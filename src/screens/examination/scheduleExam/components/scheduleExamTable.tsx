import type { LabelColor } from 'src/components/label';

import React, { useMemo, useState, useCallback } from 'react';

import { Add } from '@mui/icons-material';
import { Box, Tab, Tabs, Button, Tooltip, MenuList, useTheme, IconButton } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { GlobalIcons } from 'src/utils/icons';

import { ScheduleExamStatus } from 'src/enums/schedule-exam-status';
import {
  PublishUnpublishStatusType,
  PublishUnpublishStatusOptions,
} from 'src/enums/publishUnpublish-status';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import ViewTimetableComp from './viewTimetableComp';

import type { IExamFormValues, IScheduledExamTableProps } from '../type';

const ScheduledExamTable: React.FC<IScheduledExamTableProps> = ({
  openDialog,
  setOpenDialog,
  editData,
  setEditData,
  onDelete,
  data,
  onViewTimetable,
}) => {
  // Initialize tabs with default value of 'Pending'
  const tabs = useTabs(ScheduleExamStatus.Pending);
  // Add this outside your component
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  // Calculate counts of exams by status
  const examCounts = useMemo(
    () => ({
      pending: data?.filter((i) => i.status === ScheduleExamStatus.Pending)?.length || 0,
      completed: data?.filter((i) => i.status === ScheduleExamStatus.Completed)?.length || 0,
    }),
    [data]
  );
  const theme = useTheme();

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

          <Button
            size="small"
            startIcon={<Iconify icon={GlobalIcons.download} />}
            onClick={() => {
              // Implement print or download functionality here
            }}
            variant="outlined"
          >
            Print Timetable
          </Button>
        </MenuList>
      </>
    ),
    []
  );

  return (
    <Box>
      <Box display="flex" gap={1} alignItems="flex-start" marginBottom={3}>
        <Tabs
          value={tabs.value}
          onChange={handleTabChange}
          sx={{
            '& .MuiTabs-flexContainer': { gap: 2 },
            flexGrow: 1,
            marginLeft: 1,
            marginTop: -1,
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
        <Button
          size="small"
          startIcon={<Add />}
          variant="contained"
          onClick={() => {
            setOpenDialog(true);
          }}
          sx={{
            mt: 0.5,
          }}
        >
          Schedule Exam
        </Button>
      </Box>
      <CustomizableTable
        tableId="schedule-exam-table"
        noDataText={
          <>
            No Exam Data Found{' '}
            <Box
              onClick={() => {
                setOpenDialog(true);
                setEditData(null);
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
            id: 'className',
            label: 'Class',
            align: 'left',
            children: (row): React.ReactNode => (
              <ViewTimetableComp examData={row as IExamFormValues} />
            ),
          },
          {
            id: 'divisions',
            label: 'Divisions',
            align: 'left',
            render: (value) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {value && value.length > 0 ? value.join(', ') : '-'}
              </Box>
            ),
          },
          { id: 'examType', label: 'Exam Type', align: 'left' },
          {
            id: 'status',
            label: 'Status',
            align: 'left',
            minWidth: 40,
            isFilter: false,
            sticky: true,
            isSort: false,
            filterType: 'enum',
            enumOptions: PublishUnpublishStatusOptions,
            render(value, row) {
              const statusColor =
                value === PublishUnpublishStatusType.Published
                  ? theme.palette.success.main
                  : theme.palette.text.secondary;

              return (
                <Tooltip title={value === 0 ? 'Published' : 'Draft'}>
                  <IconButton>
                    <Iconify
                      icon={GlobalIcons.tick}
                      sx={{
                        width: 20,
                        height: 20,
                        cursor: 'pointer',
                        color: statusColor,
                      }}
                    />
                  </IconButton>
                </Tooltip>
              );
            },
          },
          // {
          //   id: 'subjects',
          //   label: 'Subjects',
          //   align: 'left',
          //   render: (value, row) => (
          //     <Box sx={{ display: 'flex', gap: 1 }}>
          //       {value.map((subject: ISubjectDetail) => (
          //         <Box key={subject.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          //           <Box
          //             sx={{
          //               width: 4,
          //               height: 18,
          //               borderRadius: 1,
          //               backgroundColor: subject.subjectColor,
          //             }}
          //           />
          //           <Typography variant="body2">{subject.subjectName}</Typography>
          //         </Box>
          //       ))}
          //     </Box>
          //   ),
          // },
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
                  // showThreeDots={false}
                  placement="right-top"
                  // showViewIcon
                  showDeleteIcon
                  showEditIcon
                  actions={(prop) => actions({ ...prop, row })}
                  handleDeleteClick={() => {
                    onDelete(row as IExamFormValues);
                  }}
                  handleEditClick={() => {
                    setEditData(row as IExamFormValues);
                    setOpenDialog(true);
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
    </Box>
  );
};

export default ScheduledExamTable;
