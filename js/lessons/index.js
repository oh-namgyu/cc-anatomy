/**
 * Lesson registry.
 *
 * Adding a lesson is adding a data module: import it here and register it.
 * Nothing else in the app needs to change.
 */

import { dummy } from './dummy.js';

const registry = new Map();

/** Add a lesson to the registry, keyed by its id. */
export function register(lesson) {
  registry.set(lesson.id, lesson);
  return lesson;
}

/** One lesson by id, or null. */
export function getLesson(id) {
  return registry.get(id) || null;
}

/** Every registered lesson, in registration order. */
export function allLessons() {
  return [...registry.values()];
}

register(dummy);
