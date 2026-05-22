import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useMemo, useState, useCallback } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { examScheduledStatus } from 'src/enums/exam-scheduled-status';
import { Box, Tab, Chip, Tabs, Button, MenuList, MenuItem } from '@mui/material';
import {
  usePublishExamMutation,
  useUpdateExamStatusMutation,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/schedule-examApi';

import ViewTimetableComp from './viewTimetableComp';

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
            <Iconify icon={GlobalIcons.download} />
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
              <Iconify icon={GlobalIcons.publish} />
              Publish Timetable
            </MenuItem>
          )}
        </MenuList>
      </>
    ),
    [publishExamDialog]
  );

  return (
    <>
      {/* ── Status tab bar ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 1,
          borderBottom: 1,
          borderColor: 'divider',
        }}
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
            sx={{ px: '32px', flexShrink: 0 }}
          >
            Schedule Exam
          </Button>
        )}
      </Box>

      {/* ── Shared base columns — action column added conditionally ── */}
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
          {
            id: 'examName',
            label: 'Exam Name',
            align: 'left',
            children: (row): React.ReactNode => (
              <ViewTimetableComp examData={row as IExamFormValues} />
            ),
          },
          { id: isAction ? 'examTypeName' : 'examType', label: 'Exam Type', align: 'left' },
          {
            id: isAction ? 'standardName' : 'className',
            label: 'Class',
            align: 'left',
            filterType: 'number',
          },
          {
            id: 'divisions',
            label: 'Divisions',
            align: 'left',
            isFilter: false,
            isSort: false,
            render: (value) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(value || []).slice(0, 4).map((div: string) => (
                  <Chip
                    key={div}
                    label={div}
                    size="small"
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.7rem', borderRadius: 1 }}
                  />
                ))}
                {(value || []).length > 4 && (
                  <Chip
                    label={`+${value.length - 4}`}
                    size="small"
                    sx={{ height: 20, fontSize: '0.7rem', borderRadius: 1 }}
                  />
                )}
              </Box>
            ),
          },
          {
            id: isAction ? 'creatorName' : 'createdBy',
            label: 'Created By',
            align: 'left',
          },
          ...(isAction
            ? [
                {
                  id: 'action',
                  label: 'Actions',
                  minWidth: 80,
                  align: 'left' as const,
                  isSort: false,
                  sticky: true,
                  isFilter: false,
                  render(value: any, row: any) {
                    return (
                      <ThreeDotsActions
                        actions={(prop: any) => actions({ ...prop, row })}
                        placement="right-top"
                        showDeleteIcon
                        showEditIcon
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
              ]
            : []),
        ]}
        data={tableData || []}
      />

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
            startIcon={<Iconify icon={GlobalIcons.publish} />}
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
