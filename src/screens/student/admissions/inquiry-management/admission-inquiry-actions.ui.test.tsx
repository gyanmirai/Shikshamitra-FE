import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';

import { it, vi, expect } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import { buildAdmissionInquiryColumns } from './admission-inquiry-columns';

it('keeps the move menu open during the request and on failure, then closes on success', async () => {
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
  function menu(isMoving: boolean) {
    const column = buildAdmissionInquiryColumns({
      canManage: true,
      canMove: true,
      isMoving,
      movingInquiryId: row.id,
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
  const view = render(menu(false));
  fireEvent.click(screen.getByRole('button', { name: 'Actions For QA Student' }));
  const move = () => screen.getByTestId('menu-action-move');
  fireEvent.click(move());
  view.rerender(menu(true));
  expect(move()).toBeVisible();
  expect(move()).toHaveAttribute('aria-busy', 'true');
  expect(
    screen.getByLabelText('Starting Application for QA Student')
  ).toBeVisible();
  fireEvent.keyDown(move(), { key: 'Escape' });
  expect(move()).toBeVisible();
  fireEvent.click(move());
  expect(onMove).toHaveBeenCalledTimes(1);
  await act(async () => finish(false));
  view.rerender(menu(false));
  expect(screen.queryByLabelText('Starting Application for QA Student')).not.toBeInTheDocument();
  expect(move()).toBeVisible();
  expect(move()).not.toHaveAttribute('aria-disabled', 'true');
  fireEvent.click(move());
  await act(async () => finish(true));
  await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
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
      const move = await screen.findByRole('menuitem', { name: 'Start Application' });
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
      expect(onMove).toHaveBeenCalledWith(row);
    } finally {
      if (original) Object.defineProperty(HTMLElement.prototype, 'offsetHeight', original);
      else Reflect.deleteProperty(HTMLElement.prototype, 'offsetHeight');
      vi.restoreAllMocks();
    }
  }
);
