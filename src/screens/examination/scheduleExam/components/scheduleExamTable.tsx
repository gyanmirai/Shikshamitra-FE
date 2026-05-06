import type { Variants } from 'framer-motion';
import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';

import { motion } from 'framer-motion';
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
import { ScheduleExamStatus } from 'src/enums/schedule-exam-status';
import { Box, Tab, Card, Tabs, Button, MenuList, MenuItem } from '@mui/material';
import { usePublishExamMutation } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/schedule-examApi';

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
}) => {
  const publishExamDialog = useBoolean();
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const [publishExam] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePublishExamMutation,
  });
  // Initialize tabs with default value of 'Pending'
  const tabs = useTabs(ScheduleExamStatus.Pending);
  // Add this outside your component
  // const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [selectedTimetable, setSelectedTimetable] = useState<IExamFormValues | null>(null);

  const handlePublishExam = async () => {
    try {
      if (selectedTimetable?.examId) {
        await publishExam({
          examId: selectedTimetable.examId,
          body: { status: 1 }, // Published status
        }).unwrap();
        shikshaMitraToast.success({ message: 'Exam Time Table Published Successfully' });
        publishExamDialog.onFalse();
        setSelectedTimetable(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Calculate counts of exams by status
  const examCounts = useMemo(() => {
    const items = getExams?.data?.items || [];
    return {
      pending: items.filter((i: any) => i.status === 0).length || 0,
      completed: items.filter((i: any) => i.status === 1).length || 0,
    };
  }, [getExams?.data?.items]);

  // Define tab configuration with labels, values, counts and colors
  const TABS = useMemo(
    () => [
      {
        label: 'Pending',
        value: 0,
        count: examCounts.pending,
        color: 'warning',
      },
      {
        label: 'Published',
        value: 1,
        count: examCounts.completed,
        color: 'info',
      },
    ],
    [examCounts]
  );

  // Handle tab change event
  const handleTabChange = (event: React.SyntheticEvent, newValue: string | number) => {
    tabs.onChange(event, newValue);
  };

  // Filter table data based on selected tab value
  const tableData = useMemo(
    () => (getExams?.data?.items || []).filter((i: any) => i.status === tabs.value),
    [getExams?.data?.items, tabs.value]
  );

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
          {row.status === ScheduleExamStatus.Pending && (
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

  const headerItemVariant: Variants = {
    hidden: { opacity: 0, y: -12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  };

  return (
    <>
      <Card sx={{ boxShadow: 'var(--shadows-4)', px: 2, pb: 1, mb: 1 }}>
        <Box display="flex" justifyContent="space-between">
          <motion.div variants={headerItemVariant}>
            <Tabs value={tabs.value} onChange={handleTabChange}>
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
          </motion.div>
          {isScheduleExamButton && (
            <Button
              size="small"
              startIcon={<Add />}
              variant="contained"
              onClick={() => {
                setOpenDialog?.(true);
              }}
              sx={{ px: '32px', mt: 1.5 }}
            >
              Schedule Exam
            </Button>
          )}
        </Box>
      </Card>
      {isAction ? (
        <CustomizableTable
          tableId="schedule-exam-table"
          isLoading={getExams?.isLoading}
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
            {
              id: 'standardName',
              label: 'Class',
              align: 'left',
              filterType: 'number',
              children: (row): React.ReactNode => (
                <ViewTimetableComp examData={row as IExamFormValues} />
              ),
            },
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
                    // showViewIcon
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
          ]}
          data={tableData || []}
        />
      ) : (
        <CustomizableTable
          tableId="schedule-exam-table"
          isLoading={getExams?.isLoading}
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
            {
              id: 'className',
              label: 'Class',
              align: 'left',
              filterType: 'number',
              children: (row): React.ReactNode => (
                <ViewTimetableComp examData={row as IExamFormValues} />
              ),
            },
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
          <Button
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.publish} />}
            onClick={handlePublishExam}
            size="small"
          >
            Publish
          </Button>
        }
      />
    </>
  );
};

export default ScheduledExamTable;
