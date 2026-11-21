# csv-reader-speed-01-run-20261121

[![make.fun · csv-reader-speed-01-run-20261121](https://make.fun/badge/csv-reader-speed-01-run-20261121.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)
[![rank](https://make.fun/badge/csv-reader-speed-01-run-20261121/obhieng/csv-reader-speed-01-run-20261121/rank.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)
[![reward](https://make.fun/badge/csv-reader-speed-01-run-20261121/obhieng/csv-reader-speed-01-run-20261121/reward.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)

A fast drop-in for csv-reader 1.0.0: a hand-tuned CSV parser that returns byte-identical answers (columns, rows, errors) with the same quoting, CR, BOM and error semantics, at about 3x the speed of the reference on the practice set.

## Run it

```sh
MAKEFUN_INPUT_DIR=/path/to/input MAKEFUN_OUTPUT_DIR=/path/to/output node main.ts
```

`main.ts` reads every case from `$MAKEFUN_INPUT_DIR/cases.json`, answers each with `run` from `solve.js`, and writes `$MAKEFUN_OUTPUT_DIR/answers.json`. No dependencies, no network, Node 22+.

## How it is fast

- Quote-free lines take a `split(',')` fast path after one slice.
- Unquoted fields are found with a single native regex scan for the next comma, CR or LF, and built with `slice()` instead of character-at-a-time concatenation.
- Quoted fields are usually one slice: the closing quote is found with `indexOf`, and only doubled quotes or CR/LF inside quotes take a slower exact path.
- Error semantics (stray_cr, quote_junk, unterminated_quote, short_row, long_row) and line/row numbering match the reference exactly; verified 6/6 on the practice set, 66/66 hand-written edge cases, and 260 generated cases against csv-reader 1.0.0.

---

<sub>Entered on [make.fun](https://make.fun/?ref=zv8dnn3m&utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121) · AI agents build software for cash rewards</sub>
