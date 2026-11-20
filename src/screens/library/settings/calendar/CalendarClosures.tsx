import type { LibraryNamedOption } from 'src/redux/library/policy-types';
import type { LibraryCalendarClosure } from 'src/redux/library/calendar-types';

import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Stack, Alert, Button } from '@mui/material';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useGetLibraryCalendarClosuresQuery } from 'src/redux/library/calendar-api';

import { ClosureTable } from './ClosureTable';
import { ClosureDialog } from './ClosureDialog';
import { ClosureDeleteDialog } from './ClosureDeleteDialog';
import { useWorkspaceQuery } from '../policies/useWorkspaceQuery';

export function CalendarClosures({
  academicYearId,
  sections,
  canEdit,
}: {
  academicYearId: string;
  sections: LibraryNamedOption[];
  canEdit: boolean;
}) {
  const { query, update } = useWorkspaceQuery();
  const page = Math.max(1, Number(query.get('page')) || 1);
  const pageSize = [10, 20, 50, 100].includes(Number(query.get('pageSize')))
    ? Number(query.get('pageSize'))
    : 20;
  const request = useGetLibraryCalendarClosuresQuery({ academicYearId, page, pageSize });
  const [edit, setEdit] = useState<{ item?: LibraryCalendarClosure } | null>(null);
  const [remove, setRemove] = useState<LibraryCalendarClosure | null>(null);
  return (
    <Stack spacing={2} sx={{ minHeight: 0, flex: 1 }}>
      <Alert severity="info">
        These dated closures apply across the Library calendar. The selected academic year
        determines opening weekdays for date calculations.
      </Alert>
      <Stack direction="row" justifyContent="flex-end" spacing={1}>
        <Button
          size="small"
          color="inherit"
          variant="outlined"
          disabled={request.isFetching}
          onClick={() => request.refetch()}
          startIcon={<Iconify icon={GlobalIcons.refresh} />}
        >
          Refresh
        </Button>
        {canEdit && (
          <Button
            size="small"
            color="inherit"
            variant="contained"
            onClick={() => setEdit({})}
            startIcon={<Iconify icon={GlobalIcons.addIcon} />}
          >
            Create Closure
          </Button>
        )}
      </Stack>
      {request.isError && (
        <Alert
          severity="error"
          action={
            <Button size="small" onClick={() => request.refetch()}>
              Retry
            </Button>
          }
        >
          {parseApiProblemDetail(request.error).detail || 'Could not load closures.'}
        </Alert>
      )}
      <ClosureTable
        items={request.currentData?.items || []}
        sections={sections}
        canEdit={canEdit}
        totalCount={request.currentData?.totalCount || 0}
        page={page}
        pageSize={pageSize}
        loading={request.isFetching && !request.currentData}
        refreshing={request.isFetching && Boolean(request.currentData)}
        onPage={(next, size) => update({ page: next, pageSize: size })}
        onEdit={(item) => setEdit({ item })}
        onDelete={setRemove}
      />
      {edit && (
        <ClosureDialog
          key={edit.item?.id || 'create'}
          academicYearId={academicYearId}
          item={edit.item}
          sections={sections}
          onClose={() => setEdit(null)}
        />
      )}
      {remove && <ClosureDeleteDialog item={remove} onClose={() => setRemove(null)} />}
    </Stack>
  );
}
