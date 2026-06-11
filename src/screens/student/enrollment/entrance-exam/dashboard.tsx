'use client';

import type { RootState } from 'src/redux/store';
import type { BoxProps, CardProps } from '@mui/material';

import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import React, { useCallback } from 'react';
import { orderBy } from 'src/utils/helper';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { Upload, ViewAgenda } from '@mui/icons-material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { fNumber, fShortenNumber } from 'src/utils/format-number';
import CustomizableTable from 'src/components/customizabaleTable';
import { AppCurrentDownload } from 'src/screens/hr/dashboard/app-current-download';
import { useGetEntranceExamQuery } from 'src/redux/student/entrance-exam/entrance-exam-api';
import {
  Box,
  Grid,
  Card,
  Button,
  Avatar,
  MenuList,
  MenuItem,
  TextField,
  Typography,
  CardHeader,
  DialogActions,
} from '@mui/material';

export const ResultForm = () => (
  <Box>
    <Scrollbar
      sx={{
        p: 3,
        bgcolor: 'background.neutral',
        //   height: 'calc(100vh - 150px)',
      }}
    >
      <Box display="flex" flexDirection="column" gap={2}>
        <TextField label="Obtained Marks" size="small" fullWidth />
        <TextField label="Total Marks" size="small" fullWidth />
      </Box>
    </Scrollbar>
    <DialogActions sx={{ flexShrink: 0 }}>
      <Button
        size="small"
        type="submit"
        variant="contained"
        color="primary"
        style={{ marginTop: '1rem' }}
      >
        Submit
      </Button>
    </DialogActions>
  </Box>
);

const EntranceExamDashboard = () => {
  const dialog = useBoolean();
  const resultDialog = useBoolean();
  const confirm = useBoolean(false);
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const { data: entranceExamData, isLoading } = useGetEntranceExamQuery(
    {
      startDate: dayjs().startOf('day').toISOString(),
      endDate: dayjs().add(30, 'day').endOf('day').toISOString(),
      educationMediumId: currentMedium?.id,
    },
    { skip: !currentMedium?.id }
  );
  const scheduledExamRows =
    entranceExamData?.data?.items?.map((item: any) => ({
      ...item,
      id: item.id || item.studentId,
      name: item.name || item.studentName,
      class: item.class || item.standard,
      medium: item.medium || item.educationMedium,
      date: item.examDate ? dayjs(item.examDate).format('DD-MM-YYYY') : '-',
      totalMarks: item.totalMarks || item.passingMarks || 0,
      obtainedMarks: item.marksObtained ?? '-',
      status: item.examStatus || 'Pending',
    })) || [];
  const passedCount = scheduledExamRows.filter(
    (row: any) => row.status === 'Pass' || row.status === 1
  ).length;
  const failedCount = scheduledExamRows.filter(
    (row: any) => row.status === 'Fail' || row.status === 2
  ).length;
  const actions = useCallback(
    ({ popover }: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            resultDialog.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="carbon:result" sx={{ height: '16px', width: '16px' }} />
          Upload Result
        </MenuItem>

        <MenuItem
          onClick={() => {
            dialog.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
          Edit
        </MenuItem>
      </MenuList>
    ),
    [dialog, resultDialog]
  );
  return (
    <Grid container spacing={2}>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure you want to delete?"
        action={
          <LoadingButton variant="contained" loading={false} color="error" onClick={async () => {}}>
            Yes
          </LoadingButton>
        }
      />

      <Grid size={{ xs: 12, md: 4 }}>
        <Card
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 3,
            height: '100%',
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ typography: 'subtitle2' }}>Upcoming Exams</Box>

            <Scrollbar sx={{ mt: 1.5, height: '120px' }}>
              <Box
                component="ul"
                sx={{
                  listStyle: 'none',
                  padding: 0,
                  animation: 'scrollAnimation 10s linear infinite',
                  animationDelay: '1s',
                  '@keyframes scrollAnimation': {
                    '0%': { transform: 'translateY(0)' },
                    '100%': { transform: 'translateY(-100%)' },
                  },
                }}
              >
                {scheduledExamRows.length === 0 ? (
                  <Box component="li" sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      No upcoming exams found.
                    </Typography>
                  </Box>
                ) : (
                  scheduledExamRows.slice(0, 5).map((exam: any) => (
                    <Box component="li" key={exam.id} sx={{ mb: 1 }}>
                      <Button variant="outlined" fullWidth sx={{ justifyContent: 'start' }}>
                        {exam.medium || '-'} - {exam.class || '-'} - {exam.date}
                      </Button>
                    </Box>
                  ))
                )}
              </Box>
            </Scrollbar>
          </Box>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Card
          sx={{
            display: 'flex',
            p: 3,
            height: '100%',
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ typography: 'subtitle2' }}>Total Candidates</Box>
            <Box sx={{ mt: 1.5, mb: 1, typography: 'h3', color: 'primary.main' }}>
              {fNumber(scheduledExamRows.length)}
            </Box>
          </Box>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Card
          sx={{
            display: 'flex',
            height: '100%',
            p: 3,
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ typography: 'subtitle2' }}>Exam Status</Box>
            <Box sx={{ mt: 1.5, mb: 1, typography: 'h4', color: 'primary.main' }}>
              {fNumber(scheduledExamRows.filter((row: any) => row.status === 'Ongoing').length)}{' '}
              Ongoing
            </Box>
            <Box sx={{ mt: 1.5, mb: 1, typography: 'h4', color: 'info.main' }}>
              {fNumber(scheduledExamRows.length)} Upcoming
            </Box>
          </Box>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <TopPerformer
          title="Top Performer"
          sx={{ height: '100%' }}
          list={scheduledExamRows
            .filter((row: any) => typeof row.obtainedMarks === 'number')
            .map((row: any) => ({
              id: row.id,
              name: row.name || '-',
              avatarUrl: '',
              totalMarks: row.obtainedMarks,
            }))}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <AppCurrentDownload
          title="Pass-Fail Ratio"
          subheader="Number of students passed vs failed"
          chart={{
            series: [
              { label: 'Passed', value: passedCount },
              { label: 'Failed', value: failedCount },
            ],
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Card sx={{ display: 'flex', p: 3 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ typography: 'subtitle2' }}>Quick Actions</Box>
            <Box display="flex" gap={2} flexWrap="wrap" pt={2}>
              <Button
                startIcon={<ViewAgenda />}
                variant="contained"
                color="primary"
                onClick={() => dialog.onTrue()}
              >
                View Scheduled Exam
              </Button>
              <Button startIcon={<Upload />} variant="contained" color="warning">
                Upload Results
              </Button>
            </Box>
          </Box>
        </Card>
      </Grid>

      <CustomDialog
        maxWidth="lg"
        title="Scheduled Exams"
        open={dialog.value}
        handleClose={dialog.onFalse}
      >
        <Box p={1}>
          <CustomizableTable
            tableId="scheduled-exam"
            columns={[
              { id: 'date', label: 'Date' },
              { id: 'name', label: 'Student' },
              { id: 'medium', label: 'Medium' },
              { id: 'class', label: 'Class' },
              { id: 'totalMarks', label: 'Total Marks' },
              { id: 'obtainedMarks', label: 'Obtained Marks' },
              {
                id: 'percentage',
                label: 'Percentage',
                render(value, row) {
                  return `${
                    typeof row.obtainedMarks === 'string'
                      ? 0
                      : ((row.obtainedMarks / row.totalMarks) * 100).toFixed(2)
                  }%`;
                },
              },
              {
                id: 'status',
                label: 'Status',
                render(value, row) {
                  return (
                    <Label
                      color={
                        value === 'Pass' ? 'success' : value === 'Pending' ? 'warning' : 'error'
                      }
                    >
                      {value}
                    </Label>
                  );
                },
              },
              {
                id: 'admission',
                label: '',
                isSort: false,
                render() {
                  return (
                    <Button variant="contained" size="small" color="primary">
                      Admission
                    </Button>
                  );
                },
              },
              {
                id: 'action',
                label: 'Action',
                render: () => <ThreeDotsActions placement="right-top" actions={actions} />,
              },
            ]}
            data={scheduledExamRows}
            isLoading={isLoading}
            noDataText={<>No scheduled exams found.</>}
          />
        </Box>
      </CustomDialog>

      <CustomDialog title="Result" handleClose={resultDialog.onFalse} open={resultDialog.value}>
        <ResultForm />
      </CustomDialog>
    </Grid>
  );
};

export default EntranceExamDashboard;

type Props = CardProps & {
  title?: string;
  subheader?: string;
  list: {
    id: string;
    name: string;
    avatarUrl: string;
    totalMarks: number;
  }[];
};

export function TopPerformer({ title, subheader, list, ...other }: Props) {
  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Box
        sx={{
          p: 3,
          gap: 3,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {orderBy(list, ['totalMarks'], ['desc']).map((item, index) => (
          <Item key={item.id} item={item} index={index} />
        ))}
      </Box>
    </Card>
  );
}

// ----------------------------------------------------------------------

type ItemProps = BoxProps & {
  index: number;
  item: Props['list'][number];
};

function Item({ item, index, sx, ...other }: ItemProps) {
  return (
    <Box
      sx={{
        gap: 2,
        display: 'flex',
        alignItems: 'center',
        ...sx,
      }}
      {...other}
    >
      <Avatar alt={item.name} src={item.avatarUrl} />

      <Box flexGrow={1}>
        <Box sx={{ typography: 'subtitle2' }}>{item.name}</Box>
        <Box
          sx={{
            gap: 0.5,
            mt: 0.5,
            alignItems: 'center',
            typography: 'caption',
            display: 'inline-flex',
            color: 'text.secondary',
          }}
        >
          <Iconify icon="fa6-solid:award" width={14} />
          {fShortenNumber(item.totalMarks)}
        </Box>
      </Box>

      <Box
        sx={{
          width: 40,
          height: 40,
          display: 'flex',
          borderRadius: '50%',
          alignItems: 'center',
          color: 'primary.main',
          justifyContent: 'center',
          bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
          ...(index === 1 && {
            color: 'info.main',
            bgcolor: (theme) => varAlpha(theme.vars.palette.info.mainChannel, 0.08),
          }),
          ...(index === 2 && {
            color: 'error.main',
            bgcolor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.08),
          }),
        }}
      >
        <Iconify width={24} icon="solar:cup-star-bold" />
      </Box>
    </Box>
  );
}
