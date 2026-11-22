import type { ReactNode } from 'react';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  House,
  HouseStudent,
  HouseLeaderCommand,
} from 'src/redux/student/house-management/house-management-types';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useId, useState, useEffect } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';
import { Alert, Stack, Drawer, Button, Typography, IconButton } from '@mui/material';
import { useGetHouseStudentsQuery } from 'src/redux/student/house-management/house-management-api';

import HouseLeaderDialog from './house-leader-dialog';

type Props = {
  academicMediumId: string;
  house: House;
  leaderContent: (student: HouseStudent | null | undefined, visible: boolean) => ReactNode;
  columns: IColumn[];
  canManage: boolean;
  onClose: () => void;
  onSave: (command: HouseLeaderCommand) => Promise<void>;
};

export default function HouseMembersDrawer({
  academicMediumId,
  house,
  leaderContent,
  columns,
  canManage,
  onClose,
  onSave,
}: Props) {
  const titleId = useId();
  const rosterTitleId = useId();
  const [editing, setEditing] = useState<House | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const roster = useGetHouseStudentsQuery({
    academicMediumId,
    houseId: house.id,
    filter: search,
    sorting: 'studentName asc',
    skipCount: page * pageSize,
    maxResultCount: pageSize,
  });
  const total = roster.currentData?.totalCount;
  useEffect(() => {
    if (total === undefined || roster.isFetching || roster.isError) return;
    const lastPage = Math.max(0, Math.ceil(total / pageSize) - 1);
    if (page > lastPage) setPage(lastPage);
  }, [total, roster.isFetching, roster.isError, page, pageSize]);
  const error = roster.isError ? parseApiProblemDetail(roster.error).detail : undefined;
  const close = () => {
    if (!editing) onClose();
  };
  const inset = { xs: 2, sm: 3 };

  return (
    <>
      <Drawer
        anchor="right"
        open
        onClose={close}
        PaperProps={{
          role: 'dialog',
          'aria-modal': true,
          'aria-labelledby': titleId,
          sx: { width: { xs: 1, sm: 680 }, maxWidth: 1, display: 'flex', flexDirection: 'column' },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ px: inset, py: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Typography id={titleId} component="h2" variant="h6" sx={{ overflowWrap: 'anywhere' }}>
            {house.name}
          </Typography>
          <InfoTooltipIcon
            title="This roster shows all members of this house that you can access in the selected medium."
            label="House roster information"
          />
          <IconButton
            size="small"
            aria-label={`Close ${house.name}`}
            onClick={close}
            sx={{ ml: 'auto' }}
          >
            <Iconify icon={GlobalIcons.cancel} />
          </IconButton>
        </Stack>
        <Stack spacing={2} sx={{ flex: 1, minHeight: 0, overflow: 'hidden', p: inset }}>
          <FormSectionCard
            title="House Leader"
            icon={GlobalIcons.assigned}
            descriptionTooltip="Each house has one leader. Only a current member can hold this position."
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
              {leaderContent(house.leader, house.canManage)}
              {canManage && house.canManage && (
                <Button
                  size="small"
                  color="inherit"
                  variant="contained"
                  startIcon={<Iconify icon={GlobalIcons.assigned} />}
                  onClick={() => setEditing(house)}
                  disabled={!house.leader && house.memberCount === 0}
                >
                  Manage house leader
                </Button>
              )}
            </Stack>
          </FormSectionCard>
          <Stack
            component="section"
            aria-labelledby={rosterTitleId}
            spacing={1}
            sx={{ flex: 1, minHeight: 0, minWidth: 0 }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon={GlobalIcons.family} width={18} />
              <Typography id={rosterTitleId} component="h3" variant="subtitle1">
                Visible Students
              </Typography>
              <InfoTooltipIcon
                title="Use a name or GR number to search house members across classes and divisions."
                label="Visible students information"
              />
            </Stack>
            <CustomizableTable
              variant="embedded"
              tableId="student-house-members"
              tableTitle="Visible Students"
              showColumns={false}
              showExport={false}
              showFullScreen={false}
              tableContainerProps={{ 'aria-label': 'Visible students in this house' }}
              wrapperProps={{ sx: { flex: 1, minHeight: 0 } }}
              columns={columns.map((column) => ({ ...column, isSort: false, isFilter: false }))}
              data={roster.currentData?.items ?? []}
              isLoading={roster.isLoading || (roster.isFetching && !roster.currentData)}
              isRefreshing={roster.isFetching && Boolean(roster.currentData)}
              error={error}
              errorContent={
                error && (
                  <Alert
                    severity="error"
                    action={
                      <Button size="small" color="inherit" onClick={() => roster.refetch()}>
                        Retry
                      </Button>
                    }
                  >
                    {error}
                  </Alert>
                )
              }
              isSearch
              searchFieldProps={{
                placeholder: 'Search name or GR number',
                inputProps: { 'aria-label': 'Search house members' },
              }}
              serverSideSearch
              searchTerm={search}
              onServerSearch={(value) => {
                setSearch(value);
                setPage(0);
              }}
              serverSidePagination
              page={page}
              rowsPerPage={pageSize}
              rowsPerPageOptions={[10, 25, 50, 100]}
              totalCount={total ?? 0}
              onServerPagination={(nextPage, nextSize) => {
                setPage(nextPage - 1);
                setPageSize(nextSize);
              }}
              noDataText={
                search
                  ? 'No house members match this search.'
                  : 'No students are visible in this house.'
              }
            />
          </Stack>
        </Stack>
        <Stack
          direction="row"
          flexWrap="wrap"
          justifyContent="flex-end"
          gap={1}
          sx={{ px: inset, py: 1.75, borderTop: 1, borderColor: 'divider' }}
        >
          <Button
            size="small"
            color="inherit"
            variant="outlined"
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            onClick={close}
          >
            Close
          </Button>
        </Stack>
      </Drawer>
      {editing && (
        <HouseLeaderDialog
          academicMediumId={academicMediumId}
          record={editing}
          onSave={onSave}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
