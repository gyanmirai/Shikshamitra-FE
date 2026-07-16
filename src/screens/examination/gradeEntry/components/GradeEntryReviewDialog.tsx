import React from 'react';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Grid,
  List,
  Stack,
  Alert,
  Button,
  Dialog,
  ListItem,
  Typography,
  DialogTitle,
  ListItemText,
  ListItemIcon,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';

interface ValidationIssue {
  code: string;
  message: string;
  studentId?: string;
  studentName?: string;
}

interface GradeEntryReviewDialogProps {
  open: boolean;
  onClose: () => void;
  stats: {
    totalCount: number;
    gradedCount: number;
    pendingCount: number;
    passCount: number;
    failCount: number;
    averageMarks: number;
    highestMarks: number;
    lowestMarks: number;
  };
  validation: {
    isValid: boolean;
    blockers: ValidationIssue[];
    warnings: ValidationIssue[];
  };
  onFix: (studentId: string) => void;
  onSubmit: () => void;
  submitLabel: string;
  isSubmitLoading?: boolean;
}

export const GradeEntryReviewDialog: React.FC<GradeEntryReviewDialogProps> = ({
  open,
  onClose,
  stats,
  validation,
  onFix,
  onSubmit,
  submitLabel,
  isSubmitLoading = false,
}) => {
  const passPct =
    stats.gradedCount > 0 ? Math.round((stats.passCount / stats.gradedCount) * 100) : 0;
  const failPct =
    stats.gradedCount > 0 ? Math.round((stats.failCount / stats.gradedCount) * 100) : 0;
  const completionPct =
    stats.totalCount > 0 ? Math.round((stats.gradedCount / stats.totalCount) * 100) : 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="solar:clipboard-check-bold" width={24} sx={{ color: 'primary.main' }} />
          <Typography variant="h6">Review Grade Entry & Result Readiness</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{ bgcolor: (theme) => `rgba(${theme.palette.grey['500Channel']} / 0.02)` }}
      >
        {/* Completion Progress Banner */}
        <Box
          sx={{
            mb: 3,
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Grade Entry Progress
            </Typography>
            <Typography variant="subtitle2" color="primary" fontWeight={700}>
              {completionPct}% Complete ({stats.gradedCount} / {stats.totalCount} Graded)
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={completionPct}
            color="primary"
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        <Grid container spacing={1}>
          {/* Left Column: Grade Entry Statistics */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="overline"
              color="text.secondary"
              display="block"
              sx={{ mb: 1.5, letterSpacing: 1 }}
            >
              Marks Summary KPIs
            </Typography>
            <Grid container spacing={1}>
              {[
                {
                  label: 'Highest Marks',
                  value: stats.highestMarks,
                  icon: 'solar:arrow-up-bold',
                  color: 'success.main',
                },
                {
                  label: 'Lowest Marks',
                  value: stats.lowestMarks,
                  icon: 'solar:arrow-down-bold',
                  color: 'error.main',
                },
                {
                  label: 'Average Marks',
                  value: stats.averageMarks,
                  icon: 'solar:graph-new-bold',
                  color: 'info.main',
                },
                {
                  label: 'Total Present',
                  value: stats.gradedCount,
                  icon: 'solar:user-bold',
                  color: 'text.primary',
                },
              ].map((stat) => (
                <Grid size={{ xs: 6 }} key={stat.label}>
                  <Stack
                    spacing={1}
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: 'background.paper',
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify icon={stat.icon} width={16} sx={{ color: stat.color }} />
                      <Typography variant="caption" color="text.secondary">
                        {stat.label}
                      </Typography>
                    </Stack>
                    <Typography variant="h6" fontWeight={800}>
                      {stat.value}
                    </Typography>
                  </Stack>
                </Grid>
              ))}
            </Grid>

            {/* Pass/Fail Distribution */}
            <Box
              sx={{
                mt: 2.5,
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 1.5,
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1.5 }} fontWeight={700}>
                Pass / Fail Distribution
              </Typography>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="success.main" fontWeight={600}>
                    Passed Students
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {stats.passCount} ({passPct}%)
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={passPct}
                  color="success"
                  sx={{ height: 6, borderRadius: 3 }}
                />

                <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                  <Typography variant="body2" color="error.main" fontWeight={600}>
                    Failed Students
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {stats.failCount} ({failPct}%)
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={failPct}
                  color="error"
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Stack>
            </Box>
          </Grid>

          {/* Right Column: Validation Issues & Blocker Checks */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="overline"
              color="text.secondary"
              display="block"
              sx={{ mb: 1.5, letterSpacing: 1 }}
            >
              Result Readiness Validation
            </Typography>

            {/* Blocker alert */}
            {validation.blockers.length > 0 ? (
              <Alert
                severity="error"
                sx={{ mb: 2 }}
                icon={<Iconify icon="solar:shield-warning-bold" />}
              >
                <Typography variant="subtitle2" fontWeight={700}>
                  {validation.blockers.length} Blocker(s) Found
                </Typography>
                <Typography variant="caption">
                  You must fix all blockers before submitting marks.
                </Typography>
              </Alert>
            ) : (
              <Alert
                severity="success"
                sx={{ mb: 2 }}
                icon={<Iconify icon="solar:shield-check-bold" />}
              >
                No validation blockers. Ready for submission.
              </Alert>
            )}

            {/* Detailed list of Blockers & Warnings */}
            <Box
              sx={{
                maxHeight: 220,
                overflowY: 'auto',
                p: 1,
                bgcolor: 'background.paper',
                borderRadius: 1.5,
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <List disablePadding>
                {/* Blockers List */}
                {validation.blockers.map((issue, idx) => (
                  <ListItem
                    key={`b-${idx}`}
                    sx={{
                      py: 1,
                      borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                      '&:last-child': { borderBottom: 'none' },
                    }}
                    secondaryAction={
                      issue.studentId && (
                        <Button
                          size="small"
                          color="error"
                          variant="text"
                          onClick={() => onFix(issue.studentId!)}
                        >
                          Fix
                        </Button>
                      )
                    }
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Iconify icon="solar:close-circle-bold" sx={{ color: 'error.main' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={issue.message}
                      primaryTypographyProps={{
                        variant: 'body2',
                        fontWeight: 600,
                        color: 'error.main',
                      }}
                    />
                  </ListItem>
                ))}

                {/* Warnings List */}
                {validation.warnings.map((issue, idx) => (
                  <ListItem
                    key={`w-${idx}`}
                    sx={{
                      py: 1,
                      borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                      '&:last-child': { borderBottom: 'none' },
                    }}
                    secondaryAction={
                      issue.studentId && (
                        <Button
                          size="small"
                          color="warning"
                          variant="text"
                          onClick={() => onFix(issue.studentId!)}
                        >
                          View
                        </Button>
                      )
                    }
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Iconify icon="solar:danger-bold" sx={{ color: 'warning.main' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={issue.message}
                      primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }}
                    />
                  </ListItem>
                ))}

                {validation.blockers.length === 0 && validation.warnings.length === 0 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ p: 2, textAlign: 'center' }}
                  >
                    All validation checks passed! No issues detected.
                  </Typography>
                )}
              </List>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Back to Entry
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          color="primary"
          disabled={!validation.isValid}
          loading={isSubmitLoading}
          sx={{ px: 3 }}
        >
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
