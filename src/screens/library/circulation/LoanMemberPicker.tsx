import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';
import type { LibraryCirculationMember } from 'src/redux/library/circulation-members-api';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { hasGrantedPermission } from 'src/utils/permissions';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { Alert, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { useLazySearchCirculationMembersQuery } from 'src/redux/library/circulation-members-api';

import { MemberCardScan } from './MemberCardScan';

import type { IssueValues } from './useIssueDraft';

export function LoanMemberPicker({
  formik,
  disabled,
}: {
  formik: FormikProps<IssueValues>;
  disabled: boolean;
}) {
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canRead = hasGrantedPermission(permissions, 'Library.IssueReturn.View');
  const [selected, setSelected] = useState<LibraryCirculationMember | null>(null);
  const [method, setMethod] = useState<'search' | 'scan'>('search');
  const [search] = useLazySearchCirculationMembersQuery();
  const error = Boolean(formik.touched.memberId && formik.errors.memberId);
  const fetchOptions = async (query: string, page: number) => {
    if (!canRead) return { data: [], hasMore: false };
    const result = await search({ search: query, page, pageSize: 20 }).unwrap();
    return { data: result.items, hasMore: page * 20 < result.totalCount };
  };
  return (
    <FormSectionCard
      title="Member Selection"
      icon={GlobalIcons.studentProfile}
      descriptionTooltip="Search a borrower's name or printed member ID, or scan the exact ID from a member card. Review the resolved borrower before issuing."
    >
      {!canRead && (
        <Alert severity="info">Member search is unavailable with your current permissions.</Alert>
      )}
      <Stack spacing={1.5}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={method}
          disabled={disabled || !canRead}
          aria-label="Borrower lookup method"
          onChange={(_, value: 'search' | 'scan' | null) => {
            if (!value) return;
            setMethod(value);
            setSelected(null);
            formik.setFieldValue('memberId', '');
            formik.setFieldValue('memberScan', '');
          }}
        >
          <ToggleButton value="search">Search</ToggleButton>
          <ToggleButton value="scan">Scan ID</ToggleButton>
        </ToggleButtonGroup>
        {method === 'scan' ? (
          <MemberCardScan formik={formik} disabled={disabled || !canRead} />
        ) : (
          <ShakingTextField error={error}>
            <PaginatedSearchSelect<LibraryCirculationMember>
              label="Library member"
              name="memberId"
              required
              fullWidth
              size="small"
              value={selected}
              fetchOptions={fetchOptions}
              disabled={disabled || !canRead}
              minChars={2}
              debounceMs={350}
              filterOptions={(options) => options}
              getOptionLabel={(option) =>
                [
                  option.memberName,
                  option.memberIdentifier,
                  option.role === 0 ? 'Student' : option.role === 1 ? 'Staff' : 'Role unavailable',
                ]
                  .filter(Boolean)
                  .join(' · ')
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onBlur={() => formik.setFieldTouched('memberId', true)}
              onInput={(event) => {
                if (event.target instanceof HTMLInputElement) {
                  setSelected(null);
                  formik.setFieldValue('memberId', '');
                }
              }}
              onChange={(_, member) => {
                setSelected(member);
                formik.setFieldValue('memberId', member?.id || '');
              }}
              error={error}
              helperText={
                error
                  ? formik.errors.memberId
                  : 'Search by name or printed member ID, then choose the correct borrower.'
              }
            />
          </ShakingTextField>
        )}
      </Stack>
    </FormSectionCard>
  );
}
