import { it, expect, describe } from 'vitest';

import { layer } from './fixtures.test-utils';
import { alignElements, distributeElements } from './geometry-commands';
import { orderElements, updateSelected, duplicateElements } from './layer-commands';

describe('studio commands', () => {
  it('updates only selected unlocked layers without changing the input', () => {
    const elements = [layer('a'), layer('b', { locked: true }), layer('c')];
    const next = updateSelected(elements, ['a', 'b'], (element) => ({ ...element, x: 25 }));
    expect(next.map((element) => element.x)).toEqual([25, 10, 10]);
    expect(elements[0].x).toBe(10);
  });

  it('aligns a single object to the card and multiple objects to their bounds', () => {
    expect(alignElements([layer('a')], ['a'], 'right', 100, 60)[0].x).toBe(80);
    const elements = [layer('a'), layer('b', { x: 50 }), layer('c', { x: 95, locked: true })];
    expect(alignElements(elements, ['a', 'b', 'c'], 'center', 100, 60).map((e) => e.x)).toEqual([
      30, 30, 95,
    ]);
  });

  it('distributes three different widths with equal gaps and fixed endpoints', () => {
    const elements = [
      layer('a', { x: 0, w: 10 }),
      layer('b', { x: 15, w: 20 }),
      layer('c', { x: 80, w: 20 }),
    ];
    expect(distributeElements(elements, ['a', 'b', 'c'], 'horizontal').map((e) => e.x)).toEqual([
      0, 35, 80,
    ]);
    expect(distributeElements(elements, ['a', 'b'], 'horizontal')).toBe(elements);
  });

  it('duplicates with fresh IDs, group identity, bounded offset, and increasing z', () => {
    const elements = [
      layer('a', { x: 78, groupId: 'old' }),
      layer('b', { x: 80, groupId: 'old', z: 2 }),
    ];
    const next = duplicateElements(elements, elements, 100, 60);
    expect(next).toHaveLength(4);
    expect(new Set(next.map((e) => e.id)).size).toBe(4);
    expect(next.slice(2).map((e) => e.x)).toEqual([78, 80]);
    expect(next[2].groupId).toBe(next[3].groupId);
    expect(next[2].groupId).not.toBe('old');
    expect(next.slice(2).map((e) => e.z)).toEqual([3, 4]);
  });

  it('reorders selected blocks while locked layers keep their z position', () => {
    const elements = [
      layer('a', { z: 1 }),
      layer('lock', { z: 2, locked: true }),
      layer('b', { z: 3 }),
      layer('c', { z: 4 }),
    ];
    const next = orderElements(elements, ['a', 'b', 'lock'], 'front');
    expect([...next].sort((a, b) => a.z - b.z).map((e) => e.id)).toEqual(['c', 'lock', 'a', 'b']);
    expect(next.find((e) => e.id === 'lock')?.z).toBe(2);
    expect(orderElements(elements, ['a', 'b'], 'forward').map((e) => e.id)).toEqual(['c', 'lock', 'a', 'b']);
  });

  it('reorders layers sharing the preset z values', () => {
    const elements = [layer('a', { z: 2 }), layer('b', { z: 2 }), layer('c', { z: 2 })];
    const next = orderElements(elements, ['a'], 'front');
    expect([...next].sort((a, b) => a.z - b.z).map((element) => element.id)).toEqual(['b', 'c', 'a']);
    expect(elements.map((element) => element.id)).toEqual(['a', 'b', 'c']);
  });
});
