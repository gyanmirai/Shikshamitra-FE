import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import {
  Box,
  Card,
  Chip,
  Table,
  Button,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
  TableContainer,
} from '@mui/material';
import {
  useGetFeeRunsQuery,
  useCreateFeeRunMutation,
  usePreviewFeeRunMutation,
  usePostFeeRunToFinanceMutation,
} from 'src/redux/transport/vehicle-management/vehicleSettingsApi';

type FeeRunPanelProps = {
  academicMediumId?: string;
  academicYearId?: string;
};

const statusLabel = (status: number | string | undefined, fallback?: string) => {
  if (fallback) return fallback;
  if (status === 0 || status === '0') return 'Generated';
  if (status === 1 || status === '1') return 'Finance Posted';
  if (status === 2 || status === '2') return 'Partially Posted';
  return 'Unknown';
};

const formatAmount = (amount: number | string | undefined) =>
  Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

const FeeRunPanel = ({ academicMediumId, academicYearId }: FeeRunPanelProps) => {
  const [periodFrom, setPeriodFrom] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [periodTo, setPeriodTo] = useState(dayjs().endOf('month').format('YYYY-MM-DD'));
  const [dueDate, setDueDate] = useState(dayjs().endOf('month').add(7, 'day').format('YYYY-MM-DD'));
  const [preview, setPreview] = useState<any>(null);

  const [previewFeeRun, { isLoading: isPreviewing }] = usePreviewFeeRunMutation();
  const [createFeeRun, { isLoading: isGenerating }] = useCreateFeeRunMutation();
  const [postFeeRunToFinance, { isLoading: isPosting }] = usePostFeeRunToFinanceMutation();
  const { data: feeRuns, isFetching: isFetchingRuns } = useGetFeeRunsQuery(
    {
      academicMediumId,
      academicYearId,
      pageNumber: 1,
      pageSize: 5,
    },
    { skip: !academicMediumId || !academicYearId }
  );

  const buildRequestBody = () => ({
    academicYearId,
    periodFrom,
    periodTo,
    dueDate,
  });

  const validateScope = () => {
    if (!academicMediumId || !academicYearId) {
      shikshaMitraToast.error({ message: 'Academic medium and year are required' });
      return false;
    }
    return true;
  };

  const handlePreview = async () => {
    if (!validateScope()) return;

    try {
      const result = await previewFeeRun({
        academicMediumId,
        body: buildRequestBody(),
      }).unwrap();
      setPreview(result);
    } catch (error: any) {
      shikshaMitraToast.error({ message: error?.data?.message || 'Failed to preview fee run' });
    }
  };

  const handleGenerate = async () => {
    if (!validateScope()) return;

    try {
      const result = await createFeeRun({
        academicMediumId,
        body: buildRequestBody(),
      }).unwrap();
      setPreview(result);
      shikshaMitraToast.success({ message: 'Transport dues generated successfully' });
    } catch (error: any) {
      shikshaMitraToast.error({
        message: error?.data?.message || 'Failed to generate transport dues',
      });
    }
  };

  const handlePostFinance = async (runId: string) => {
    if (!academicMediumId) return;

    try {
      const result = await postFeeRunToFinance({ runId, academicMediumId }).unwrap();
      shikshaMitraToast.success({
        message: `${result?.postedStudentDueCount || 0} student dues posted to Finance`,
      });
    } catch (error: any) {
      shikshaMitraToast.error({
        message: error?.data?.message || 'Failed to post transport dues to Finance',
      });
    }
  };

  const previewRows = preview?.items ?? preview?.dues ?? [];
  const runRows = (feeRuns as any)?.items ?? [];

  return (
    <Card sx={{ boxShadow: 'var(--shadows-4)', mt: 2 }}>
      <Box p={2} display="flex" flexDirection="column" gap={1}>
        <Typography variant="h6" color="primary">
          Fee Runs
        </Typography>

        <Box display="grid" gap={1} gridTemplateColumns={{ xs: '1fr', md: 'repeat(4, 1fr)' }}>
          <TextField
            size="small"
            type="date"
            label="Period From"
            value={periodFrom}
            onChange={(event) => setPeriodFrom(event.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            size="small"
            type="date"
            label="Period To"
            value={periodTo}
            onChange={(event) => setPeriodTo(event.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            size="small"
            type="date"
            label="Due Date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Box display="flex" gap={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="mdi:eye-outline" />}
              disabled={isPreviewing || !academicMediumId || !academicYearId}
              onClick={handlePreview}
            >
              Preview
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<Iconify icon="mdi:playlist-plus" />}
              disabled={isGenerating || !academicMediumId || !academicYearId}
              onClick={handleGenerate}
            >
              Generate
            </Button>
          </Box>
        </Box>

        {preview && (
          <Box>
            <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
              <Chip size="small" label={`Dues: ${preview.generatedDueCount || 0}`} />
              <Chip size="small" label={`Students: ${preview.studentDueCount || 0}`} />
              <Chip size="small" label={`Employees: ${preview.employeeDueCount || 0}`} />
              <Chip size="small" label={`Total: Rs. ${formatAmount(preview.totalAmount)}`} />
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Member</TableCell>
                    <TableCell>Route</TableCell>
                    <TableCell>Stop</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewRows.slice(0, 5).map((row: any) => (
                    <TableRow key={`${row.memberId}-${row.assignmentId}`}>
                      <TableCell>{row.memberName}</TableCell>
                      <TableCell>{row.routeName}</TableCell>
                      <TableCell>{row.stopName}</TableCell>
                      <TableCell align="right">Rs. {formatAmount(row.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        <Box>
          <Typography variant="subtitle2" mb={1}>
            Recent Runs
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Period</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Dues</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {runRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      {isFetchingRuns ? 'Loading...' : 'No runs'}
                    </TableCell>
                  </TableRow>
                )}
                {runRows.map((run: any) => (
                  <TableRow key={run.id}>
                    <TableCell>
                      {dayjs(run.periodFrom).format('DD MMM YYYY')} -{' '}
                      {dayjs(run.periodTo).format('DD MMM YYYY')}
                    </TableCell>
                    <TableCell>{statusLabel(run.status, run.statusName)}</TableCell>
                    <TableCell align="right">{run.generatedDueCount}</TableCell>
                    <TableCell align="right">Rs. {formatAmount(run.totalAmount)}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="text"
                        disabled={isPosting || run.status === 1 || run.status === '1'}
                        onClick={() => handlePostFinance(run.id)}
                      >
                        Post
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Card>
  );
};

export default FeeRunPanel;
