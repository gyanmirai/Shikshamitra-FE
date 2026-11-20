import type {
  ChargeEditorLoan,
  ChargeEditorMember,
} from 'src/redux/library/charges-management/charge-editor-types';

import ShakingTextField from 'src/components/shaking-text-field';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { useLazyGetLibraryChargeEditorLoanSourcesQuery } from 'src/redux/library/charges-management/charges-get-api';

import { chargeEditorFieldError, type ChargeEditorFieldProps } from './charge-editor-field-types';

export function ChargeEditorLoanField({
  formik,
  disabled,
  member,
  loan,
  setLoan,
}: ChargeEditorFieldProps & {
  member: ChargeEditorMember;
  loan: ChargeEditorLoan | null;
  setLoan: (loan: ChargeEditorLoan | null) => void;
}) {
  const [findLoans] = useLazyGetLibraryChargeEditorLoanSourcesQuery();
  const year = formik.values.academicYearId;
  const error = () => chargeEditorFieldError(formik, 'bookIssueId');
  return (
    <ShakingTextField error={Boolean(error())}>
      <PaginatedSearchSelect<ChargeEditorLoan>
        key={`${year}:${member.id}`}
        label="Loan source"
        name="bookIssueId"
        required={member.requiresLoanSource}
        size="small"
        fullWidth
        value={loan}
        disabled={disabled}
        filterOptions={(options) => options}
        fetchOptions={async (search, page) => {
          const response = await findLoans({
            academicYearId: year,
            memberId: member.id,
            search,
            page,
            pageSize: 20,
          }).unwrap();
          return { data: response.items, hasMore: page * 20 < response.totalCount };
        }}
        getOptionLabel={(option) =>
          [option.accessionNumber, option.title].filter(Boolean).join(' · ')
        }
        getOptionKey={(option) => option.loanId}
        isOptionEqualToValue={(option, value) => option.loanId === value.loanId}
        onInput={(event) => {
          if (loan && event.target instanceof HTMLInputElement) {
            setLoan(null);
            formik.setValues({
              ...formik.values,
              bookIssueId: '',
              bookNumber: '',
              bookTitle: '',
            });
          }
        }}
        onChange={(_, selected) => {
          setLoan(selected);
          formik.setValues({
            ...formik.values,
            bookIssueId: selected?.loanId || '',
            bookNumber: selected?.accessionNumber || '',
            bookTitle: selected?.title || '',
          });
        }}
        onBlur={() => formik.setFieldTouched('bookIssueId', true)}
        error={Boolean(error())}
        helperText={
          error() ||
          (member.requiresLoanSource
            ? 'Choose the authorized historical loan for this assessment.'
            : 'Optional. Leave empty for a direct assessment.')
        }
      />
    </ShakingTextField>
  );
}
