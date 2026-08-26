# cc-anatomy — Content Accuracy Review (Stage 1)

Every scenario step in [`CONTENT-SPEC.md`](CONTENT-SPEC.md) gets one row below: the claim it makes, the official page that backs it, a **verbatim excerpt** from that page, and a verdict. The gate is not "a URL exists" — it is that the excerpt actually says what the step says. Where the docs did not back the draft claim, the claim was rewritten and the row is marked `adjusted`.

- **Review date:** 2026-08-26
- **Reviewer:** authoring pass, cc-anatomy stage 1
- **Doc baseline:** all pages fetched live on 2026-08-26 (not quoted from memory)

## Pages fetched

| # | URL | Used for |
| :-- | :--- | :--- |
| D1 | `https://code.claude.com/docs/en/how-claude-code-works` | L1 agentic loop, tools, context window, sessions |
| D2 | `https://code.claude.com/docs/en/agent-sdk/agent-loop` | L1 loop steps, turns, tool execution ordering |
| D3 | `https://code.claude.com/docs/en/context-window` | L1 startup load list, what survives compaction |
| D4 | `https://code.claude.com/docs/en/memory` | L1 CLAUDE.md load timing, position, hierarchy, auto memory |
| D5 | `https://code.claude.com/docs/en/skills` | L2 + L4 command names, `$ARGUMENTS`, invocation control, lifecycle |
| D6 | `https://code.claude.com/docs/en/commands` | L2 command recognition and argument split |
| D7 | `https://code.claude.com/docs/en/hooks` | L3 event list, exit-code semantics, per-event exit 2 table |
| D8 | `https://code.claude.com/docs/en/hooks-guide` | L3 hook definition, blocking walkthrough, Stop loop guard |

**Note on D2 scope:** `agent-sdk/agent-loop` documents the Agent SDK, which states it *"runs the same [execution loop that powers Claude Code]"*. Claims sourced only to D2 are used for loop mechanics (turns, tool-result feedback, termination), and every one of them is also corroborated by D1 for Claude Code itself. No SDK-only API surface (`ResultMessage`, `maxTurns`, etc.) appears in any lesson.

**Note on the L2 source URL:** `https://code.claude.com/docs/en/slash-commands` no longer serves its own page — fetching it returns the skills page (D5), which states custom commands have been merged into skills. L2 therefore cites D5 and D6, not a `slash-commands` URL. This is the single largest correction this review produced; see `L2-TERM`.

---

## Duplicate check (plan §8 re-confirmation)

The plan recorded, as of 2026-08-26, that no input-reactive Claude Code simulator existed publicly and asked for one re-confirmation during stage 1. **That claim did not survive the re-check and is corrected here.**

**Search 1** — query: `interactive simulator "Claude Code" agent loop hooks visualizer learn how it works`

| Result | What it is | Overlap |
| :--- | :--- | :--- |
| `github.com/jonwiggins/claude-code-visualizer` | "An interactive educational webapp that visualizes how Claude Code works internally. Explore the agentic loop algorithm through interactive flowcharts and step-by-step scenario walkthroughs." 20 algorithm nodes, playback controls, sandbox panel toggling permission modes and hooks. Pre-built scenarios include Hook Blocking, Permission Denied, Subagent Delegation, Context Compaction. ~5 stars, no live demo URL, English only. | **High** on L1 and part of L3 |
| `github.com/patoles/agent-flow` | Real-time visualization of *live* agent runs (node graph fed by hooks) | Low — observability, not a lesson |
| `github.com/disler/claude-code-hooks-multi-agent-observability` | Real-time hook-event monitoring | Low — observability |
| `github.com/ksimback/looper` | Design review-gated agent loops before running them | Low — authoring tool |
| `code.claude.com/docs/en/agent-sdk/agent-loop` | Official docs page | n/a |

**Search 2** — query: `"Claude Code" interactive lesson simulator slash commands hooks skills bilingual Korean English web app teach`

| Result | What it is | Overlap |
| :--- | :--- | :--- |
| `claude.nagdy.me` — "Learn Claude Code Interactively" | 12 interactive modules with a browser terminal simulator and quizzes, covering slash commands, skills, hooks, MCP. No setup, no API key. | **High** on L2, L3, L4 |
| `claude10x.com` | 30-lesson interactive course covering slash commands, memory, skills, subagents, MCP, hooks | **High** on lesson coverage |
| `nimbalyst.com/skills/tutorial/` | `/tutorial` skill — an in-CLI interactive tutorial | Medium, different medium |
| ClaudeCodeQuiz (App Store) | Quiz app, EN/JA auto-switching, slash commands + MCP | Medium — quiz only |
| `github.com/m98/fluent` | Language-learning kit built *as* Claude Code skills, multi-language incl. Korean | Low — unrelated domain |
| `alexknowshtml/claude-skills` `/teach`, aihero.dev, aiopsschool.com, marktechpost.com, coursera.org | Skills, blog tutorials, courses — static or in-CLI | Low |

**Additional finding, not from search:** D3 (`/docs/en/context-window`) is itself *"An interactive simulation of how Claude Code's context window fills during a session"* — an official, playable timeline with hover detail and a `/compact` step. It overlaps L1's startup-load material directly.

**Conclusion:** the plan's premise of a gap is **wrong as stated**. Interactive Claude Code learning tools with terminal simulators, playback, and hook/skill/command lessons already exist publicly, and Anthropic ships an interactive context-window simulation in its own docs. What is *not* visible in these results is the specific combination cc-anatomy proposes: **input-combination-driven branching on a flow diagram (widget values → distinct replayed step lists), EN/KO bilingual text, per-step official-doc citation, and an explicit refusal to over-specify undocumented ordering.** That is a narrower and honest positioning claim than "no equivalent exists", and README/positioning copy in stage 7 must use the narrower one. Recommend surfacing the closest prior art (`claude-code-visualizer`, `claude.nagdy.me`) in README rather than claiming novelty.

---

## Verdict legend

- **ok** — the draft claim was already what the docs say.
- **adjusted** — the draft claim was rewritten during this review to match the docs (or to stop asserting something the docs do not state). The spec now contains the adjusted wording.

---

## L1 — The Agent Loop

### Cross-cutting adjustment `L1-ORDER` (drives every `l1.startup` row)

| Item | Value |
| :--- | :--- |
| Draft claim | "Startup loads the system prompt, then CLAUDE.md, then memory, then skills, then tools — in that order." |
| Verdict | **adjusted** |
| Source | D3, D4 |
| Excerpt (D3) | "**Before you type anything**: CLAUDE.md, auto memory, MCP tool names, and skill descriptions all load into context." |
| Excerpt (D3) | "Core instructions for behavior, tool use, and response formatting. Always loaded first. You never see it." |
| Excerpt (D4) | "CLAUDE.md content is delivered as a user message after the system prompt, not as part of the system prompt itself." |
| Rewritten to | Two ordering facts only: system prompt first, CLAUDE.md after the system prompt as a user message. Everything else that loads pre-prompt is drawn as an **unordered cluster** with the on-screen label "the docs list these together without stating an order among them", highlighted simultaneously, with no arrows between members. |

### `l1.s1` — question, no CLAUDE.md

| Step | Claim | Src | Verbatim excerpt | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| L1-S1-01 | A session starts with a fresh context window; the system prompt is loaded first | D1, D3 | D1: "Each new session starts with a fresh context window, without the conversation history from previous sessions." · D3: "Always loaded first." | ok |
| L1-S1-02 | Auto memory, skill descriptions and tool names load before you type, in no stated order | D3 | "**Before you type anything**: CLAUDE.md, auto memory, MCP tool names, and skill descriptions all load into context." | adjusted |
| L1-S1-03 | Your prompt is small compared with what is already loaded | D3 | "Your prompt is tiny compared to what's already loaded. Most of Claude's context is project knowledge, not your words." | ok |
| L1-S1-04 | Claude evaluates the current state and decides: text, tool calls, or both | D2 | "**Evaluate and respond.** Claude evaluates the current state and determines how to proceed. It may respond with text, request one or more tool calls, or both." | ok |
| L1-S1-05 | A quick question may take one or two turns calling `Glob` | D2 | "A quick question (\"what files are here?\") might take one or two turns of calling `Glob` and responding with the results." | ok |
| L1-S1-06 | The tool result feeds back for the next decision; one full cycle is one turn | D2 | "Each set of tool results feeds back to Claude for the next decision." · "Each full cycle is one turn." | ok |
| L1-S1-07 | The loop ends when Claude produces a response with no tool calls | D2 | "Claude continues calling tools and processing results until it produces a response with no tool calls." | ok |

### `l1.s2` — question, CLAUDE.md present

| Step | Claim | Src | Verbatim excerpt | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| L1-S2-01 | The system prompt is loaded first | D3 | "Always loaded first." | ok |
| L1-S2-02a | CLAUDE.md arrives as a user message after the system prompt, not inside it | D4 | "CLAUDE.md content is delivered as a user message after the system prompt, not as part of the system prompt itself." | adjusted |
| L1-S2-02b | Multiple CLAUDE.md files load broadest scope → most specific | D4 | "The table below lists them in load order, from broadest scope to most specific, so a project instruction appears in context after a user instruction." | ok |
| L1-S2-03 | Auto memory, skill descriptions, tool names load alongside, no stated order | D3 | "**Before you type anything**: CLAUDE.md, auto memory, MCP tool names, and skill descriptions all load into context." | adjusted |
| L1-S2-04 | The prompt enters the loop | D2 | "**Receive prompt.** Claude receives your prompt, along with the system prompt, tool definitions, and conversation history." | ok |
| L1-S2-05 | Claude evaluates and decides how to proceed | D2 | "Claude evaluates the current state and determines how to proceed." | ok |
| L1-S2-06 | Claude calls `Glob` for a file-listing question | D2 | "might take one or two turns of calling `Glob` and responding with the results." | ok |
| L1-S2-07 | CLAUDE.md is context, not enforced configuration | D4 | "Claude treats them as context, not enforced configuration. To block an action regardless of what Claude decides, use a [PreToolUse hook] instead." | ok |

### `l1.s3` — edit task, no CLAUDE.md

| Step | Claim | Src | Verbatim excerpt | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| L1-S3-01 | System prompt loads first | D3 | "Always loaded first." | ok |
| L1-S3-02 | Remaining startup content loads pre-prompt with no documented order | D3 | "**Before you type anything**: CLAUDE.md, auto memory, MCP tool names, and skill descriptions all load into context." | adjusted |
| L1-S3-03 | The prompt "fix the failing tests" starts the loop | D1 | "Claude chooses which tools to use based on your prompt and what it learns along the way. When you say \"fix the failing tests,\" Claude might:" | ok |
| L1-S3-04 | Turn 1 runs `npm test` via `Bash` and sees three failures | D2 | "**Turn 1:** Claude calls `Bash` to run `npm test`. The SDK yields an [`AssistantMessage`] with the tool call, executes the command, then yields a [`UserMessage`] with the output (three failures)." | ok |
| L1-S3-05 | Each result informs the next step | D1 | "Each tool use gives Claude new information that informs the next step. This is the agentic loop in action." | ok |
| L1-S3-06a | Claude reads files, edits, re-runs tests across turns 2–3 | D2 | "**Turn 3:** Claude calls `Edit` to fix `auth.ts`, then calls `Bash` to re-run `npm test`. All three tests pass." | ok |
| L1-S3-06b | State-modifying tools run sequentially | D2 | "Tools that modify state (like `Edit`, `Write`, and `Bash`) run sequentially to avoid conflicts." | ok |
| L1-S3-07 | Four turns total — three with tool calls, one final text | D2 | "That was four turns: three with tool calls, one final text-only response." | ok |

### `l1.s4` — edit task, CLAUDE.md present

| Step | Claim | Src | Verbatim excerpt | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| L1-S4-01 | System prompt first | D3 | "Always loaded first." | ok |
| L1-S4-02 | CLAUDE.md is a user message after the system prompt | D4 | "CLAUDE.md content is delivered as a user message after the system prompt, not as part of the system prompt itself." | adjusted |
| L1-S4-03 | The rest of startup loads with it, unordered | D3 | "**Before you type anything**: CLAUDE.md, auto memory, MCP tool names, and skill descriptions all load into context." | adjusted |
| L1-S4-04 | The edit prompt starts the loop | D1 | "When you say \"fix the failing tests,\" Claude might:" | ok |
| L1-S4-05 | Claude runs tests, reads files, edits | D1 | "1. Run the test suite to see what's failing … 5. Edit the files to fix the issue 6. Run the tests again to verify" | ok |
| L1-S4-06 | Each tool result feeds the next evaluation | D2 | "Each set of tool results feeds back to Claude for the next decision." | ok |
| L1-S4-07 | For a rule that must apply regardless of Claude's decision, the docs point to a hook | D4 | "To block an action regardless of what Claude decides, use a [PreToolUse hook] instead." | ok |

---

## L2 — Slash Commands

### Cross-cutting adjustment `L2-TERM` (drives every `l2.resolve` row)

| Item | Value |
| :--- | :--- |
| Draft claim | "Slash commands are markdown files in `.claude/commands/`; `/docs/en/slash-commands` documents them." |
| Verdict | **adjusted** |
| Source | D5, D6 |
| Excerpt (D5) | "**Custom commands have been merged into skills.** A file at `.claude/commands/deploy.md` and a skill at `.claude/skills/deploy/SKILL.md` both create `/deploy` and work the same way. Your existing `.claude/commands/` files keep working." |
| Excerpt (D6) | "To add your own commands, see [skills](/docs/en/skills)." |
| Excerpt (D5) | "If you have files in `.claude/commands/`, those work the same way, but if a skill and a command share the same name, the skill takes precedence." |
| Rewritten to | L2 teaches "the user-typed `/name` path" and presents both locations as equivalent, with the skill winning a name clash. The lesson must not present `.claude/commands/` as the only or current home, and cites D5/D6 rather than a `slash-commands` URL (which redirects to D5). |

### `l2.s1` — `$ARGUMENTS` present, args given

| Step | Claim | Src | Verbatim excerpt | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| L2-S1-01 | A command is only recognized at the start of the message | D6 | "A command is only recognized at the start of your message." | ok |
| L2-S1-02 | Text after the command name becomes its arguments | D6 | "Text that follows the command name becomes its arguments." | ok |
| L2-S1-03 | The name maps to a directory name (skills) or a file name without extension (commands) | D5 | "Skill directory under `~/.claude/skills/` or `.claude/skills/` | Directory name | `.claude/skills/deploy-staging/SKILL.md` → `/deploy-staging`" · "File under `.claude/commands/` | File name without extension | `.claude/commands/deploy.md` → `/deploy`" | adjusted |
| L2-S1-04a | `$ARGUMENTS` expands to all arguments passed | D5 | "`$ARGUMENTS` | All arguments passed when invoking the skill." | ok |
| L2-S1-04b | `/fix-issue 123` yields "Fix GitHub issue 123 following our coding standards…" | D5 | "When you run `/fix-issue 123`, Claude receives \"Fix GitHub issue 123 following our coding standards...\"" | ok |
| L2-S1-05 | Rendered content enters the conversation as one message and stays for the session | D5 | "the rendered `SKILL.md` content enters the conversation as a single message and stays there for the rest of the session." | ok |
| L2-S1-06 | Claude receives it as instructions | D5 | "markdown content with the instructions Claude follows when the skill runs" | ok |
| L2-S1-07 | Claude acts on the rendered prompt | D6 | "Most are built-in commands whose behavior is coded into the CLI." / "[Skill]: a bundled skill. It works like skills you write yourself: a prompt handed to Claude." | ok |

### `l2.s2` — no `$ARGUMENTS`, args given

| Step | Claim | Src | Verbatim excerpt | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| L2-S2-01 | `/deploy 123` is recognized at the start of the message | D6 | "A command is only recognized at the start of your message." | ok |
| L2-S2-02 | `123` becomes the arguments | D6 | "Text that follows the command name becomes its arguments." | ok |
| L2-S2-03 | The file for `/deploy` resolves from its name | D5 | "`.claude/commands/deploy.md` → `/deploy`" | adjusted |
| L2-S2-04 | With no `$ARGUMENTS` in the content, arguments are appended as `ARGUMENTS: <value>` | D5 | "If you invoke a skill with arguments but the skill doesn't include `$ARGUMENTS`, Claude Code appends `ARGUMENTS: <your input>` to the end of the skill content so Claude still sees what you typed." | ok |
| L2-S2-05 | The rendered content enters as one message | D5 | "enters the conversation as a single message" | ok |
| L2-S2-06 | Claude reads the body plus the trailing `ARGUMENTS:` line | D5 | "`If `$ARGUMENTS` is not present in the content, arguments are appended as `ARGUMENTS: <value>`.`" | ok |
| L2-S2-07 | Claude responds having followed the instructions | D5 | "markdown content with the instructions Claude follows when the skill runs" | ok |

### `l2.s3` — `$ARGUMENTS` present, no args

| Step | Claim | Src | Verbatim excerpt | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| L2-S3-01 | `/fix-issue` alone is a valid invocation at the start of the message | D6 | "A command is only recognized at the start of your message." | ok |
| L2-S3-02 | With nothing after the name there are no arguments | D6 | "Text that follows the command name becomes its arguments." | ok |
| L2-S3-03 | The file resolves from the name | D5 | "Directory name | `.claude/skills/deploy-staging/SKILL.md` → `/deploy-staging`" | adjusted |
| L2-S3-04 | **The docs do not state what `$ARGUMENTS` expands to when no arguments were passed** — the lesson shows this as undocumented rather than guessing | D5 | Definition covers only the with-arguments case: "`$ARGUMENTS` | All arguments passed when invoking the skill." The neighbouring rules cover *other* placeholders only: "An indexed placeholder with no corresponding argument, such as `$2` when only one argument was passed, stays in the content unchanged. A named placeholder from the [`arguments`] frontmatter with no matching argument expands to an empty string." Neither sentence mentions `$ARGUMENTS`. | adjusted |
| L2-S3-05 | Whatever it renders to, the content enters the conversation as one message | D5 | "the rendered `SKILL.md` content enters the conversation as a single message" | ok |
| L2-S3-06 | Claude works from instructions lacking the issue number | D5 | "markdown content with the instructions Claude follows when the skill runs" | ok |
| L2-S3-07 | Claude responds | D5 | "Claude uses skills when relevant, or you can invoke one directly with `/skill-name`." | ok |

### `l2.s4` — no `$ARGUMENTS`, no args

| Step | Claim | Src | Verbatim excerpt | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| L2-S4-01 | `/deploy` is recognized at the start of the message | D6 | "A command is only recognized at the start of your message." | ok |
| L2-S4-02 | No trailing text means no arguments | D6 | "Text that follows the command name becomes its arguments." | ok |
| L2-S4-03 | On a name clash between a skill and a command file, the skill wins | D5 | "if a skill and a command share the same name, the skill takes precedence." | ok |
| L2-S4-04 | With no arguments and no placeholder, the file content is what enters the conversation | D5 | "the rendered `SKILL.md` content enters the conversation as a single message and stays there for the rest of the session." | ok |
| L2-S4-05 | Claude follows the steps as written | D5 | "markdown content with the instructions Claude follows when the skill runs" | ok |
| L2-S4-06 | The content stays in context; the file is not re-read on later turns | D5 | "Claude Code does not re-read the skill file on later turns, so write guidance that should apply throughout a task as standing instructions rather than one-time steps." | ok |

---

## L3 — Hooks

### Cross-cutting adjustment `L3-EXIT2` (drives every exit-2 row)

| Item | Value |
| :--- | :--- |
| Draft claim | "exit 2 = the hook blocks the action." |
| Verdict | **adjusted** |
| Source | D7 |
| Excerpt | "Exit 2 means a blocking error. On [events that can block](#exit-code-2-behavior-per-event), exit 2 blocks whether or not you print JSON: even a JSON `permissionDecision` of `\"allow\"` can't override it." |
| Excerpt (per-event table) | "`PreToolUse` | Yes | Blocks the tool call" · "`PostToolUse` | No | Shows stderr to Claude; the tool already ran" · "`Stop` | Yes | Prevents Claude from stopping, continues the conversation" |
| Excerpt (D8) | "Where it lands depends on the event: some events feed it to Claude as feedback so it can adjust, others show it to the user, and a few, such as `ConfigChange` and `Elicitation`, surface no message. Some events can't be blocked" |
| Rewritten to | No generic "exit 2 = block" copy anywhere in the app. Three events are simulated with three distinct outcomes and three distinct badges (`blocked`, `not blocked`, `continues`), each with its own terminal node. |

### `l3.s1` / `l3.s2` — hooks off (exit selector inert)

| Step | Claim | Src | Verbatim excerpt | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| L3-S1-01 | With no hooks configured in any settings file, nothing fires | D8 | "To create a hook, add a `hooks` block to a [settings file](#configure-hook-location)." | ok |
| L3-S1-02 | The normal permission flow decides whether the call runs | D8 | "the normal [permission flow](/docs/en/permissions) still applies." | ok |
| L3-S1-03 | The tool executes | D1 | "With tools, Claude can act: read your code, edit files, run commands, search the web, and interact with external services." | ok |
| L3-S1-04 | The result returns to Claude | D1 | "Each tool use returns information that feeds back into the loop, informing Claude's next decision." | ok |
| L3-S1-05 | Claude finishes responding | D7 | "`Stop` | When Claude finishes responding" | ok |
| L3-S1-06 | Without hooks an action happens only if the model chooses it; hooks are what make it deterministic | D8 | "Hooks are user-defined shell commands. Claude Code runs them at specific points in its lifecycle, which gives you deterministic control: certain actions always happen rather than relying on the LLM to choose to run them." | ok |
| L3-S2-00 | With no hook configured there is no exit code, so the selector has no effect | D8 | "To create a hook, add a `hooks` block to a [settings file](#configure-hook-location)." (no hook block ⇒ no hook process ⇒ no exit code) | adjusted |
| L3-S2-01 | With no hooks configured in any settings file, nothing fires | D8 | "To create a hook, add a `hooks` block to a [settings file](#configure-hook-location)." | ok |
| L3-S2-02 | The normal permission flow decides whether the call runs | D8 | "the normal [permission flow](/docs/en/permissions) still applies." | ok |
| L3-S2-03 | The tool executes | D1 | "With tools, Claude can act: read your code, edit files, run commands, search the web, and interact with external services." | ok |
| L3-S2-04 | The result returns to Claude | D1 | "Each tool use returns information that feeds back into the loop, informing Claude's next decision." | ok |
| L3-S2-05 | Claude finishes responding | D7 | "`Stop` | When Claude finishes responding" | ok |
| L3-S2-06 | Without hooks an action happens only if the model chooses it | D8 | "Hooks are user-defined shell commands. Claude Code runs them at specific points in its lifecycle, which gives you deterministic control: certain actions always happen rather than relying on the LLM to choose to run them." | ok |

### `l3.s3` — PreToolUse, exit 0

| Step | Claim | Src | Verbatim excerpt | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| L3-S3-01 | A `PreToolUse` hook can be scoped to a tool by matcher | D7 | "`Bash` matches only the Bash tool" | ok |
| L3-S3-02a | It fires before the tool call executes | D7 | "`PreToolUse` | Before a tool call executes. Can block it" | ok |
| L3-S3-02b | It receives event JSON on stdin | D8 | "When an event fires, Claude Code passes event-specific data as JSON to your script's stdin." | ok |
| L3-S3-03 | On exit 0, stderr goes to the debug log only and Claude never sees it | D7 | "Stderr from a hook that exits 0 goes to the debug log only, never the transcript, and Claude never sees it." | ok |
| L3-S3-04 | Exit 0 from `PreToolUse` does **not** approve the call; the normal permission flow still applies | D8 | "**Exit 0**: the hook reports no objection through its exit code. For a `PreToolUse` hook this doesn't approve the tool call: the normal [permission flow](/docs/en/permissions) still applies." | adjusted |
| L3-S3-05 | The tool executes subject to that permission flow | D8 | "the normal [permission flow](/docs/en/permissions) still applies." | ok |
| L3-S3-06 | The turn ends normally | D7 | "`Stop` | When Claude finishes responding" | ok |

### `l3.s4` — PreToolUse, exit 2 → **blocked**

| Step | Claim | Src | Verbatim excerpt | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| L3-S4-01 | The hook is positioned to see the call before it runs | D8 | "`PreToolUse` hooks fire before any permission-mode check, in every [permission mode](/docs/en/permission-modes), including `dontAsk`." | ok |
| L3-S4-02 | It fires before the call executes | D7 | "`PreToolUse` | Before a tool call executes. Can block it" | ok |
| L3-S4-03 | The script writes a reason to stderr and exits 2 | D8 | "**Exit 2**: Claude Code blocks the action. Write a reason to stderr." | ok |
| L3-S4-04 | On `PreToolUse`, exit 2 blocks the tool call, and Claude Code shows Claude the hook's stderr | D7, D8 | D7: "`PreToolUse` | Yes | Blocks the tool call" · D8: "The guardrail hook exits 2, which denies the tool call. The deny takes precedence, so Claude Code blocks the command and shows Claude the guardrail's stderr." | ok |
| L3-S4-05 | Claude reads that stderr as feedback and can adjust | D8 | "some events feed it to Claude as feedback so it can adjust" | ok |
| L3-S4-06 | Exit 2 blocks whether or not JSON is printed; a JSON `permissionDecision: "allow"` cannot override it | D7 | "exit 2 blocks whether or not you print JSON: even a JSON `permissionDecision` of `\"allow\"` can't override it." | ok |

### `l3.s5` — PostToolUse, exit 0

| Step | Claim | Src | Verbatim excerpt | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| L3-S5-01 | A `PostToolUse` hook is configured in a settings file | D8 | "To create a hook, add a `hooks` block to a [settings file](#configure-hook-location)." | ok |
| L3-S5-02 | `PostToolUse` fires after a tool call succeeds, so the edit is already applied | D7 | "`PostToolUse` | After a tool call succeeds" | ok |
| L3-S5-03 | A common use is running a formatter after edits | D8 | "format files after edits, block commands before they execute, send notifications when Claude needs input, inject context at session start, and more." | ok |
| L3-S5-04 | On exit 0, stdout goes to the debug log and is not shown in the transcript | D7 | "For most events, stdout is written to the debug log but not shown in the transcript." | ok |
| L3-S5-05 | The tool result returns to Claude and the loop continues | D1 | "Each tool use returns information that feeds back into the loop, informing Claude's next decision." | ok |
| L3-S5-06 | The turn ends | D7 | "`Stop` | When Claude finishes responding" | ok |

### `l3.s6` — PostToolUse, exit 2 → **NOT blocked**

| Step | Claim | Src | Verbatim excerpt | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| L3-S6-01 | Claude requests `Edit` | D1 | "**File operations** | Read files, edit code, create new files, rename and reorganize" | ok |
| L3-S6-02 | The call succeeds and the file is written before the hook runs | D7 | "`PostToolUse` | After a tool call succeeds" | ok |
| L3-S6-03 | The hook exits 2 with a message on stderr | D8 | "**Exit 2**: Claude Code blocks the action. Write a reason to stderr." (general form; the per-event outcome is the next row) | ok |
| L3-S6-04 | `PostToolUse` **cannot block**; exit 2 shows stderr to Claude and the tool already ran, so the edit is not undone | D7 | "`PostToolUse` | No | Shows stderr to Claude; the tool already ran" | adjusted |
| L3-S6-05 | Claude sees the message and can react | D7 | "Shows stderr to Claude" | ok |
| L3-S6-06 | Same exit code as the PreToolUse case, different documented meaning | D7 | "`PreToolUse` | Yes | Blocks the tool call" vs "`PostToolUse` | No | Shows stderr to Claude; the tool already ran" | adjusted |

### `l3.s7` — Stop, exit 0

| Step | Claim | Src | Verbatim excerpt | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| L3-S7-01 | Claude does its work for the turn | D1 | "When you give Claude a task, it works through three phases: **gather context**, **take action**, and **verify results**." | ok |
| L3-S7-02 | `Stop` fires whenever Claude finishes responding, not only at task completion | D8 | "`Stop` hooks fire whenever Claude finishes responding, not only at task completion." | adjusted |
| L3-S7-03 | A `Stop` hook can scan the working tree once per turn | D8 | "add a [`Stop`](/docs/en/hooks#stop) hook that scans the working tree once per turn." | ok |
| L3-S7-04 | On exit 0 its stdout goes to the debug log, not the transcript | D7 | "For most events, stdout is written to the debug log but not shown in the transcript." | ok |
| L3-S7-05 | Claude stops as normal and the turn ends | D7 | "`Stop` | When Claude finishes responding" | ok |
| L3-S7-06 | `Stop` hooks do not fire on user interrupts; API errors fire `StopFailure` | D8 | "They don't fire on user interrupts. API errors fire [StopFailure](/docs/en/hooks#stopfailure) instead." | ok |

### `l3.s8` — Stop, exit 2 → **prevents stopping**

| Step | Claim | Src | Verbatim excerpt | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| L3-S8-01 | Claude does its work for the turn | D1 | "Claude decides what each step requires based on what it learned from the previous step" | ok |
| L3-S8-02 | Claude finishes responding and the `Stop` hook fires | D7 | "`Stop` | When Claude finishes responding" | ok |
| L3-S8-03 | The hook exits 2 with a reason on stderr | D8 | "**Exit 2**: Claude Code blocks the action. Write a reason to stderr." | ok |
| L3-S8-04 | On `Stop`, exit 2 prevents Claude from stopping and continues the conversation — nothing is blocked, the turn is extended | D7 | "`Stop` | Yes | Prevents Claude from stopping, continues the conversation" | adjusted |
| L3-S8-05 | Claude keeps working, using the reason as its next instruction | D8 | "the `reason` is fed back to Claude so it keeps working" · "If the model returns `\"ok\": false` because the condition isn't met yet, Claude keeps working and uses the `reason` as its next instruction" | ok |
| L3-S8-06 | Claude Code overrides a `Stop` hook after eight consecutive blocks without progress; scripts should check `stop_hook_active` and exit early when true | D8 | "Claude Code overrides a Stop hook after it blocks eight times in a row without progress. Your hook script needs to check whether it already triggered a continuation. Parse the `stop_hook_active` field from the JSON input and exit early if it's `true`" | ok |

---

## L4 — Skills

### `l4.s1` — you invoke, default frontmatter

| Step | Claim | Src | Verbatim excerpt | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| L4-S1-01 | Descriptions load at session start; full content only when the skill is used | D5, D1 | D5: "In a regular session, skill descriptions are loaded into context so Claude knows what's available, but full skill content only loads when invoked." · D1: "Claude sees skill descriptions at session start, but the full content only loads when a skill is used." | adjusted |
| L4-S1-02 | The command name comes from the skill's directory name | D5 | "The directory name becomes the command you type" | ok |
| L4-S1-03 | With default frontmatter both you and Claude can invoke it | D5 | "(default) | Yes | Yes | Description always in context, full skill loads when invoked" | ok |
| L4-S1-04 | `` !`command` `` lines run before Claude sees the content and their output replaces the placeholder | D5 | "The `` !`<command>` `` syntax runs shell commands before the skill content is sent to Claude. The command output replaces the placeholder, so Claude receives actual data, not the command itself." | ok |
| L4-S1-05 | The rendered content enters the conversation as a single message | D5 | "the rendered `SKILL.md` content enters the conversation as a single message" | ok |
| L4-S1-06 | It stays for the rest of the session and the file is not re-read on later turns | D5 | "and stays there for the rest of the session… Claude Code does not re-read the skill file on later turns" | ok |

### `l4.s2` — Claude invokes, default frontmatter

| Step | Claim | Src | Verbatim excerpt | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| L4-S2-01 | The `description` is in context from session start and is what Claude uses to decide when to apply the skill | D5 | "`description` | Recommended | What the skill does and when to use it. Claude uses this to decide when to apply the skill." | ok |
| L4-S2-02 | Asking something matching the description makes Claude load the skill automatically | D5 | "**Let Claude invoke it automatically** by asking something that matches the description" · "the `description` helps Claude decide when to load the skill automatically." | ok |
| L4-S2-03 | Default frontmatter permits model invocation | D5 | "(default) | Yes | Yes" | ok |
| L4-S2-04 | The file is rendered with dynamic context commands run first | D5 | "runs shell commands before the skill content is sent to Claude" | ok |
| L4-S2-05 | Content enters the conversation as one message | D5 | "enters the conversation as a single message" | ok |
| L4-S2-06 | The difference from a typed slash command is that the trigger was the description matching the request, not a `/` | D5 | "Claude uses skills when relevant, or you can invoke one directly with `/skill-name`." | ok |

### `l4.s3` — you invoke, `disable-model-invocation: true`

| Step | Claim | Src | Verbatim excerpt | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| L4-S3-01 | With `disable-model-invocation: true` the description is not in context; the skill stays out until you invoke it | D5, D3 | D5: "`disable-model-invocation: true` | Yes | No | Description not in context, full skill loads when you invoke" · D3: "Skills with `disable-model-invocation: true` are not in this list. They stay completely out of context until you invoke them with `/name`." | adjusted |
| L4-S3-02 | Only you can invoke it | D5 | "**`disable-model-invocation: true`**: Only you can invoke the skill." | ok |
| L4-S3-03 | User invocation passes the check | D5 | "`disable-model-invocation: true` | Yes | No" | ok |
| L4-S3-04 | The file is rendered with your arguments substituted | D5 | "`$ARGUMENTS` | All arguments passed when invoking the skill." | ok |
| L4-S3-05 | `allowed-tools` pre-approves tools for the invoking turn only, and the grant clears on your next message | D5 | "The `allowed-tools` field grants permission for the listed tools during the turn that invokes the skill, so Claude can use them without prompting you for approval. The grant clears when you send your next message" | ok |
| L4-S3-06 | The full skill loads on your invocation and stays in context | D5 | "Description not in context, full skill loads when you invoke" · "stays there for the rest of the session" | ok |

### `l4.s4` — Claude invokes, `disable-model-invocation: true` → **blocked**

| Step | Claim | Src | Verbatim excerpt | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| L4-S4-01 | The description is not in the startup listing, so Claude has no entry telling it the skill exists | D3 | "Skills with `disable-model-invocation: true` are not in this list. They stay completely out of context until you invoke them with `/name`." | ok |
| L4-S4-02 | The scenario posits Claude attempting the invocation anyway | D5 | "If Claude tries anyway…" | ok |
| L4-S4-03 | The field means only you can invoke the skill | D5 | "Set to `true` to prevent Claude from automatically loading this skill. Use for workflows you want to trigger manually with `/name`." | ok |
| L4-S4-04 | Claude Code blocks the call and instructs Claude not to reproduce the steps another way, so it suggests you run the command yourself | D5 | "If Claude tries anyway, Claude Code blocks the call and instructs it not to reproduce the deploy steps another way, so expect Claude to suggest running `/deploy` yourself." | ok |
| L4-S4-05 | The field is recommended for workflows with side effects | D5 | "Use this for workflows with side effects or that you want to control timing, like `/commit`, `/deploy`, or `/send-slack-message`. You don't want Claude deciding to deploy because your code looks ready." | ok |
| L4-S4-06 | Nothing entered context because the skill never ran | D5 | "Description not in context, full skill loads when you invoke" | ok |

---

## Totals

| Lesson | Spec steps | Review rows | ok | adjusted |
| :--- | ---: | ---: | ---: | ---: |
| L1 | 28 | 30 (2 steps split into sub-rows) | 24 | 6 |
| L2 | 27 | 28 (1 step split into sub-rows) | 24 | 4 |
| L3 | 48 | 50 (1 step split + 1 inert-selector row) | 44 | 6 |
| L4 | 24 | 24 | 22 | 2 |
| **Step rows subtotal** | **127** | **132** | **114** | **18** |
| Cross-cutting adjustment blocks (`L1-ORDER`, `L2-TERM`, `L3-EXIT2`) | — | 3 | 0 | 3 |
| **Total** | **127** | **135** | **114** | **21** |

Every one of the 127 scenario steps in `CONTENT-SPEC.md` has at least one row; steps that make two separable claims were split into `a`/`b` sub-rows so each claim carries its own excerpt.

Rows marked `adjusted` are the ones where the draft spec claimed more than, or something different from, what the documentation states. All 21 were rewritten in `CONTENT-SPEC.md` before this review was finalized; the spec contains no un-reconciled claim.

## Open items for later stages

1. **Positioning copy.** The duplicate check above disproves the plan's "no equivalent exists" premise. Stage 7 README must use the narrow differentiator (input-combination branching + EN/KO + per-step citations + documented-ordering discipline) and should link the closest prior art.
2. **Independent cross-review.** The plan asks for a `claude-code-guide` cross-check performed without handing over the author's conclusions. Not yet run; do it before stage 2 freezes the data modules, and append the reviewer and date here.
3. **Version drift.** Every claim is pinned to docs fetched 2026-08-26. The hooks per-event table in particular lists events (`PostToolUseFailure`, `PostToolBatch`, `TeammateIdle`, …) beyond the four this MVP simulates; a later re-fetch should re-verify the three simulated rows verbatim.
4. **`$ARGUMENTS` with zero arguments** (`L2-S3-04`) is genuinely undocumented. If the docs later specify it, replace the `undocumented` badge with the documented behavior rather than leaving the badge in place.
