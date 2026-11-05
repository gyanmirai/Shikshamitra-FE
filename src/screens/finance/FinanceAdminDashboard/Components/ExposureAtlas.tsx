'use client';

import type { RootState } from 'src/redux/store';
import type { BoardMediumOption } from 'src/components/boardMediumDropdown';

import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { fCurrency } from 'src/utils/format-number';
import { useMemo, useState, useEffect } from 'react';
import BoardMediumDropdown from 'src/components/boardMediumDropdown';
import { Box, Paper, Stack, Divider, Typography, LinearProgress } from '@mui/material';

import { financeExposurePreview } from '../finance-admin-dashboard-preview-data';

function academicYearLabel(year: Record<string, any>) {
  if (year.name || year.academicYearName || year.yearName) {
    return year.name || year.academicYearName || year.yearName;
  }

  const start = year.startDate ? new Date(year.startDate).getFullYear() : '';
  const end = year.endDate ? new Date(year.endDate).getFullYear() : '';
  return start && end ? `AY ${  start  }–${  end}` : 'Selected academic year';
}

export default function ExposureAtlas() {
  const theme = useTheme();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const options = useMemo<BoardMediumOption[]>(
    () =>
      (currentYear?.boards ?? []).flatMap((board: any) =>
        (board.educationMediums ?? []).map((medium: any) => ({
          label: `${board.name  } / ${  medium.name}`,
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

  const maxOutstanding = financeExposurePreview.classes[0].outstanding;

  return (
    <Paper component="section" aria-labelledby="exposure-atlas-title" variant="outlined">
      <Box
        sx={{
          p: { xs: 2, md: 3 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          gap: 2,
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        <Box>
          <Typography id="exposure-atlas-title" variant="h6">
            Exposure Atlas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Move from the selected academic year into its board, medium and class balances.
          </Typography>
        </Box>
        {options.length ? (
          <BoardMediumDropdown
            value={activeBoardMedium}
            onChange={setSelectedBoardMedium}
            minWidth={260}
          />
        ) : (
          <Typography role="status" variant="body2" color="text.secondary">
            This academic year has no board and medium options.
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          px: { xs: 2, md: 3 },
          pb: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Scope path
        </Typography>
        <Typography variant="caption" fontWeight={700}>
          {currentYear?.id ? academicYearLabel(currentYear as Record<string, any>) : 'No year selected'}
        </Typography>
        {activeBoardMedium && (
          <>
            <Typography aria-hidden variant="caption" color="text.disabled">
              /
            </Typography>
            <Typography variant="caption" fontWeight={700}>
              {activeBoardMedium.label}
            </Typography>
            <Typography aria-hidden variant="caption" color="text.disabled">
              /
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Class
            </Typography>
          </>
        )}
      </Box>

      <Divider />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, minmax(0, 1fr))' },
          gap: { xs: 1.5, sm: 3 },
          px: { xs: 2, md: 3 },
          py: 2,
          bgcolor: 'action.hover',
        }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary">
            Outstanding · year snapshot
          </Typography>
          <Typography variant="h6">{fCurrency(financeExposurePreview.outstanding)}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Overdue · included above
          </Typography>
          <Typography variant="h6" color="error.main">
            {fCurrency(financeExposurePreview.overdue)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Students with overdue balances
          </Typography>
          <Typography variant="h6">{financeExposurePreview.overdueStudents}</Typography>
        </Box>
      </Box>

      <Box role="table" aria-label="Class-wise finance exposure for selected board and medium">
        <Box
          role="row"
          sx={{
            px: { xs: 2, md: 3 },
            py: 1.25,
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr 1fr',
              md: 'minmax(120px, 1.1fr) minmax(110px, 1fr) minmax(110px, 1fr) minmax(95px, 0.75fr)',
            },
            gap: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography role="columnheader" variant="caption" color="text.secondary" fontWeight={700}>
            CLASS
          </Typography>
          <Typography
            role="columnheader"
            variant="caption"
            color="text.secondary"
            textAlign="right"
            fontWeight={700}
          >
            OUTSTANDING
          </Typography>
          <Typography
            role="columnheader"
            variant="caption"
            color="text.secondary"
            textAlign="right"
            fontWeight={700}
            sx={{ display: { xs: 'none', md: 'block' } }}
          >
            OVERDUE
          </Typography>
          <Typography
            role="columnheader"
            variant="caption"
            color="text.secondary"
            textAlign="right"
            fontWeight={700}
            sx={{ display: { xs: 'none', md: 'block' } }}
          >
            SEPARATE CHARGES
          </Typography>
        </Box>

        {financeExposurePreview.classes.map((item) => (
          <Box
            key={item.className}
            role="row"
            sx={{
              px: { xs: 2, md: 3 },
              py: 1.5,
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr 1fr',
                md: 'minmax(120px, 1.1fr) minmax(110px, 1fr) minmax(110px, 1fr) minmax(95px, 0.75fr)',
              },
              gap: 1,
              alignItems: 'center',
              borderBottom: '1px solid',
              borderColor: 'divider',
              '&:last-child': { borderBottom: 0 },
            }}
          >
            <Box role="rowheader">
              <Typography variant="subtitle2">{item.className}</Typography>
              <Typography variant="caption" color="text.secondary">
                {item.students} students with overdue balances
              </Typography>
            </Box>
            <Box role="cell" sx={{ textAlign: 'right' }}>
              <Typography variant="body2" fontWeight={600}>
                {fCurrency(item.outstanding)}
              </Typography>
              <LinearProgress
                aria-label={`${item.className  } share of outstanding exposure`}
                variant="determinate"
                value={(item.outstanding / maxOutstanding) * 100}
                sx={{
                  mt: 0.5,
                  ml: 'auto',
                  width: '72%',
                  height: 4,
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                  '& .MuiLinearProgress-bar': { backgroundColor: theme.palette.primary.main },
                }}
              />
            </Box>
            <Typography
              role="cell"
              variant="body2"
              textAlign="right"
              sx={{ display: { xs: 'none', md: 'block' } }}
            >
              {fCurrency(item.overdue)}
            </Typography>
            <Typography
              role="cell"
              variant="body2"
              textAlign="right"
              sx={{ display: { xs: 'none', md: 'block' } }}
            >
              {fCurrency(item.charges)}
            </Typography>
          </Box>
        ))}
      </Box>

      <Divider />
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        spacing={0.5}
        sx={{ px: { xs: 2, md: 3 }, py: 1.5 }}
      >
        <Typography variant="caption" color="text.secondary">
          Separate charges across classes: {fCurrency(financeExposurePreview.separateCharges)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Current selected-year snapshot · not reconstructed for the activity date range
        </Typography>
      </Stack>
    </Paper>
  );
}
