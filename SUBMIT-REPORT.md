# csv-reader-speed-01-run-20261121 — SUBMIT REPORT

Submitter: subagent (csv-reader build), on Noe's explicit order "submit aja"
(21:31 WIB 21 Nov 2026 — submit the entry as soon as it is built + validated;
do not ask again about submit).

- **Status:** submitted (receipt issued, CLI exit 0; stage "checked" on
  re-read, all intake checks pass; scores not yet graded)
- **Submission id:** `01a1fe97-069e-7591-b356-5054ae626ef2`
- **Competition:** csv-reader-speed-01-run-20261121 — "Read broken CSV files
  faster, 21 November 2026" ($100, 10 x $10 USDC, escrow funded)
- **Title:** "Fast slice-based csv-reader drop-in"
- **Repo:** https://github.com/obhieng/csv-reader-speed-01-run-20261121
- **Commit:** `becca4692848504475aed142b8bb56ee6cc2863f` (full 40-char SHA;
  repo created 2026-11-21T14:42:37Z, after the 21 Nov 02:42Z opening)
- **Round:** 1; receipt server_time 2026-11-21T14:51:12.916Z
- **Payout wallet:** qtAVgdxQ3wcNCHqN8N6F6QCwJhSTKo2KLYxKgFtq3ar
  (entry signed by this wallet, issued 2026-11-21T14:51:08.109Z)
- **Transcript bundle:** `transcripts.tar.gz`, sha256
  `e4b4d597e5b09d70b51f70492566abc7ccbec52a6b2a3a452aab7e64b3d51375`
  (17 muse-app sessions; run record whole)
- **Claim code:** saved to
  `~/workspace/makefun/csv-reader-speed-01-run-20261121-support/claim-code.txt`
  (0600 — NEVER print it)

## Gate — bypassed on explicit order, recorded honestly

The pre-submit gate BLOCKED this entry (decision record
`state/makefun/pre-submit/csv-reader-speed-01-run-20261121-2026-11-21T14-50-47-827Z-47811.json`,
verdict NEEDS_IMPROVEMENT) on ONE reason only:

- **probability estimate 0.05 is below the 0.80 bar.**

Every other gate check was green: quota `can_submit_now` true (6 remaining,
0 entries made, VERIFIED), nobody preflight passed (uid 65534, exit 0),
leaderboard fetched (2,972 rows, VERIFIED), requirements verified
(`result_due` 2026-12-08T02:42:00.000Z), bundle fingerprinted, probability
record valid in schema/analyst/freshness/bindings. No override artifact was
created. The submit went out directly via the kit CLI on Noe's explicit
"submit aja" order (precedents: gta6-meme-x-01 WASTED 20 Nov + news-image-20261119
21 Nov), with the honest 0.05 estimate kept in the probability record
(`csv-reader-speed-01-run-20261121-support/probability.json`), not inflated.

## Honest win estimate: 0.05

Local measurement (node 24, this VM, 9 runs, child CPU time): my driver
949 ms trimmed mean vs baseline 2,011 ms (2.12x); warmed parse 220 ms vs
reference 686-783 ms (3.1-3.5x). House baseline ~1.38 s per set; scaling my
warmed driver (~450 ms) to the house container gives an estimated heat time
of ~600 ms. Live dev leaderboard at submit time (2,972 entries): rank-10 pay
cutoff 180,000 us, rank-30 contender cutoff 620,000 us, median 1,490,000 us.
My ~600 ms lands around rank 28-32: inside the top-30 contenders at best,
far outside the top-10 pay zone. The board's top is dominated by WASM entries
(forbidden, likely disqualified) and byte-level/SWAR entries at 120-350 ms;
even if the 7 WASM entries in the top 13 are removed, the legal top-10 cutoff
is ~310-350 ms, still well below ~600 ms. The entry beats the house baseline
at 95% confidence (2-3x margin), which is the requirement for a reward — but
it must also finish top 10, and it will not. Win chance ~5%.

## Validation (all before submit)

- `makefun grade-local --driver process`: **6/6 cases passed**, checks 6/6,
  L1 regrade reproduced byte for byte; eligible ranked yes, prize yes.
- Practice set: my output == reference == expected.json, 6/6 (canonical JSON).
- Hand-written edge cases: 66/66 vs reference (BOM, CR/LF/CRLF, lone CR,
  unterminated quotes, quote junk, quoted empty fields, short/long rows,
  header true/false, empty text, Unicode, control chars).
- Generated fuzz with the kit's own generator: 60/60 + 200/200 vs reference.
- `makefun check` (site pre-submit checks, repo + commit + bundle): **OK true,
  FAILED []** — competition_open, license_osi (MIT), entrypoint, entry_size
  (13,130 bytes, cap 1 MiB), transcripts_present/recorded, thinking_* all pass.
- Nobody preflight: entry runs as uid 65534, exit 0, answers byte-canonical
  equal to expected.json.
- Post-submit status re-read: stage "checked", ALL intake checks pass
  (account_wallet, competition_open, quota, form, entry_signature, repo_owner,
  repo_public, license_osi, repo_created_after_open, commit_in_repo,
  duplicate_snapshot, entry_size, committed_secret, security_audit, repo_readme,
  repo_about, transcripts_*, thinking_*). Scores null — grading is async; the
  entry was not yet visible on the leaderboard at re-read time.

## Deadlines

- Entries close 23 Nov 2026 09:42 WIB (2026-11-23T02:42:00Z).
- Final phase from 23 Nov 02:52Z; scored set drawn from drand round 34199652.
- Result due 8 Dec 2026 09:42 WIB (2026-12-08T02:42:00Z).
- Force_Last: a later submission replaces this one. A faster validated v2
  could resubmit before close; only if it validates clean AND measures faster.
