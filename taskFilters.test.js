import { describe, it, expect } from 'vitest';
import { getFilteredTasks } from './taskFilters.js';

describe('getFilteredTasks', () => {
  const tasks = [
    { id: 1, title: 'Study', completed: false },
    { id: 2, title: 'Homework', completed: true },
    { id: 3, title: 'Exercise', completed: false },
  ];

  it('returns all tasks when the filter is all', () => {
    expect(getFilteredTasks(tasks, 'all')).toEqual(tasks);
  });

  it('returns only active tasks', () => {
    const result = getFilteredTasks(tasks, 'active');

    expect(result).toHaveLength(2);
    expect(result.every((task) => !task.completed)).toBe(true);
  });

  it('returns only completed tasks', () => {
    const result = getFilteredTasks(tasks, 'completed');

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Homework');
  });

  it('returns an empty array when no tasks match', () => {
    const result = getFilteredTasks(
      [{ id: 1, title: 'Study', completed: false }],
      'completed'
    );

    expect(result).toEqual([]);
  });
});