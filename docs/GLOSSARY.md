# cc-anatomy — Glossary

Terms used across lessons L1–L4. Each entry is scoped to how the official Claude Code documentation uses the term, as of the 2026-08-26 baseline. Definitions here are the wording the lesson UI should reuse, so the same term never gets two explanations in two lessons.

| # | Term (EN) | 한국어 | One-liner |
| :-- | :--- | :--- | :--- |
| 1 | **Agentic loop** | 에이전트 루프 | The cycle a task runs through — gather context, take action, verify results — repeating until Claude answers with no tool calls. Used in L1. |
| 2 | **Turn** | 턴 | One round trip inside the loop: Claude produces output containing tool calls, the tools run, and the results feed back. A final turn has no tool calls. Used in L1, L4. |
| 3 | **Tool** | 도구 | A capability Claude can call to act rather than just answer — reading files, editing, running commands, searching. Without tools Claude can only respond with text. Used in L1, L3. |
| 4 | **Context window** | 컨텍스트 창 | Everything available to Claude in a session: system instructions, CLAUDE.md, auto memory, loaded skills, conversation history, file contents, command outputs. Used in L1, L4. |
| 5 | **System prompt** | 시스템 프롬프트 | The core instructions for behavior, tool use, and response formatting; the docs describe it as always loaded first, and you never see it. Used in L1. |
| 6 | **CLAUDE.md** | CLAUDE.md | A file of persistent instructions you write. Loaded at the start of every session and delivered as a user message *after* the system prompt — context, not enforced configuration. Used in L1. |
| 7 | **Auto memory** | 자동 메모리 | Notes Claude writes for itself across sessions. The first 200 lines or 25KB of `MEMORY.md`, whichever comes first, load at the start of each session. Used in L1. |
| 8 | **Startup context** | 시작 컨텍스트 | cc-anatomy's name for what loads before your first prompt — CLAUDE.md, auto memory, MCP tool names, skill descriptions. The docs list these together **without stating an order among them**, so the diagram draws them unordered. Used in L1. |
| 9 | **Slash command** | 슬래시 명령 | A `/name` you type at the start of a message. Text following the name becomes its arguments. Custom commands have been merged into skills, so `.claude/commands/deploy.md` and `.claude/skills/deploy/SKILL.md` both create `/deploy`. Used in L2, L4. |
| 10 | **`$ARGUMENTS`** | `$ARGUMENTS` | The placeholder that expands to all arguments passed when invoking. If it is absent from the content, arguments are appended as `ARGUMENTS: <value>` instead. Used in L2. |
| 11 | **Skill / SKILL.md** | 스킬 / SKILL.md | A file of instructions Claude adds to its toolkit. Its `description` is in context from session start; the body loads only when the skill is used, then stays for the rest of the session. Used in L4. |
| 12 | **Model invocation** | 모델 호출 | Claude loading a skill on its own because your request matches the skill's description — as opposed to you typing `/name`. `disable-model-invocation: true` turns it off. Used in L4. |
| 13 | **`allowed-tools`** | `allowed-tools` | Frontmatter that pre-approves tools for the single turn that invoked the skill. The grant clears when you send your next message. Used in L4. |
| 14 | **Hook** | 훅 | A user-defined shell command Claude Code runs at a fixed lifecycle point, giving deterministic control: the action always happens instead of depending on the model choosing it. Used in L3. |
| 15 | **Hook event** | 훅 이벤트 | The named lifecycle point a hook attaches to — `PreToolUse` (before a tool call executes, can block it), `PostToolUse` (after a tool call succeeds), `Stop` (when Claude finishes responding), and others. Used in L3. |
| 16 | **Exit code (hooks)** | 종료 코드 (훅) | How a hook reports back. Exit 0 means no objection — for `PreToolUse` that is *not* approval, the normal permission flow still applies. **Exit 2 means different things per event** (see next row). Used in L3. |
| 17 | **Per-event exit 2** | 이벤트별 exit 2 | The rule cc-anatomy exists to teach: exit 2 blocks the tool call on `PreToolUse`, only shows stderr to Claude on `PostToolUse` because the tool already ran, and prevents Claude from stopping on `Stop`. Never "exit 2 = block". Used in L3. |
| 18 | **Permission flow** | 권한 흐름 | The check that decides whether a tool call runs. A `PreToolUse` hook fires before any permission-mode check, and exiting 0 hands the decision back to this flow. Used in L3. |

## Terms deliberately not used in the MVP

`subagent`, `MCP server`, `plugin`, `compaction`, `permission mode`, and `plan mode` appear in the source documentation but are out of MVP scope. If a lesson draft reaches for one of them, that is a signal the lesson has drifted past L1–L4 — add it here first, with the same documentation discipline, before it reaches a step description.
