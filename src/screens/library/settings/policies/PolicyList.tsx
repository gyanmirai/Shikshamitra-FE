import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { libraryPaths } from 'src/constants/library-menus';
import { Alert, Stack, Button, LinearProgress } from '@mui/material';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';

import { PolicyTable } from './PolicyTable';
import { usePolicyList } from './usePolicyList';
import { PolicyDraftDrawer } from './PolicyDraftDrawer';
import { PolicyRecordDrawer } from './PolicyRecordDrawer';
import { PolicyLifecycleDialog } from './PolicyLifecycleDialog';

export function PolicyList({
  academicYearId,
  canEdit,
}: {
  academicYearId: string;
  canEdit: boolean;
}) {
  const {
    update,
    page,
    pageSize,
    selected,
    setSelected,
    create,
    setCreate,
    lifecycle,
    setLifecycle,
    list,
    options,
    calendar,
    data,
    canManage,
  } = usePolicyList(academicYearId);
  if (!academicYearId)
    return <Alert severity="info">Select an academic year to manage borrowing policies.</Alert>;
  return (
    <Stack spacing={2} sx={{ minHeight: 0, flex: 1 }}>
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button
          size="small"
          color="inherit"
          variant="outlined"
          startIcon={<Iconify icon={GlobalIcons.refresh} />}
          disabled={list.isFetching || options.isFetching || calendar.isFetching}
          onClick={() => {
            list.refetch();
            options.refetch();
            calendar.refetch();
          }}
        >
          Refresh
        </Button>
        {canEdit &&
          data &&
          (data.canManageGlobalPolicies || data.stages.length > 0 || data.standards.length > 0) && (
            <Button
              size="small"
              color="inherit"
              variant="contained"
              startIcon={<Iconify icon={GlobalIcons.addIcon} />}
              onClick={() => setCreate(true)}
            >
              Create Policy
            </Button>
          )}
      </Stack>
      <Alert severity="info">
        Published policies apply matching limits and manual or automatic date rules. Without a
        matching published policy, legacy limits and manual due dates continue to apply. Drafts have
        no effect.
      </Alert>
      {calendar.currentData && !calendar.currentData.canPublishAutomatedPolicy && (
        <Alert
          severity="info"
          action={
            <Button size="small" href={libraryPaths.settings.calendar}>
              Open Calendar
            </Button>
          }
        >
          {calendar.currentData.configurationIssues.join(' ') ||
            'Configure the Library calendar before publishing automatic policies.'}{' '}
          Manual policies use explicit dates and do not require an automated calendar. Drafts can be
          saved now.
        </Alert>
      )}
      {options.isFetching && !data && <LinearProgress aria-label="Loading policy scope options" />}
      {[
        ['policies', list],
        ['scope options', options],
        ['calendar readiness', calendar],
      ].map(([name, request]) => {
        const state = request as typeof list;
        return state.isError ? (
          <Alert
            key={String(name)}
            severity="error"
            action={
              <Button size="small" onClick={() => state.refetch()}>
                Retry
              </Button>
            }
          >
            {parseApiProblemDetail(state.error).detail || `Could not load ${String(name)}.`}
          </Alert>
        ) : null;
      })}
      <PolicyTable
        items={list.currentData?.items || []}
        totalCount={list.currentData?.totalCount || 0}
        page={page}
        pageSize={pageSize}
        loading={list.isFetching && !list.currentData}
        refreshing={list.isFetching && Boolean(list.currentData)}
        canEdit={canEdit}
        canPublish={Boolean(calendar.currentData?.canPublishAutomatedPolicy)}
        canManage={canManage}
        onPage={(next, size) => update({ page: next, pageSize: size })}
        onOpen={(id, edit) => setSelected({ id, edit })}
        onLifecycle={(item, action) => setLifecycle({ item, action })}
      />
      {create && data && (
        <PolicyDraftDrawer
          academicYearId={academicYearId}
          options={data}
          onClose={() => setCreate(false)}
        />
      )}
      {selected && data && (
        <PolicyRecordDrawer
          key={selected.id}
          {...selected}
          academicYearId={academicYearId}
          options={data}
          onClose={() => setSelected(null)}
        />
      )}
      {lifecycle && <PolicyLifecycleDialog {...lifecycle} onClose={() => setLifecycle(null)} />}
    </Stack>
  );
}
