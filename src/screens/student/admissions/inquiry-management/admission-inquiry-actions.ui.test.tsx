import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';

import { it, vi, expect } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { buildAdmissionInquiryColumns } from './admission-inquiry-columns';

it.each(['below', 'above'] as const)(
  'opens the inquiry menu %s its trigger without covering row actions',
  async (side) => {
    const onMove = vi.fn();
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
      const move = await screen.findByRole('menuitem', { name: 'Move to Next Stage' });
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
