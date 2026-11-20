import { it, expect } from 'vitest';
import { screen, within } from '@testing-library/react';

import {
  bookNotice,
  alertPayload,
  financialNotices,
  mountAlertDashboard,
} from './dashboard-alerts.fixture';

it('preserves canonical financial notice messages/counts for a dashboard reader without Charges View', () => {
  mountAlertDashboard('admin');
  financialNotices.forEach((notice) => {
    const title = screen.getByText(notice.title);
    expect(title).toBeVisible();
    expect(screen.getByText(notice.message)).toBeVisible();
    expect(
      within(title.parentElement!).getByText(String(notice.count), { exact: true })
    ).toBeVisible();
  });
  expect(screen.queryByRole('link', { name: /Open charge register for/i })).toBeNull();
  expect(screen.getByText(bookNotice.message)).toBeVisible();
});

it('offers only exact owned financial destinations and keeps an unsupported link readable', () => {
  const unsupported = {
    ...financialNotices[3],
    title: 'Unsupported destination review',
    message: 'This review remains readable without following an unsupported destination.',
    link: 'https://other.example/finance',
  };
  mountAlertDashboard('admin', { ...alertPayload, alerts: [...alertPayload.alerts, unsupported] }, [
    'Library.Dashboard.View',
    'Library.Charges.View',
  ]);
  const links = screen.getAllByRole('link', { name: /Open charge register for/i });
  expect(links).toHaveLength(4);
  links.forEach((link) => {
    expect(link).toHaveAttribute('href', '/library/charges-management');
    expect(link.querySelector('a,button,[role="button"]')).toBeNull();
  });
  expect(screen.getByText(unsupported.message)).toBeVisible();
  expect(screen.queryByRole('link', { name: /Unsupported destination review/i })).toBeNull();
});

it.each([undefined, null])(
  'does not turn old financial alerts into verified demands when financePosition is %s',
  (position) => {
    const legacy = [
      {
        ...financialNotices[0],
        title: 'Legacy collection demand',
        message: 'Collect local Pending principal now.',
      },
      {
        ...financialNotices[1],
        title: 'Legacy arrears demand',
        message: 'A local declaration is overdue and must be collected.',
      },
    ];
    mountAlertDashboard('admin', {
      ...alertPayload,
      financePosition: position,
      alerts: [...legacy, ...financialNotices.slice(2), bookNotice],
    });
    expect(screen.getByText(/Financial alert verification unavailable/i)).toBeVisible();
    legacy.forEach((notice) => {
      expect(screen.queryByText(notice.title)).toBeNull();
      expect(screen.queryByText(notice.message)).toBeNull();
    });
    expect(screen.getByText(financialNotices[2].message)).toBeVisible();
    expect(screen.getByText(financialNotices[3].message)).toBeVisible();
    expect(screen.getByText(bookNotice.message)).toBeVisible();
    expect(screen.queryByRole('link', { name: /Open charge register for/i })).toBeNull();
  }
);
