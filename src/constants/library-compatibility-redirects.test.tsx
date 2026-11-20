import { it, vi, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AllBooksLayout from 'src/app/(auth-route)/library/book-list/layout';
import ReceivingLayout from 'src/app/(auth-route)/library/receiving/layout';
import ChargesLayout from 'src/app/(auth-route)/library/charges-management/layout';
import ReservationPage from 'src/app/(auth-route)/library/reservation-management/page';
import FineCirculationPage from 'src/app/(auth-route)/library/circulation/fine-management/page';
import ReservationCirculationPage from 'src/app/(auth-route)/library/circulation/reservation-management/page';

const state = vi.hoisted(() => ({
  permissions: [] as { name: string; isGranted: boolean }[],
  loading: false,
  permissionsInitialized: true,
}));
const redirect = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({ redirect }));
vi.mock('react-redux', () => ({ useSelector: (select: any) => select({ auth: state }) }));
vi.mock('src/sections/error', () => ({ View403: () => <div>Access denied</div> }));
vi.mock('src/components/loading-screen', () => ({ SplashScreen: () => <div>Loading</div> }));

it.each([
  [ReservationPage, '/library/book-list'],
  [ReservationCirculationPage, '/library/book-list'],
  [FineCirculationPage, '/library/charges-management'],
] as const)(
  'keeps the existing compatibility redirect to %s backed by its real destination',
  (Page, destination) => {
    redirect.mockClear();
    Page();
    expect(redirect).toHaveBeenCalledWith(destination);
  }
);

it.each([AllBooksLayout, ChargesLayout])('retains the exact destination View gate', (Layout) => {
  state.permissions = [{ name: 'Library.Receiving.View', isGranted: true }];
  render(
    <Layout>
      <div>Protected destination</div>
    </Layout>
  );
  expect(screen.getByText('Access denied')).toBeVisible();
});

it('allows saved receiving records without Add but requires both exact View grants', () => {
  state.permissions = ['Library.Receiving.View', 'Library.AllBooks.View'].map((name) => ({
    name,
    isGranted: true,
  }));
  const view = render(
    <ReceivingLayout>
      <div>Saved receipt</div>
    </ReceivingLayout>
  );
  expect(screen.getByText('Saved receipt')).toBeVisible();
  state.permissions = [{ name: 'Library.Receiving.View', isGranted: true }];
  view.rerender(
    <ReceivingLayout>
      <div>Saved receipt</div>
    </ReceivingLayout>
  );
  expect(screen.getByText('Access denied')).toBeVisible();
});
