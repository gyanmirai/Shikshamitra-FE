import type { KeyboardEvent } from 'react';

import { vi, it, expect, describe } from 'vitest';

import { moveSelection } from './move-selection';
import { canvasShortcuts } from './canvas-shortcuts';
import { createIdentityCardPreset } from '../presets';

import type { IdentityCardElement } from '../types';
import type { StudioController } from '../studio/use-card-studio';

describe('editor shortcut boundaries', () => {
  const layout = createIdentityCardPreset('classic-identity');
  it('ignores portaled modal events and editable controls', () => {
    const undo = vi.fn();
    const root = document.createElement('div');
    const portal = document.createElement('button');
    const studio = { undo } as unknown as StudioController;
    const fire = (target: HTMLElement) =>
      canvasShortcuts(
        {
          target,
          currentTarget: root,
          key: 'z',
          ctrlKey: true,
          preventDefault: vi.fn(),
        } as unknown as KeyboardEvent,
        studio,
        layout,
        vi.fn()
      );
    fire(portal);
    const input = document.createElement('input');
    root.append(input);
    fire(input);
    const slider = document.createElement('div');
    slider.setAttribute('role', 'slider');
    root.append(slider);
    fire(slider);
    expect(undo).not.toHaveBeenCalled();
    const canvas = document.createElement('div');
    root.append(canvas);
    fire(canvas);
    expect(undo).toHaveBeenCalledOnce();
  });
  it('moves a group as one block at the card boundary', () => {
    const first = { ...layout.front.elements[0], x: 20, y: 20, w: 40, h: 20, locked: false };
    const second = { ...first, id: 'second', x: layout.width - 45 };
    const results: IdentityCardElement[] = [];
    const studio = {
      selectedElements: [first, second],
      updateElements: (transform: (element: IdentityCardElement) => IdentityCardElement) =>
        results.push(transform(first), transform(second)),
    } as unknown as StudioController;
    moveSelection(studio, layout, 'arrowright', 10);
    expect(results[0].x - first.x).toBe(5);
    expect(results[1].x - second.x).toBe(5);
    expect(results[1].x - results[0].x).toBe(second.x - first.x);
  });
});
