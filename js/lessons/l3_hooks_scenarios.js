/**
 * L3 scenarios — the eight hook/exit-code combinations.
 *
 * Split out of l3_hooks.js purely for file size; this module is data only.
 * Binding rule from docs/CONTENT-SPEC.md §3.1: exit 2 does NOT mean the same
 * thing on every event, so each event keeps its own outcome node and its own
 * badge — `blocked` (PreToolUse), `not blocked` (PostToolUse), `continues`
 * (Stop). Never collapse these into one "blocked" story.
 */

/** `{hook:"off"}` — same steps for either exit value; s2 adds a leading note. */
const offSteps = [
  { node: 'l3.request', badge: 'no hooks', explain: {
    en: 'Claude requests a tool. No hooks are configured in any settings file.',
    ko: '클로드가 도구를 요청합니다. 어느 설정 파일에도 훅이 없습니다.' } },
  { node: 'l3.perm', edge: 'l3.request->l3.perm', explain: {
    en: 'The normal permission flow decides whether the call runs.',
    ko: '일반 권한 흐름이 호출 실행 여부를 결정합니다.' } },
  { node: 'l3.exec', edge: 'l3.perm->l3.exec', explain: {
    en: 'The tool executes.',
    ko: '도구가 실행됩니다.' } },
  { node: 'l3.result', edge: 'l3.exec->l3.result', explain: {
    en: 'The result returns to Claude.',
    ko: '결과가 클로드에게 돌아갑니다.' } },
  { node: 'l3.turn_end', edge: 'l3.result->l3.turn_end', explain: {
    en: 'Claude finishes responding.',
    ko: '클로드가 응답을 마칩니다.' } },
  { node: 'l3.done', edge: 'l3.turn_end->l3.done', badge: 'end', explain: {
    en: 'The turn ends. Hooks give deterministic control — without them, an action happens only if the model chooses it.',
    ko: '턴이 끝납니다. 훅은 결정론적 통제를 제공합니다 — 훅이 없으면 그 동작은 모델이 선택할 때만 일어납니다.' } },
];

const noExitCodeNote = {
  node: 'l3.request',
  badge: 'no hooks',
  explain: {
    en: 'No hook is configured, so no exit code is produced. The selector has no effect here.',
    ko: '설정된 훅이 없어 종료 코드도 생기지 않습니다. 선택값은 여기서 영향이 없습니다.',
  },
};

export const l3Scenarios = [
  { id: 'l3.s1', trigger: { hook: 'off', exit: '0' }, steps: offSteps },
  { id: 'l3.s2', trigger: { hook: 'off', exit: '2' }, steps: [noExitCodeNote, ...offSteps] },
  {
    id: 'l3.s3',
    trigger: { hook: 'PreToolUse', exit: '0' },
    steps: [
      { node: 'l3.request', explain: {
        en: 'Claude requests `Bash`. A `PreToolUse` hook matching `Bash` is configured in a settings file.',
        ko: '클로드가 `Bash` 를 요청합니다. `Bash` 에 매칭되는 `PreToolUse` 훅이 설정 파일에 있습니다.' } },
      { node: 'l3.pre', edge: 'l3.request->l3.pre', explain: {
        en: 'The hook fires before the tool call executes and receives the event JSON on stdin.',
        ko: '도구 호출 실행 전에 훅이 발화하고, 이벤트 JSON 을 stdin 으로 받습니다.' } },
      { node: 'l3.debug_log', badge: 'exit 0', explain: {
        en: 'It exits 0. Stderr from a hook that exits 0 goes to the debug log only, never the transcript, and Claude never sees it.',
        ko: 'exit 0 으로 종료합니다. exit 0 훅의 stderr 는 디버그 로그로만 가고 트랜스크립트에는 절대 나타나지 않으며 클로드도 보지 못합니다.' } },
      { node: 'l3.perm', edge: 'l3.pre->l3.perm', explain: {
        en: 'Exit 0 reports no objection — for `PreToolUse` this does not approve the call; the normal permission flow still applies.',
        ko: 'exit 0 은 이의 없음일 뿐 — `PreToolUse` 에서 이것이 호출을 승인하지는 않습니다. 일반 권한 흐름이 그대로 적용됩니다.' } },
      { node: 'l3.exec', edge: 'l3.perm->l3.exec', explain: {
        en: 'The tool executes, subject to that permission flow.',
        ko: '권한 흐름을 거쳐 도구가 실행됩니다.' } },
      { node: 'l3.done', edge: 'l3.turn_end->l3.done', badge: 'end', explain: {
        en: 'The result returns and the turn ends normally.',
        ko: '결과가 돌아오고 턴이 정상 종료됩니다.' } },
    ],
  },
  {
    id: 'l3.s4',
    trigger: { hook: 'PreToolUse', exit: '2' },
    steps: [
      { node: 'l3.request', explain: {
        en: 'Claude requests `Bash` with a command your policy forbids.',
        ko: '정책상 금지된 명령으로 클로드가 `Bash` 를 요청합니다.' } },
      { node: 'l3.pre', edge: 'l3.request->l3.pre', explain: {
        en: 'The `PreToolUse` hook fires before the call executes.',
        ko: '호출 실행 전에 `PreToolUse` 훅이 발화합니다.' } },
      { node: 'l3.pre', badge: 'exit 2', explain: {
        en: 'The script writes a reason to stderr and exits 2.',
        ko: '스크립트가 stderr 에 이유를 쓰고 exit 2 로 종료합니다.' } },
      { node: 'l3.blocked', edge: 'l3.pre->l3.blocked', badge: 'blocked', explain: {
        en: "On `PreToolUse`, exit 2 blocks the tool call. Claude Code blocks the command and shows Claude the hook's stderr.",
        ko: '`PreToolUse` 에서 exit 2 는 도구 호출을 차단합니다. Claude Code 가 명령을 막고 훅의 stderr 를 클로드에게 보여줍니다.' } },
      { node: 'l3.result', explain: {
        en: 'Claude reads that stderr as feedback and can adjust its approach.',
        ko: '클로드가 그 stderr 를 피드백으로 읽고 접근 방식을 바꿀 수 있습니다.' } },
      { node: 'l3.done', edge: 'l3.turn_end->l3.done', badge: 'end', explain: {
        en: 'Exit 2 blocks whether or not the hook prints JSON — even a JSON `permissionDecision` of "allow" cannot override it.',
        ko: '훅이 JSON 을 출력하든 말든 exit 2 는 차단합니다 — JSON `permissionDecision` 이 "allow" 여도 뒤집지 못합니다.' } },
    ],
  },
  {
    id: 'l3.s5',
    trigger: { hook: 'PostToolUse', exit: '0' },
    steps: [
      { node: 'l3.request', explain: {
        en: 'Claude requests `Edit`. A `PostToolUse` hook is configured.',
        ko: '클로드가 `Edit` 를 요청합니다. `PostToolUse` 훅이 설정돼 있습니다.' } },
      { node: 'l3.exec', edge: 'l3.perm->l3.exec', explain: {
        en: 'The tool call succeeds — `PostToolUse` fires after a tool call succeeds, so the edit is already applied.',
        ko: '도구 호출이 성공합니다 — `PostToolUse` 는 성공 후 발화하므로 편집은 이미 적용된 상태입니다.' } },
      { node: 'l3.post', edge: 'l3.exec->l3.post', explain: {
        en: 'The hook fires, for example to run a formatter.',
        ko: '예를 들어 포매터를 돌리려고 훅이 발화합니다.' } },
      { node: 'l3.debug_log', edge: 'l3.post->l3.debug_log', badge: 'exit 0', explain: {
        en: 'It exits 0. For most events, stdout is written to the debug log but not shown in the transcript.',
        ko: 'exit 0 으로 종료합니다. 대부분 이벤트에서 stdout 은 디버그 로그에만 기록되고 트랜스크립트에는 표시되지 않습니다.' } },
      { node: 'l3.result', edge: 'l3.debug_log->l3.result', explain: {
        en: 'The tool result returns to Claude and the loop continues.',
        ko: '도구 결과가 클로드에게 돌아가고 루프가 이어집니다.' } },
      { node: 'l3.done', edge: 'l3.turn_end->l3.done', badge: 'end', explain: {
        en: 'The turn ends.',
        ko: '턴이 끝납니다.' } },
    ],
  },
  {
    id: 'l3.s6',
    trigger: { hook: 'PostToolUse', exit: '2' },
    steps: [
      { node: 'l3.request', explain: {
        en: 'Claude requests `Edit`.',
        ko: '클로드가 `Edit` 를 요청합니다.' } },
      { node: 'l3.exec', edge: 'l3.perm->l3.exec', explain: {
        en: 'The tool call succeeds and the file is written.',
        ko: '도구 호출이 성공하고 파일이 쓰입니다.' } },
      { node: 'l3.post', edge: 'l3.exec->l3.post', badge: 'exit 2', explain: {
        en: 'The `PostToolUse` hook fires and exits 2 with a message on stderr.',
        ko: '`PostToolUse` 훅이 발화하고 stderr 에 메시지를 남기며 exit 2 로 종료합니다.' } },
      { node: 'l3.feedback', edge: 'l3.post->l3.feedback', badge: 'not blocked', explain: {
        en: '`PostToolUse` cannot block. The docs say exit 2 here "shows stderr to Claude; the tool already ran". The edit is not undone.',
        ko: '`PostToolUse` 는 차단할 수 없습니다. 문서는 여기서 exit 2 가 "stderr 를 클로드에게 보여주고, 도구는 이미 실행됐다" 고 기술합니다. 편집은 되돌려지지 않습니다.' } },
      { node: 'l3.result', edge: 'l3.feedback->l3.result', explain: {
        en: 'Claude sees the message and can react — for instance, by fixing what the hook complained about.',
        ko: '클로드가 메시지를 보고 반응할 수 있습니다 — 예컨대 훅이 지적한 것을 고칩니다.' } },
      { node: 'l3.done', edge: 'l3.turn_end->l3.done', badge: 'end', explain: {
        en: 'The turn ends. Same exit code as the PreToolUse case, different documented meaning.',
        ko: '턴이 끝납니다. PreToolUse 와 같은 종료 코드지만 문서상 의미가 다릅니다.' } },
    ],
  },
  {
    id: 'l3.s7',
    trigger: { hook: 'Stop', exit: '0' },
    steps: [
      { node: 'l3.exec', explain: {
        en: 'Claude does its work for the turn.',
        ko: '클로드가 이번 턴의 작업을 합니다.' } },
      { node: 'l3.turn_end', edge: 'l3.result->l3.turn_end', explain: {
        en: 'Claude finishes responding. `Stop` hooks fire whenever Claude finishes responding, not only at task completion.',
        ko: '클로드가 응답을 마칩니다. `Stop` 훅은 작업 완료 시점만이 아니라 응답이 끝날 때마다 발화합니다.' } },
      { node: 'l3.stop', edge: 'l3.turn_end->l3.stop', explain: {
        en: 'The `Stop` hook runs, for example to scan the working tree.',
        ko: '`Stop` 훅이 실행됩니다 — 예컨대 작업 트리를 검사합니다.' } },
      { node: 'l3.debug_log', badge: 'exit 0', explain: {
        en: 'It exits 0; its stdout goes to the debug log, not the transcript.',
        ko: 'exit 0 으로 종료하고, stdout 은 트랜스크립트가 아니라 디버그 로그로 갑니다.' } },
      { node: 'l3.done', edge: 'l3.stop->l3.done', badge: 'end', explain: {
        en: 'Claude stops as normal and the turn ends.',
        ko: '클로드가 정상적으로 멈추고 턴이 끝납니다.' } },
      { node: 'l3.done', explain: {
        en: 'Note: `Stop` hooks do not fire on user interrupts; API errors fire `StopFailure` instead.',
        ko: '참고: `Stop` 훅은 사용자 인터럽트에는 발화하지 않고, API 오류에는 `StopFailure` 가 대신 발화합니다.' } },
    ],
  },
  {
    id: 'l3.s8',
    trigger: { hook: 'Stop', exit: '2' },
    steps: [
      { node: 'l3.exec', explain: {
        en: 'Claude does its work for the turn.',
        ko: '클로드가 이번 턴의 작업을 합니다.' } },
      { node: 'l3.turn_end', edge: 'l3.result->l3.turn_end', explain: {
        en: 'Claude finishes responding, and the `Stop` hook fires.',
        ko: '클로드가 응답을 마치고 `Stop` 훅이 발화합니다.' } },
      { node: 'l3.stop', edge: 'l3.turn_end->l3.stop', badge: 'exit 2', explain: {
        en: 'The hook decides the work is not done and exits 2 with a reason on stderr.',
        ko: '훅이 작업이 안 끝났다고 판단해 stderr 에 이유를 쓰고 exit 2 로 종료합니다.' } },
      { node: 'l3.continue', edge: 'l3.stop->l3.continue', badge: 'continues', explain: {
        en: 'On `Stop`, exit 2 prevents Claude from stopping and continues the conversation. Nothing is blocked — the turn is extended.',
        ko: '`Stop` 에서 exit 2 는 클로드가 멈추는 것을 막고 대화를 계속하게 합니다. 차단이 아니라 턴의 연장입니다.' } },
      { node: 'l3.exec', explain: {
        en: "Claude keeps working, using the hook's reason as its next instruction.",
        ko: '클로드가 훅의 이유를 다음 지시로 삼아 작업을 이어갑니다.' } },
      { node: 'l3.done', edge: 'l3.turn_end->l3.done', badge: 'end', explain: {
        en: 'The docs warn about loops: Claude Code overrides a `Stop` hook after it blocks eight times in a row without progress, and hook scripts should check the `stop_hook_active` field and exit early when it is `true`.',
        ko: '문서는 루프를 경고합니다 — 진전 없이 연속 8회 차단하면 Claude Code 가 `Stop` 훅을 무시하며, 훅 스크립트는 `stop_hook_active` 가 `true` 면 조기 종료해야 합니다.' } },
    ],
  },
];

export default l3Scenarios;
