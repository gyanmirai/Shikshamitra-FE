import type { LabelColor } from 'src/components/label';

import React, { useMemo, useState, useCallback } from 'react';

import { Add } from '@mui/icons-material';
import { Box, Tab, Tabs, Button, MenuList, MenuItem } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';
import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { ScheduleExamStatus } from 'src/enums/schedule-exam-status';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import ViewTimetableComp from './ViewTimetableComp';

import type { IExamFormValues, IScheduledExamTableProps } from '../type';

const ScheduledExamTable: React.FC<IScheduledExamTableProps> = ({
  openDialog,
  setOpenDialog,
  editData,
  setEditData,
  onDelete,
  data,
  onViewTimetable,
  isScheduleExamButton = true,
  isAction = true,
}) => {
  const publishExamDialog = useBoolean();

  // Initialize tabs with default value of 'Pending'
  const tabs = useTabs(ScheduleExamStatus.Pending);
  // Add this outside your component
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  // 🔼 Add this near the top with other useState hooks
  const [selectedTimetableName, setSelectedTimetableName] = useState<string | null>(null);

  // Calculate counts of exams by status
  const examCounts = useMemo(
    () => ({
      pending: data?.filter((i) => i.status === ScheduleExamStatus.Pending)?.length || 0,
      completed: data?.filter((i) => i.status === ScheduleExamStatus.Completed)?.length || 0,
    }),
    [data]
  );

  // Define tab configuration with labels, values, counts and colors
  const TABS = useMemo(
    () => [
      {
        label: 'Pending',
        value: ScheduleExamStatus.Pending,
        count: examCounts.pending,
        color: 'warning',
      },
      {
        label: 'Completed',
        value: ScheduleExamStatus.Completed,
        count: examCounts.completed,
        color: 'success',
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
    () => data?.filter((i: any) => i.status === tabs.value),
    [data, tabs.value]
  );

  const handleAccordionToggle = (row: IExamFormValues) => {
    const isOpen = expandedRowId === row.id;
    setExpandedRowId(isOpen ? null : row.id || null);

    // Call view action only when opening
    if (!isOpen) {
      onViewTimetable(row);
    }
  };

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          {/* Show Add Timetable option for Pending status */}

          <MenuItem
            onClick={() => {
              pop.onClose();
            }}
          >
            <Iconify icon={GlobalIcons.download} />
            Print Timetable
          </MenuItem>
          <MenuItem
            onClick={() => {
              publishExamDialog.onTrue();
              setSelectedTimetableName(row.examName);
              pop.onClose();
            }}
          >
            <Iconify icon={GlobalIcons.publish} />
            Publish Timetable
          </MenuItem>
        </MenuList>
      </>
    ),
    [publishExamDialog]
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" sx={{ mt: '4px', mb: 2 }}>
        <Tabs
          value={tabs.value}
          onChange={handleTabChange}
          sx={{
            '& .MuiTabs-flexContainer': { gap: 2 },
            flexGrow: 1,
          }}
        >
          {TABS.map((tab) => (
            <Tab
              sx={{ fontSize: '12px' }}
              key={tab.value}
              label={
                <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                  {tab.label}{' '}
                  <Label
                    // variant={tab.value === EmployeeAttendanceStatus.All ? 'filled' : 'soft'}
                    color={(tab?.color as LabelColor) || 'default'}
                  >
                    {tab.count}
                  </Label>
                </Box>
              }
              // icon={tab.icon}
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
            sx={{
              mt: 2,
            }}
          >
            Schedule Exam
          </Button>
        )}
      </Box>
      {isAction ? (
        <CustomizableTable
          tableId="schedule-exam-table"
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
              render: (value) => <Box>{value.join(', ')}</Box>,
            },
            { id: 'createdBy', label: 'Created By', align: 'left' },
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
                      // onDelete(row as IExamFormValues);
                    }}
                    handleEditClick={() => {
                      // setEditData(row as IExamFormValues);
                      // setOpenDialog?.(true);
                    }}
                    // handleViewClick={() => {
                    //   onViewTimetable(row as IExamFormValues);
                    // }}
                  />
                );
              },
            },
          ]}
          data={tableData}
        />
      ) : (
        <CustomizableTable
          tableId="schedule-exam-table"
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
              render: (value) => <Box>{value.join(', ')}</Box>,
            },
            { id: 'createdBy', label: 'Created By', align: 'left' },
          ]}
          data={tableData}
        />
      )}

      <ConfirmDialog
        open={publishExamDialog.value}
        onClose={() => {
          publishExamDialog.onFalse();
          // setSelectedAssignment(null);
          setSelectedTimetableName(null);
        }}
        title="Publish"
        content={
          <>
            Are you sure you want to publish{' '}
            <Box component="span" fontWeight="bold" color="text.primary">
              {selectedTimetableName}
            </Box>
            ?
          </>
        }
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.publish} />}
            onClick={() => {
              shikshaMitraToast.success({ message: 'Exam Time Table Published Successfully' });
              publishExamDialog.onFalse();
              setSelectedTimetableName(null);
            }}
            size="small"
          >
            Publish
          </Button>
        }
      />
    </Box>
  );
};

export default ScheduledExamTable;
