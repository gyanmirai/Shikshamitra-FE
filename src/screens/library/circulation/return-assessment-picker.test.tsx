import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import { canonicalReturn } from './canonical-test-fixtures';
import { ReturnAssessmentFields } from './ReturnAssessmentFields';
import { reservationWrapper } from '../BookList/Components/BookView/reservation-test-fixture';

import type { ReturnValues } from './return-form';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
function Harness() {
  const formik = useFormik<ReturnValues>({
    initialValues: {
      accessionNo: 'scan',
      returnDate: dayjs('2026-11-17'),
      chargeCategory: 'none',
      amount: '',
      fineDueDate: dayjs('2026-11-30'),
      copyStatus: 0,
      remarks: '',
      assessmentAcademicYearId: '',
      chargeDate: dayjs('2026-11-17'),
      assessmentReason: 'Damage verified',
    },
    onSubmit: vi.fn(),
  });
  return (
    <>
      <ReturnAssessmentFields formik={formik} lookup={canonicalReturn} disabled={false} />
      <output aria-label="Assessment draft">{JSON.stringify(formik.values)}</output>
    </>
  );
}
it('loads real paged assessment categories with Return access and retains the saved fixed amount without Settings or Finance grants', async () => {
  const queries: URLSearchParams[] = [];
  mswServer.use(
    http.get(
      'http://library.test/api/library/circulation/lookups/assessment-categories',
      ({ request }) => {
        queries.push(new URL(request.url).searchParams);
        return HttpResponse.json({
          items: [
            {
              id: 'category-id',
              academicYearId: 'year-id',
              name: 'Damage',
              amount: 12.25,
              isFixed: true,
            },
          ],
          totalCount: 1,
          currentPage: 1,
          pageSize: 20,
        });
      }
    )
  );
  render(
    <Harness />,
    reservationWrapper(['Library.IssueReturn.View', 'Library.IssueReturn.Return'])
  );
  const user = userEvent.setup();
  await user.click(screen.getByRole('combobox', { name: /Assessment academic year/ }));
  await user.click(await screen.findByRole('option', { name: '2026–2027' }));
  await user.type(screen.getByRole('combobox', { name: /Assessment category/ }), 'Damage');
  await user.click(await screen.findByRole('option', { name: 'Damage' }));
  await waitFor(() =>
    expect(screen.getByLabelText('Assessment draft')).toHaveTextContent(
      '"chargeCategory":"category-id"'
    )
  );
  expect(screen.getByLabelText('Assessment draft')).toHaveTextContent('"amount":"12.25"');
  expect(screen.getByRole('textbox', { name: /Assessment amount/ })).toBeDisabled();
  expect(
    queries.some(
      (query) =>
        query.get('academicYearId') === 'year-id' &&
        query.get('page') === '1' &&
        query.get('pageSize') === '20'
    )
  ).toBe(true);
});
