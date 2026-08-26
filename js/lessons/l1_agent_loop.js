/**
 * L1 — The Agent Loop.
 *
 * Data transcribed from docs/CONTENT-SPEC.md §1. The ordering rule there is
 * binding: only the system prompt has a documented position. Everything else
 * that loads before your first prompt sits inside the `l1.startup` cluster,
 * which has no edges between its members and is highlighted as a whole.
 */

const H = 64;

export const l1 = {
  id: 'l1-agent-loop',
  minutes: 6,
  asOf: '2026-08-26',
  title: { en: 'The Agent Loop', ko: '에이전트 루프' },
  intro: {
    en: 'Before you type anything, a session already has content loaded. Then your prompt starts a cycle: Claude evaluates, may call tools, receives results, and repeats until it answers with no tool calls.',
    ko: '무언가를 입력하기 전에 이미 세션에는 여러 내용이 올라와 있습니다. 그 다음 프롬프트가 순환을 시작합니다 — 클로드가 판단하고, 도구를 호출할 수 있고, 결과를 받고, 도구 호출이 없는 응답을 낼 때까지 반복합니다.',
  },

  diagram: {
    nodes: [
      { id: 'l1.session_start', role: 'event', x: 0, y: 0, h: H,
        label: { en: 'Session start', ko: '세션 시작' } },
      { id: 'l1.system_prompt', role: 'artifact', x: 300, y: 0, h: H,
        label: { en: 'System prompt', ko: '시스템 프롬프트' } },
      { id: 'l1.startup', role: 'cluster', x: 232, y: 130,
        group: ['l1.claude_md', 'l1.auto_memory', 'l1.skill_list', 'l1.tool_defs'],
        label: { en: 'Startup context (no documented order)', ko: '시작 컨텍스트 (문서상 순서 없음)' } },
      { id: 'l1.claude_md', role: 'artifact', x: 250, y: 170, h: H,
        label: { en: 'CLAUDE.md files', ko: 'CLAUDE.md 파일들' } },
      { id: 'l1.auto_memory', role: 'artifact', x: 460, y: 170, h: H,
        label: { en: 'Auto memory (MEMORY.md)', ko: '자동 메모리 (MEMORY.md)' } },
      { id: 'l1.skill_list', role: 'artifact', x: 250, y: 248, h: H,
        label: { en: 'Skill descriptions', ko: '스킬 설명 목록' } },
      { id: 'l1.tool_defs', role: 'artifact', x: 460, y: 248, h: H,
        label: { en: 'Tool names and definitions', ko: '도구 이름·정의' } },
      { id: 'l1.prompt', role: 'event', x: 0, y: 430, h: H,
        label: { en: 'Your prompt', ko: '사용자 프롬프트' } },
      { id: 'l1.evaluate', role: 'decision', x: 280, y: 430, h: H,
        label: { en: 'Claude evaluates', ko: '클로드가 판단' } },
      { id: 'l1.tool_call', role: 'event', x: 630, y: 430, h: H,
        label: { en: 'Tool call', ko: '도구 호출' } },
      { id: 'l1.tool_result', role: 'event', x: 980, y: 430, h: H,
        label: { en: 'Tool result', ko: '도구 결과' } },
      { id: 'l1.final', role: 'terminal', x: 280, y: 590, h: H,
        label: { en: 'Final response (no tool calls)', ko: '최종 응답 (도구 호출 없음)' } },
    ],
    edges: [
      { from: 'l1.session_start', to: 'l1.system_prompt',
        label: { en: 'loaded first', ko: '가장 먼저 로드' } },
      { from: 'l1.system_prompt', to: 'l1.startup',
        label: { en: 'then, as a user message after the system prompt', ko: '그 다음, 시스템 프롬프트 뒤 사용자 메시지로' } },
      { from: 'l1.startup', to: 'l1.prompt',
        label: { en: 'you type', ko: '입력' } },
      { from: 'l1.prompt', to: 'l1.evaluate' },
      { from: 'l1.evaluate', to: 'l1.tool_call',
        label: { en: 'tool calls requested', ko: '도구 호출 요청' } },
      { from: 'l1.tool_call', to: 'l1.tool_result',
        label: { en: 'executed', ko: '실행' } },
      { from: 'l1.tool_result', to: 'l1.evaluate', bow: -60,
        label: { en: 'loop back', ko: '되돌아감' } },
      { from: 'l1.evaluate', to: 'l1.final',
        label: { en: 'no tool calls', ko: '도구 호출 없음' } },
    ],
  },

  inputs: {
    task: ['question', 'edit'],
    claude_md: ['absent', 'present'],
  },

  widgets: {
    task: {
      type: 'chips',
      label: { en: 'What you send', ko: '보내는 내용' },
      valueLabels: {
        question: { en: '"what files are here?"', ko: '"여기 무슨 파일이 있어?"' },
        edit: { en: '"fix the failing tests in auth.ts"', ko: '"auth.ts 의 실패 테스트를 고쳐줘"' },
      },
    },
    claude_md: {
      type: 'toggle',
      label: { en: 'CLAUDE.md', ko: 'CLAUDE.md' },
      valueLabels: {
        absent: { en: 'project has none', ko: '프로젝트에 없음' },
        present: { en: 'project has one', ko: '프로젝트에 있음' },
      },
    },
  },

  scenarios: [
    {
      id: 'l1.s1',
      trigger: { task: 'question', claude_md: 'absent' },
      steps: [
        { node: 'l1.system_prompt', edge: 'l1.session_start->l1.system_prompt', explain: {
          en: 'The session starts with a fresh context window. The docs describe the system prompt as always loaded first.',
          ko: '새 컨텍스트 창으로 세션이 시작됩니다. 문서는 시스템 프롬프트가 항상 가장 먼저 로드된다고 기술합니다.' } },
        { node: 'l1.startup', edge: 'l1.system_prompt->l1.startup', badge: 'unordered', explain: {
          en: 'Auto memory, skill descriptions, and tool names load before you type. The docs list these together and do not state an order among them.',
          ko: '자동 메모리, 스킬 설명, 도구 이름이 입력 전에 로드됩니다. 문서는 이들을 함께 나열할 뿐 서로의 순서는 밝히지 않습니다.' } },
        { node: 'l1.prompt', edge: 'l1.startup->l1.prompt', explain: {
          en: 'You send "what files are here?". The docs note your prompt is tiny compared with what is already loaded.',
          ko: '"여기 무슨 파일이 있어?"를 보냅니다. 문서는 프롬프트가 이미 로드된 것에 비해 아주 작다고 설명합니다.' } },
        { node: 'l1.evaluate', edge: 'l1.prompt->l1.evaluate', explain: {
          en: 'Claude evaluates the current state and determines how to proceed: text, tool calls, or both.',
          ko: '클로드가 현재 상태를 판단해 진행 방식을 정합니다 — 텍스트, 도구 호출, 또는 둘 다.' } },
        { node: 'l1.tool_call', edge: 'l1.evaluate->l1.tool_call', explain: {
          en: 'Claude calls `Glob`. The docs give this exact case: a quick question might take one or two turns of calling `Glob`.',
          ko: '클로드가 `Glob` 을 호출합니다. 문서가 바로 이 사례를 듭니다 — 간단한 질문은 `Glob` 호출로 한두 턴이면 끝납니다.' } },
        { node: 'l1.tool_result', edge: 'l1.tool_call->l1.tool_result', explain: {
          en: 'The result feeds back to Claude for the next decision. Each full cycle is one turn.',
          ko: '결과가 클로드에게 되돌아가 다음 판단의 근거가 됩니다. 한 순환이 한 턴입니다.' } },
        { node: 'l1.final', edge: 'l1.evaluate->l1.final', badge: 'end', explain: {
          en: 'Claude produces a response with no tool calls, and the loop ends.',
          ko: '클로드가 도구 호출 없는 응답을 내놓고 루프가 끝납니다.' } },
      ],
    },
    {
      id: 'l1.s2',
      trigger: { task: 'question', claude_md: 'present' },
      steps: [
        { node: 'l1.system_prompt', edge: 'l1.session_start->l1.system_prompt', explain: {
          en: 'The system prompt is loaded first.',
          ko: '시스템 프롬프트가 가장 먼저 로드됩니다.' } },
        { node: 'l1.claude_md', edge: 'l1.system_prompt->l1.startup', explain: {
          en: 'Your CLAUDE.md is delivered as a user message after the system prompt, not as part of it. Multiple CLAUDE.md files load from broadest scope to most specific.',
          ko: 'CLAUDE.md 는 시스템 프롬프트의 일부가 아니라, 그 뒤에 사용자 메시지로 전달됩니다. 여러 CLAUDE.md 는 넓은 범위에서 좁은 범위 순으로 로드됩니다.' } },
        { node: 'l1.startup', badge: 'unordered', explain: {
          en: 'Auto memory, skill descriptions, and tool names load alongside it. The docs state no order among these.',
          ko: '자동 메모리, 스킬 설명, 도구 이름이 함께 로드됩니다. 문서는 이들 사이의 순서를 밝히지 않습니다.' } },
        { node: 'l1.prompt', edge: 'l1.startup->l1.prompt', explain: {
          en: 'You send "what files are here?".',
          ko: '"여기 무슨 파일이 있어?"를 보냅니다.' } },
        { node: 'l1.evaluate', edge: 'l1.prompt->l1.evaluate', explain: {
          en: 'Claude evaluates and decides how to proceed.',
          ko: '클로드가 판단하고 진행 방식을 정합니다.' } },
        { node: 'l1.tool_call', edge: 'l1.evaluate->l1.tool_call', explain: {
          en: 'Claude calls `Glob`.',
          ko: '클로드가 `Glob` 을 호출합니다.' } },
        { node: 'l1.final', edge: 'l1.evaluate->l1.final', badge: 'end', explain: {
          en: 'A response with no tool calls ends the loop. CLAUDE.md is context, not enforced configuration — the docs are explicit that it shapes behavior without guaranteeing compliance.',
          ko: '도구 호출 없는 응답이 루프를 끝냅니다. CLAUDE.md 는 강제 설정이 아니라 컨텍스트입니다 — 문서는 준수가 보장되지 않는다고 명시합니다.' } },
      ],
    },
    {
      id: 'l1.s3',
      trigger: { task: 'edit', claude_md: 'absent' },
      steps: [
        { node: 'l1.system_prompt', edge: 'l1.session_start->l1.system_prompt', explain: {
          en: 'The system prompt loads first.',
          ko: '시스템 프롬프트가 먼저 로드됩니다.' } },
        { node: 'l1.startup', edge: 'l1.system_prompt->l1.startup', badge: 'unordered', explain: {
          en: 'Auto memory, skill descriptions, and tool names load before your prompt, in no documented order.',
          ko: '자동 메모리, 스킬 설명, 도구 이름이 프롬프트 전에 로드됩니다 — 문서상 순서는 없습니다.' } },
        { node: 'l1.prompt', edge: 'l1.startup->l1.prompt', explain: {
          en: 'You send "fix the failing tests in auth.ts".',
          ko: '"auth.ts 의 실패 테스트를 고쳐줘"를 보냅니다.' } },
        { node: 'l1.tool_call', edge: 'l1.evaluate->l1.tool_call', badge: 'turn 1', explain: {
          en: 'Turn 1: Claude calls `Bash` to run `npm test` and sees three failures.',
          ko: '1턴: 클로드가 `Bash` 로 `npm test` 를 실행해 3건의 실패를 확인합니다.' } },
        { node: 'l1.tool_result', edge: 'l1.tool_call->l1.tool_result', explain: {
          en: 'The output returns to Claude; each result informs the next step.',
          ko: '출력이 클로드에게 돌아가고, 각 결과가 다음 단계를 결정합니다.' } },
        { node: 'l1.tool_call', edge: 'l1.tool_result->l1.evaluate', badge: 'turn 2-3', explain: {
          en: 'Turn 2–3: Claude reads the files, then calls `Edit`, then re-runs the tests. Tools that modify state run sequentially.',
          ko: '2~3턴: 파일을 읽고 `Edit` 후 테스트를 다시 실행합니다. 상태를 바꾸는 도구는 순차 실행됩니다.' } },
        { node: 'l1.final', edge: 'l1.evaluate->l1.final', badge: 'end', explain: {
          en: 'Final turn: a text-only response with no tool calls. Four turns total — three with tool calls, one final text.',
          ko: '마지막 턴: 도구 호출 없는 텍스트 응답. 총 4턴 — 3턴은 도구 호출, 1턴은 최종 텍스트.' } },
      ],
    },
    {
      id: 'l1.s4',
      trigger: { task: 'edit', claude_md: 'present' },
      steps: [
        { node: 'l1.system_prompt', edge: 'l1.session_start->l1.system_prompt', explain: {
          en: 'The system prompt loads first.',
          ko: '시스템 프롬프트가 먼저 로드됩니다.' } },
        { node: 'l1.claude_md', edge: 'l1.system_prompt->l1.startup', explain: {
          en: 'CLAUDE.md arrives as a user message after the system prompt.',
          ko: 'CLAUDE.md 는 시스템 프롬프트 뒤에 사용자 메시지로 도착합니다.' } },
        { node: 'l1.startup', badge: 'unordered', explain: {
          en: 'The rest of the startup content loads with it, in no documented order.',
          ko: '나머지 시작 컨텍스트가 함께 로드됩니다 — 문서상 순서 없음.' } },
        { node: 'l1.prompt', edge: 'l1.startup->l1.prompt', explain: {
          en: 'You send "fix the failing tests in auth.ts".',
          ko: '"auth.ts 의 실패 테스트를 고쳐줘"를 보냅니다.' } },
        { node: 'l1.tool_call', edge: 'l1.evaluate->l1.tool_call', explain: {
          en: 'Claude runs the tests, reads the files, and edits.',
          ko: '클로드가 테스트를 실행하고 파일을 읽고 수정합니다.' } },
        { node: 'l1.tool_result', edge: 'l1.tool_call->l1.tool_result', explain: {
          en: 'Each tool result feeds back into the next evaluation.',
          ko: '각 도구 결과가 다음 판단으로 되먹임됩니다.' } },
        { node: 'l1.final', edge: 'l1.evaluate->l1.final', badge: 'end', explain: {
          en: 'The loop ends with a text-only response. If a rule must apply no matter what Claude decides, the docs point to a hook instead of CLAUDE.md.',
          ko: '텍스트 응답으로 루프가 끝납니다. 클로드의 판단과 무관하게 반드시 적용되어야 하는 규칙이라면, 문서는 CLAUDE.md 대신 훅을 쓰라고 안내합니다.' } },
      ],
    },
  ],

  quiz: [
    {
      q: { en: 'What does the documentation say ends the agent loop?', ko: '문서에 따르면 에이전트 루프는 무엇으로 끝납니까?' },
      choices: [
        { en: 'A fixed number of tool calls', ko: '정해진 횟수의 도구 호출' },
        { en: 'Claude producing a response with no tool calls', ko: '도구 호출이 없는 응답을 클로드가 내놓을 때' },
        { en: 'The user pressing Enter', ko: '사용자가 엔터를 누를 때' },
        { en: 'The context window filling up', ko: '컨텍스트 창이 가득 찰 때' },
      ],
      answer: 1,
    },
    {
      q: { en: 'Where does CLAUDE.md content arrive, according to the docs?', ko: '문서에 따르면 CLAUDE.md 내용은 어디로 전달됩니까?' },
      choices: [
        { en: 'Inside the system prompt', ko: '시스템 프롬프트 안에' },
        { en: 'As a user message after the system prompt', ko: '시스템 프롬프트 뒤의 사용자 메시지로' },
        { en: 'Only when Claude reads a file', ko: '클로드가 파일을 읽을 때만' },
        { en: 'It is not loaded into context', ko: '컨텍스트에 로드되지 않는다' },
      ],
      answer: 1,
    },
    {
      q: {
        en: 'Among auto memory, skill descriptions, and MCP tool names at startup, what do the docs say about their order?',
        ko: '시작 시 자동 메모리·스킬 설명·MCP 도구 이름의 순서에 대해 문서는 무엇이라 말합니까?' },
      choices: [
        { en: 'Auto memory always comes first', ko: '자동 메모리가 항상 먼저다' },
        { en: 'Skill descriptions always come last', ko: '스킬 설명이 항상 마지막이다' },
        { en: 'The docs list them together without stating an order', ko: '문서는 순서를 밝히지 않고 함께 나열한다' },
        { en: 'They load alphabetically', ko: '알파벳 순으로 로드된다' },
      ],
      answer: 2,
    },
  ],

  sources: [
    'https://code.claude.com/docs/en/how-claude-code-works',
    'https://code.claude.com/docs/en/agent-sdk/agent-loop',
    'https://code.claude.com/docs/en/context-window',
    'https://code.claude.com/docs/en/memory',
  ],
};

export default l1;
