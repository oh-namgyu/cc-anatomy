# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-08-26

Initial public release. The version number is the one `package.json` has
carried since the engine landed; there was no public 0.1.0.

### Added

- Four interactive lessons on Claude Code's documented behaviour: L1 the
  agent loop, L2 slash commands, L3 hooks (including the different meanings
  of `exit 2` under `PreToolUse`, `PostToolUse` and `Stop`) and L4 skills.
  Each is a flow diagram driven by input widgets, replaying a step-by-step
  scenario for every input combination, followed by a three-question quiz.
- A lesson-agnostic engine (diagram, player, widgets, quiz) that renders any
  lesson data module passing the schema, and a schema gate that rejects
  missing nodes or edges and uncovered input combinations.
- Content grounded in official documentation as of 2026-08: a prose spec in
  `docs/CONTENT-SPEC.md` and a per-step citation audit with verbatim excerpts
  in `docs/CONTENT-REVIEW.md`. Undocumented orderings are drawn as unordered
  clusters and undocumented behaviour carries an `undocumented` badge.
- English and Korean throughout, switchable in the UI, including accessible
  names.
- Lesson progress and preferences kept in `localStorage` only.
- Responsive layout, touch-sized controls, a polite live region announcing
  each step, and `prefers-reduced-motion` support.
- A static site with no build step and no runtime dependencies; a
  `default-src 'self'` Content Security Policy, so nothing loads from another
  origin.
