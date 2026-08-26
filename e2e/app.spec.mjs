import { test, expect } from '@playwright/test';

// The engine demo lives outside the lesson list; ?lesson=dummy registers it.
const LESSON = '?lesson=dummy#/lesson/dummy';

const els = (page) => ({
  indicator: page.locator('[data-indicator]'),
  explain: page.locator('[data-explain]'),
  badge: page.locator('[data-badge]'),
  next: page.locator('[data-next]'),
  prev: page.locator('[data-prev]'),
  auto: page.locator('[data-auto]'),
});

async function openLesson(page) {
  await page.goto(`/${LESSON}`);
  await expect(page.locator('body[data-ready="true"]')).toBeAttached();
  await expect(page.locator('svg.diagram')).toBeVisible();
}

async function pick(page, widget, value) {
  await page.locator(`[data-widget="${widget}"][data-value="${value}"]`).click();
}

test('home lists the four lessons and opens one', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero-title')).toContainText('See how Claude Code actually runs');
  await expect(page.locator('[data-card]')).toHaveCount(4);
  await expect(page.locator('[data-lesson-id="dummy"]')).toHaveCount(0);
  const card = page.locator('[data-lesson-id="l1-agent-loop"]');
  await expect(card.locator('[data-title]')).toHaveText('The Agent Loop');
  await expect(card.locator('[data-meta]')).toContainText('6 min');
  await expect(card.locator('[data-progress]')).toHaveText('not started');
  await card.click();
  await expect(page).toHaveURL(/#\/lesson\/l1-agent-loop$/);
  await expect(page.locator('.lesson-title')).toHaveText('The Agent Loop');
  await expect(page.locator('svg.diagram')).toBeVisible();
  await expect(els(page).indicator).toHaveText('1 / 7');
});

test('the engine demo is reachable only through the test fixture', async ({ page }) => {
  await page.goto('/#/lesson/dummy');
  await expect(page.locator('body[data-ready="true"]')).toBeAttached();
  await expect(page.locator('.lesson-title')).toHaveText('Lesson not found');
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
  await expect(page.locator('[data-lesson-id="l1-agent-loop"]')).toBeVisible();
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

test.describe('touch layout at 860px', () => {
  test.use({ viewport: { width: 860, height: 900 } });

  test('the stage stacks, widgets wrap, and every control is at least 40px', async ({ page }) => {
    await page.goto('/#/lesson/l3-hooks');
    await expect(page.locator('body[data-ready="true"]')).toBeAttached();

    const canvas = await page.locator('.canvas').boundingBox();
    const panel = await page.locator('.panel').boundingBox();
    expect(panel.y).toBeGreaterThanOrEqual(canvas.y + canvas.height);
    expect(Math.round(panel.width)).toBeCloseTo(Math.round(canvas.width), -1);

    // the widget zone wraps instead of overflowing its container
    const zone = await page.locator('.widget-zone').boundingBox();
    for (const id of ['hook', 'exit']) {
      const box = await page.locator(`.widget[data-widget="${id}"]`).boundingBox();
      expect(box.x + box.width).toBeLessThanOrEqual(zone.x + zone.width + 1);
    }

    const controls = ['[data-prev]', '[data-next]', '[data-auto]', '[data-quiz-open]',
      '.chip', '.seg', '.dot', '.loc-btn'];
    for (const selector of controls) {
      const box = await page.locator(selector).first().boundingBox();
      expect(Math.min(box.width, box.height), `${selector} touch target`).toBeGreaterThanOrEqual(40);
    }
  });
});

test.describe('accessibility', () => {
  test('controls, the diagram and the live region are named in both locales', async ({ page }) => {
    await page.goto('/#/lesson/l1-agent-loop');
    await expect(page.locator('body[data-ready="true"]')).toBeAttached();

    const panel = page.locator('.panel');
    await expect(panel).toHaveAttribute('aria-live', 'polite');
    await expect(panel).toHaveAttribute('aria-label', 'Current step');
    await expect(page.locator('[data-next]')).toHaveAttribute('aria-label', 'Next step');
    await expect(page.locator('svg.diagram')).toHaveAttribute('aria-label', 'Lesson flow diagram');
    await expect(page.locator('.dot').first()).toHaveAttribute('aria-label', 'Step 1');

    await page.locator('.loc-btn[data-locale="ko"]').click();
    await expect(panel).toHaveAttribute('aria-label', '현재 단계');
    await expect(page.locator('[data-next]')).toHaveAttribute('aria-label', '다음 단계');
    await expect(page.locator('svg.diagram')).toHaveAttribute('aria-label', '레슨 흐름 다이어그램');
    await expect(page.locator('.dot').first()).toHaveAttribute('aria-label', '단계 1');
  });

  test('the keyboard drives a real lesson and focus is visible', async ({ page }) => {
    await page.goto('/#/lesson/l2-slash-commands');
    await expect(page.locator('body[data-ready="true"]')).toBeAttached();
    await page.keyboard.press('ArrowRight');
    await expect(els(page).indicator).toHaveText('2 / 7');
    await page.keyboard.press('ArrowLeft');
    await expect(els(page).indicator).toHaveText('1 / 7');

    await page.keyboard.press('Tab');
    const focus = await page.evaluate(() => {
      const node = document.activeElement;
      return { tag: node.tagName, outline: window.getComputedStyle(node).outlineWidth };
    });
    expect(focus.tag).not.toBe('BODY');
    expect(parseFloat(focus.outline)).toBeGreaterThan(0);
  });
});
