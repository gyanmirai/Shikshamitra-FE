import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useMemo, useState } from 'react';
import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { academicPermissions } from 'src/constants/academic-menu';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { examScheduledStatus } from 'src/enums/exam-scheduled-status';
import { Box, Tab, Chip, Tabs, Paper, Stack, Button, MenuList, MenuItem, Typography } from '@mui/material';
import {
  usePublishExamMutation,
  useUpdateExamStatusMutation,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/schedule-examApi';

import ScheduleExamKpiStrip from './ScheduleExamKpiStrip';
import ScheduleExamPreviewDrawer from './ScheduleExamPreviewDrawer';

import type { IExamFormValues, IScheduledExamTableProps } from '../type';

const ScheduledExamTable: React.FC<IScheduledExamTableProps> = ({
  openDialog,
  setOpenDialog,
  editData,
  setEditData,
  onDelete,
  onViewTimetable,
  isScheduleExamButton = true,
  isAction = true,
  getExams,
  activeStatus,
  onStatusChange,
}) => {
  const publishExamDialog = useBoolean();
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const { permissions } = useSelector((state: RootState) => state.auth);

  const canAdd = hasGrantedPermission(
    permissions,
    `${academicPermissions.examination.schedule}.Add`
  );
  const canView = hasGrantedPermission(
    permissions,
    `${academicPermissions.examination.schedule}.View`
  );
  const canDelete = hasGrantedPermission(
    permissions,
    `${academicPermissions.examination.schedule}.Delete`
  );

  const [publishExam] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePublishExamMutation,
  });

  const [updateExamStatus, { isLoading: isPublishing }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateExamStatusMutation,
  });
  // Initialize tabs with the current active status driven by the parent
  const tabs = useTabs(activeStatus ?? examScheduledStatus.Pending);
  // Add this outside your component
  // const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [selectedTimetable, setSelectedTimetable] = useState<IExamFormValues | null>(null);
  const [previewExam, setPreviewExam] = useState<IExamFormValues | null>(null);

  const handlePublishExam = async () => {
    try {
      if (selectedTimetable?.examId) {
        await updateExamStatus({
          examId: selectedTimetable.examId,
          body: { status: examScheduledStatus.Published },
        }).unwrap();
        shikshaMitraToast.success({ message: 'Exam Time Table Published Successfully' });
        publishExamDialog.onFalse();
        setSelectedTimetable(null);
      }
    } catch (error) {
      const parsed = parseApiProblemDetail(error);
      shikshaMitraToast.error({ message: parsed.detail });
    }
  };

  const requestPublishExam = (row: any) => {
    publishExamDialog.onTrue();
    setSelectedTimetable(row);
  };

  // Define tab configuration with labels, values, counts and colors
  const TABS = useMemo(
    () => [
      {
        label: 'Pending',
        value: examScheduledStatus.Pending,
        count: getExams?.data?.pendingCount || 0,
        color: 'warning',
      },
      {
        label: 'Published',
        value: examScheduledStatus.Published,
        count: getExams?.data?.publishedCount || 0,
        color: 'info',
      },
      {
        label: 'Completed',
        value: examScheduledStatus.Completed,
        count: getExams?.data?.completedCount || 0,
        color: 'success',
      },
    ],
    [getExams?.data?.pendingCount, getExams?.data?.publishedCount, getExams?.data?.completedCount]
  );

  // Handle tab change event — update UI state, notify parent, and refetch with new Status
  const handleTabChange = (event: React.SyntheticEvent, newValue: string | number) => {
    tabs.onChange(event, newValue);
    onStatusChange?.(newValue as number);
    getExams?.refetch?.();
  };

  // Table data comes pre-filtered from the backend via the Status query param
  const tableData = useMemo(() => getExams?.data?.items || [], [getExams?.data?.items]);

  // Actions component for the three dots menu
  // Renders menu items for printing and publishing timetables
  // Uses useCallback to memoize the component for performance
  const actions = ({ popover: pop, row }: any) =>
    canView || canAdd ? (
      <>
        {' '}
        <MenuList>
          <MenuItem
            onClick={() => {
              setPreviewExam(row);
              pop.onClose();
            }}
          >
            <Iconify icon="solar:eye-bold" />
            Preview
          </MenuItem>

          <MenuItem
            onClick={() => {
              onViewTimetable?.(row as IExamFormValues);
              pop.onClose();
            }}
          >
            <Iconify icon="solar:calendar-bold-duotone" />
            View Timetable
          </MenuItem>

          {/* Menu item for printing the timetable */}
          <MenuItem
            onClick={() => {
              pop.onClose();
            }}
          >
            <Iconify icon="solar:printer-outline" />
            Print Timetable
          </MenuItem>

          {/* Menu item for publishing the timetable 
              Sets the selected timetable name and shows confirmation dialog */}
          {canAdd && row.status === examScheduledStatus.Pending && (
            <MenuItem
              onClick={() => {
                requestPublishExam(row);
                pop.onClose();
              }}
            >
              <Iconify icon="solar:cloud-upload-outline" />
              Publish Exam
            </MenuItem>
          )}
        </MenuList>
      </>
    ) : null;

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1 }}>
        <ScheduleExamKpiStrip summary={getExams?.data} rows={tableData} />
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            gap: 1,
            alignItems: 'center',
            px: 2,
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Tabs
            value={tabs.value}
            onChange={handleTabChange}
            sx={{ '& .MuiTabs-flexContainer': { gap: 1 }, flexGrow: 1 }}
          >
            {TABS.map((tab) => (
              <Tab
                sx={{ fontSize: '12px' }}
                key={tab.value}
                label={
                  <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                    {tab.label}{' '}
                    <Label color={(tab?.color as LabelColor) || 'default'}>{tab.count}</Label>
                  </Box>
                }
                value={tab.value}
              />
            ))}
          </Tabs>
          {isScheduleExamButton && canAdd && (
            <Button
              size="small"
              startIcon={<Add />}
              variant="contained"
              onClick={() => {
                setOpenDialog?.(true);
              }}
              sx={{ px: '32px' }}
            >
              Schedule Exam
            </Button>
          )}
        </Paper>
      </Box>
      {isAction ? (
        <CustomizableTable
          tableId="schedule-exam-table"
          isLoading={getExams?.isLoading || getExams?.isFetching}
          noDataText={
            <Stack alignItems="center" spacing={0.5}>
              <Box component="span">Exam Data Not Found</Box>
              <Box
                component="span"
                onClick={() => {
                  setOpenDialog?.(true);
                  setEditData?.(null);
                }}
                color="primary.main"
                fontWeight={600}
                sx={{
                  '&:hover': {
                    cursor: 'pointer',
                    color: 'primary.main',
                    textDecoration: 'underline',
                  },
                }}
              >
                Create Exam
              </Box>
            </Stack>
          }
          columns={[
            {
              id: 'examName',
              label: 'Exam Name',
              align: 'left',
              sticky: true,
              stickyPosition: 'left',
              minWidth: 260,
              render: (value, row) => (
                <Box>
                  <Typography variant="subtitle2">{value}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.subjectCount ?? 0} subjects
                    {row.lastUpdatedAt
                      ? ` · Updated ${dayjs(row.lastUpdatedAt).format('DD MMM')}`
                      : ''}
                  </Typography>
                </Box>
              ),
            },
            { id: 'examTypeName', label: 'Exam Type', align: 'left' },
            { id: 'standardName', label: 'Class', align: 'left' },
            {
              id: 'divisions',
              label: 'Divisions',
              align: 'left',
              isFilter: false,
              isSort: false,
              render: (value) => (
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {(value || []).slice(0, 2).map((division: string) => (
                    <Chip key={division} label={division} size="small" variant="soft" />
                  ))}
                  {(value || []).length > 2 && (
                    <Chip label={`+${(value || []).length - 2}`} size="small" variant="outlined" />
                  )}
                </Stack>
              ),
            },
            {
              id: 'startDate',
              label: 'Date Range',
              align: 'left',
              isFilter: false,
              render: (_value, row) => {
                if (!row.startDate) return 'Not scheduled';
                const start = dayjs(row.startDate).format('DD-MM-YYYY');
                const end = row.endDate ? dayjs(row.endDate).format('DD-MM-YYYY') : start;
                return start === end ? start : `${start} - ${end}`;
              },
            },
            {
              id: 'issueCount',
              label: 'Issues',
              align: 'left',
              isFilter: false,
              isSort: false,
              render: (_value, row) => (
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {(row.issueCount ?? 0) > 0 ? (
                    <Chip
                      label={`${row.issueCount} issue${row.issueCount > 1 ? 's' : ''}`}
                      color="error"
                      size="small"
                      variant="soft"
                    />
                  ) : (
                    <Chip label="Ready" color="success" size="small" variant="soft" />
                  )}
                  {(row.missingRoomAssignmentCount ?? 0) > 0 && (
                    <Chip label="Missing rooms" color="warning" size="small" variant="outlined" />
                  )}
                </Stack>
              ),
            },
            { id: 'creatorName', label: 'Created By', align: 'left', isFilter: false },
            {
              id: 'status',
              label: 'Status',
              align: 'left',
              sticky: true,
              stickyPosition: 'right',
              minWidth: 120,
              filterType: 'enum',
              enumOptions: [
                { label: 'Pending', value: 'Pending' },
                { label: 'Published', value: 'Published' },
                { label: 'Completed', value: 'Completed' },
              ],
              render: (value) => {
                const meta =
                  value === examScheduledStatus.Published
                    ? { label: 'Published', color: 'info' }
                    : value === examScheduledStatus.Completed
                      ? { label: 'Completed', color: 'success' }
                      : { label: 'Draft', color: 'warning' };
                return <Label color={meta.color as LabelColor}>{meta.label}</Label>;
              },
            },
            {
              id: 'action',
              label: 'Actions',
              minWidth: 50,
              width: 50,
              align: 'left',
              isSort: false,
              sticky: true,
              stickyPosition: 'right',
              isFilter: false,
              render(value, row) {
                return (
                  <ThreeDotsActions
                    actions={(prop) => actions({ ...prop, row })}
                    placement="right-top"
                    showViewIcon={canView}
                    showDeleteIcon={tabs.value === examScheduledStatus.Pending && canDelete}
                    showEditIcon={tabs.value === examScheduledStatus.Pending && canAdd}
                    handleViewClick={() => setPreviewExam(row as IExamFormValues)}
                    handleDeleteClick={() => {
                      onDelete?.(row as IExamFormValues);
                    }}
                    handleEditClick={() => {
                      setOpenDialog?.(true);
                      setEditData?.(row as IExamFormValues);
                    }}
                  />
                );
              },
            },
          ]}
          data={tableData || []}
        />
      ) : (
        <CustomizableTable
          tableId="schedule-exam-table"
          isLoading={getExams?.isLoading || getExams?.isFetching}
          noDataText={
            <Stack alignItems="center" spacing={0.5}>
              <Box component="span">Exam Data Not Found</Box>
              <Box
                component="span"
                onClick={() => {
                  setOpenDialog?.(true);
                  setEditData?.(null);
                }}
                color="primary.main"
                fontWeight={600}
                sx={{
                  '&:hover': {
                    cursor: 'pointer',
                    color: 'primary.main',
                    textDecoration: 'underline',
                  },
                }}
              >
                Create Exam
              </Box>
            </Stack>
          }
          columns={[
            { id: 'examName', label: 'Exam Name', align: 'left', sticky: true },
            { id: 'examType', label: 'Exam Type', align: 'left' },
            { id: 'className', label: 'Class', align: 'left', filterType: 'number' },
            {
              id: 'divisions',
              label: 'Divisions',
              align: 'left',
              isFilter: false,
              isSort: false,
              render: (value) => <Box>{(value || []).join(', ')}</Box>,
            },
            { id: 'createdBy', label: 'Created By', align: 'left', isFilter: false },
          ]}
          data={tableData || []}
        />
      )}

      <ConfirmDialog
        open={publishExamDialog.value}
        onClose={() => {
          publishExamDialog.onFalse();
          setSelectedTimetable(null);
        }}
        title="Publish"
        content={
          <Stack spacing={1}>
            <Box>
              Are you sure you want to publish{' '}
              <Box component="span" fontWeight="bold" color="text.primary">
                {selectedTimetable?.examName}
              </Box>
              ?
            </Box>
            {(selectedTimetable?.issueCount ?? 0) > 0 && (
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: 'warning.lighter',
                  borderColor: 'warning.light',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <Iconify icon="solar:danger-triangle-bold-duotone" width={20} color="warning.dark" />
                  <Box>
                    <Typography variant="body2" fontWeight={700} color="warning.dark">
                      {selectedTimetable?.issueCount} blocking issue{(selectedTimetable?.issueCount ?? 0) > 1 ? 's' : ''} detected
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Publishing will fail. Open the exam schedule and fill in all required fields first.
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            )}
          </Stack>
        }
        action={
          <LoadingButton
            variant="contained"
            loading={isPublishing}
            disabled={isPublishing || (selectedTimetable?.issueCount ?? 0) > 0}
            startIcon={<Iconify icon="solar:cloud-upload-outline" />}
            onClick={handlePublishExam}
            size="small"
          >
            Publish
          </LoadingButton>
        }
      />
      <ScheduleExamPreviewDrawer
        open={!!previewExam}
        exam={previewExam}
        canEdit={canAdd}
        onClose={() => setPreviewExam(null)}
        onEdit={(row) => {
          setPreviewExam(null);
          setOpenDialog?.(true);
          setEditData?.(row as IExamFormValues);
        }}
        onViewTimetable={(row) => {
          setPreviewExam(null);
          onViewTimetable?.(row as IExamFormValues);
        }}
        onPublish={(row) => {
          setPreviewExam(null);
          requestPublishExam(row);
        }}
      />
    </>
  );
};

export default ScheduledExamTable;
