import { api } from 'src/redux/service';
import { act, screen, fireEvent } from '@testing-library/react';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { AcademicOrderAction } from './academic-order-action';
import {
  academicOrderNode,
  renderAcademicOrder,
  displayedAcademicOrder,
  createAcademicOrderStore,
} from './academic-order-test-utils';

let store: ReturnType<typeof createAcademicOrderStore>;
beforeEach(() => {
  store = createAcademicOrderStore();
});
afterEach(() => {
  store.dispatch(api.util.resetApiState());
  window.history.replaceState({}, '', '/');
});

describe('academic order draft freshness', () => {
  it.each(['Medium', 'Organization'] as const)(
    'keeps an open dirty %s dialog when a sibling is removed and uses the latest list after reopening',
    (type) => {
      const label = type === 'Medium' ? 'Reorder stages' : 'Reorder classes';
      const title = type === 'Medium' ? 'Reorder Stages' : 'Reorder Classes';
      const view = renderAcademicOrder(
        <AcademicOrderAction node={academicOrderNode(type)} />,
        store
      );
      fireEvent.click(screen.getByRole('button', { name: label }));
      fireEvent.click(screen.getByRole('button', { name: 'Move Nursery up' }));
      view.rerender(<AcademicOrderAction node={academicOrderNode(type, 1)} />);
      expect(screen.getByRole('dialog', { name: title })).toBeVisible();
      expect(screen.getByRole('alert')).toHaveTextContent('This list changed');
      expect(displayedAcademicOrder()).toEqual(['1Nursery', '2UKG']);
      expect(screen.getByRole('button', { name: 'Save order' })).toBeDisabled();
      const updated = academicOrderNode(type);
      updated.children = [
        ...(updated.children ?? []),
        {
          id: 'new',
          name: 'LKG',
          type: type === 'Medium' ? 'Organization' : 'Standard',
          data: { id: 'new', name: 'LKG' },
          parentsData: {},
        },
      ];
      view.rerender(<AcademicOrderAction node={updated} />);
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
      fireEvent.click(screen.getByRole('button', { name: label }));
      expect(displayedAcademicOrder()).toEqual(['1UKG', '2Nursery', '3LKG']);
    }
  );

  it.each(['Medium', 'Organization'] as const)(
    'blocks saving a refreshed %s order without changed membership',
    (type) => {
      const view = renderAcademicOrder(
        <AcademicOrderAction node={academicOrderNode(type)} />,
        store
      );
      fireEvent.click(
        screen.getByRole('button', {
          name: type === 'Medium' ? 'Reorder stages' : 'Reorder classes',
        })
      );
      fireEvent.click(screen.getByRole('button', { name: 'Move Nursery up' }));
      const reordered = academicOrderNode(type);
      reordered.children = [...(reordered.children ?? [])].reverse();
      view.rerender(<AcademicOrderAction node={reordered} />);
      expect(screen.getByRole('alert')).toHaveTextContent('This list changed');
      expect(screen.getByRole('button', { name: 'Save order' })).toBeDisabled();
    }
  );

  it('protects a changed order from same-document history traversal', () => {
    const navigation = new EventTarget();
    const traverseTo = vi.fn(() => ({ finished: Promise.resolve() }));
    Object.assign(navigation, { traverseTo });
    Object.defineProperty(window, 'navigation', { configurable: true, value: navigation });
    try {
      renderAcademicOrder(<AcademicOrderAction node={academicOrderNode()} />, store);
      fireEvent.click(screen.getByRole('button', { name: 'Reorder classes' }));
      fireEvent.click(screen.getByRole('button', { name: 'Move Nursery up' }));
      const event = new Event('navigate', { cancelable: true });
      Object.assign(event, {
        navigationType: 'traverse',
        destination: { key: 'previous', url: 'http://localhost/previous' },
      });
      act(() => {
        navigation.dispatchEvent(event);
      });
      expect(event.defaultPrevented).toBe(true);
      expect(traverseTo).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
      expect(displayedAcademicOrder()).toEqual(['1Nursery', '2UKG']);
    } finally {
      Reflect.deleteProperty(window, 'navigation');
    }
  });
});
