/**
 * L2 — Slash Commands.
 *
 * Data transcribed from docs/CONTENT-SPEC.md §2. Binding terminology note: as
 * of the 2026-08 docs, custom commands are merged into skills — both
 * `.claude/skills/<name>/SKILL.md` and `.claude/commands/<name>.md` create
 * `/name`, and the skill wins a name clash. This lesson teaches the path a
 * user-typed `/name` takes, without claiming one location is the only one.
 */

const H = 64;

export const l2 = {
  id: 'l2-slash-commands',
  minutes: 5,
  asOf: '2026-08-26',
  title: { en: 'Slash Commands', ko: '슬래시 명령' },
  intro: {
    en: 'A slash command is a file whose content becomes a prompt. Typing `/name` renders that file — substituting any arguments you passed — and hands the result to Claude.',
    ko: '슬래시 명령은 내용이 곧 프롬프트가 되는 파일입니다. `/이름` 을 입력하면 그 파일이 렌더링되고 — 전달한 인자가 치환되어 — 결과가 클로드에게 전달됩니다.',
  },

  diagram: {
    nodes: [
      { id: 'l2.type', role: 'event', x: 0, y: 0, h: H,
        label: { en: 'You type /name [args]', ko: '/이름 [인자] 입력' } },
      { id: 'l2.parse', role: 'event', x: 0, y: 130, h: H,
        label: { en: 'Split name and arguments', ko: '이름·인자 분리' } },
      { id: 'l2.resolve', role: 'decision', x: 0, y: 260, h: H,
        label: { en: 'Resolve the file', ko: '파일 해석' } },
      { id: 'l2.substitute', role: 'event', x: 400, y: 190, h: H,
        label: { en: '$ARGUMENTS substitution', ko: '$ARGUMENTS 치환' } },
      { id: 'l2.append', role: 'event', x: 400, y: 330, h: H,
        label: { en: 'Append ARGUMENTS: <value>', ko: 'ARGUMENTS: <값> 덧붙임' } },
      { id: 'l2.inject', role: 'artifact', x: 680, y: 260, h: H,
        label: { en: 'Rendered content enters the conversation', ko: '렌더링된 내용이 대화에 진입' } },
      { id: 'l2.evaluate', role: 'decision', x: 680, y: 400, h: H,
        label: { en: 'Claude follows the instructions', ko: '클로드가 지시를 수행' } },
      { id: 'l2.response', role: 'terminal', x: 680, y: 530, h: H,
        label: { en: 'Response', ko: '응답' } },
    ],
    edges: [
      { from: 'l2.type', to: 'l2.parse' },
      { from: 'l2.parse', to: 'l2.resolve' },
      { from: 'l2.resolve', to: 'l2.substitute',
        label: { en: 'has $ARGUMENTS', ko: '$ARGUMENTS 있음' } },
      { from: 'l2.resolve', to: 'l2.append',
        label: { en: 'no $ARGUMENTS', ko: '$ARGUMENTS 없음' } },
      { from: 'l2.substitute', to: 'l2.inject' },
      { from: 'l2.append', to: 'l2.inject' },
      { from: 'l2.inject', to: 'l2.evaluate' },
      { from: 'l2.evaluate', to: 'l2.response' },
    ],
  },

  inputs: {
    body: ['with-placeholder', 'no-placeholder'],
    args: ['none', '123'],
  },

  widgets: {
    body: {
      type: 'chips',
      label: { en: 'File content', ko: '파일 내용' },
      valueLabels: {
        'with-placeholder': {
          en: 'Fix GitHub issue $ARGUMENTS following our coding standards.',
          ko: 'Fix GitHub issue $ARGUMENTS following our coding standards.',
        },
        'no-placeholder': {
          en: 'Deploy the application to production.',
          ko: 'Deploy the application to production.',
        },
      },
    },
    args: {
      type: 'chips',
      default: '123',
      label: { en: 'What you type', ko: '입력한 것' },
      valueLabels: {
        none: { en: '/fix-issue', ko: '/fix-issue' },
        123: { en: '/fix-issue 123', ko: '/fix-issue 123' },
      },
    },
  },

  scenarios: [
    {
      id: 'l2.s1',
      trigger: { body: 'with-placeholder', args: '123' },
      steps: [
        { node: 'l2.type', explain: {
          en: 'You type `/fix-issue 123`. A command is only recognized at the start of your message.',
          ko: '`/fix-issue 123` 를 입력합니다. 명령은 메시지 맨 앞에서만 인식됩니다.' } },
        { node: 'l2.parse', edge: 'l2.type->l2.parse', explain: {
          en: 'Text that follows the command name becomes its arguments, so `123` is the argument.',
          ko: '명령 이름 뒤의 텍스트가 인자가 되므로 `123` 이 인자입니다.' } },
        { node: 'l2.resolve', edge: 'l2.parse->l2.resolve', explain: {
          en: 'The name maps to a file: a directory under `.claude/skills/` gives its directory name, a file under `.claude/commands/` gives its file name without the extension.',
          ko: '이름이 파일로 연결됩니다 — `.claude/skills/` 아래는 디렉토리 이름, `.claude/commands/` 아래는 확장자를 뺀 파일 이름.' } },
        { node: 'l2.substitute', edge: 'l2.resolve->l2.substitute', badge: 'substituted', explain: {
          en: '`$ARGUMENTS` expands to all arguments passed. The content becomes "Fix GitHub issue 123 following our coding standards…".',
          ko: '`$ARGUMENTS` 가 전달된 인자 전체로 확장됩니다. 내용은 "Fix GitHub issue 123 following our coding standards…" 가 됩니다.' } },
        { node: 'l2.inject', edge: 'l2.substitute->l2.inject', explain: {
          en: 'The rendered content enters the conversation as a single message and stays there for the rest of the session.',
          ko: '렌더링된 내용이 하나의 메시지로 대화에 들어가 세션이 끝날 때까지 남습니다.' } },
        { node: 'l2.evaluate', edge: 'l2.inject->l2.evaluate', explain: {
          en: 'Claude receives that text as its instructions and works on the issue.',
          ko: '클로드는 그 텍스트를 지시로 받아 이슈 작업을 진행합니다.' } },
        { node: 'l2.response', edge: 'l2.evaluate->l2.response', badge: 'end', explain: {
          en: 'Claude answers, having acted on the rendered prompt.',
          ko: '렌더링된 프롬프트에 따라 작업하고 응답합니다.' } },
      ],
    },
    {
      id: 'l2.s2',
      trigger: { body: 'no-placeholder', args: '123' },
      steps: [
        { node: 'l2.type', explain: {
          en: 'You type `/deploy 123`.',
          ko: '`/deploy 123` 를 입력합니다.' } },
        { node: 'l2.parse', edge: 'l2.type->l2.parse', explain: {
          en: '`123` becomes the arguments.',
          ko: '`123` 이 인자가 됩니다.' } },
        { node: 'l2.resolve', edge: 'l2.parse->l2.resolve', explain: {
          en: 'The file for `/deploy` is found. Its content contains no `$ARGUMENTS`.',
          ko: '`/deploy` 의 파일을 찾습니다. 내용에 `$ARGUMENTS` 가 없습니다.' } },
        { node: 'l2.append', edge: 'l2.resolve->l2.append', badge: 'appended', explain: {
          en: 'Because the content has no `$ARGUMENTS`, the arguments are appended as `ARGUMENTS: 123` at the end, so Claude still sees what you typed.',
          ko: '`$ARGUMENTS` 가 없으므로 인자가 끝에 `ARGUMENTS: 123` 로 덧붙습니다. 그래서 입력한 내용을 클로드가 여전히 봅니다.' } },
        { node: 'l2.inject', edge: 'l2.append->l2.inject', explain: {
          en: 'The rendered content enters the conversation as one message.',
          ko: '렌더링된 내용이 하나의 메시지로 대화에 들어갑니다.' } },
        { node: 'l2.evaluate', edge: 'l2.inject->l2.evaluate', explain: {
          en: 'Claude reads the deploy steps plus the trailing `ARGUMENTS:` line.',
          ko: '클로드가 배포 단계와 뒤에 붙은 `ARGUMENTS:` 줄을 읽습니다.' } },
        { node: 'l2.response', edge: 'l2.evaluate->l2.response', badge: 'end', explain: {
          en: 'Claude responds.',
          ko: '클로드가 응답합니다.' } },
      ],
    },
    {
      id: 'l2.s3',
      trigger: { body: 'with-placeholder', args: 'none' },
      steps: [
        { node: 'l2.type', explain: {
          en: 'You type `/fix-issue` with nothing after it.',
          ko: '뒤에 아무것도 없이 `/fix-issue` 만 입력합니다.' } },
        { node: 'l2.parse', edge: 'l2.type->l2.parse', explain: {
          en: 'The docs state that text following the command name becomes its arguments — here there is none.',
          ko: '문서는 명령 이름 뒤의 텍스트가 인자가 된다고 합니다 — 여기서는 없습니다.' } },
        { node: 'l2.resolve', edge: 'l2.parse->l2.resolve', explain: {
          en: 'The file for `/fix-issue` is found; its content contains `$ARGUMENTS`.',
          ko: '`/fix-issue` 파일을 찾습니다. 내용에 `$ARGUMENTS` 가 있습니다.' } },
        { node: 'l2.substitute', edge: 'l2.resolve->l2.substitute', badge: 'undocumented', explain: {
          en: 'The docs define `$ARGUMENTS` as all arguments passed when invoking, and they do not state what the placeholder becomes when no arguments were passed. cc-anatomy shows this as undocumented rather than guessing.',
          ko: '문서는 `$ARGUMENTS` 를 "호출 시 전달된 인자 전체" 로 정의할 뿐, 인자가 없을 때 무엇이 되는지는 명시하지 않습니다. cc-anatomy 는 추측 대신 "문서 미기재" 로 표시합니다.' } },
        { node: 'l2.inject', edge: 'l2.substitute->l2.inject', explain: {
          en: 'Whatever the placeholder renders to, the rendered content enters the conversation as a single message.',
          ko: '치환 결과가 무엇이든, 렌더링된 내용은 하나의 메시지로 대화에 들어갑니다.' } },
        { node: 'l2.evaluate', edge: 'l2.inject->l2.evaluate', explain: {
          en: 'Claude works from instructions with no issue number, so it will typically need to ask or infer.',
          ko: '이슈 번호 없는 지시로 작업하게 되므로, 보통 되묻거나 추론해야 합니다.' } },
        { node: 'l2.response', edge: 'l2.evaluate->l2.response', badge: 'end', explain: {
          en: 'Claude responds.',
          ko: '클로드가 응답합니다.' } },
      ],
    },
    {
      id: 'l2.s4',
      trigger: { body: 'no-placeholder', args: 'none' },
      steps: [
        { node: 'l2.type', explain: {
          en: 'You type `/deploy`.',
          ko: '`/deploy` 를 입력합니다.' } },
        { node: 'l2.parse', edge: 'l2.type->l2.parse', explain: {
          en: 'No text follows the name, so there are no arguments.',
          ko: '이름 뒤에 텍스트가 없으므로 인자가 없습니다.' } },
        { node: 'l2.resolve', edge: 'l2.parse->l2.resolve', explain: {
          en: 'The file for `/deploy` is found. If both a skill and a command file use the name, the skill takes precedence.',
          ko: '`/deploy` 파일을 찾습니다. 스킬과 명령 파일이 이름을 공유하면 스킬이 우선합니다.' } },
        { node: 'l2.inject', explain: {
          en: "With no arguments and no placeholder, the file's content is what enters the conversation, as a single message.",
          ko: '인자도 플레이스홀더도 없으므로 파일 내용 그대로가 하나의 메시지로 대화에 들어갑니다.' } },
        { node: 'l2.evaluate', edge: 'l2.inject->l2.evaluate', explain: {
          en: 'Claude follows the deploy steps as written.',
          ko: '클로드가 적힌 대로 배포 단계를 수행합니다.' } },
        { node: 'l2.response', edge: 'l2.evaluate->l2.response', badge: 'end', explain: {
          en: 'Claude responds. The content stays in context for the rest of the session; the docs note Claude Code does not re-read the file on later turns.',
          ko: '클로드가 응답합니다. 내용은 세션 내내 컨텍스트에 남고, 이후 턴에 파일을 다시 읽지 않는다고 문서는 설명합니다.' } },
      ],
    },
  ],

  quiz: [
    {
      q: {
        en: 'You invoke a command with arguments, but its content has no `$ARGUMENTS`. What do the docs say happens?',
        ko: '인자와 함께 명령을 호출했는데 내용에 `$ARGUMENTS` 가 없습니다. 문서는 어떻게 된다고 합니까?' },
      choices: [
        { en: 'The invocation fails', ko: '호출이 실패한다' },
        { en: 'The arguments are discarded', ko: '인자가 버려진다' },
        { en: 'The arguments are appended as `ARGUMENTS: <value>`', ko: '인자가 `ARGUMENTS: <값>` 로 덧붙는다' },
        { en: 'Claude is asked to supply them', ko: '클로드에게 인자를 물어본다' },
      ],
      answer: 2,
    },
    {
      q: { en: 'Where in your message must a slash command appear?', ko: '슬래시 명령은 메시지의 어디에 있어야 합니까?' },
      choices: [
        { en: 'Anywhere in the message', ko: '메시지 어디든' },
        { en: 'Only at the start of the message', ko: '메시지 맨 앞에만' },
        { en: 'Only on its own line', ko: '자기 줄에만' },
        { en: 'Only at the end', ko: '맨 끝에만' },
      ],
      answer: 1,
    },
    {
      q: {
        en: 'A `deploy` skill and a `deploy.md` command file both exist. Which one runs?',
        ko: '`deploy` 스킬과 `deploy.md` 명령 파일이 둘 다 있습니다. 무엇이 실행됩니까?' },
      choices: [
        { en: 'The command file', ko: '명령 파일' },
        { en: 'The skill', ko: '스킬' },
        { en: 'Both, in sequence', ko: '둘 다 순서대로' },
        { en: 'Neither; it is an error', ko: '둘 다 아니고 오류다' },
      ],
      answer: 1,
    },
  ],

  sources: [
    'https://code.claude.com/docs/en/skills',
    'https://code.claude.com/docs/en/commands',
  ],
};

export default l2;
