import { it, vi, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import AdmissionPublicInquiryLinksScreen from './admission-public-inquiry-links-screen';

const state = vi.hoisted(() => ({ permissions: [] as { name: string; isGranted: boolean }[] }));
vi.mock('react-redux', () => ({ useSelector: (selector: any) => selector({ auth: state }) }));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading, action }: any) => (
    <header>
      <h1>{heading}</h1>
      {action}
    </header>
  ),
}));
vi.mock('./admission-public-inquiry-links', () => ({
  AdmissionPublicInquiryLinks: ({ createOpen, onCreateClose }: any) => (
    <div>
      Public links table
      {createOpen && (
        <button type="button" onClick={onCreateClose}>
          Close link creation
        </button>
      )}
    </div>
  ),
}));
it('keeps public links and link creation without intake setup tabs or actions', () => {
  state.permissions = [{ name: 'Students.Admissions.Offerings.Add', isGranted: true }];
  render(<AdmissionPublicInquiryLinksScreen />);
  expect(screen.getByRole('heading', { name: 'Public Inquiry Links' })).toBeInTheDocument();
  expect(
    screen.queryByText(/Create intake setup|Admission intake setups|Counsellor routing/)
  ).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Create inquiry link' }));
  fireEvent.click(screen.getByRole('button', { name: 'Close link creation' }));
  expect(screen.queryByRole('button', { name: 'Close link creation' })).not.toBeInTheDocument();
});
it('keeps link mutation controls unavailable without the existing Add permission', () => {
  state.permissions = [];
  render(<AdmissionPublicInquiryLinksScreen />);
  expect(screen.queryByRole('button', { name: 'Create inquiry link' })).not.toBeInTheDocument();
  expect(screen.getByText('Public links table')).toBeInTheDocument();
});
