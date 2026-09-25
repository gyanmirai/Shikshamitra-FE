import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Paper,
  Stack,
  Button,
  IconButton,
  Typography,
  DialogActions,
  LinearProgress,
} from '@mui/material';

import { getReadinessSetupAction } from '../readinessChecklistActions';

export type ReadinessChecklistDivision = {
  divisionName: string;
  readinessScore: number;
  missingItems: string[];
};

type Props = {
  open: boolean;
  className: string;
  division: ReadinessChecklistDivision | null;
  onClose: () => void;
};

export function ReadinessChecklistDialog({ open, className, division, onClose }: Props) {
  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      maxWidth="sm"
      hasForm={false}
      title={
        <Box display="flex" alignItems="center" gap={1}>
          <Iconify icon="lucide:alert-triangle" color="warning.main" width={22} />
          Readiness Checklist
          <CustomTooltip
            arrow
            placement="right"
            title="View the prerequisite checklist required before publishing a timetable for this division."
          >
            <IconButton size="small" color="info" aria-label="About timetable readiness">
              <Iconify icon="lucide:info" width={18} />
            </IconButton>
          </CustomTooltip>
        </Box>
      }
    >
      <DialogScrollContent>
        {division && (
          <Stack spacing={2}>
            <Box>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                spacing={0.5}
                sx={{ mb: 1 }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Class {className} · Division {division.divisionName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {division.readinessScore}% ready
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={division.readinessScore}
                color={division.readinessScore === 100 ? 'success' : 'warning'}
                sx={{ height: 6, borderRadius: 1 }}
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Pending setup items
              </Typography>
              <Stack spacing={1}>
                {division.missingItems.map((item) => {
                  const action = getReadinessSetupAction(item);

                  return (
                    <Paper
                      key={item}
                      variant="outlined"
                      sx={{
                        p: 1.25,
                        display: 'flex',
                        alignItems: { xs: 'stretch', sm: 'center' },
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        gap: 1,
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                        <Iconify
                          icon="lucide:circle-alert"
                          color="error.main"
                          width={18}
                          sx={{ flexShrink: 0 }}
                        />
                        <Typography variant="body2">{item}</Typography>
                      </Stack>
                      {action && (
                        <Button
                          component={RouterLink}
                          href={action.href}
                          size="small"
                          variant="text"
                          onClick={onClose}
                          endIcon={<Iconify icon="lucide:arrow-right" width={16} />}
                          aria-label={`${action.label}: ${item}`}
                          sx={{ flexShrink: 0, alignSelf: { xs: 'flex-end', sm: 'center' } }}
                        >
                          {action.label}
                        </Button>
                      )}
                    </Paper>
                  );
                })}
              </Stack>
            </Box>
          </Stack>
        )}
      </DialogScrollContent>
      <DialogActions>
        <Button
          onClick={onClose}
          variant="contained"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.approvedIcon} />}
        >
          Okay
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
