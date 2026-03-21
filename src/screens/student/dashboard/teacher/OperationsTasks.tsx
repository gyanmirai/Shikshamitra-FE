import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { alpha } from '@mui/material/styles';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/custom-dialog';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizable-table';
import { Box, Card, Stack, Button, CardHeader, Typography, IconButton } from '@mui/material';

// ----------------------------------------------------------------------

const renderInfoTooltip = (title: string, tooltipText: string) => (
  <Stack direction="row" alignItems="center" spacing={1}>
    <Box component="span">{title}</Box>
    <CustomTooltip title={tooltipText} arrow placement="top">
      <Iconify
        icon="eva:info-outline"
        width={18}
        sx={{ color: 'text.disabled', cursor: 'pointer' }}
      />
    </CustomTooltip>
  </Stack>
);

type QuickActionColor = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';

interface QuickAction {
  id: number;
  label: string;
  icon: string;
  color: QuickActionColor;
}

const quickActions: QuickAction[] = [
  {
    id: 1,
    label: 'Create Event / Holiday',
    icon: 'mdi:calendar-plus',
    color: 'success',
  },
  {
    id: 2,
    label: 'Generate Fee Invoice',
    icon: 'mdi:receipt-text-outline',
    color: 'success',
  },
  {
    id: 3,
    label: 'Upload Staff Documents',
    icon: 'mdi:file-document-edit-outline',
    color: 'info',
  },
  {
    id: 4,
    label: 'System Configuration',
    icon: 'mdi:cog-outline',
    color: 'warning',
  },
];

const upcomingExams = [
  {
    id: 1,
    time: '09:00 - 10:30',
    date: 'Feb 15, 2026',
    subject: 'Mathematics',
    details: 'Unit Test 3 - Mathematics',
    type: 'Internal',
    status: 'Scheduled',
    students: 42,
  },
  {
    id: 2,
    time: '10:00 - 11:30',
    date: 'Feb 18, 2026',
    subject: 'Science',
    details: 'Science Practical Assessment',
    type: 'Practical',
    status: 'Scheduled',
    students: 40, // Maybe some absent or detached
  },
  {
    id: 3,
    time: '09:00 - 12:00',
    date: 'Jan 15, 2026',
    subject: 'English',
    details: 'English Mid-Term Exam',
    type: 'Term',
    status: 'Completed',
    students: 42,
  },
  {
    id: 4,
    time: '09:00 - 12:00',
    date: 'Jan 15, 2026',
    subject: 'English',
    details: 'English Mid-Term Exam',
    type: 'Term',
    status: 'Completed',
    students: 42,
  },
];

// ----------------------------------------------------------------------

export const QuickActions = () => (
  <Card sx={{ height: '100%', maxHeight: 480 }}>
    <CardHeader
      title="Quick Actions"
      action={
        <IconButton>
          <Iconify icon="mdi:refresh" />
        </IconButton>
      }
    />
    <Stack spacing={1} sx={{ p: 3 }}>
      {quickActions.map((action) => (
        <Button
          key={action.id}
          fullWidth
          size="large"
          variant="outlined"
          startIcon={
            <Box
              component="span"
              sx={{
                width: 24,
                height: 24,
                borderRadius: 0.75,
                bgcolor: (theme) => alpha(theme.palette[action.color].main, 0.16),
                color: (theme) => theme.palette[action.color].main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon={action.icon} width={16} />
            </Box>
          }
          sx={{
            justifyContent: 'flex-start',
            py: 2,
            px: 2,
            borderStyle: 'dashed',
            borderColor: (theme) => alpha(theme.palette.grey[500], 0.24),
            color: 'text.primary',
            fontWeight: 600,
            '&:hover': {
              borderColor: (theme) => theme.palette[action.color].main,
              bgcolor: (theme) => alpha(theme.palette[action.color].main, 0.08),
            },
          }}
        >
          {action.label}
        </Button>
      ))}
    </Stack>
  </Card>
);

export const UpcomingExams = () => {
  const [openDialog, setOpenDialog] = useState(false);

  // Class & Division state (same pattern as SubjectPassFailChart)
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClasses] = useState<string>('');
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [division, setDivision] = useState<string>('');

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  useEffect(() => {
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];
    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [medium]);

  useEffect(() => {
    const currentClass = allClass.find((org: Standards) => org?.id === classes);
    setAllDivision(currentClass?.divisions || []);
    setDivision(currentClass?.divisions?.[0]?.id || '');
  }, [allClass, classes]);

  // Table columns for exams dialog
  const examColumns: any[] = [
    { id: 'details', label: 'Exam Name', align: 'left' },
    { id: 'date', label: 'Date', align: 'left' },
    { id: 'time', label: 'Time', align: 'left' },
    { id: 'subject', label: 'Subject', align: 'left' },
    {
      id: 'type',
      label: 'Type',
      align: 'left',
      render: (value: string) => (
        <Label variant="soft" color={value === 'Internal' ? 'info' : 'warning'}>
          {value}
        </Label>
      ),
    },
    { id: 'students', label: 'Students', align: 'center' },
    {
      id: 'status',
      label: 'Status',
      align: 'left',
      render: (value: string) => (
        <Label variant="soft" color={value === 'Completed' ? 'success' : 'warning'}>
          {value}
        </Label>
      ),
    },
  ];

  return (
    <>
      <Card
        sx={{
          height: '100%',
          maxHeight: 480,
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: (theme) => theme.shadows[8],
            transition: 'all 0.3s ease-in-out',
          },
        }}
      >
        <CardHeader
          title={renderInfoTooltip(
            'Upcoming Exams',
            'Upcoming exams for the selected class and division.'
          )}
          action={
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, mr: 1 }}>
                <CustomSelect
                  options={allClass}
                  label="Class"
                  value={classes}
                  onChange={(val) => setClasses(val as string)}
                  labelKey="name"
                  valueKey="id"
                  formControlProps={{ sx: { minWidth: '90px' } }}
                />
                <CustomSelect
                  options={allDivision}
                  label="Division"
                  value={division}
                  onChange={(val) => setDivision(val as string)}
                  labelKey="name"
                  valueKey="id"
                  formControlProps={{ sx: { minWidth: '90px' } }}
                  disabled={!classes}
                />
              </Box>
              <Button
                size="small"
                color="inherit"
                onClick={() => setOpenDialog(true)}
                endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
              >
                View All
              </Button>
            </Box>
          }
          sx={{ mt: -1, ml: -1 }}
        />
        <Scrollbar>
          <Stack spacing={1} sx={{ p: 1 }}>
            {upcomingExams.map((exam) => (
              <Box
                key={exam.id}
                sx={{
                  p: 1,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  position: 'relative',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'transparent',
                    bgcolor: 'background.neutral',
                    transform: 'scale(1.02)',
                    boxShadow: 'none',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 4,
                    height: 48,
                    borderRadius: 0.5,
                    bgcolor: exam.status === 'Completed' ? 'success.main' : 'warning.main',
                    flexShrink: 0,
                  }}
                />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontSize: '0.925rem' }}>
                        {exam.details}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {exam.students} Students Registered
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                    sx={{ mt: 1, flexWrap: 'wrap' }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: 'text.secondary',
                        typography: 'caption',
                      }}
                    >
                      <Iconify icon="mdi:clock-outline" width={16} sx={{ mr: 0.5 }} />
                      {exam.time}
                    </Box>
                    <Box
                      sx={{
                        width: 4,
                        height: 4,
                        bgcolor: 'text.disabled',
                        borderRadius: '50%',
                      }}
                    />
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: 'text.secondary',
                        typography: 'caption',
                      }}
                    >
                      <Iconify icon="mdi:calendar-blank-outline" width={16} sx={{ mr: 0.5 }} />
                      {exam.date}
                    </Box>

                    <Label variant="soft" color={exam.type === 'Internal' ? 'info' : 'warning'}>
                      {exam.type}
                    </Label>
                  </Stack>
                </Box>
              </Box>
            ))}
          </Stack>
        </Scrollbar>
      </Card>

      {/* Exams Dialog */}
      <CustomDialog
        open={openDialog}
        handleClose={() => setOpenDialog(false)}
        title="Upcoming Exams"
        maxWidth="lg"
      >
        <CustomizableTable
          columns={examColumns}
          data={upcomingExams}
          tableId="upcoming-exams-table"
          isSearch={false}
          isFilter={false}
          isPagination={false}
          wrapperProps={{ sx: { height: '60vh' }, padding: 1 }}
        />
      </CustomDialog>
    </>
  );
};
