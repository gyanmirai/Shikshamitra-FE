import { api } from 'src/redux/service';
import { it, expect, describe, afterEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';

import { AcademicOrderAction } from './academic-order-action';
import {
  academicOrderNode,
  renderAcademicOrder,
  createAcademicOrderStore,
} from './academic-order-test-utils';

import type { AcademicSetupNodeType } from './academic-setup-model';

const stores: ReturnType<typeof createAcademicOrderStore>[] = [];
const setup = (canEdit = true, type: AcademicSetupNodeType = 'Organization', count = 2) => {
  const store = createAcademicOrderStore(canEdit);
  stores.push(store);
  renderAcademicOrder(<AcademicOrderAction node={academicOrderNode(type, count)} />, store);
};
afterEach(() => {
  stores.splice(0).forEach((store) => store.dispatch(api.util.resetApiState()));
});

describe('academic order action', () => {
  it.each(['Medium', 'Organization', 'Standard'] as const)(
    'requires the existing academic Edit grant for %s',
    (type) => {
      setup(false, type);
      expect(screen.queryByRole('button', { name: /Reorder/ })).not.toBeInTheDocument();
    }
  );
  it.each(['Academic Year', 'Division', 'Education Board'] as const)(
    'does not offer reordering for %s',
    (type) => {
      setup(true, type);
      expect(screen.queryByRole('button', { name: /Reorder/ })).not.toBeInTheDocument();
    }
  );
  it('does not offer reorder for fewer than two records', () => {
    setup(true, 'Organization', 1);
    expect(screen.queryByRole('button', { name: 'Reorder classes' })).not.toBeInTheDocument();
  });
  it.each([
    ['Medium', 'Reorder stages', 'Reorder Stages'],
    ['Organization', 'Reorder classes', 'Reorder Classes'],
    ['Standard', 'Reorder divisions', 'Reorder Divisions'],
  ] as const)(
    'opens the matching %s dialog and discards cancelled drafts when reopened',
    (type, label, title) => {
      setup(true, type);
      fireEvent.click(screen.getByRole('button', { name: label }));
      expect(screen.getByRole('dialog', { name: title })).toBeVisible();
      fireEvent.click(screen.getByRole('button', { name: 'Move Nursery up' }));
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
      fireEvent.click(screen.getByRole('button', { name: label }));
      expect(screen.getByRole('button', { name: 'Move UKG up' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Save order' })).toBeDisabled();
    }
  );
});
