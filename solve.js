// solve.js — fast drop-in for csv-reader 1.0.0 (make.fun csv-reader-speed-01).
//
// Exact semantics of the reference (vendor/csv-reader/index.js), implemented with
// bulk scans (indexOf / split / slice / sticky regex) instead of character-at-a-time
// string concatenation. Dependency-free ES module. run(input) -> {columns, rows, errors}.
//
// Design:
// - At each record start, the line is sliced once and checked for quotes: a line with
//   no quote takes the split(',') fast path (with exact stray-CR handling).
// - Lines with quotes go through a field-by-field state machine that mirrors the
//   reference, but finds field ends with one native regex scan (/[,\r\n]/g) and
//   builds field values with slice() instead of per-character +=.
// - A quoted field is usually one slice: the closing quote is found with indexOf,
//   and doubled quotes / CR-LF inside quotes take a slower exact path.

const NEXT = /[,\r\n]/g; // next comma / CR / LF at or after lastIndex (single scan)
const BREAK = /[\r\n]/g; // next line break at or after lastIndex
const BREAKS = /\r\n|[\r\n]/g; // every line break (CRLF counts once)
const CR_OR_CRLF = /\r\n?/g; // every CR or CRLF (for -> LF conversion inside quotes)

const COMMA = 0;
const LINE_BREAK = 1;
const END = 2;

/** csv-reader 1.0.0's answer for one case's input. */
export function run(input) {
  const text = String(input.text);
  const header = input.header === true;
  const errors = [];
  const rows = [];
  let columns = null;
  let width = -1;
  const len = text.length;
  let pos = text.charCodeAt(0) === 0xfeff ? 1 : 0;
  let line = 1;
  let recordLine = 1;
  let recordRow = null;

  function err(code) {
    errors.push({ code, line: recordLine, row: recordRow });
  }

  function assemble(fields) {
    if (width < 0) width = fields.length;
    if (header && columns === null) {
      columns = fields;
      return;
    }
    if (fields.length < width) {
      errors.push({ code: 'short_row', line: recordLine, row: recordRow, fields: fields.length });
      while (fields.length < width) fields.push('');
    } else if (fields.length > width) {
      errors.push({ code: 'long_row', line: recordLine, row: recordRow, extra: fields.splice(width) });
    }
    rows.push(fields);
  }

  // Reads an unquoted field starting at pos, with `init` already in its value.
  // Returns {value, ended, added} where added counts the characters kept here
  // (the initial value does not count, matching the reference).
  function readUnquoted(init) {
    let value = init;
    let added = 0;
    let p = pos;
    for (;;) {
      NEXT.lastIndex = p;
      const m = NEXT.exec(text);
      if (m === null) {
        if (p < len) {
          value += text.slice(p, len);
          added += len - p;
        }
        pos = len;
        return { value, ended: END, added };
      }
      const e = m.index;
      const ch = m[0];
      if (ch === ',') {
        value += text.slice(p, e);
        added += e - p;
        pos = e + 1;
        return { value, ended: COMMA, added };
      }
      if (ch === '\n') {
        value += text.slice(p, e);
        added += e - p;
        pos = e + 1;
        line += 1;
        return { value, ended: LINE_BREAK, added };
      }
      // ch === '\r'
      if (e + 1 < len && text.charCodeAt(e + 1) === 10) {
        value += text.slice(p, e);
        added += e - p;
        pos = e + 2;
        line += 1;
        return { value, ended: LINE_BREAK, added };
      }
      // Lone CR: stray_cr, dropped, keep reading the same field.
      err('stray_cr');
      value += text.slice(p, e);
      added += e - p;
      p = e + 1;
    }
  }

  // Reads a quoted field whose opening quote is at pos.
  function readQuoted() {
    const open = pos;
    const openLine = line;
    let p = open + 1;
    let segStart = p;
    let value = '';
    let closed = -1;
    for (;;) {
      const q = text.indexOf('"', p);
      if (q === -1) {
        closed = -1;
        break;
      }
      if (q + 1 < len && text.charCodeAt(q + 1) === 34) {
        value += text.slice(segStart, q) + '"';
        p = q + 2;
        segStart = q + 2;
        continue;
      }
      closed = q;
      break;
    }
    if (closed === -1) {
      // The quote never closes: it is a literal character, and the text after
      // it is read again as unquoted.
      pos = open + 1;
      line = openLine;
      err('unterminated_quote');
      return readUnquoted('"');
    }
    if (value === '') {
      // No doubled quotes: check whether the span holds a line break.
      BREAK.lastIndex = open + 1;
      const b = BREAK.exec(text);
      if (b === null || b.index >= closed) {
        value = text.slice(open + 1, closed);
      } else {
        const raw = text.slice(open + 1, closed);
        const breaks = raw.match(BREAKS);
        line += breaks === null ? 0 : breaks.length;
        value = raw.replace(CR_OR_CRLF, '\n');
      }
    } else {
      // Doubled quotes were collapsed into value; append the last segment.
      const raw = value + text.slice(segStart, closed);
      const breaks = raw.match(BREAKS);
      if (breaks === null) {
        value = raw;
      } else {
        line += breaks.length;
        value = raw.replace(CR_OR_CRLF, '\n');
      }
    }
    pos = closed + 1;
    if (pos >= len) return { value, ended: END, added: 0 };
    const c = text.charCodeAt(pos);
    if (c === 44) {
      pos += 1;
      return { value, ended: COMMA, added: 0 };
    }
    if (c === 10) {
      pos += 1;
      line += 1;
      return { value, ended: LINE_BREAK, added: 0 };
    }
    if (c === 13 && pos + 1 < len && text.charCodeAt(pos + 1) === 10) {
      pos += 2;
      line += 1;
      return { value, ended: LINE_BREAK, added: 0 };
    }
    // What follows the closing quote is appended as it stands, up to the next
    // comma or line break.
    const junk = readUnquoted(value);
    if (junk.added > 0) err('quote_junk');
    return junk;
  }

  for (;;) {
    // Lines with no characters are no records.
    while (pos < len) {
      const c = text.charCodeAt(pos);
      if (c === 10) {
        pos += 1;
        line += 1;
      } else if (c === 13 && pos + 1 < len && text.charCodeAt(pos + 1) === 10) {
        pos += 2;
        line += 1;
      } else {
        break;
      }
    }
    if (pos >= len) break;

    recordLine = line;
    recordRow = header && columns === null ? null : rows.length;

    // One slice of this line decides the path: no quote -> split fast path.
    const le = text.indexOf('\n', pos);
    const hasNL = le !== -1;
    const end = hasNL ? le : len;
    let contentEnd = end;
    if (hasNL && contentEnd > pos && text.charCodeAt(contentEnd - 1) === 13) contentEnd -= 1;
    const s = text.slice(pos, contentEnd);

    if (s.indexOf('"') === -1) {
      if (s === '') {
        // Empty line (already skipped above in practice); advance past it.
        pos = hasNL ? le + 1 : len;
        if (hasNL) line += 1;
        continue;
      }
      if (s.indexOf('\r') === -1) {
        const fields = s.split(',');
        pos = hasNL ? le + 1 : len;
        if (hasNL) line += 1;
        assemble(fields);
        continue;
      }
      // Lone CRs inside the line: one stray_cr each, dropped.
      let ncr = 0;
      let idx = -1;
      while ((idx = s.indexOf('\r', idx + 1)) !== -1) ncr += 1;
      const clean = s.replaceAll('\r', '');
      for (let i = 0; i < ncr; i += 1) err('stray_cr');
      pos = hasNL ? le + 1 : len;
      if (hasNL) line += 1;
      if (clean === '') continue; // line held only stray CRs: no record
      assemble(clean.split(','));
      continue;
    }

    // This record holds a quote: field by field, mirroring the reference.
    const fields = [];
    let field;
    let quoted = false;
    do {
      quoted = text.charCodeAt(pos) === 34;
      field = quoted ? readQuoted() : readUnquoted('');
      fields.push(field.value);
    } while (field.ended === COMMA);

    // A line that held only stray CRs is left with no characters: no record
    // (its stray_cr errors stay).
    if (fields.length === 1 && fields[0] === '' && !quoted) continue;
    assemble(fields);
  }

  return { columns: header ? (columns ?? []) : null, rows, errors };
}
