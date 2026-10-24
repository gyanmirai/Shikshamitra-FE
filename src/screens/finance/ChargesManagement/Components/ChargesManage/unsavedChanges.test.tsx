import React from 'react';
import { Provider, useDispatch } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import confirmPopup, { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import ChargesManagement from './index';

vi.mock('src/screens/finance/hooks/useFinanceAcademicFilters', () => ({
  useFinanceAcademicFilters: () => ({ selectedBoard: 'board', selectedMedium: 'medium' }),
}));
vi.mock('../../useChargePermissions', () => ({ useChargePermissions: () => ({ canAdd: true }) }));
vi.mock('src/redux/customQueryAndMutation', () => ({ default: () => [vi.fn(), {}] }));
vi.mock('src/redux/finance/ChargeManagement/chargeApi', () => ({
  useDeleteChargeMutation: vi.fn(),
  useVoidChargeMutation: vi.fn(),
}));
vi.mock('src/components/customDialog', () => ({ default: () => null }));
vi.mock('src/components/custom-tooltip', () => ({ default: () => null }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ onBack, action }: any) => (
    <div>
      {action}
      {onBack && (
        <button type="button" onClick={onBack}>
          Back
        </button>
      )}
    </div>
  ),
}));
vi.mock('./Component/ChargesTable', () => ({
  default: ({ primaryAction }: any) => <div>Charges list{primaryAction}</div>,
}));
vi.mock('./Component/ViewChargeForm', () => ({ default: () => null }));
vi.mock('../ChargeApprovalReview', () => ({ ChargeApprovalReview: () => null }));
vi.mock('./Component/ChargeApproveRejectForm', () => ({ default: () => null }));
vi.mock('../UpdateChargeForm', () => ({
  UpdateChargeForm: ({ onClose }: any) => {
    const dispatch = useDispatch();
    return (
      <div>
        Charge form
        <button type="button" onClick={() => dispatch(setIsChanges(true))}>
          Enter data
        </button>
        <button type="button" onClick={() => onClose(null, false)}>
          Cancel form
        </button>
        <button type="button" onClick={() => onClose(null, true)}>
          Save successfully
        </button>
      </div>
    );
  },
}));

describe('charge unsaved navigation guard', () => {
  function setup() {
    const store = configureStore({ reducer: { confirmPopup } });
    render(
      <Provider store={store}>
        <ChargesManagement />
      </Provider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Add Charge' }));
    fireEvent.click(screen.getByRole('button', { name: 'Enter data' }));
    return store;
  }
  it.each(['Cancel form', 'Back'])(
    'asks before leaving through %s and preserves the form on Cancel',
    (action) => {
      setup();
      fireEvent.click(screen.getByRole('button', { name: action }));
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText('Discard unsaved changes?')).toBeVisible();
      fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
      expect(screen.getByText('Charge form')).toBeVisible();
    }
  );
  it('discards only after confirmation and clears dirty state', () => {
    const store = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel form' }));
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Discard changes' })
    );
    expect(screen.getByText('Charges list')).toBeVisible();
    expect(store.getState().confirmPopup.isChanges).toBe(false);
  });
  it('successful submission bypasses the unsaved prompt', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Save successfully' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('Charges list')).toBeVisible();
  });
});
