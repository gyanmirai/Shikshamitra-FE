import type { BoxProps, CardProps } from '@mui/material';

import React, { useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import { Upload , } from '@mui/icons-material';
// import Grid from '@mui/material/Unstable_Grid2/Grid2';
import {
  Box,
  Card,
  Grid,
  Button,
  Avatar,
  MenuList,
  MenuItem,
  TextField,
  CardHeader,
  DialogActions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { orderBy } from 'src/utils/helper';
import { fNumber, fShortenNumber } from 'src/utils/format-number';

import { varAlpha } from 'src/theme/styles';
import { AppCurrentDownload } from 'src/screens/hr/dashboard/app-current-download';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

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
      <Button type="submit" variant="contained" color="primary" style={{ marginTop: '1rem' }}>
        Submit
      </Button>
    </DialogActions>
  </Box>
);

const EntranceExamDashboard = () => {
  const dialog = useBoolean();
  const resultDialog = useBoolean();
  const confirm = useBoolean(false);
  const dummyData = [
    {
      id: 1,
      name: 'John Doe',
      class: '10th',
      medium: 'English',
      date: '2023-06-01',
      totalMarks: 100,
      obtainedMarks: 85,
      status: 'Pass',
    },
    {
      id: 2,
      name: 'Jane Smith',
      class: '11th',
      medium: 'Spanish',
      date: '2023-06-02',
      totalMarks: 100,
      obtainedMarks: 92,
      status: 'Pass',
    },
    {
      id: 3,
      name: 'Bob Johnson',
      class: '9th',
      medium: 'French',
      date: '2023-06-03',
      totalMarks: 100,
      obtainedMarks: '-',
      status: 'Pending',
    },
    {
      id: 4,
      name: 'Alice Williams',
      class: '12th',
      medium: 'German',
      date: '2023-06-04',
      totalMarks: 100,
      obtainedMarks: 95,
      status: 'Pass',
    },
    {
      id: 5,
      name: 'Charlie Brown',
      class: '8th',
      medium: 'Mandarin',
      date: '2023-06-05',
      totalMarks: 100,
      obtainedMarks: 68,
      status: 'Fail',
    },
  ];
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
    <>
    <Grid container spacing={2}>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <LoadingButton variant="contained" loading={false} color="error" onClick={async () => {}}>
            Delete
          </LoadingButton>
        }
      />
  <Grid sx={{pt:"20px"}} container spacing={2}>
  <Grid item xs={12} md={4}>
    <Card sx={{ p: 3, height: '100%' }}>
      <Box sx={{ typography: 'h6', mb: 2 }}>Upcoming Exams</Box>
      <Scrollbar sx={{ height: '120px' }}>
        <Box component="ul" sx={{ listStyle: 'none', padding: 0 }}>
          {[
            'GSEB - English - 10th May',
            'CBSE - Hindi - 15th May',
            'GSEB - Gujarati - 10th May',
          ].map((exam, index) => (
            <Box component="li" key={index} sx={{ mb: 1 }}>
              <Button variant="outlined" fullWidth sx={{ justifyContent: 'start' }}>
                {exam}
              </Button>
            </Box>
          ))}
        </Box>
      </Scrollbar>
    </Card>
  </Grid>
  <Grid item xs={12} md={4}>
  <Card sx={{ p: 2, height: '100%' }}>
    <Box display="flex" flexDirection="column" gap={2}>
      {/* Total Candidates and Exam Status */}
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Box>
          <Box sx={{ typography: 'subtitle2' }}>Total Candidates</Box>
          <Box sx={{ mt: 1.5, typography: 'h6', color: 'primary.main' }}>
            {fNumber(10000)}
          </Box>
        </Box>

        <Box>
          <Box sx={{ typography: 'subtitle2' }}>Exam Status</Box>
          <Box sx={{ mt: 1.5, typography: 'h6', color: 'primary.main' }}>
            {fNumber(2)} Ongoing
          </Box>
          <Box sx={{ mt: 1.5, typography: 'h6', color: 'warning.main' }}>
            {fNumber(5)} Upcoming
          </Box>
        </Box>
      </Box>

      {/* Top Performers Section */}
      <Box>
        <Box sx={{ typography: 'subtitle2', mb: 1 }}>Top Performers</Box>
        <Scrollbar sx={{ height: '150px' }}>
          <Box component="ul" sx={{ listStyle: 'none', padding: 0 }}>
            {[
              { id: '1', name: 'John Doe', totalMarks: 65 },
              { id: '2', name: 'Herbert Clark', totalMarks: 89 },
              // Add more performers here
            ].map((performer) => (
              <Box component="li" key={performer.id} sx={{ mb: 1 }}>
                <Button variant="outlined" fullWidth sx={{ justifyContent: 'start' }}>
                  {performer.name} - {performer.totalMarks} Marks
                </Button>
              </Box>
            ))}
          </Box>
        </Scrollbar>
      </Box>
    </Box>
  </Card>
</Grid>

  
  {/* <Grid item xs={12} md={4}>
    <Card sx={{ p: 3, height: '100%' }}>
      <Box sx={{ typography: 'subtitle2' }}>Total Candidates</Box>
      <Box sx={{ mt: 1.5, mb: 1, typography: 'h4', color: 'primary.main' }}>
        {fNumber(10000)}
      </Box>
      <Box sx={{ typography: 'subtitle2' }}>Exam Status</Box>
      <Box sx={{ mt: 1.5, mb: 1, typography: 'h4', color: 'primary.main' }}>
        {fNumber(2)} Ongoing
      </Box>
      <Box sx={{ mt: 1.5, mb: 1, typography: 'h4', color: 'warning.main' }}>
        {fNumber(5)} Upcoming
      </Box>
    </Card>
  </Grid> */}

  {/* <Grid item xs={12} md={4}>
    <TopPerformer
      title="Top Performer"
      sx={{ height: '100%' }}
      list={[
        {
          id: '1',
          name: 'John Doe',
          avatarUrl: '/static/images/avatars/avatar_1.png',
          totalMarks: 65,
        },
        {
          id: '2',
          name: 'Herbert Clark',
          avatarUrl: '/static/images/avatars/avatar_2.png',
          totalMarks: 89,
        },
      ]}
    />
  </Grid> */}

  <Grid item xs={12} md={4}>
    <AppCurrentDownload
      title="Pass-Fail Ratio"
      subheader="Number of students passed vs failed"
      chart={{
        series: [
          { label: 'Passed', value: 15 },
          { label: 'Failed', value: 2 },
        ],
      }}
    />
  </Grid>
</Grid>

      {/* <Grid xs={12} md={4}>
        <Card
          sx={{
            display: 'flex',
            p: 3,
          }}
        >
          {/* <Box sx={{ flexGrow: 1 }}>
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
             
            </Box>
          </Box> */}
        {/* </Card>
      </Grid> */} 

      {/* <CustomDialog
        maxWidth="lg"
        title="Scheduled Exams"
        open={dialog.value}
        handleClose={dialog.onFalse}
      > */}
{/*        
      </CustomDialog> */}
      

      <CustomDialog title="Result" handleClose={resultDialog.onFalse} open={resultDialog.value}>
        <ResultForm />
      </CustomDialog>
    </Grid>
    <Box pt="15px">
    <Box  display="flex" justifyContent="flex-end">
       <Button startIcon={<Upload />} variant="contained" color="warning">
                Upload Results
              </Button>
       </Box>
        <CustomizableTable
            columns={[
              { id: 'date', label: 'Date' },
              {
                id: 'name',
                label: 'Student',
              },
              {
                id: 'medium',
                label: 'Medium',
              },
              {
                id: 'class',
                label: 'Class',
              },
              {
                id: 'totalMarks',
                label: 'Total Marks',
              },
              {
                id: 'obtainedMarks',
                label: 'Obtained Marks',
              },
              {
                id: 'percentage',
                label: 'Percentage',
                render(value, row) {
                  return `${((row.obtainedMarks / row.totalMarks) * 100).toFixed(2)}%`;
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
                render(value, row) {
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
                render: (value, row) => (
                  <ThreeDotsActions placement="right-top" actions={actions} />
                ),
              },
            ]}
            data={dummyData}
          />
        </Box>
        </>
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
