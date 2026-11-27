import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';

import { it, vi, expect } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import { buildAdmissionInquiryColumns } from './admission-inquiry-columns';

it('opens sibling review from eligible name cells without selecting the table row', () => {
  const onCheckSiblings = vi.fn();
  const onRowClick = vi.fn();
  const column = buildAdmissionInquiryColumns({
    canManage: true,
    canMove: false,
    isMoving: false,
    counsellorNames: {},
    counsellorOptions: [],
    offeringOptions: [],
    onManage: vi.fn(),
    onMove: vi.fn(async () => false),
    onCheckSiblings,
  }).find((item) => item.id === 'applicantName')!;
  const rows = [
    { id: 'one', applicantName: 'Priya', hasPossibleSiblingMatch: true },
    { id: 'two', applicantName: 'Riya', hasPossibleSiblingMatch: true },
    { id: 'three', applicantName: 'Jay' },
    { id: 'four', applicantName: 'Sam', hasLinkedSiblings: true },
  ];
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <div role="presentation" onClick={onRowClick}>
        {rows.map((item) => (
          <div key={item.id}>{column.render?.(item.applicantName, item)}</div>
        ))}
      </div>
    </ThemeProvider>
  );
  fireEvent.click(screen.getByRole('button', { name: 'Check Parent Details for Priya' }));
  expect(onCheckSiblings).toHaveBeenCalledWith(rows[0]);
  expect(screen.getByRole('button', { name: 'Check Parent Details for Riya' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Siblings linked for Sam' })).toBeVisible();
  expect(screen.queryByRole('button', { name: /Jay/ })).not.toBeInTheDocument();
  expect(onRowClick).not.toHaveBeenCalled();
});

it('shows Start Application directly and prevents repeat requests while loading', async () => {
  let finish: (success: boolean) => void = () => {};
  const onMove = vi.fn(
    () =>
      new Promise<boolean>((resolve) => {
        finish = resolve;
      })
  );
  const row = {
    id: 'inquiry',
    inquiryNumber: 'INQ-2026-000058',
    applicantName: 'QA Student',
    status: 2,
    applicantId: 'applicant',
    admissionOfferingId: 'offering',
  } as AdmissionInquiry;
  const theme = createTheme(defaultSettings);
  function actions(isMoving: boolean) {
    const column = buildAdmissionInquiryColumns({
      canManage: true,
      canMove: true,
      isMoving,
      movingInquiryId: isMoving ? row.id : null,
      counsellorNames: {},
      counsellorOptions: [],
      offeringOptions: [],
      onManage: vi.fn(),
      onFollowUp: vi.fn(),
      onHistory: vi.fn(),
      onMove,
    }).find((item) => item.id === 'actions')!;
    return <ThemeProvider theme={theme}>{column.render?.(null, row)}</ThemeProvider>;
  }
  const view = render(actions(false));
  fireEvent.click(screen.getByRole('button', { name: 'Start Application' }));
  view.rerender(actions(true));
  const button = screen.getByRole('button', { name: 'Start Application' });
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute('aria-busy', 'true');
  expect(document.querySelector('.MuiLinearProgress-root')).not.toBeInTheDocument();
  fireEvent.click(button);
  expect(onMove).toHaveBeenCalledTimes(1);
  await act(async () => finish(false));
  view.rerender(actions(false));
  expect(screen.getByRole('button', { name: 'Start Application' })).toBeEnabled();
});

it.each(['below', 'above'] as const)(
  'opens the inquiry menu %s its trigger without covering row actions',
  async (side) => {
    const onMove = vi.fn(async () => true);
    const row = {
      id: 'inquiry',
      inquiryNumber: 'INQ-2026-000058',
      applicantName: 'QA Student',
      status: 2,
      applicantId: 'applicant',
      admissionOfferingId: 'offering',
    } as AdmissionInquiry;
    const column = buildAdmissionInquiryColumns({
      canManage: true,
      canMove: true,
      isMoving: false,
      counsellorNames: {},
      counsellorOptions: [],
      offeringOptions: [],
      onManage: vi.fn(),
      onFollowUp: vi.fn(),
      onHistory: vi.fn(),
      onMove,
    }).find((item) => item.id === 'actions')!;
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        {column.render?.(null, row)}
      </ThemeProvider>
    );
    const trigger = screen.getByRole('button', { name: 'Actions For QA Student' });
    const top = side === 'above' ? window.innerHeight - 40 : 150;
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      x: 900,
      y: top,
      top,
      bottom: top + 30,
      left: 900,
      right: 930,
      width: 30,
      height: 30,
      toJSON: () => ({}),
    });
    const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      get: () => 96,
    });
    try {
      fireEvent.click(trigger);
      const move = await screen.findByRole('menuitem', { name: /Follow-Up/ });
      const menu = screen.getByRole('menu', { name: 'Actions For QA Student' });
      const paper = menu.closest('.MuiPopover-paper')!;
      await waitFor(() =>
        // JSDOM retains MUI's negative-spacing calc instead of resolving it to pixels.
        expect(window.getComputedStyle(paper).marginTop).toBe(
          side === 'above' ? 'calc(-1 * 8px)' : '8px'
        )
      );
      const arrow = paper.firstElementChild!;
      expect(arrow).toHaveStyle(
        side === 'above' ? { bottom: '-6.5px', right: '17px' } : { top: '-6.5px', right: '17px' }
      );
      fireEvent.click(move);
      expect(onMove).not.toHaveBeenCalled();
    } finally {
      if (original) Object.defineProperty(HTMLElement.prototype, 'offsetHeight', original);
      else Reflect.deleteProperty(HTMLElement.prototype, 'offsetHeight');
      vi.restoreAllMocks();
    }
  }
);
