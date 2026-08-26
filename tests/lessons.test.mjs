/**
 * Lesson data tests: the four shipped lessons against docs/CONTENT-SPEC.md.
 * The schema gate proves structure; these tests pin the content contract that
 * the spec calls binding (the L1 cluster, L3's per-event exit-2 meanings).
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { validateLesson, combinations, findScenario } from '../js/engine/schema.js';
import { allLessons } from '../js/lessons/index.js';

const lessons = allLessons();
const byId = Object.fromEntries(lessons.map((l) => [l.id, l]));
const stepsOf = (lesson) => lesson.scenarios.flatMap((s) => s.steps);
const badgesOf = (scenario) => scenario.steps.map((s) => s.badge).filter(Boolean);

/** nodes / scenarios / steps / quiz, per CONTENT-SPEC §5 (L3: see note). */
const EXPECTED = {
  'l1-agent-loop': { nodes: 12, scenarios: 4, steps: 28, quiz: 3 },
  'l2-slash-commands': { nodes: 8, scenarios: 4, steps: 27, quiz: 3 },
  // 48 in the spec's totals table + the extra leading note step §3.5 gives l3.s2
  'l3-hooks': { nodes: 13, scenarios: 8, steps: 49, quiz: 3 },
  'l4-skills': { nodes: 10, scenarios: 4, steps: 24, quiz: 3 },
};

test('the registry ships exactly the four MVP lessons, in order', () => {
  assert.deepEqual(lessons.map((l) => l.id), Object.keys(EXPECTED));
});

test('every registered lesson passes the schema gate', () => {
  for (const lesson of lessons) {
    const result = validateLesson(lesson);
    assert.deepEqual(result.errors, [], `lesson "${lesson.id}" failed the gate`);
  }
});

test('each lesson matches the spec node / scenario / step / quiz counts', () => {
  for (const [id, want] of Object.entries(EXPECTED)) {
    const lesson = byId[id];
    assert.equal(lesson.diagram.nodes.length, want.nodes, `${id} nodes`);
    assert.equal(lesson.scenarios.length, want.scenarios, `${id} scenarios`);
    assert.equal(stepsOf(lesson).length, want.steps, `${id} steps`);
    assert.equal(lesson.quiz.length, want.quiz, `${id} quiz`);
  }
});

test('every widget combination resolves to exactly one scenario', () => {
  for (const lesson of lessons) {
    const rows = combinations(lesson.inputs);
    const ids = rows.map((row) => findScenario(lesson, row)).map((s) => s && s.id);
    assert.equal(ids.filter(Boolean).length, rows.length, `${lesson.id} has an uncovered combination`);
    assert.equal(new Set(ids).size, rows.length, `${lesson.id} reuses a scenario`);
  }
});

test('every lesson carries sources and the documentation baseline date', () => {
  for (const lesson of lessons) {
    assert.ok(lesson.sources.length >= 1, `${lesson.id} needs a source`);
    for (const url of lesson.sources) assert.match(url, /^https:\/\/code\.claude\.com\/docs\//);
    assert.equal(lesson.asOf, '2026-08-26');
    assert.ok(lesson.minutes > 0);
  }
});

test('L1 draws the startup context as an unordered cluster', () => {
  const l1 = byId['l1-agent-loop'];
  const cluster = l1.diagram.nodes.find((n) => Array.isArray(n.group));
  assert.equal(cluster.id, 'l1.startup');
  assert.deepEqual(cluster.group, ['l1.claude_md', 'l1.auto_memory', 'l1.skill_list', 'l1.tool_defs']);
  // the binding rule: no edges may order the cluster members among themselves
  const members = new Set(cluster.group);
  for (const edge of l1.diagram.edges) {
    assert.ok(!(members.has(edge.from) && members.has(edge.to)), `edge ${edge.from}->${edge.to} orders the cluster`);
  }
  assert.ok(stepsOf(l1).some((s) => s.badge === 'unordered'));
});

test('L3 gives exit 2 a distinct outcome and badge per event', () => {
  const l3 = byId['l3-hooks'];
  const scenario = (id) => l3.scenarios.find((s) => s.id === id);
  const pre = scenario('l3.s4');
  const post = scenario('l3.s6');
  const stop = scenario('l3.s8');
  assert.deepEqual(pre.trigger, { hook: 'PreToolUse', exit: '2' });
  assert.deepEqual(post.trigger, { hook: 'PostToolUse', exit: '2' });
  assert.deepEqual(stop.trigger, { hook: 'Stop', exit: '2' });

  assert.ok(badgesOf(pre).includes('blocked'));
  assert.ok(badgesOf(post).includes('not blocked'));
  assert.ok(badgesOf(stop).includes('continues'));

  // the three outcomes are different terminals, not one shared "blocked" node
  assert.ok(pre.steps.some((s) => s.node === 'l3.blocked'));
  assert.ok(post.steps.some((s) => s.node === 'l3.feedback'));
  assert.ok(stop.steps.some((s) => s.node === 'l3.continue'));

  // no other scenario may claim a block
  for (const s of l3.scenarios) {
    if (s.id === 'l3.s4') continue;
    assert.ok(!badgesOf(s).includes('blocked'), `${s.id} must not reuse the blocked badge`);
    assert.ok(!s.steps.some((step) => step.node === 'l3.blocked'), `${s.id} must not reach l3.blocked`);
  }
});

test('every quiz question has one answer inside its choice list', () => {
  for (const lesson of lessons) {
    for (const item of lesson.quiz) {
      assert.ok(item.choices.length >= 3, `${lesson.id} quiz needs real distractors`);
      assert.ok(item.choices[item.answer], `${lesson.id} quiz answer out of range`);
    }
  }
});
