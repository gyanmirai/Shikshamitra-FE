'use client';

import type { RootState } from 'src/redux/store';
import type { BoardMediumOption } from 'src/components/boardMediumDropdown';

import { useSelector } from 'react-redux';
import { useMemo, useState, useEffect } from 'react';
import { formatNumber } from 'src/utils/formate_number';
import BoardMediumDropdown from 'src/components/boardMediumDropdown';
import {
  Card,
  Grid,
  Stack,
  Table,
  Divider,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  CardHeader,
  Typography,
  CardContent,
  TableContainer,
} from '@mui/material';

import { financeExposurePreview } from '../finance-admin-dashboard-preview-data';

function academicYearLabel(year: Record<string, any>) {
  if (year.name || year.academicYearName || year.yearName) {
    return year.name || year.academicYearName || year.yearName;
  }

  const start = year.startDate ? new Date(year.startDate).getFullYear() : '';
  const end = year.endDate ? new Date(year.endDate).getFullYear() : '';
  return start && end ? `AY ${start}–${end}` : 'Selected academic year';
}

export default function ExposureAtlas() {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const options = useMemo<BoardMediumOption[]>(
    () =>
      (currentYear?.boards ?? []).flatMap((board: any) =>
        (board.educationMediums ?? []).map((medium: any) => ({
          label: `${board.name} / ${medium.name}`,
          boardId: String(board.id),
          mediumId: String(medium.id),
        }))
      ),
    [currentYear?.boards]
  );
  const [selectedBoardMedium, setSelectedBoardMedium] = useState<BoardMediumOption | null>(null);
  const activeBoardMedium =
    options.find(
      (option) =>
        option.boardId === selectedBoardMedium?.boardId &&
        option.mediumId === selectedBoardMedium?.mediumId
    ) ??
    options[0] ??
    null;

  useEffect(() => {
    if (
      activeBoardMedium?.boardId !== selectedBoardMedium?.boardId ||
      activeBoardMedium?.mediumId !== selectedBoardMedium?.mediumId
    ) {
      setSelectedBoardMedium(activeBoardMedium);
    }
  }, [activeBoardMedium, selectedBoardMedium?.boardId, selectedBoardMedium?.mediumId]);

  const yearLabel = currentYear?.id
    ? academicYearLabel(currentYear as Record<string, any>)
    : 'No academic year selected';

  return (
    <Card
      component="section"
      aria-labelledby="outstanding-fees-title"
      variant="outlined"
      sx={{ height: '100%', boxShadow: 'none' }}
    >
      <CardHeader
        title={
          <Typography id="outstanding-fees-title" variant="h6">
            Outstanding Fees by Class
          </Typography>
        }
        subheader={`Current academic year · ${yearLabel}`}
        action={
          options.length ? (
            <BoardMediumDropdown
              value={activeBoardMedium}
              onChange={setSelectedBoardMedium}
              minWidth={240}
            />
          ) : null
        }
        sx={{
          p: 2,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          '& .MuiCardHeader-content': { minWidth: 0 },
          '& .MuiCardHeader-action': { m: 0, width: { xs: '100%', md: 'auto' } },
        }}
      />
      {!options.length && (
        <Typography role="status" variant="body2" color="text.secondary" sx={{ px: 2, pb: 2 }}>
          No board and medium options are available for this year.
        </Typography>
      )}
      <Divider />
      <CardContent sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Total outstanding
            </Typography>
            <Typography component="p" variant="h6" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatNumber(financeExposurePreview.outstanding, 'INR')}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Overdue
            </Typography>
            <Typography component="p" variant="h6" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatNumber(financeExposurePreview.overdue, 'INR')}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Students with overdue fees
            </Typography>
            <Typography component="p" variant="h6">
              {financeExposurePreview.overdueStudents}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
      <Divider />
      <TableContainer sx={{ maxWidth: '100%' }}>
        <Table size="small" aria-label="Outstanding fees by class" sx={{ minWidth: 580 }}>
          <TableHead>
            <TableRow>
              <TableCell>Class</TableCell>
              <TableCell align="right">Outstanding</TableCell>
              <TableCell align="right">Overdue</TableCell>
              <TableCell align="right">Separate charges</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {financeExposurePreview.classes.map((item) => (
              <TableRow key={item.className} hover>
                <TableCell component="th" scope="row">
                  <Typography variant="subtitle2">{item.className}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.students} students overdue
                  </Typography>
                </TableCell>
                <TableCell align="right">{formatNumber(item.outstanding, 'INR')}</TableCell>
                <TableCell align="right">{formatNumber(item.overdue, 'INR')}</TableCell>
                <TableCell align="right">{formatNumber(item.charges, 'INR')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Divider />
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        spacing={0.5}
        sx={{ p: 2 }}
      >
        <Typography variant="caption" color="text.secondary">
          Separate charges total: {formatNumber(financeExposurePreview.separateCharges, 'INR')}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          The activity date filter does not change these year totals.
        </Typography>
      </Stack>
    </Card>
  );
}
