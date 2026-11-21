import type { ChargeEditorMember } from 'src/redux/library/charges-management/charge-editor-types';

import ShakingTextField from 'src/components/shaking-text-field';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { useLazySearchLibraryChargeEditorMembersQuery } from 'src/redux/library/charges-management/charges-get-api';

import { chargeEditorFieldError, type ChargeEditorFieldProps } from './charge-editor-field-types';

export function ChargeEditorMemberField({
  formik,
  disabled,
  member,
  onClear,
  onSelect,
}: ChargeEditorFieldProps & {
  member: ChargeEditorMember | null;
  onClear: () => void;
  onSelect: (member: ChargeEditorMember | null) => void;
}) {
  const [findMember] = useLazySearchLibraryChargeEditorMembersQuery();
  const year = formik.values.academicYearId;
  const error = () => chargeEditorFieldError(formik, 'memberId');
  return (
    <ShakingTextField error={Boolean(error())}>
      <PaginatedSearchSelect<ChargeEditorMember>
        key={year}
        label="Member"
        name="memberId"
        required
        size="small"
        fullWidth
        value={member}
        disabled={disabled || !year}
        filterOptions={(options) => options}
        fetchOptions={async (search, page) => {
          if (!year || disabled) return { data: [], hasMore: false };
          const response = await findMember({
            academicYearId: year,
            search,
            page,
            pageSize: 20,
          }).unwrap();
          return { data: response.items, hasMore: page * 20 < response.totalCount };
        }}
        getOptionLabel={(option) =>
          [option.memberName, option.memberIdentifier, option.role === 0 ? 'Student' : 'Staff']
            .filter(Boolean)
            .join(' · ')
        }
        getOptionKey={(option) => option.id}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        onInput={(event) => {
          if (member && event.target instanceof HTMLInputElement) onClear();
        }}
        onChange={(_, selected) => {
          onSelect(selected);
        }}
        onBlur={() => formik.setFieldTouched('memberId', true)}
        error={Boolean(error())}
        helperText={
          error() || 'Search by borrower name or member ID, then choose the correct record.'
        }
      />
    </ShakingTextField>
  );
}
