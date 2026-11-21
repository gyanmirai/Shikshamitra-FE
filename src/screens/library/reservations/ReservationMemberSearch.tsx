import type { ReservationMember } from 'src/redux/library/reservation-types';

import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { useLazySearchReservationMembersQuery } from 'src/redux/library/reservations-api';

export function reservationMemberLabel(member: ReservationMember) {
  return [
    member.memberName,
    member.memberIdentifier || member.id,
    member.role === 0 ? 'Student' : member.role === 1 ? 'Staff' : 'Role unavailable',
    !member.isEligibleForReservation ? member.ineligibilityReason : null,
  ]
    .filter(Boolean)
    .join(' · ');
}
export function ReservationMemberSearch({
  academicYearId,
  selected,
  onSelect,
  disabled,
  error,
  onBlur,
}: {
  academicYearId: string;
  selected: ReservationMember | null;
  onSelect: (member: ReservationMember | null) => void;
  disabled: boolean;
  error?: string;
  onBlur: () => void;
}) {
  const [search] = useLazySearchReservationMembersQuery();
  const fetchOptions = async (query: string, page: number) => {
    if (disabled || !academicYearId) return { data: [], hasMore: false };
    const response = await search({ academicYearId, search: query, page, pageSize: 20 }).unwrap();
    return { data: response.items, hasMore: page * 20 < response.totalCount };
  };
  return (
    <PaginatedSearchSelect<ReservationMember>
      label="Library member"
      name="memberId"
      required
      fullWidth
      size="small"
      value={selected}
      fetchOptions={fetchOptions}
      disabled={disabled}
      minChars={2}
      debounceMs={350}
      filterOptions={(options) => options}
      getOptionLabel={reservationMemberLabel}
      getOptionDisabled={(option) => !option.isEligibleForReservation}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      onInput={(event) => {
        if (event.target instanceof HTMLInputElement) onSelect(null);
      }}
      onChange={(_, member) => onSelect(member?.isEligibleForReservation ? member : null)}
      onBlur={onBlur}
      error={Boolean(error)}
      helperText={error || 'Search by name or printed member ID, then choose the correct member.'}
    />
  );
}
