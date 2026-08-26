import { test, expect } from '@playwright/test';

/**
 * The four shipped lessons: load, branch, step through, badge, quiz, progress.
 * Content expectations come from docs/CONTENT-SPEC.md — especially L3, where
 * exit 2 must read differently on every event.
 */

const LESSONS = [
  { id: 'l1-agent-loop', title: 'The Agent Loop', steps: 7 },
  { id: 'l2-slash-commands', title: 'Slash Commands', steps: 7 },
  { id: 'l3-hooks', title: 'Hooks', steps: 6 },
  { id: 'l4-skills', title: 'Skills', steps: 6 },
];

const els = (page) => ({
  indicator: page.locator('[data-indicator]'),
  explain: page.locator('[data-explain]'),
  badge: page.locator('[data-badge]'),
  next: page.locator('[data-next]'),
  quiz: page.locator('[data-quiz]'),
});

async function open(page, id) {
  await page.goto(`/#/lesson/${id}`);
  await expect(page.locator('body[data-ready="true"]')).toBeAttached();
  await expect(page.locator('svg.diagram')).toBeVisible();
}

const pick = (page, widget, value) => page.locator(`[data-widget="${widget}"][data-value="${value}"]`).click();

/** Walk to the end with the next button and return the final step count. */
async function stepToEnd(page, expected) {
  const { next, indicator } = els(page);
  for (let i = 1; i < expected; i += 1) await next.click();
  await expect(indicator).toHaveText(`${expected} / ${expected}`);
  await expect(next).toBeDisabled();
}

for (const lesson of LESSONS) {
  test(`${lesson.id}: loads, steps to the end, and reveals the quiz`, async ({ page }) => {
    await open(page, lesson.id);
    await expect(page.locator('.lesson-title')).toHaveText(lesson.title);
    await expect(els(page).indicator).toHaveText(`1 / ${lesson.steps}`);
    await expect(els(page).quiz).toBeHidden();
    await stepToEnd(page, lesson.steps);
    await expect(els(page).badge).toHaveText('end');
    await expect(els(page).quiz).toBeVisible();
    const first = page.locator('.sources-list a').first();
    await expect(first).toBeVisible();
    await expect(first).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(first).toHaveAttribute('target', '_blank');
    await expect(first).toHaveAttribute('href', /^https:\/\/code\.claude\.com\/docs\//);
    await expect(page.locator('[data-as-of]')).toHaveText('2026-08-26');
  });

  test(`${lesson.id}: the quiz grades, completes, and shows on the home card`, async ({ page }) => {
    await open(page, lesson.id);
    await page.locator('[data-quiz-open]').click();
    await expect(els(page).quiz).toBeVisible();
    await expect(page.locator('.quiz-card')).toHaveCount(3);

    for (const at of [0, 1, 2]) {
      await page.locator(`[data-question="${at}"] [data-choice="0"]`).click();
    }
    await expect(page.locator('.quiz-verdict:visible')).toHaveCount(3);
    await expect(page.locator('[data-score]')).toHaveText(/^[0-3] \/ 3 correct$/);

    await page.locator('.back').click();
    const card = page.locator(`[data-lesson-id="${lesson.id}"] [data-progress]`);
    await expect(card).toHaveText('completed');
    await expect(card).toHaveAttribute('data-state', 'completed');
  });
}

test('L1: the startup cluster lights up as a whole, with no order inside it', async ({ page }) => {
  await open(page, 'l1-agent-loop');
  await els(page).next.click();
  await expect(els(page).badge).toHaveText('unordered');
  for (const id of ['l1.startup', 'l1.claude_md', 'l1.auto_memory', 'l1.skill_list', 'l1.tool_defs']) {
    await expect(page.locator(`[data-node="${id}"]`)).toHaveClass(/is-active/);
  }
  await expect(page.locator('[data-node="l1.evaluate"]')).toHaveClass(/is-idle/);
});

test('L1: turning CLAUDE.md on switches to the scenario that shows it separately', async ({ page }) => {
  await open(page, 'l1-agent-loop');
  await pick(page, 'claude_md', 'present');
  await expect(els(page).indicator).toHaveText('1 / 7');
  await els(page).next.click();
  await expect(page.locator('[data-node="l1.claude_md"]')).toHaveClass(/is-active/);
  await expect(els(page).explain).toContainText('user message after the system prompt');
  await expect(page.locator('[data-node="l1.auto_memory"]')).toHaveClass(/is-idle/);
});

test('L2: the argument branches differ — substituted, appended, undocumented', async ({ page }) => {
  await open(page, 'l2-slash-commands');
  const { badge, next, indicator } = els(page);
  for (let i = 0; i < 3; i += 1) await next.click();
  await expect(badge).toHaveText('substituted');

  await pick(page, 'body', 'no-placeholder');
  await expect(indicator).toHaveText('1 / 7');
  for (let i = 0; i < 3; i += 1) await next.click();
  await expect(badge).toHaveText('appended');
  await expect(page.locator('[data-node="l2.append"]')).toHaveClass(/is-active/);

  await pick(page, 'body', 'with-placeholder');
  await pick(page, 'args', 'none');
  for (let i = 0; i < 3; i += 1) await next.click();
  await expect(badge).toHaveText('undocumented');

  await pick(page, 'body', 'no-placeholder');
  await expect(indicator).toHaveText('1 / 6');
});

test('L3: exit 2 means something different on every event', async ({ page }) => {
  await open(page, 'l3-hooks');
  const { badge, next, indicator } = els(page);
  await expect(badge).toHaveText('no hooks');

  await pick(page, 'hook', 'PreToolUse');
  await pick(page, 'exit', '2');
  await expect(indicator).toHaveText('1 / 6');
  for (let i = 0; i < 3; i += 1) await next.click();
  await expect(badge).toHaveText('blocked');
  await expect(badge).toHaveAttribute('data-tone', 'blocked');
  await expect(page.locator('[data-node="l3.blocked"]')).toHaveClass(/is-active/);
  await expect(els(page).explain).toContainText('blocks the tool call');

  await pick(page, 'hook', 'PostToolUse');
  for (let i = 0; i < 3; i += 1) await next.click();
  await expect(badge).toHaveText('not blocked');
  await expect(badge).toHaveAttribute('data-tone', 'allowed');
  await expect(page.locator('[data-node="l3.feedback"]')).toHaveClass(/is-active/);
  await expect(page.locator('[data-node="l3.blocked"]')).toHaveClass(/is-idle/);
  await expect(els(page).explain).toContainText('the tool already ran');

  await pick(page, 'hook', 'Stop');
  for (let i = 0; i < 3; i += 1) await next.click();
  await expect(badge).toHaveText('continues');
  await expect(badge).toHaveAttribute('data-tone', 'warn');
  await expect(page.locator('[data-node="l3.continue"]')).toHaveClass(/is-active/);
  await expect(els(page).explain).toContainText('prevents Claude from stopping');
});

test('L3: with no hook configured the exit code selector says it does nothing', async ({ page }) => {
  await open(page, 'l3-hooks');
  await pick(page, 'exit', '2');
  await expect(els(page).indicator).toHaveText('1 / 7');
  await expect(els(page).explain).toContainText('no exit code is produced');
});

test('L4: a model-disabled skill blocks the model, not you', async ({ page }) => {
  await open(page, 'l4-skills');
  const { badge, next } = els(page);
  await pick(page, 'frontmatter', 'disable-model-invocation');
  await expect(badge).toHaveText('not listed');
  for (let i = 0; i < 4; i += 1) await next.click();
  await expect(badge).toHaveText('this turn only');
  await expect(page.locator('[data-node="l4.tools"]')).toHaveClass(/is-active/);

  await pick(page, 'invoker', 'claude');
  for (let i = 0; i < 3; i += 1) await next.click();
  await expect(badge).toHaveText('blocked');
  await expect(page.locator('[data-node="l4.blocked"]')).toHaveClass(/is-active/);
});

test('the locale toggle switches lesson prose, widgets, and quiz', async ({ page }) => {
  await open(page, 'l3-hooks');
  await page.locator('.loc-btn[data-locale="ko"]').click();
  await expect(page.locator('.lesson-title')).toHaveText('훅');
  await expect(els(page).explain).toContainText('훅이 없습니다');
  await expect(page.locator('[data-widget="hook"] .widget-legend')).toHaveText('설정된 훅');
  await expect(page.locator('text.node-label tspan').first()).toContainText('클로드');
  await page.locator('[data-quiz-open]').click();
  await expect(page.locator('.quiz-q').first()).toContainText('문서는 어떻게 된다고 합니까');
  await expect(page.locator('.footer')).toContainText('비공식 커뮤니티 프로젝트');
});
