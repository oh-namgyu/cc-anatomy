import { test, expect } from '@playwright/test';

const LESSON = '#/lesson/dummy';

const els = (page) => ({
  indicator: page.locator('[data-indicator]'),
  explain: page.locator('[data-explain]'),
  badge: page.locator('[data-badge]'),
  next: page.locator('[data-next]'),
  prev: page.locator('[data-prev]'),
  auto: page.locator('[data-auto]'),
});

async function openLesson(page, query = '') {
  await page.goto(`/${query}${LESSON}`);
  await expect(page.locator('body[data-ready="true"]')).toBeAttached();
  await expect(page.locator('svg.diagram')).toBeVisible();
}

async function pick(page, widget, value) {
  await page.locator(`[data-widget="${widget}"][data-value="${value}"]`).click();
}

test('home lists the engine demo and opens it', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('[data-lesson-id="dummy"]');
  await expect(card).toBeVisible();
  await expect(card.locator('[data-title]')).toHaveText('Engine demo');
  await expect(card.locator('[data-meta]')).toContainText('engine demo');
  await card.click();
  await expect(page).toHaveURL(new RegExp(`${LESSON}$`));
  await expect(page.locator('.lesson-title')).toHaveText('Engine demo');
  await expect(page.locator('svg.diagram')).toBeVisible();
  await expect(els(page).indicator).toHaveText('1 / 4');
});

test('the control bar steps forward and back', async ({ page }) => {
  await openLesson(page);
  const { indicator, explain, prev, next } = els(page);
  await expect(prev).toBeDisabled();
  const first = await explain.textContent();

  await next.click();
  await expect(indicator).toHaveText('2 / 4');
  await expect(explain).not.toHaveText(first);
  await expect(prev).toBeEnabled();

  await prev.click();
  await expect(indicator).toHaveText('1 / 4');
  await expect(explain).toHaveText(first);

  await next.click();
  await next.click();
  await next.click();
  await expect(indicator).toHaveText('4 / 4');
  await expect(next).toBeDisabled();
});

test('the arrow keys step through the scenario', async ({ page }) => {
  await openLesson(page);
  const { indicator } = els(page);
  await page.keyboard.press('ArrowRight');
  await expect(indicator).toHaveText('2 / 4');
  await page.keyboard.press('ArrowRight');
  await expect(indicator).toHaveText('3 / 4');
  await page.keyboard.press('ArrowLeft');
  await expect(indicator).toHaveText('2 / 4');
});

test('a cluster step highlights every member at once', async ({ page }) => {
  await openLesson(page);
  await page.keyboard.press('ArrowRight');
  await expect(els(page).indicator).toHaveText('2 / 4');
  await expect(page.locator('[data-node="d.context"]')).toHaveClass(/is-active/);
  await expect(page.locator('[data-node="d.rules"]')).toHaveClass(/is-active/);
  await expect(page.locator('[data-node="d.tools"]')).toHaveClass(/is-active/);
  await expect(page.locator('[data-node="d.gate"]')).toHaveClass(/is-idle/);
  await expect(page.locator('[data-edge="d.input->d.context"]')).toHaveClass(/is-pulse/);
});

test('changing an input switches scenario and resets to the first step', async ({ page }) => {
  await openLesson(page);
  const { indicator } = els(page);
  await expect(indicator).toHaveText('1 / 4');

  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(indicator).toHaveText('3 / 4');

  await pick(page, 'guard', 'on');
  await expect(indicator).toHaveText('1 / 5');

  await pick(page, 'guard', 'off');
  await expect(indicator).toHaveText('1 / 4');
});

test('the blocked branch shows a red badge and never reaches the result node', async ({ page }) => {
  await openLesson(page);
  const { badge, next, indicator } = els(page);
  await expect(badge).toBeHidden();

  await pick(page, 'mode', 'edit');
  await pick(page, 'guard', 'on');
  await expect(indicator).toHaveText('1 / 5');

  await next.click();
  await expect(badge).toHaveText('unordered');
  await expect(badge).toHaveAttribute('data-tone', 'neutral');

  await next.click();
  await next.click();
  await expect(indicator).toHaveText('4 / 5');
  await expect(badge).toHaveText('blocked');
  await expect(badge).toHaveAttribute('data-tone', 'blocked');
  await expect(page.locator('[data-node="d.result"]')).toHaveClass(/is-idle/);

  await next.click();
  await expect(page.locator('[data-edge="d.gate->d.input"]')).toHaveClass(/is-pulse/);
});

test('the allowed branch shows a green badge', async ({ page }) => {
  await openLesson(page);
  const { badge, next } = els(page);
  await pick(page, 'guard', 'on');
  await next.click();
  await next.click();
  await next.click();
  await expect(badge).toHaveText('allowed');
  await expect(badge).toHaveAttribute('data-tone', 'allowed');
});

test('auto play advances the scenario on its own', async ({ page }) => {
  await openLesson(page);
  const { indicator, auto } = els(page);
  await auto.click();
  await expect(auto).toHaveAttribute('aria-pressed', 'true');
  await expect(indicator).toHaveText('2 / 4', { timeout: 6000 });
  await expect(indicator).toHaveText('3 / 4', { timeout: 6000 });
  await auto.click();
  await expect(auto).toHaveAttribute('aria-pressed', 'false');
});

test('the locale toggle switches every string and survives a reload', async ({ page }) => {
  await openLesson(page);
  const { explain } = els(page);
  await expect(page.locator('.lesson-title')).toHaveText('Engine demo');

  await page.locator('.loc-btn[data-locale="ko"]').click();
  await expect(page.locator('.lesson-title')).toHaveText('엔진 데모');
  await expect(page.locator('.brand-note')).toContainText('개념 모델');
  await expect(explain).toContainText('질문');
  await expect(page.locator('[data-widget="mode"] .widget-legend')).toHaveText('요청 내용');
  await expect(page.locator('text.node-label tspan').first()).toContainText('프롬프트');

  await page.reload();
  await expect(page.locator('body[data-ready="true"]')).toBeAttached();
  await expect(page.locator('.lesson-title')).toHaveText('엔진 데모');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ko');

  await page.locator('.loc-btn[data-locale="en"]').click();
  await expect(page.locator('.lesson-title')).toHaveText('Engine demo');
});

test('a broken lesson falls back to the overview view instead of crashing', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/?lesson=broken#/lesson/broken');
  await expect(page.locator('body[data-ready="true"]')).toBeAttached();

  await expect(page.locator('.lesson-title')).toHaveText('Broken fixture');
  await expect(page.locator('.lesson-intro')).toContainText('intentionally invalid');
  await expect(page.locator('.notice')).toBeVisible();
  await expect(page.locator('.notice-list')).toContainText('E_NODE_REF');
  await expect(page.locator('.notice-list')).toContainText('E_COMBO_UNCOVERED');
  await expect(page.locator('svg.diagram')).toHaveCount(0);
  expect(errors).toEqual([]);

  await page.locator('.back').click();
  await expect(page.locator('[data-lesson-id="dummy"]')).toBeVisible();
});

test.describe('reduced motion', () => {
  test('the player still works, with the trace pulse turned off', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openLesson(page);
    expect(await page.evaluate(
      () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    )).toBe(true);
    const { indicator, explain } = els(page);
    await page.keyboard.press('ArrowRight');
    await expect(indicator).toHaveText('2 / 4');
    await expect(explain).not.toHaveText('');

    const edge = page.locator('[data-edge="d.input->d.context"]');
    await expect(edge).toHaveClass(/is-pulse/);
    const animation = await edge.locator('.edge-line').evaluate(
      (node) => window.getComputedStyle(node).animationName,
    );
    expect(animation).toBe('none');
    await expect(page.locator('[data-node="d.context"]')).toHaveClass(/is-active/);
  });
});

test.describe('narrow viewport', () => {
  test.use({ viewport: { width: 420, height: 780 } });

  test('the stage stacks and the controls stay usable', async ({ page }) => {
    await openLesson(page);
    const canvas = await page.locator('.canvas').boundingBox();
    const panel = await page.locator('.panel').boundingBox();
    expect(panel.y).toBeGreaterThan(canvas.y);
    await els(page).next.click();
    await expect(els(page).indicator).toHaveText('2 / 4');
  });
});
