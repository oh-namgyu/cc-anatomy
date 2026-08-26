# cc-anatomy — Content Specification (Stage 1)

**Status:** frozen content spec for MVP lessons L1–L4. Implementation (stage 2+) turns this document into lesson data modules; it does not re-decide the wording here.

**Model boundary (applies to every lesson):** cc-anatomy replays a *conceptual model of documented behavior*, not the actual implementation. Every step description below is phrased as what the official documentation states. Where the docs do not state something, the spec says so instead of guessing. Accuracy evidence for every step lives in [`CONTENT-REVIEW.md`](CONTENT-REVIEW.md).

**Documentation baseline:** official Claude Code docs at `https://code.claude.com/docs/en/...`, as fetched **2026-08-26**. Lesson data carries this date and its `sources[]` URLs.

**Unofficial:** cc-anatomy is a community learning tool, not affiliated with Anthropic.

---

## 0. Schema this spec targets

Per the project plan, each lesson is a pure data module:

```
{ id, title:{en,ko}, intro:{en,ko},
  diagram:{ nodes[], edges[] },
  inputs:{ widgetId: [allowed values...] },     // ≤2 widgets per lesson, ≤8 total combinations
  scenarios:[ { id, trigger:{widgetId:value,...}, steps:[{node, edge?, explain:{en,ko}, badge?}] } ],
  quiz:[ {q:{en,ko}, choices[], answer} ],
  sources:[url...] }
```

**Branch completeness contract:** the Cartesian product of `inputs` must be fully covered by `scenarios[].trigger`. Every combination listed in this spec has exactly one scenario.

### Node kinds used in the diagrams

| kind | Meaning |
| :--- | :--- |
| `event` | A lifecycle point the docs name (session start, tool call, turn end) |
| `artifact` | Something loaded into context (system prompt, CLAUDE.md, skill body) |
| `decision` | A documented branch point |
| `cluster` | A **visual grouping whose members have no documented order among them** |
| `terminal` | An end state for the replay |

The `cluster` kind exists because of the L1 ordering rule below.

---

## 1. L1 — The Agent Loop

- **title.en:** The Agent Loop
- **title.ko:** 에이전트 루프
- **intro.en:** Before you type anything, a session already has content loaded. Then your prompt starts a cycle: Claude evaluates, may call tools, receives results, and repeats until it answers with no tool calls.
- **intro.ko:** 무언가를 입력하기 전에 이미 세션에는 여러 내용이 올라와 있습니다. 그 다음 프롬프트가 순환을 시작합니다 — 클로드가 판단하고, 도구를 호출할 수 있고, 결과를 받고, 도구 호출이 없는 응답을 낼 때까지 반복합니다.

### 1.1 ORDERING RULE (binding)

The docs state **only two ordering facts** about session startup:

1. The system prompt is *"Always loaded first."*
2. CLAUDE.md content *"is delivered as a user message after the system prompt, not as part of the system prompt itself."* CLAUDE.md files among themselves load *"from broadest scope to most specific."*

The docs describe everything else that loads at startup as an **unordered list**: *"Before you type anything: CLAUDE.md, auto memory, MCP tool names, and skill descriptions all load into context."*

Therefore: `n_sysprompt` is drawn first; everything else that loads before the first prompt is drawn inside the **`n_startup` cluster with no ordering arrows between its members**, and the diagram carries the visible label *"the docs list these together without stating an order among them."* The player highlights cluster members **simultaneously**, never in sequence. Implementation must not add sequencing arrows inside this cluster.

### 1.2 Nodes

| id | label.en | label.ko | kind | Role (one line) |
| :--- | :--- | :--- | :--- | :--- |
| `l1.session_start` | Session start | 세션 시작 | event | A new session begins with a fresh context window. |
| `l1.system_prompt` | System prompt | 시스템 프롬프트 | artifact | Core instructions for behavior, tool use, and formatting; the docs say it is always loaded first. |
| `l1.startup` | Startup context (no documented order) | 시작 컨텍스트 (문서상 순서 없음) | cluster | Container for what the docs list as loading before your first prompt, without stating an order. |
| `l1.claude_md` | CLAUDE.md files | CLAUDE.md 파일들 | artifact | Persistent instructions you wrote; delivered as a user message after the system prompt. |
| `l1.auto_memory` | Auto memory (MEMORY.md) | 자동 메모리 (MEMORY.md) | artifact | Claude's own notes from earlier sessions; first 200 lines or 25KB load. |
| `l1.skill_list` | Skill descriptions | 스킬 설명 목록 | artifact | Short descriptions so Claude knows what it can invoke; full bodies stay out. |
| `l1.tool_defs` | Tool names and definitions | 도구 이름·정의 | artifact | What Claude can call; MCP schemas are deferred by default. |
| `l1.prompt` | Your prompt | 사용자 프롬프트 | event | What you type; small compared to what is already loaded. |
| `l1.evaluate` | Claude evaluates | 클로드가 판단 | decision | Claude evaluates the current state and responds with text, tool calls, or both. |
| `l1.tool_call` | Tool call | 도구 호출 | event | Claude requests one or more tools; the harness runs them. |
| `l1.tool_result` | Tool result | 도구 결과 | event | Results feed back to Claude for the next decision. |
| `l1.final` | Final response (no tool calls) | 최종 응답 (도구 호출 없음) | terminal | The loop ends when Claude produces a response with no tool calls. |

### 1.3 Edges

| from | to | label |
| :--- | :--- | :--- |
| `l1.session_start` | `l1.system_prompt` | loaded first |
| `l1.system_prompt` | `l1.startup` | then, as a user message after the system prompt |
| `l1.startup` | `l1.prompt` | you type |
| `l1.prompt` | `l1.evaluate` | — |
| `l1.evaluate` | `l1.tool_call` | tool calls requested |
| `l1.tool_call` | `l1.tool_result` | executed |
| `l1.tool_result` | `l1.evaluate` | **loop back** |
| `l1.evaluate` | `l1.final` | no tool calls |

Cluster membership (drawn as containment, **not** as edges): `l1.startup` ⊇ { `l1.claude_md`, `l1.auto_memory`, `l1.skill_list`, `l1.tool_defs` }.

### 1.4 Inputs

```
inputs: {
  task:      ["question", "edit"],
  claude_md: ["absent", "present"]
}
```
2 widgets · 2 × 2 = **4 combinations**.

- `task` chips: `"what files are here?"` (question) / `"fix the failing tests in auth.ts"` (edit)
- `claude_md` toggle: project has no CLAUDE.md / project has a CLAUDE.md

### 1.5 Scenarios

#### `l1.s1` — trigger `{task:"question", claude_md:"absent"}`

| # | node | explain.en | explain.ko | badge |
| :-- | :--- | :--- | :--- | :--- |
| 1 | `l1.system_prompt` | The session starts with a fresh context window. The docs describe the system prompt as always loaded first. | 새 컨텍스트 창으로 세션이 시작됩니다. 문서는 시스템 프롬프트가 항상 가장 먼저 로드된다고 기술합니다. | |
| 2 | `l1.startup` | Auto memory, skill descriptions, and tool names load before you type. The docs list these together and do not state an order among them. | 자동 메모리, 스킬 설명, 도구 이름이 입력 전에 로드됩니다. 문서는 이들을 함께 나열할 뿐 서로의 순서는 밝히지 않습니다. | `unordered` |
| 3 | `l1.prompt` | You send "what files are here?". The docs note your prompt is tiny compared with what is already loaded. | "여기 무슨 파일이 있어?"를 보냅니다. 문서는 프롬프트가 이미 로드된 것에 비해 아주 작다고 설명합니다. | |
| 4 | `l1.evaluate` | Claude evaluates the current state and determines how to proceed: text, tool calls, or both. | 클로드가 현재 상태를 판단해 진행 방식을 정합니다 — 텍스트, 도구 호출, 또는 둘 다. | |
| 5 | `l1.tool_call` | Claude calls `Glob`. The docs give this exact case: a quick question might take one or two turns of calling `Glob`. | 클로드가 `Glob` 을 호출합니다. 문서가 바로 이 사례를 듭니다 — 간단한 질문은 `Glob` 호출로 한두 턴이면 끝납니다. | |
| 6 | `l1.tool_result` | The result feeds back to Claude for the next decision. Each full cycle is one turn. | 결과가 클로드에게 되돌아가 다음 판단의 근거가 됩니다. 한 순환이 한 턴입니다. | |
| 7 | `l1.final` | Claude produces a response with no tool calls, and the loop ends. | 클로드가 도구 호출 없는 응답을 내놓고 루프가 끝납니다. | `end` |

#### `l1.s2` — trigger `{task:"question", claude_md:"present"}`

Same as `l1.s1` except step 2 is split so the CLAUDE.md fact is shown:

| # | node | explain.en | explain.ko | badge |
| :-- | :--- | :--- | :--- | :--- |
| 1 | `l1.system_prompt` | The system prompt is loaded first. | 시스템 프롬프트가 가장 먼저 로드됩니다. | |
| 2 | `l1.claude_md` | Your CLAUDE.md is delivered as a user message after the system prompt, not as part of it. Multiple CLAUDE.md files load from broadest scope to most specific. | CLAUDE.md 는 시스템 프롬프트의 일부가 아니라, 그 뒤에 사용자 메시지로 전달됩니다. 여러 CLAUDE.md 는 넓은 범위에서 좁은 범위 순으로 로드됩니다. | |
| 3 | `l1.startup` | Auto memory, skill descriptions, and tool names load alongside it. The docs state no order among these. | 자동 메모리, 스킬 설명, 도구 이름이 함께 로드됩니다. 문서는 이들 사이의 순서를 밝히지 않습니다. | `unordered` |
| 4 | `l1.prompt` | You send "what files are here?". | "여기 무슨 파일이 있어?"를 보냅니다. | |
| 5 | `l1.evaluate` | Claude evaluates and decides how to proceed. | 클로드가 판단하고 진행 방식을 정합니다. | |
| 6 | `l1.tool_call` | Claude calls `Glob`. | 클로드가 `Glob` 을 호출합니다. | |
| 7 | `l1.final` | A response with no tool calls ends the loop. CLAUDE.md is context, not enforced configuration — the docs are explicit that it shapes behavior without guaranteeing compliance. | 도구 호출 없는 응답이 루프를 끝냅니다. CLAUDE.md 는 강제 설정이 아니라 컨텍스트입니다 — 문서는 준수가 보장되지 않는다고 명시합니다. | `end` |

#### `l1.s3` — trigger `{task:"edit", claude_md:"absent"}`

| # | node | explain.en | explain.ko | badge |
| :-- | :--- | :--- | :--- | :--- |
| 1 | `l1.system_prompt` | The system prompt loads first. | 시스템 프롬프트가 먼저 로드됩니다. | |
| 2 | `l1.startup` | Auto memory, skill descriptions, and tool names load before your prompt, in no documented order. | 자동 메모리, 스킬 설명, 도구 이름이 프롬프트 전에 로드됩니다 — 문서상 순서는 없습니다. | `unordered` |
| 3 | `l1.prompt` | You send "fix the failing tests in auth.ts". | "auth.ts 의 실패 테스트를 고쳐줘"를 보냅니다. | |
| 4 | `l1.tool_call` | Turn 1: Claude calls `Bash` to run `npm test` and sees three failures. | 1턴: 클로드가 `Bash` 로 `npm test` 를 실행해 3건의 실패를 확인합니다. | `turn 1` |
| 5 | `l1.tool_result` | The output returns to Claude; each result informs the next step. | 출력이 클로드에게 돌아가고, 각 결과가 다음 단계를 결정합니다. | |
| 6 | `l1.tool_call` | Turn 2–3: Claude reads the files, then calls `Edit`, then re-runs the tests. Tools that modify state run sequentially. | 2~3턴: 파일을 읽고 `Edit` 후 테스트를 다시 실행합니다. 상태를 바꾸는 도구는 순차 실행됩니다. | `turn 2-3` |
| 7 | `l1.final` | Final turn: a text-only response with no tool calls. Four turns total — three with tool calls, one final text. | 마지막 턴: 도구 호출 없는 텍스트 응답. 총 4턴 — 3턴은 도구 호출, 1턴은 최종 텍스트. | `end` |

#### `l1.s4` — trigger `{task:"edit", claude_md:"present"}`

Steps 1–2 as in `l1.s2` (CLAUDE.md shown separately, then the unordered cluster), steps 3–7 as in `l1.s3`, with one added note on step 7:

| # | node | explain.en | explain.ko | badge |
| :-- | :--- | :--- | :--- | :--- |
| 1 | `l1.system_prompt` | The system prompt loads first. | 시스템 프롬프트가 먼저 로드됩니다. | |
| 2 | `l1.claude_md` | CLAUDE.md arrives as a user message after the system prompt. | CLAUDE.md 는 시스템 프롬프트 뒤에 사용자 메시지로 도착합니다. | |
| 3 | `l1.startup` | The rest of the startup content loads with it, in no documented order. | 나머지 시작 컨텍스트가 함께 로드됩니다 — 문서상 순서 없음. | `unordered` |
| 4 | `l1.prompt` | You send "fix the failing tests in auth.ts". | "auth.ts 의 실패 테스트를 고쳐줘"를 보냅니다. | |
| 5 | `l1.tool_call` | Claude runs the tests, reads the files, and edits. | 클로드가 테스트를 실행하고 파일을 읽고 수정합니다. | |
| 6 | `l1.tool_result` | Each tool result feeds back into the next evaluation. | 각 도구 결과가 다음 판단으로 되먹임됩니다. | |
| 7 | `l1.final` | The loop ends with a text-only response. If a rule must apply no matter what Claude decides, the docs point to a hook instead of CLAUDE.md. | 텍스트 응답으로 루프가 끝납니다. 클로드의 판단과 무관하게 반드시 적용되어야 하는 규칙이라면, 문서는 CLAUDE.md 대신 훅을 쓰라고 안내합니다. | `end` |

### 1.6 Quiz

1. **en:** What does the documentation say ends the agent loop? · **ko:** 문서에 따르면 에이전트 루프는 무엇으로 끝납니까?
   - a) A fixed number of tool calls / 정해진 횟수의 도구 호출
   - b) **Claude producing a response with no tool calls / 도구 호출이 없는 응답을 클로드가 내놓을 때** ✅
   - c) The user pressing Enter / 사용자가 엔터를 누를 때
   - d) The context window filling up / 컨텍스트 창이 가득 찰 때

2. **en:** Where does CLAUDE.md content arrive, according to the docs? · **ko:** 문서에 따르면 CLAUDE.md 내용은 어디로 전달됩니까?
   - a) Inside the system prompt / 시스템 프롬프트 안에
   - b) **As a user message after the system prompt / 시스템 프롬프트 뒤의 사용자 메시지로** ✅
   - c) Only when Claude reads a file / 클로드가 파일을 읽을 때만
   - d) It is not loaded into context / 컨텍스트에 로드되지 않는다

3. **en:** Among auto memory, skill descriptions, and MCP tool names at startup, what do the docs say about their order? · **ko:** 시작 시 자동 메모리·스킬 설명·MCP 도구 이름의 순서에 대해 문서는 무엇이라 말합니까?
   - a) Auto memory always comes first / 자동 메모리가 항상 먼저다
   - b) Skill descriptions always come last / 스킬 설명이 항상 마지막이다
   - c) **The docs list them together without stating an order / 문서는 순서를 밝히지 않고 함께 나열한다** ✅
   - d) They load alphabetically / 알파벳 순으로 로드된다

### 1.7 Sources

- `https://code.claude.com/docs/en/how-claude-code-works`
- `https://code.claude.com/docs/en/agent-sdk/agent-loop`
- `https://code.claude.com/docs/en/context-window`
- `https://code.claude.com/docs/en/memory`

---

## 2. L2 — Slash Commands

- **title.en:** Slash Commands
- **title.ko:** 슬래시 명령
- **intro.en:** A slash command is a file whose content becomes a prompt. Typing `/name` renders that file — substituting any arguments you passed — and hands the result to Claude.
- **intro.ko:** 슬래시 명령은 내용이 곧 프롬프트가 되는 파일입니다. `/이름` 을 입력하면 그 파일이 렌더링되고 — 전달한 인자가 치환되어 — 결과가 클로드에게 전달됩니다.

### 2.1 Terminology note (binding)

As of the 2026-08 docs, **custom commands have been merged into skills**: `.claude/commands/deploy.md` and `.claude/skills/deploy/SKILL.md` both create `/deploy` and work the same way; existing `.claude/commands/` files keep working. `https://code.claude.com/docs/en/slash-commands` now resolves to the skills page. This lesson therefore teaches *the user-typed `/name` path*, and the UI must not claim `.claude/commands/` is the only or current location. Where a skill and a command share a name, the docs say the skill takes precedence.

### 2.2 Nodes

| id | label.en | label.ko | kind | Role (one line) |
| :--- | :--- | :--- | :--- | :--- |
| `l2.type` | You type `/name [args]` | `/이름 [인자]` 입력 | event | A command is only recognized at the start of your message. |
| `l2.parse` | Split name and arguments | 이름·인자 분리 | event | Text that follows the command name becomes its arguments. |
| `l2.resolve` | Resolve the file | 파일 해석 | decision | `.claude/skills/<name>/SKILL.md` or `.claude/commands/<name>.md`; the skill wins on a name clash. |
| `l2.substitute` | `$ARGUMENTS` substitution | `$ARGUMENTS` 치환 | event | `$ARGUMENTS` expands to all arguments passed when invoking. |
| `l2.append` | Append `ARGUMENTS: <value>` | `ARGUMENTS: <값>` 덧붙임 | event | Used when arguments were passed but the content has no `$ARGUMENTS`. |
| `l2.inject` | Rendered content enters the conversation | 렌더링된 내용이 대화에 진입 | artifact | Enters as a single message and stays for the rest of the session. |
| `l2.evaluate` | Claude follows the instructions | 클로드가 지시를 수행 | decision | The rendered text is a prompt; Claude acts on it. |
| `l2.response` | Response | 응답 | terminal | Claude answers, having acted on the rendered instructions. |

### 2.3 Edges

`l2.type` → `l2.parse` → `l2.resolve` → { `l2.substitute` | `l2.append` } → `l2.inject` → `l2.evaluate` → `l2.response`

The fork after `l2.resolve` is the documented branch: substitution when the content contains `$ARGUMENTS`, appending when it does not.

### 2.4 Inputs

```
inputs: {
  body: ["with-placeholder", "no-placeholder"],
  args: ["none", "123"]
}
```
2 widgets · 2 × 2 = **4 combinations**.

- `body` chips: `Fix GitHub issue $ARGUMENTS following our coding standards.` / `Deploy the application to production.`
- `args` chips: `/fix-issue` (none) / `/fix-issue 123`

### 2.5 Scenarios

#### `l2.s1` — trigger `{body:"with-placeholder", args:"123"}` — the canonical case

| # | node | explain.en | explain.ko | badge |
| :-- | :--- | :--- | :--- | :--- |
| 1 | `l2.type` | You type `/fix-issue 123`. A command is only recognized at the start of your message. | `/fix-issue 123` 를 입력합니다. 명령은 메시지 맨 앞에서만 인식됩니다. | |
| 2 | `l2.parse` | Text that follows the command name becomes its arguments, so `123` is the argument. | 명령 이름 뒤의 텍스트가 인자가 되므로 `123` 이 인자입니다. | |
| 3 | `l2.resolve` | The name maps to a file: a directory under `.claude/skills/` gives its directory name, a file under `.claude/commands/` gives its file name without the extension. | 이름이 파일로 연결됩니다 — `.claude/skills/` 아래는 디렉토리 이름, `.claude/commands/` 아래는 확장자를 뺀 파일 이름. | |
| 4 | `l2.substitute` | `$ARGUMENTS` expands to all arguments passed. The content becomes "Fix GitHub issue 123 following our coding standards…". | `$ARGUMENTS` 가 전달된 인자 전체로 확장됩니다. 내용은 "Fix GitHub issue 123 following our coding standards…" 가 됩니다. | `substituted` |
| 5 | `l2.inject` | The rendered content enters the conversation as a single message and stays there for the rest of the session. | 렌더링된 내용이 하나의 메시지로 대화에 들어가 세션이 끝날 때까지 남습니다. | |
| 6 | `l2.evaluate` | Claude receives that text as its instructions and works on the issue. | 클로드는 그 텍스트를 지시로 받아 이슈 작업을 진행합니다. | |
| 7 | `l2.response` | Claude answers, having acted on the rendered prompt. | 렌더링된 프롬프트에 따라 작업하고 응답합니다. | `end` |

#### `l2.s2` — trigger `{body:"no-placeholder", args:"123"}` — the append branch

| # | node | explain.en | explain.ko | badge |
| :-- | :--- | :--- | :--- | :--- |
| 1 | `l2.type` | You type `/deploy 123`. | `/deploy 123` 를 입력합니다. | |
| 2 | `l2.parse` | `123` becomes the arguments. | `123` 이 인자가 됩니다. | |
| 3 | `l2.resolve` | The file for `/deploy` is found. Its content contains no `$ARGUMENTS`. | `/deploy` 의 파일을 찾습니다. 내용에 `$ARGUMENTS` 가 없습니다. | |
| 4 | `l2.append` | Because the content has no `$ARGUMENTS`, the arguments are appended as `ARGUMENTS: 123` at the end, so Claude still sees what you typed. | `$ARGUMENTS` 가 없으므로 인자가 끝에 `ARGUMENTS: 123` 로 덧붙습니다. 그래서 입력한 내용을 클로드가 여전히 봅니다. | `appended` |
| 5 | `l2.inject` | The rendered content enters the conversation as one message. | 렌더링된 내용이 하나의 메시지로 대화에 들어갑니다. | |
| 6 | `l2.evaluate` | Claude reads the deploy steps plus the trailing `ARGUMENTS:` line. | 클로드가 배포 단계와 뒤에 붙은 `ARGUMENTS:` 줄을 읽습니다. | |
| 7 | `l2.response` | Claude responds. | 클로드가 응답합니다. | `end` |

#### `l2.s3` — trigger `{body:"with-placeholder", args:"none"}`

| # | node | explain.en | explain.ko | badge |
| :-- | :--- | :--- | :--- | :--- |
| 1 | `l2.type` | You type `/fix-issue` with nothing after it. | 뒤에 아무것도 없이 `/fix-issue` 만 입력합니다. | |
| 2 | `l2.parse` | The docs state that text following the command name becomes its arguments — here there is none. | 문서는 명령 이름 뒤의 텍스트가 인자가 된다고 합니다 — 여기서는 없습니다. | |
| 3 | `l2.resolve` | The file for `/fix-issue` is found; its content contains `$ARGUMENTS`. | `/fix-issue` 파일을 찾습니다. 내용에 `$ARGUMENTS` 가 있습니다. | |
| 4 | `l2.substitute` | The docs define `$ARGUMENTS` as all arguments passed when invoking, and they do **not** state what the placeholder becomes when no arguments were passed. cc-anatomy shows this as undocumented rather than guessing. | 문서는 `$ARGUMENTS` 를 "호출 시 전달된 인자 전체" 로 정의할 뿐, 인자가 없을 때 무엇이 되는지는 **명시하지 않습니다**. cc-anatomy 는 추측 대신 "문서 미기재" 로 표시합니다. | `undocumented` |
| 5 | `l2.inject` | Whatever the placeholder renders to, the rendered content enters the conversation as a single message. | 치환 결과가 무엇이든, 렌더링된 내용은 하나의 메시지로 대화에 들어갑니다. | |
| 6 | `l2.evaluate` | Claude works from instructions with no issue number, so it will typically need to ask or infer. | 이슈 번호 없는 지시로 작업하게 되므로, 보통 되묻거나 추론해야 합니다. | |
| 7 | `l2.response` | Claude responds. | 클로드가 응답합니다. | `end` |

#### `l2.s4` — trigger `{body:"no-placeholder", args:"none"}` — the plain case

| # | node | explain.en | explain.ko | badge |
| :-- | :--- | :--- | :--- | :--- |
| 1 | `l2.type` | You type `/deploy`. | `/deploy` 를 입력합니다. | |
| 2 | `l2.parse` | No text follows the name, so there are no arguments. | 이름 뒤에 텍스트가 없으므로 인자가 없습니다. | |
| 3 | `l2.resolve` | The file for `/deploy` is found. If both a skill and a command file use the name, the skill takes precedence. | `/deploy` 파일을 찾습니다. 스킬과 명령 파일이 이름을 공유하면 스킬이 우선합니다. | |
| 4 | `l2.inject` | With no arguments and no placeholder, the file's content is what enters the conversation, as a single message. | 인자도 플레이스홀더도 없으므로 파일 내용 그대로가 하나의 메시지로 대화에 들어갑니다. | |
| 5 | `l2.evaluate` | Claude follows the deploy steps as written. | 클로드가 적힌 대로 배포 단계를 수행합니다. | |
| 6 | `l2.response` | Claude responds. The content stays in context for the rest of the session; the docs note Claude Code does not re-read the file on later turns. | 클로드가 응답합니다. 내용은 세션 내내 컨텍스트에 남고, 이후 턴에 파일을 다시 읽지 않는다고 문서는 설명합니다. | `end` |

### 2.6 Quiz

1. **en:** You invoke a command with arguments, but its content has no `$ARGUMENTS`. What do the docs say happens? · **ko:** 인자와 함께 명령을 호출했는데 내용에 `$ARGUMENTS` 가 없습니다. 문서는 어떻게 된다고 합니까?
   - a) The invocation fails / 호출이 실패한다
   - b) The arguments are discarded / 인자가 버려진다
   - c) **The arguments are appended as `ARGUMENTS: <value>` / 인자가 `ARGUMENTS: <값>` 로 덧붙는다** ✅
   - d) Claude is asked to supply them / 클로드에게 인자를 물어본다

2. **en:** Where in your message must a slash command appear? · **ko:** 슬래시 명령은 메시지의 어디에 있어야 합니까?
   - a) Anywhere in the message / 메시지 어디든
   - b) **Only at the start of the message / 메시지 맨 앞에만** ✅
   - c) Only on its own line / 자기 줄에만
   - d) Only at the end / 맨 끝에만

3. **en:** A `deploy` skill and a `deploy.md` command file both exist. Which one runs? · **ko:** `deploy` 스킬과 `deploy.md` 명령 파일이 둘 다 있습니다. 무엇이 실행됩니까?
   - a) The command file / 명령 파일
   - b) **The skill / 스킬** ✅
   - c) Both, in sequence / 둘 다 순서대로
   - d) Neither; it is an error / 둘 다 아니고 오류다

### 2.7 Sources

- `https://code.claude.com/docs/en/skills`
- `https://code.claude.com/docs/en/commands`

---

## 3. L3 — Hooks

- **title.en:** Hooks
- **title.ko:** 훅
- **intro.en:** Hooks are shell commands Claude Code runs at fixed lifecycle points. The exit code is how a hook talks back — and **exit 2 does not mean the same thing on every event**. This lesson makes that difference the point.
- **intro.ko:** 훅은 정해진 생애주기 지점에서 Claude Code 가 실행하는 셸 명령입니다. 훅은 종료 코드로 응답하는데, **exit 2 의 의미는 이벤트마다 다릅니다**. 이 레슨은 그 차이를 정면으로 다룹니다.

### 3.1 EXIT-CODE RULE (binding)

The app must **never** present "exit 2 = block" as a general rule. The docs give a per-event table; three of its rows are simulated here, and they differ:

| Event | Can block? | What the docs say happens on exit 2 |
| :--- | :--- | :--- |
| `PreToolUse` | **Yes** | *"Blocks the tool call"* |
| `PostToolUse` | **No** | *"Shows stderr to Claude; the tool already ran"* |
| `Stop` | **Yes** | *"Prevents Claude from stopping, continues the conversation"* |

Each of the three has its own scenario and its own terminal node. The player must not reuse a single "blocked" badge across all three: `PostToolUse` exit 2 gets a `not blocked` badge, `Stop` exit 2 gets a `continues` badge.

### 3.2 Nodes

| id | label.en | label.ko | kind | Role (one line) |
| :--- | :--- | :--- | :--- | :--- |
| `l3.request` | Claude requests a tool | 클로드가 도구를 요청 | event | The point before a tool call executes. |
| `l3.pre` | `PreToolUse` fires | `PreToolUse` 발화 | event | Before a tool call executes; can block it. |
| `l3.perm` | Permission flow | 권한 흐름 | decision | Exit 0 from PreToolUse does not approve the call; the normal permission flow still applies. |
| `l3.exec` | Tool executes | 도구 실행 | event | The tool runs and produces a result. |
| `l3.post` | `PostToolUse` fires | `PostToolUse` 발화 | event | After a tool call succeeds; the tool has already run. |
| `l3.result` | Result returns to Claude | 결과가 클로드에게 | event | The tool result feeds back into the loop. |
| `l3.turn_end` | Claude finishes responding | 클로드가 응답 완료 | event | Where `Stop` fires — every time Claude finishes responding, not only at task completion. |
| `l3.stop` | `Stop` fires | `Stop` 발화 | event | When Claude finishes responding. |
| `l3.blocked` | Tool call blocked | 도구 호출 차단 | terminal | PreToolUse exit 2 outcome. |
| `l3.feedback` | stderr shown to Claude | stderr 를 클로드에게 표시 | artifact | PostToolUse exit 2 outcome — the tool already ran. |
| `l3.continue` | Claude keeps working | 클로드가 계속 작업 | terminal | Stop exit 2 outcome — the conversation continues. |
| `l3.debug_log` | Debug log | 디버그 로그 | artifact | Where stdout and stderr go on exit 0 for these events. |
| `l3.done` | Turn ends | 턴 종료 | terminal | Normal completion. |

### 3.3 Edges

`l3.request` → `l3.pre` → { `l3.blocked` (exit 2) | `l3.perm` (exit 0) } ; `l3.perm` → `l3.exec` → `l3.post` → { `l3.feedback` (exit 2) | `l3.debug_log` (exit 0) } → `l3.result` → `l3.turn_end` → `l3.stop` → { `l3.continue` (exit 2) | `l3.done` (exit 0) }

When `hook = off`, the path is `l3.request` → `l3.perm` → `l3.exec` → `l3.result` → `l3.turn_end` → `l3.done` with the three hook nodes drawn dimmed.

### 3.4 Inputs

```
inputs: {
  hook: ["off", "PreToolUse", "PostToolUse", "Stop"],
  exit: ["0", "2"]
}
```
2 widgets · 4 × 2 = **8 combinations** (the plan's ceiling).

When `hook = "off"` the exit-code widget is not meaningful; both combinations are mapped to explicit scenarios that say so, so the branch-completeness gate stays green without a fallback.

### 3.5 Scenarios

#### `l3.s1` — `{hook:"off", exit:"0"}` and `l3.s2` — `{hook:"off", exit:"2"}`

Identical step lists. `l3.s2` adds a leading note: *"No hook is configured, so no exit code is produced. The selector has no effect here."* / *"설정된 훅이 없어 종료 코드도 생기지 않습니다. 선택값은 여기서 영향이 없습니다."*

| # | node | explain.en | explain.ko | badge |
| :-- | :--- | :--- | :--- | :--- |
| 1 | `l3.request` | Claude requests a tool. No hooks are configured in any settings file. | 클로드가 도구를 요청합니다. 어느 설정 파일에도 훅이 없습니다. | `no hooks` |
| 2 | `l3.perm` | The normal permission flow decides whether the call runs. | 일반 권한 흐름이 호출 실행 여부를 결정합니다. | |
| 3 | `l3.exec` | The tool executes. | 도구가 실행됩니다. | |
| 4 | `l3.result` | The result returns to Claude. | 결과가 클로드에게 돌아갑니다. | |
| 5 | `l3.turn_end` | Claude finishes responding. | 클로드가 응답을 마칩니다. | |
| 6 | `l3.done` | The turn ends. Hooks give deterministic control — without them, an action happens only if the model chooses it. | 턴이 끝납니다. 훅은 결정론적 통제를 제공합니다 — 훅이 없으면 그 동작은 모델이 선택할 때만 일어납니다. | `end` |

#### `l3.s3` — `{hook:"PreToolUse", exit:"0"}`

| # | node | explain.en | explain.ko | badge |
| :-- | :--- | :--- | :--- | :--- |
| 1 | `l3.request` | Claude requests `Bash`. A `PreToolUse` hook matching `Bash` is configured in a settings file. | 클로드가 `Bash` 를 요청합니다. `Bash` 에 매칭되는 `PreToolUse` 훅이 설정 파일에 있습니다. | |
| 2 | `l3.pre` | The hook fires before the tool call executes and receives the event JSON on stdin. | 도구 호출 실행 전에 훅이 발화하고, 이벤트 JSON 을 stdin 으로 받습니다. | |
| 3 | `l3.debug_log` | It exits 0. Stderr from a hook that exits 0 goes to the debug log only, never the transcript, and Claude never sees it. | exit 0 으로 종료합니다. exit 0 훅의 stderr 는 디버그 로그로만 가고 트랜스크립트에는 절대 나타나지 않으며 클로드도 보지 못합니다. | `exit 0` |
| 4 | `l3.perm` | Exit 0 reports no objection — for `PreToolUse` this does **not** approve the call; the normal permission flow still applies. | exit 0 은 이의 없음일 뿐 — `PreToolUse` 에서 이것이 호출을 **승인하지는 않습니다**. 일반 권한 흐름이 그대로 적용됩니다. | |
| 5 | `l3.exec` | The tool executes, subject to that permission flow. | 권한 흐름을 거쳐 도구가 실행됩니다. | |
| 6 | `l3.done` | The result returns and the turn ends normally. | 결과가 돌아오고 턴이 정상 종료됩니다. | `end` |

#### `l3.s4` — `{hook:"PreToolUse", exit:"2"}` — **blocks**

| # | node | explain.en | explain.ko | badge |
| :-- | :--- | :--- | :--- | :--- |
| 1 | `l3.request` | Claude requests `Bash` with a command your policy forbids. | 정책상 금지된 명령으로 클로드가 `Bash` 를 요청합니다. | |
| 2 | `l3.pre` | The `PreToolUse` hook fires before the call executes. | 호출 실행 전에 `PreToolUse` 훅이 발화합니다. | |
| 3 | `l3.pre` | The script writes a reason to stderr and exits 2. | 스크립트가 stderr 에 이유를 쓰고 exit 2 로 종료합니다. | `exit 2` |
| 4 | `l3.blocked` | On `PreToolUse`, exit 2 blocks the tool call. Claude Code blocks the command and shows Claude the hook's stderr. | `PreToolUse` 에서 exit 2 는 도구 호출을 차단합니다. Claude Code 가 명령을 막고 훅의 stderr 를 클로드에게 보여줍니다. | `blocked` |
| 5 | `l3.result` | Claude reads that stderr as feedback and can adjust its approach. | 클로드가 그 stderr 를 피드백으로 읽고 접근 방식을 바꿀 수 있습니다. | |
| 6 | `l3.done` | Exit 2 blocks whether or not the hook prints JSON — even a JSON `permissionDecision` of `"allow"` cannot override it. | 훅이 JSON 을 출력하든 말든 exit 2 는 차단합니다 — JSON `permissionDecision` 이 `"allow"` 여도 뒤집지 못합니다. | `end` |

#### `l3.s5` — `{hook:"PostToolUse", exit:"0"}`

| # | node | explain.en | explain.ko | badge |
| :-- | :--- | :--- | :--- | :--- |
| 1 | `l3.request` | Claude requests `Edit`. A `PostToolUse` hook is configured. | 클로드가 `Edit` 를 요청합니다. `PostToolUse` 훅이 설정돼 있습니다. | |
| 2 | `l3.exec` | The tool call succeeds — `PostToolUse` fires after a tool call succeeds, so the edit is already applied. | 도구 호출이 성공합니다 — `PostToolUse` 는 성공 후 발화하므로 편집은 이미 적용된 상태입니다. | |
| 3 | `l3.post` | The hook fires, for example to run a formatter. | 예를 들어 포매터를 돌리려고 훅이 발화합니다. | |
| 4 | `l3.debug_log` | It exits 0. For most events, stdout is written to the debug log but not shown in the transcript. | exit 0 으로 종료합니다. 대부분 이벤트에서 stdout 은 디버그 로그에만 기록되고 트랜스크립트에는 표시되지 않습니다. | `exit 0` |
| 5 | `l3.result` | The tool result returns to Claude and the loop continues. | 도구 결과가 클로드에게 돌아가고 루프가 이어집니다. | |
| 6 | `l3.done` | The turn ends. | 턴이 끝납니다. | `end` |

#### `l3.s6` — `{hook:"PostToolUse", exit:"2"}` — **does NOT block**

| # | node | explain.en | explain.ko | badge |
| :-- | :--- | :--- | :--- | :--- |
| 1 | `l3.request` | Claude requests `Edit`. | 클로드가 `Edit` 를 요청합니다. | |
| 2 | `l3.exec` | The tool call succeeds and the file is written. | 도구 호출이 성공하고 파일이 쓰입니다. | |
| 3 | `l3.post` | The `PostToolUse` hook fires and exits 2 with a message on stderr. | `PostToolUse` 훅이 발화하고 stderr 에 메시지를 남기며 exit 2 로 종료합니다. | `exit 2` |
| 4 | `l3.feedback` | **`PostToolUse` cannot block.** The docs say exit 2 here "shows stderr to Claude; the tool already ran". The edit is not undone. | **`PostToolUse` 는 차단할 수 없습니다.** 문서는 여기서 exit 2 가 "stderr 를 클로드에게 보여주고, 도구는 이미 실행됐다" 고 기술합니다. 편집은 되돌려지지 않습니다. | `not blocked` |
| 5 | `l3.result` | Claude sees the message and can react — for instance, by fixing what the hook complained about. | 클로드가 메시지를 보고 반응할 수 있습니다 — 예컨대 훅이 지적한 것을 고칩니다. | |
| 6 | `l3.done` | The turn ends. Same exit code as the PreToolUse case, different documented meaning. | 턴이 끝납니다. PreToolUse 와 같은 종료 코드지만 문서상 의미가 다릅니다. | `end` |

#### `l3.s7` — `{hook:"Stop", exit:"0"}`

| # | node | explain.en | explain.ko | badge |
| :-- | :--- | :--- | :--- | :--- |
| 1 | `l3.exec` | Claude does its work for the turn. | 클로드가 이번 턴의 작업을 합니다. | |
| 2 | `l3.turn_end` | Claude finishes responding. `Stop` hooks fire whenever Claude finishes responding, not only at task completion. | 클로드가 응답을 마칩니다. `Stop` 훅은 작업 완료 시점만이 아니라 응답이 끝날 때마다 발화합니다. | |
| 3 | `l3.stop` | The `Stop` hook runs, for example to scan the working tree. | `Stop` 훅이 실행됩니다 — 예컨대 작업 트리를 검사합니다. | |
| 4 | `l3.debug_log` | It exits 0; its stdout goes to the debug log, not the transcript. | exit 0 으로 종료하고, stdout 은 트랜스크립트가 아니라 디버그 로그로 갑니다. | `exit 0` |
| 5 | `l3.done` | Claude stops as normal and the turn ends. | 클로드가 정상적으로 멈추고 턴이 끝납니다. | `end` |
| 6 | `l3.done` | Note: `Stop` hooks do not fire on user interrupts; API errors fire `StopFailure` instead. | 참고: `Stop` 훅은 사용자 인터럽트에는 발화하지 않고, API 오류에는 `StopFailure` 가 대신 발화합니다. | |

#### `l3.s8` — `{hook:"Stop", exit:"2"}` — **prevents stopping**

| # | node | explain.en | explain.ko | badge |
| :-- | :--- | :--- | :--- | :--- |
| 1 | `l3.exec` | Claude does its work for the turn. | 클로드가 이번 턴의 작업을 합니다. | |
| 2 | `l3.turn_end` | Claude finishes responding, and the `Stop` hook fires. | 클로드가 응답을 마치고 `Stop` 훅이 발화합니다. | |
| 3 | `l3.stop` | The hook decides the work is not done and exits 2 with a reason on stderr. | 훅이 작업이 안 끝났다고 판단해 stderr 에 이유를 쓰고 exit 2 로 종료합니다. | `exit 2` |
| 4 | `l3.continue` | On `Stop`, exit 2 **prevents Claude from stopping and continues the conversation**. Nothing is blocked — the turn is extended. | `Stop` 에서 exit 2 는 **클로드가 멈추는 것을 막고 대화를 계속하게** 합니다. 차단이 아니라 턴의 연장입니다. | `continues` |
| 5 | `l3.exec` | Claude keeps working, using the hook's reason as its next instruction. | 클로드가 훅의 이유를 다음 지시로 삼아 작업을 이어갑니다. | |
| 6 | `l3.done` | The docs warn about loops: Claude Code overrides a `Stop` hook after it blocks eight times in a row without progress, and hook scripts should check the `stop_hook_active` field and exit early when it is `true`. | 문서는 루프를 경고합니다 — 진전 없이 연속 8회 차단하면 Claude Code 가 `Stop` 훅을 무시하며, 훅 스크립트는 `stop_hook_active` 가 `true` 면 조기 종료해야 합니다. | `end` |

### 3.6 Quiz

1. **en:** A `PostToolUse` hook exits 2. What do the docs say happens? · **ko:** `PostToolUse` 훅이 exit 2 로 종료했습니다. 문서는 어떻게 된다고 합니까?
   - a) The tool call is blocked / 도구 호출이 차단된다
   - b) The tool's effect is rolled back / 도구의 결과가 롤백된다
   - c) **stderr is shown to Claude; the tool already ran / stderr 가 클로드에게 표시되고, 도구는 이미 실행됐다** ✅
   - d) The session ends / 세션이 종료된다

2. **en:** A `Stop` hook exits 2. What do the docs say happens? · **ko:** `Stop` 훅이 exit 2 로 종료했습니다. 문서는 어떻게 된다고 합니까?
   - a) **Claude is prevented from stopping and the conversation continues / 클로드가 멈추지 못하고 대화가 계속된다** ✅
   - b) The last tool call is blocked / 마지막 도구 호출이 차단된다
   - c) The turn ends immediately / 턴이 즉시 끝난다
   - d) Nothing; `Stop` cannot block / 아무 일도 없다; `Stop` 은 차단 불가다

3. **en:** A `PreToolUse` hook exits 0. Is the tool call approved? · **ko:** `PreToolUse` 훅이 exit 0 으로 종료했습니다. 도구 호출이 승인된 것입니까?
   - a) Yes, exit 0 approves it / 예, exit 0 이 승인이다
   - b) **No — the normal permission flow still applies / 아니오 — 일반 권한 흐름이 그대로 적용된다** ✅
   - c) Only in `bypassPermissions` mode / `bypassPermissions` 모드에서만
   - d) Only if stdout is empty / stdout 이 비어 있을 때만

### 3.7 Sources

- `https://code.claude.com/docs/en/hooks`
- `https://code.claude.com/docs/en/hooks-guide`

---

## 4. L4 — Skills

- **title.en:** Skills
- **title.ko:** 스킬
- **intro.en:** A skill is a `SKILL.md` whose description is in context from the start, while its body loads only when it is used — by you typing `/name`, or by Claude deciding it is relevant. Frontmatter controls which of those two is allowed.
- **intro.ko:** 스킬은 `SKILL.md` 입니다. 설명은 처음부터 컨텍스트에 있고, 본문은 사용될 때만 로드됩니다 — 사용자가 `/이름` 을 입력하거나 클로드가 관련 있다고 판단할 때. 프론트매터가 이 둘 중 무엇을 허용할지 결정합니다.

### 4.1 Nodes

| id | label.en | label.ko | kind | Role (one line) |
| :--- | :--- | :--- | :--- | :--- |
| `l4.listing` | Skill descriptions at session start | 세션 시작 시 스킬 설명 | artifact | Short descriptions load so Claude knows what it can invoke. |
| `l4.user_invoke` | You type `/skill-name` | `/스킬이름` 입력 | event | Direct invocation by the user. |
| `l4.model_invoke` | Claude decides it is relevant | 클로드가 관련 있다고 판단 | decision | Automatic invocation based on the description. |
| `l4.gate` | Invocation control check | 호출 제어 확인 | decision | `disable-model-invocation` / `user-invocable` decide who may invoke. |
| `l4.blocked` | Claude Code blocks the call | Claude Code 가 호출을 차단 | terminal | What the docs say happens if Claude invokes a model-disabled skill anyway. |
| `l4.render` | Render `SKILL.md` | `SKILL.md` 렌더링 | event | Substitutions and `` !`command` `` dynamic context run before Claude sees the content. |
| `l4.load` | Content enters the conversation | 내용이 대화에 진입 | artifact | As a single message that stays for the rest of the session. |
| `l4.tools` | `allowed-tools` grant | `allowed-tools` 부여 | artifact | Pre-approves listed tools for the invoking turn only. |
| `l4.execute` | Claude follows the instructions | 클로드가 지시를 수행 | decision | The skill body is instructions, not code the harness runs. |
| `l4.persist` | Stays in context | 컨텍스트에 잔류 | terminal | Claude Code does not re-read the file on later turns. |

### 4.2 Edges

`l4.listing` → { `l4.user_invoke` | `l4.model_invoke` } → `l4.gate` → { `l4.blocked` | `l4.render` } → `l4.load` → `l4.tools` → `l4.execute` → `l4.persist`

### 4.3 Inputs

```
inputs: {
  invoker:  ["you", "claude"],
  frontmatter: ["default", "disable-model-invocation"]
}
```
2 widgets · 2 × 2 = **4 combinations**.

### 4.4 Scenarios

#### `l4.s1` — `{invoker:"you", frontmatter:"default"}`

| # | node | explain.en | explain.ko | badge |
| :-- | :--- | :--- | :--- | :--- |
| 1 | `l4.listing` | At session start, skill descriptions are loaded into context so Claude knows what is available; full content loads only when a skill is used. | 세션 시작 시 스킬 설명이 컨텍스트에 로드돼 클로드가 무엇을 쓸 수 있는지 압니다. 전체 내용은 사용될 때만 로드됩니다. | |
| 2 | `l4.user_invoke` | You type `/summarize-changes`. The command name comes from the skill's directory name. | `/summarize-changes` 를 입력합니다. 명령 이름은 스킬 디렉토리 이름에서 옵니다. | |
| 3 | `l4.gate` | With default frontmatter, both you and Claude can invoke the skill, so the invocation proceeds. | 기본 프론트매터에서는 사용자와 클로드 모두 호출할 수 있으므로 그대로 진행됩니다. | |
| 4 | `l4.render` | Any `` !`command` `` lines run first and their output replaces the placeholder, so Claude receives actual data rather than the command. | `` !`명령` `` 줄이 먼저 실행되고 출력이 자리표시자를 대체합니다. 그래서 클로드는 명령이 아니라 실제 데이터를 받습니다. | |
| 5 | `l4.load` | The rendered content enters the conversation as a single message. | 렌더링된 내용이 하나의 메시지로 대화에 들어갑니다. | |
| 6 | `l4.persist` | It stays there for the rest of the session, and Claude Code does not re-read the skill file on later turns. | 세션 내내 남으며, 이후 턴에 Claude Code 가 스킬 파일을 다시 읽지 않습니다. | `end` |

#### `l4.s2` — `{invoker:"claude", frontmatter:"default"}`

| # | node | explain.en | explain.ko | badge |
| :-- | :--- | :--- | :--- | :--- |
| 1 | `l4.listing` | The skill's `description` is in context from session start. The docs say Claude uses this description to decide when to apply the skill. | 스킬의 `description` 이 세션 시작부터 컨텍스트에 있습니다. 문서는 클로드가 이 설명으로 적용 시점을 판단한다고 합니다. | |
| 2 | `l4.model_invoke` | You ask "what did I change?" and Claude loads the skill automatically because the request matches the description. | "내가 뭘 바꿨지?" 라고 묻자 요청이 설명과 맞아 클로드가 스킬을 자동 로드합니다. | |
| 3 | `l4.gate` | Default frontmatter allows model invocation, so nothing blocks it. | 기본 프론트매터는 모델 호출을 허용하므로 아무것도 막지 않습니다. | |
| 4 | `l4.render` | The file is rendered, with dynamic context commands run first. | 동적 컨텍스트 명령이 먼저 실행된 뒤 파일이 렌더링됩니다. | |
| 5 | `l4.load` | The content enters the conversation as one message. | 내용이 하나의 메시지로 대화에 들어갑니다. | |
| 6 | `l4.persist` | This is the difference from a slash command you type: nobody typed `/`. The trigger was the description matching your request. | 사용자가 입력하는 슬래시 명령과의 차이가 여기입니다 — `/` 를 아무도 치지 않았습니다. 트리거는 설명과 요청의 일치였습니다. | `end` |

#### `l4.s3` — `{invoker:"you", frontmatter:"disable-model-invocation"}`

| # | node | explain.en | explain.ko | badge |
| :-- | :--- | :--- | :--- | :--- |
| 1 | `l4.listing` | With `disable-model-invocation: true`, the description is **not** in context. The skill stays out of context until you invoke it. | `disable-model-invocation: true` 면 설명이 컨텍스트에 **없습니다**. 사용자가 호출하기 전까지 스킬은 컨텍스트 밖에 있습니다. | `not listed` |
| 2 | `l4.user_invoke` | You type `/deploy`. Only you can invoke this skill. | `/deploy` 를 입력합니다. 이 스킬은 사용자만 호출할 수 있습니다. | |
| 3 | `l4.gate` | The check passes for user invocation. | 사용자 호출이므로 통과합니다. | |
| 4 | `l4.render` | The file is rendered with your arguments substituted. | 인자가 치환된 채 파일이 렌더링됩니다. | |
| 5 | `l4.tools` | If the skill declares `allowed-tools`, those tools are pre-approved for the turn that invoked it, and the grant clears when you send your next message. | 스킬이 `allowed-tools` 를 선언했다면 호출한 그 턴에 한해 사전 승인되고, 다음 메시지를 보내면 부여가 해제됩니다. | `this turn only` |
| 6 | `l4.persist` | The full skill loads when you invoke it, and stays in context afterwards. | 호출 시 전체 스킬이 로드되고 이후에도 컨텍스트에 남습니다. | `end` |

#### `l4.s4` — `{invoker:"claude", frontmatter:"disable-model-invocation"}` — **blocked**

| # | node | explain.en | explain.ko | badge |
| :-- | :--- | :--- | :--- | :--- |
| 1 | `l4.listing` | The description is not in context, so Claude has no listing entry telling it this skill exists. | 설명이 컨텍스트에 없으므로 이 스킬의 존재를 알려줄 목록 항목이 클로드에게 없습니다. | `not listed` |
| 2 | `l4.model_invoke` | Suppose Claude tries to invoke `/deploy` anyway. | 그럼에도 클로드가 `/deploy` 호출을 시도했다고 합시다. | |
| 3 | `l4.gate` | `disable-model-invocation: true` means only you can invoke the skill. | `disable-model-invocation: true` 는 사용자만 호출할 수 있다는 뜻입니다. | |
| 4 | `l4.blocked` | The docs state: Claude Code blocks the call and instructs Claude not to reproduce the steps another way, so expect it to suggest you run `/deploy` yourself. | 문서 기술: Claude Code 가 호출을 차단하고, 다른 방법으로 단계를 재현하지 말라고 지시합니다. 그래서 사용자에게 직접 `/deploy` 를 실행하라고 제안하게 됩니다. | `blocked` |
| 5 | `l4.blocked` | This is why the docs recommend the field for workflows with side effects — deploys, commits, sending messages. | 그래서 문서는 배포·커밋·메시지 발송처럼 부작용이 있는 워크플로에 이 필드를 권합니다. | |
| 6 | `l4.persist` | Nothing was loaded into context, because the skill never ran. | 스킬이 실행되지 않았으므로 컨텍스트에 로드된 것도 없습니다. | `end` |

### 4.5 Quiz

1. **en:** In a regular session, what is in context at session start for a default skill? · **ko:** 일반 세션에서 기본 스킬은 세션 시작 시 무엇이 컨텍스트에 있습니까?
   - a) The whole `SKILL.md` body / `SKILL.md` 본문 전체
   - b) **Its description only; the full content loads when invoked / 설명만; 전체 내용은 호출 시 로드된다** ✅
   - c) Nothing until you type `/` / `/` 를 입력하기 전까지 아무것도 없다
   - d) Its frontmatter only / 프론트매터만

2. **en:** What does `disable-model-invocation: true` do? · **ko:** `disable-model-invocation: true` 는 무엇을 합니까?
   - a) Hides the skill from the `/` menu / `/` 메뉴에서 스킬을 숨긴다
   - b) **Prevents Claude from loading the skill automatically; only you can invoke it / 클로드의 자동 로드를 막는다; 사용자만 호출 가능** ✅
   - c) Disables the skill entirely / 스킬을 완전히 비활성화한다
   - d) Runs the skill in a subagent / 스킬을 서브에이전트에서 실행한다

3. **en:** How long does an `allowed-tools` grant from a skill last? · **ko:** 스킬의 `allowed-tools` 부여는 얼마나 지속됩니까?
   - a) For the whole session / 세션 전체
   - b) **For the invoking turn; it clears when you send your next message / 호출한 턴 동안; 다음 메시지를 보내면 해제된다** ✅
   - c) Until Claude Code restarts / Claude Code 재시작까지
   - d) Permanently, saved to settings / 영구적으로 설정에 저장된다

### 4.6 Sources

- `https://code.claude.com/docs/en/skills`
- `https://code.claude.com/docs/en/context-window`

---

## 5. Totals

| Lesson | Nodes | Widgets | Combinations | Scenarios | Steps | Quiz |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| L1 Agent Loop | 12 | 2 | 4 | 4 | 28 | 3 |
| L2 Slash Commands | 8 | 2 | 4 | 4 | 27 | 3 |
| L3 Hooks | 13 | 2 | 8 | 8 | 48 | 3 |
| L4 Skills | 10 | 2 | 4 | 4 | 24 | 3 |
| **Total** | **43** | — | **20** | **20** | **127** | **12** |

Every combination has exactly one scenario. No lesson exceeds 2 widgets or 8 combinations.
