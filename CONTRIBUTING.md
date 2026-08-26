# Contributing to cc-anatomy

Thanks for your interest. The most valuable contributions here are **content
corrections** and **new lessons** — and both are edits to data, not to the
engine.

## Development setup

No build step, no runtime dependencies.

```bash
npm ci                              # installs @playwright/test, the only dev dep
python3 -m http.server 6182         # open http://127.0.0.1:6182

npm test                            # node --test: schema gate + lesson data
npx playwright install chromium     # once
npx playwright test                 # e2e (boots its own static server)
```

`npm test` is the fast gate and runs against the lesson data directly; run it
after every data edit.

## The rule that matters most

**Every behavioral claim needs a documentation citation.**

If a lesson step says Claude Code does something, there must be a row for it in
[`docs/CONTENT-REVIEW.md`](docs/CONTENT-REVIEW.md) containing:

| column | what goes in it |
| :--- | :--- |
| step id | e.g. `L3-S2-04`, matching the step in `docs/CONTENT-SPEC.md` |
| claim | what the step asserts, in one sentence |
| source | the official doc URL |
| excerpt | a **verbatim** quote from that page |
| verdict | `ok`, or `adjusted` if the draft claim had to be rewritten to match |

The gate is not that a URL exists — it is that the excerpt actually says what
the step says. Fetch the page; do not quote from memory. If the documentation
does not back the claim, change the claim, not the excerpt.

Two corollaries, both already exercised in the existing lessons:

- **Do not assert an ordering the docs do not state.** Draw those elements as an
  unordered `cluster` and label it as such (see L1).
- **Do not guess at undocumented behavior.** Give the step an `undocumented`
  badge and say so in the explanation (see `L2-S3-04`).

Prose changes with no behavioral claim (wording, typos, translation quality) do
not need a new row.

## Adding a lesson

A lesson is one file in `js/lessons/`, exporting a plain object, plus one
`register(...)` line in `js/lessons/index.js`. The engine renders anything that
passes the schema; you should not need to touch `js/engine/`.

Order of work — the same order the existing lessons were built in:

1. Write the lesson into `docs/CONTENT-SPEC.md`: diagram nodes, branch table,
   every step in prose.
2. Add its citation rows to `docs/CONTENT-REVIEW.md`, fetching each doc page.
3. Only then transcribe the reviewed spec into a data module.

### Schema shape

```js
export const lX = {
  id: 'lX-topic',                    // unique, kebab-case
  minutes: 5,                        // shown on the home card
  asOf: '2026-08-26',                // documentation baseline, shown in the UI
  title: { en: '…', ko: '…' },
  intro: { en: '…', ko: '…' },

  diagram: {
    nodes: [
      { id: 'lX.start', role: 'event', x: 0, y: 0, h: 64,
        label: { en: '…', ko: '…' } },
      // role: event | decision | artifact | terminal | cluster  (default: event)
      // x and y are required numbers — layout coordinates live in the data.

      // An unordered group: a `cluster` node that names its members in `group`.
      // Members are highlighted together, with no arrows among them.
      { id: 'lX.context', role: 'cluster', x: 320, y: 0,
        group: ['lX.a', 'lX.b'],
        label: { en: '…', ko: '…' } },
    ],
    edges: [
      { from: 'lX.start', to: 'lX.next', label: { en: '…', ko: '…' } },
      // edge label may also be a plain string
    ],
  },

  // Declared widgets and their enumerated values.
  // At most 2 widgets, at most 8 total combinations.
  inputs: {
    mode: ['a', 'b'],
    flag: ['off', 'on'],
  },

  // Optional presentation for those widgets.
  widgets: {
    mode: { type: 'chips', label: { en: '…', ko: '…' },
            valueLabels: { a: { en: '…', ko: '…' } } },
    flag: { type: 'toggle', label: { en: '…', ko: '…' } },   // toggle needs exactly 2 values
  },

  // One scenario per combination — all of them.
  scenarios: [
    { id: 'lX.s1',
      trigger: { mode: 'a', flag: 'off' },     // every widget, values from inputs
      steps: [
        { node: 'lX.start',                        // required, must exist
          edge: 'lX.start->lX.next',               // optional; or {from, to}
          explain: { en: '…', ko: '…' },
          badge: 'blocked' },                      // optional: string, or
                                                   // { en, ko, tone } with tone in
                                                   // neutral | blocked | allowed | warn
      ] },
  ],

  quiz: [
    { q: { en: '…', ko: '…' },
      choices: [{ en: '…', ko: '…' }, { en: '…', ko: '…' }],
      answer: 0 },                              // index into choices
  ],

  sources: ['https://code.claude.com/docs/en/…'],   // rendered as "Learn more"
};
```

Everything reader-facing is `{ en, ko }`. Both languages are required — the
schema rejects a lesson with one missing. If your Korean is not fluent, open the
PR with the English filled in and say so; a translation pass is a welcome
follow-up rather than a blocker.

### Validator error codes

`npm test` runs `validateLesson()` over every registered lesson. Errors come
back as `CODE: message`, so this table is the fastest way to read a failure:

| code | meaning |
| :--- | :--- |
| `E_SHAPE` | a field is missing or the wrong type (`id`, `sources`, node `x`/`y`, `diagram.nodes`, the lesson itself) |
| `E_LOCALE` | a localized field lacks `en` or `ko` |
| `E_NODE_ID` | a diagram node id is missing or duplicated |
| `E_NODE_REF` | a step has no `node`, or points at one absent from `diagram.nodes` |
| `E_EDGE_REF` | an edge is malformed, self-pointing or duplicated, or a step points at an edge absent from `diagram.edges` |
| `E_CLUSTER` | a `group` is not a non-empty array, names an unknown node, or contains its own node |
| `E_INPUTS` | `inputs`/`widgets` malformed — empty value list, duplicate value, unknown widget id, bad widget type, toggle without exactly 2 values |
| `E_WIDGET_LIMIT` | more than 2 widgets declared |
| `E_COMBO_LIMIT` | more than 8 input combinations |
| `E_TRIGGER` | a scenario trigger misses a widget, names an unknown one, or uses a value outside `inputs` |
| `E_TRIGGER_DUP` | two scenarios share the same trigger combination |
| `E_COMBO_UNCOVERED` | some input combination has no scenario — the branch-completeness gate |
| `E_SCENARIO` | a scenario has no id, a duplicate id, no steps, or a step whose `badge` is malformed or carries an unknown `tone` |
| `E_QUIZ` | a quiz item is malformed, has fewer than 2 choices, or `answer` is not a valid index |

`E_COMBO_UNCOVERED` is the one that catches the mistake this project most wants
to prevent: a branch you can select in the UI but did not write. Every
combination in the Cartesian product of `inputs` must have a scenario. Keep the
combination count down by keeping the widgets few and their values enumerated;
the limits are enforced, not advisory.

`js/lessons/broken.js` is deliberately invalid — it is the fixture behind the
fallback-view test. Do not "fix" it.

## Code conventions

- **Keep files small.** A source file over ~300 lines, or a function over ~50,
  wants splitting.
- **No inline styles.** Every style is a reusable class in the global
  `css/style.css` — no `style="..."` attributes, no per-component stylesheets.
- **No `innerHTML`.** Text lands via `textContent` or `paintText()` from
  `js/engine/richtext.js`. The tests and the CSP both assume this.
- **Nothing loads from another origin.** No CDN, no web font, no analytics. The
  page must keep working under `default-src 'self'`.
- **The engine stays lesson-agnostic.** If a lesson needs a new capability, add
  it as a schema-described feature that any lesson can use — not as a special
  case keyed on a lesson id.
- **Add or update tests** in `tests/` (or `e2e/`) for every behavior change.

## Pull requests

Keep PRs focused on one change. Say what changed and how you verified it. For a
content change, include the doc URL and excerpt in the PR description — that is
the review. Make sure `npm test` is green before opening. CI runs the unit suite
on Node 22 and the Playwright suite on chromium.
