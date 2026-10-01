import React from 'react';
import { it, vi, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

import DraftPostingQueue from './DraftPostingQueue';
import PostingAutomation from '../settings/PostingAutomation';

vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading }: { heading: string }) => <h1>{heading}</h1>,
}));

afterEach(cleanup);

it('does not offer a fake save action for accounting mappings', () => {
  render(<PostingAutomation />);
  expect(screen.getByRole('heading', { name: 'Accounting mappings unavailable' })).toBeTruthy();
  expect(screen.getByRole('alert').textContent).toContain('No accounting mapping changes can be saved');
  expect(screen.queryByRole('button')).toBeNull();
});

it('does not call unsupported draft-posting APIs or offer finalise actions', () => {
  render(<DraftPostingQueue />);
  expect(screen.getByRole('heading', { name: 'Posting exceptions unavailable' })).toBeTruthy();
  expect(screen.getByRole('alert').textContent).toContain('No posting can be finalised');
  expect(screen.queryByRole('button')).toBeNull();
});
