/**
 * L4 — Skills.
 *
 * Data transcribed from docs/CONTENT-SPEC.md §4. The lesson contrasts the two
 * ways a skill starts — you type `/name`, or Claude decides the description
 * matches — and what `disable-model-invocation` does to each.
 */

const H = 64;

export const l4 = {
  id: 'l4-skills',
  minutes: 5,
  asOf: '2026-08-26',
  title: { en: 'Skills', ko: '스킬' },
  intro: {
    en: 'A skill is a `SKILL.md` whose description is in context from the start, while its body loads only when it is used — by you typing `/name`, or by Claude deciding it is relevant. Frontmatter controls which of those two is allowed.',
    ko: '스킬은 `SKILL.md` 입니다. 설명은 처음부터 컨텍스트에 있고, 본문은 사용될 때만 로드됩니다 — 사용자가 `/이름` 을 입력하거나 클로드가 관련 있다고 판단할 때. 프론트매터가 이 둘 중 무엇을 허용할지 결정합니다.',
  },

  diagram: {
    nodes: [
      { id: 'l4.listing', role: 'artifact', x: 0, y: 0, h: H,
        label: { en: 'Skill descriptions at session start', ko: '세션 시작 시 스킬 설명' } },
      { id: 'l4.user_invoke', role: 'event', x: 280, y: -80, h: H,
        label: { en: 'You type /skill-name', ko: '/스킬이름 입력' } },
      { id: 'l4.model_invoke', role: 'decision', x: 280, y: 80, h: H,
        label: { en: 'Claude decides it is relevant', ko: '클로드가 관련 있다고 판단' } },
      { id: 'l4.gate', role: 'decision', x: 560, y: 0, h: H,
        label: { en: 'Invocation control check', ko: '호출 제어 확인' } },
      { id: 'l4.blocked', role: 'terminal', x: 900, y: -80, h: H,
        label: { en: 'Claude Code blocks the call', ko: 'Claude Code 가 호출을 차단' } },
      { id: 'l4.render', role: 'event', x: 900, y: 80, h: H,
        label: { en: 'Render SKILL.md', ko: 'SKILL.md 렌더링' } },
      { id: 'l4.load', role: 'artifact', x: 900, y: 240, h: H,
        label: { en: 'Content enters the conversation', ko: '내용이 대화에 진입' } },
      { id: 'l4.tools', role: 'artifact', x: 560, y: 240, h: H,
        label: { en: 'allowed-tools grant', ko: 'allowed-tools 부여' } },
      { id: 'l4.execute', role: 'decision', x: 280, y: 240, h: H,
        label: { en: 'Claude follows the instructions', ko: '클로드가 지시를 수행' } },
      { id: 'l4.persist', role: 'terminal', x: 0, y: 240, h: H,
        label: { en: 'Stays in context', ko: '컨텍스트에 잔류' } },
    ],
    edges: [
      { from: 'l4.listing', to: 'l4.user_invoke' },
      { from: 'l4.listing', to: 'l4.model_invoke' },
      { from: 'l4.user_invoke', to: 'l4.gate' },
      { from: 'l4.model_invoke', to: 'l4.gate' },
      { from: 'l4.gate', to: 'l4.blocked',
        label: { en: 'not allowed', ko: '허용 안 됨' } },
      { from: 'l4.gate', to: 'l4.render',
        label: { en: 'allowed', ko: '허용' } },
      { from: 'l4.render', to: 'l4.load' },
      { from: 'l4.load', to: 'l4.tools' },
      { from: 'l4.tools', to: 'l4.execute' },
      { from: 'l4.execute', to: 'l4.persist' },
    ],
  },

  inputs: {
    invoker: ['you', 'claude'],
    frontmatter: ['default', 'disable-model-invocation'],
  },

  widgets: {
    invoker: {
      type: 'chips',
      label: { en: 'Who invokes it', ko: '호출 주체' },
      valueLabels: {
        you: { en: 'you type the command', ko: '사용자가 명령을 입력' },
        claude: { en: 'Claude decides', ko: '클로드가 판단' },
      },
    },
    frontmatter: {
      type: 'toggle',
      label: { en: 'Frontmatter', ko: '프론트매터' },
      valueLabels: {
        default: { en: 'default', ko: '기본값' },
        'disable-model-invocation': { en: 'disable-model-invocation: true', ko: 'disable-model-invocation: true' },
      },
    },
  },

  scenarios: [
    {
      id: 'l4.s1',
      trigger: { invoker: 'you', frontmatter: 'default' },
      steps: [
        { node: 'l4.listing', explain: {
          en: 'At session start, skill descriptions are loaded into context so Claude knows what is available; full content loads only when a skill is used.',
          ko: '세션 시작 시 스킬 설명이 컨텍스트에 로드돼 클로드가 무엇을 쓸 수 있는지 압니다. 전체 내용은 사용될 때만 로드됩니다.' } },
        { node: 'l4.user_invoke', edge: 'l4.listing->l4.user_invoke', explain: {
          en: "You type `/summarize-changes`. The command name comes from the skill's directory name.",
          ko: '`/summarize-changes` 를 입력합니다. 명령 이름은 스킬 디렉토리 이름에서 옵니다.' } },
        { node: 'l4.gate', edge: 'l4.user_invoke->l4.gate', explain: {
          en: 'With default frontmatter, both you and Claude can invoke the skill, so the invocation proceeds.',
          ko: '기본 프론트매터에서는 사용자와 클로드 모두 호출할 수 있으므로 그대로 진행됩니다.' } },
        { node: 'l4.render', edge: 'l4.gate->l4.render', explain: {
          en: 'Any !`command` lines run first and their output replaces the placeholder, so Claude receives actual data rather than the command.',
          ko: '!`명령` 줄이 먼저 실행되고 출력이 자리표시자를 대체합니다. 그래서 클로드는 명령이 아니라 실제 데이터를 받습니다.' } },
        { node: 'l4.load', edge: 'l4.render->l4.load', explain: {
          en: 'The rendered content enters the conversation as a single message.',
          ko: '렌더링된 내용이 하나의 메시지로 대화에 들어갑니다.' } },
        { node: 'l4.persist', badge: 'end', explain: {
          en: 'It stays there for the rest of the session, and Claude Code does not re-read the skill file on later turns.',
          ko: '세션 내내 남으며, 이후 턴에 Claude Code 가 스킬 파일을 다시 읽지 않습니다.' } },
      ],
    },
    {
      id: 'l4.s2',
      trigger: { invoker: 'claude', frontmatter: 'default' },
      steps: [
        { node: 'l4.listing', explain: {
          en: "The skill's `description` is in context from session start. The docs say Claude uses this description to decide when to apply the skill.",
          ko: '스킬의 `description` 이 세션 시작부터 컨텍스트에 있습니다. 문서는 클로드가 이 설명으로 적용 시점을 판단한다고 합니다.' } },
        { node: 'l4.model_invoke', edge: 'l4.listing->l4.model_invoke', explain: {
          en: 'You ask "what did I change?" and Claude loads the skill automatically because the request matches the description.',
          ko: '"내가 뭘 바꿨지?" 라고 묻자 요청이 설명과 맞아 클로드가 스킬을 자동 로드합니다.' } },
        { node: 'l4.gate', edge: 'l4.model_invoke->l4.gate', explain: {
          en: 'Default frontmatter allows model invocation, so nothing blocks it.',
          ko: '기본 프론트매터는 모델 호출을 허용하므로 아무것도 막지 않습니다.' } },
        { node: 'l4.render', edge: 'l4.gate->l4.render', explain: {
          en: 'The file is rendered, with dynamic context commands run first.',
          ko: '동적 컨텍스트 명령이 먼저 실행된 뒤 파일이 렌더링됩니다.' } },
        { node: 'l4.load', edge: 'l4.render->l4.load', explain: {
          en: 'The content enters the conversation as one message.',
          ko: '내용이 하나의 메시지로 대화에 들어갑니다.' } },
        { node: 'l4.persist', badge: 'end', explain: {
          en: 'This is the difference from a slash command you type: nobody typed `/`. The trigger was the description matching your request.',
          ko: '사용자가 입력하는 슬래시 명령과의 차이가 여기입니다 — `/` 를 아무도 치지 않았습니다. 트리거는 설명과 요청의 일치였습니다.' } },
      ],
    },
    {
      id: 'l4.s3',
      trigger: { invoker: 'you', frontmatter: 'disable-model-invocation' },
      steps: [
        { node: 'l4.listing', badge: 'not listed', explain: {
          en: 'With `disable-model-invocation: true`, the description is not in context. The skill stays out of context until you invoke it.',
          ko: '`disable-model-invocation: true` 면 설명이 컨텍스트에 없습니다. 사용자가 호출하기 전까지 스킬은 컨텍스트 밖에 있습니다.' } },
        { node: 'l4.user_invoke', edge: 'l4.listing->l4.user_invoke', explain: {
          en: 'You type `/deploy`. Only you can invoke this skill.',
          ko: '`/deploy` 를 입력합니다. 이 스킬은 사용자만 호출할 수 있습니다.' } },
        { node: 'l4.gate', edge: 'l4.user_invoke->l4.gate', explain: {
          en: 'The check passes for user invocation.',
          ko: '사용자 호출이므로 통과합니다.' } },
        { node: 'l4.render', edge: 'l4.gate->l4.render', explain: {
          en: 'The file is rendered with your arguments substituted.',
          ko: '인자가 치환된 채 파일이 렌더링됩니다.' } },
        { node: 'l4.tools', edge: 'l4.load->l4.tools', badge: 'this turn only', explain: {
          en: 'If the skill declares `allowed-tools`, those tools are pre-approved for the turn that invoked it, and the grant clears when you send your next message.',
          ko: '스킬이 `allowed-tools` 를 선언했다면 호출한 그 턴에 한해 사전 승인되고, 다음 메시지를 보내면 부여가 해제됩니다.' } },
        { node: 'l4.persist', badge: 'end', explain: {
          en: 'The full skill loads when you invoke it, and stays in context afterwards.',
          ko: '호출 시 전체 스킬이 로드되고 이후에도 컨텍스트에 남습니다.' } },
      ],
    },
    {
      id: 'l4.s4',
      trigger: { invoker: 'claude', frontmatter: 'disable-model-invocation' },
      steps: [
        { node: 'l4.listing', badge: 'not listed', explain: {
          en: 'The description is not in context, so Claude has no listing entry telling it this skill exists.',
          ko: '설명이 컨텍스트에 없으므로 이 스킬의 존재를 알려줄 목록 항목이 클로드에게 없습니다.' } },
        { node: 'l4.model_invoke', edge: 'l4.listing->l4.model_invoke', explain: {
          en: 'Suppose Claude tries to invoke `/deploy` anyway.',
          ko: '그럼에도 클로드가 `/deploy` 호출을 시도했다고 합시다.' } },
        { node: 'l4.gate', edge: 'l4.model_invoke->l4.gate', explain: {
          en: '`disable-model-invocation: true` means only you can invoke the skill.',
          ko: '`disable-model-invocation: true` 는 사용자만 호출할 수 있다는 뜻입니다.' } },
        { node: 'l4.blocked', edge: 'l4.gate->l4.blocked', badge: 'blocked', explain: {
          en: 'The docs state: Claude Code blocks the call and instructs Claude not to reproduce the steps another way, so expect it to suggest you run `/deploy` yourself.',
          ko: '문서 기술: Claude Code 가 호출을 차단하고, 다른 방법으로 단계를 재현하지 말라고 지시합니다. 그래서 사용자에게 직접 `/deploy` 를 실행하라고 제안하게 됩니다.' } },
        { node: 'l4.blocked', explain: {
          en: 'This is why the docs recommend the field for workflows with side effects — deploys, commits, sending messages.',
          ko: '그래서 문서는 배포·커밋·메시지 발송처럼 부작용이 있는 워크플로에 이 필드를 권합니다.' } },
        { node: 'l4.persist', badge: 'end', explain: {
          en: 'Nothing was loaded into context, because the skill never ran.',
          ko: '스킬이 실행되지 않았으므로 컨텍스트에 로드된 것도 없습니다.' } },
      ],
    },
  ],

  quiz: [
    {
      q: {
        en: 'In a regular session, what is in context at session start for a default skill?',
        ko: '일반 세션에서 기본 스킬은 세션 시작 시 무엇이 컨텍스트에 있습니까?' },
      choices: [
        { en: 'The whole `SKILL.md` body', ko: '`SKILL.md` 본문 전체' },
        { en: 'Its description only; the full content loads when invoked', ko: '설명만; 전체 내용은 호출 시 로드된다' },
        { en: 'Nothing until you type `/`', ko: '`/` 를 입력하기 전까지 아무것도 없다' },
        { en: 'Its frontmatter only', ko: '프론트매터만' },
      ],
      answer: 1,
    },
    {
      q: { en: 'What does `disable-model-invocation: true` do?', ko: '`disable-model-invocation: true` 는 무엇을 합니까?' },
      choices: [
        { en: 'Hides the skill from the `/` menu', ko: '`/` 메뉴에서 스킬을 숨긴다' },
        { en: 'Prevents Claude from loading the skill automatically; only you can invoke it', ko: '클로드의 자동 로드를 막는다; 사용자만 호출 가능' },
        { en: 'Disables the skill entirely', ko: '스킬을 완전히 비활성화한다' },
        { en: 'Runs the skill in a subagent', ko: '스킬을 서브에이전트에서 실행한다' },
      ],
      answer: 1,
    },
    {
      q: { en: 'How long does an `allowed-tools` grant from a skill last?', ko: '스킬의 `allowed-tools` 부여는 얼마나 지속됩니까?' },
      choices: [
        { en: 'For the whole session', ko: '세션 전체' },
        { en: 'For the invoking turn; it clears when you send your next message', ko: '호출한 턴 동안; 다음 메시지를 보내면 해제된다' },
        { en: 'Until Claude Code restarts', ko: 'Claude Code 재시작까지' },
        { en: 'Permanently, saved to settings', ko: '영구적으로 설정에 저장된다' },
      ],
      answer: 1,
    },
  ],

  sources: [
    'https://code.claude.com/docs/en/skills',
    'https://code.claude.com/docs/en/context-window',
  ],
};

export default l4;
