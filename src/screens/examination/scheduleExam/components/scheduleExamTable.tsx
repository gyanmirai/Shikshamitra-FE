import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useMemo, useState, useCallback } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { examScheduledStatus } from 'src/enums/exam-scheduled-status';
import { Box, Tab, Tabs, Paper, Button, MenuList, MenuItem } from '@mui/material';
import {
  usePublishExamMutation,
  useUpdateExamStatusMutation,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/schedule-examApi';

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
      console.error(error);
    }
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
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
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
          {row.status === examScheduledStatus.Pending && (
            <MenuItem
              onClick={() => {
                publishExamDialog.onTrue();
                setSelectedTimetable(row);
                pop.onClose();
              }}
            >
              <Iconify icon="solar:cloud-upload-outline" />
              Publish Exam
            </MenuItem>
          )}
        </MenuList>
      </>
    ),
    [publishExamDialog]
  );

  return (
    <>
      <Paper
        elevation={2}
        sx={{ display: 'flex', gap: 1, alignItems: 'center', px: 2, mb: 1, borderRadius: '15px' }}
      >
        <Tabs
          value={tabs.value}
          onChange={handleTabChange}
          sx={{ '& .MuiTabs-flexContainer': { gap: 2 }, flexGrow: 1 }}
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
        {isScheduleExamButton && (
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
      {isAction ? (
        <CustomizableTable
          tableId="schedule-exam-table"
          isLoading={getExams?.isLoading || getExams?.isFetching}
          noDataText={
            <>
              Exam Data Not Found{' '}
              <Box
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
            </>
          }
          columns={[
            { id: 'examName', label: 'Exam Name', align: 'left' },
            { id: 'examTypeName', label: 'Exam Type', align: 'left' },
            { id: 'standardName', label: 'Class', align: 'left', filterType: 'number' },
            {
              id: 'divisions',
              label: 'Divisions',
              align: 'left',
              isFilter: false,
              isSort: false,
              render: (value) => <Box>{(value || []).join(', ')}</Box>,
            },
            { id: 'creatorName', label: 'Created By', align: 'left' },
            {
              id: 'action',
              label: 'Actions',
              minWidth: 80,
              align: 'left',
              isSort: false,
              sticky: true,
              isFilter: false,
              render(value, row) {
                return (
                  <ThreeDotsActions
                    actions={(prop) => actions({ ...prop, row })}
                    placement="right-top"
                    showViewIcon
                    showDeleteIcon={tabs.value === examScheduledStatus.Pending}
                    showEditIcon={tabs.value === examScheduledStatus.Pending}
                    handleViewClick={() => onViewTimetable?.(row as IExamFormValues)}
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
            <>
              Exam Data Not Found{' '}
              <Box
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
            </>
          }
          columns={[
            { id: 'examName', label: 'Exam Name', align: 'left', sticky: true },
            { id: 'examType', label: 'Exam Type', align: 'left' },
            { id: 'className', label: 'Class', align: 'left', filterType: 'number' },
            {
              id: 'divisions',
              label: 'Divisions',
              align: 'left',
              render: (value) => <Box>{(value || []).join(', ')}</Box>,
            },
            { id: 'createdBy', label: 'Created By', align: 'left' },
          ]}
          data={tableData || []}
        />
      )}

      <ConfirmDialog
        open={publishExamDialog.value}
        onClose={() => {
          publishExamDialog.onFalse();
          // setSelectedAssignment(null);
          setSelectedTimetable(null);
        }}
        title="Publish"
        content={
          <>
            Are you sure you want to publish{' '}
            <Box component="span" fontWeight="bold" color="text.primary">
              {selectedTimetable?.examName}
            </Box>
            ?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            loading={isPublishing}
            disabled={isPublishing}
            startIcon={<Iconify icon="solar:cloud-upload-outline" />}
            onClick={handlePublishExam}
            size="small"
          >
            Publish
          </LoadingButton>
        }
      />
    </>
  );
};

export default ScheduledExamTable;
