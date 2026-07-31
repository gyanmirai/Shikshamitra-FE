import React from 'react';
import { Iconify } from 'src/components/iconify';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import SubmitButton from 'src/components/submit-button';
import CancelButton from 'src/components/cancel-button';
import { Scrollbar } from 'src/components/scrollbar';
import {
  Box,
  Grid,
  List,
  Stack,
  Alert,
  ListItem,
  Typography,
  ListItemText,
  ListItemIcon,
  DialogActions,
  LinearProgress,
  Button,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

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

  const statItems = [
    {
      label: 'Highest Marks',
      value: stats.highestMarks,
      icon: 'solar:arrow-up-bold',
      color: 'success',
    },
    {
      label: 'Lowest Marks',
      value: stats.lowestMarks,
      icon: 'solar:arrow-down-bold',
      color: 'error',
    },
    {
      label: 'Average Marks',
      value: stats.averageMarks,
      icon: 'solar:graph-new-bold',
      color: 'info',
    },
    {
      label: 'Total Present',
      value: stats.gradedCount,
      icon: 'solar:user-bold',
      color: 'primary',
    },
  ];

  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      title={
        <Box display="flex" flexDirection="row" gap={1.25} alignItems="center" component="span" sx={{ fontWeight: 'normal' }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.main',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
            }}
          >
            <Iconify icon="solar:clipboard-check-bold" width={20} height={20} />
          </Box>
          <Box component="span" sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
            Review Grade Entry & Result Readiness
          </Box>
        </Box>
      }
      maxWidth="md"
      hasForm={false}
    >
      <DialogScrollContent
        sx={{
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.02),
          p: 3,
        }}
      >
        {/* Completion Progress Banner */}
        <Box
          sx={{
            mb: 2,
            p: 1.25,
            bgcolor: 'background.paper',
            borderRadius: 1.5,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            boxShadow: (theme) => `0 4px 12px 0 ${alpha(theme.palette.grey[500], 0.02)}`,
          }}
        >
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Grade Entry Progress
            </Typography>
            <Typography variant="subtitle2" color="primary" fontWeight={700}>
              {completionPct}% Complete ({stats.gradedCount} Graded / {stats.totalCount} Total)
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={completionPct}
            color="primary"
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
            }}
          />
        </Box>

        <Grid container spacing={2} alignItems="stretch">
          {/* Left Column: Grade Entry Statistics */}
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography
                variant="overline"
                color="text.secondary"
                display="block"
                sx={{ mb: 1, letterSpacing: 1 }}
              >
                Marks Summary KPIs
              </Typography>
              <Grid container spacing={1}>
                {statItems.map((stat) => (
                  <Grid size={{ xs: 6 }} key={stat.label} sx={{ display: 'flex' }}>
                    <Stack
                      direction="row"
                      spacing={1.25}
                      alignItems="center"
                      sx={{
                        p: 1.25,
                        borderRadius: 1.5,
                        bgcolor: 'background.paper',
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        boxShadow: (theme) => `0 4px 12px 0 ${alpha(theme.palette.grey[500], 0.03)}`,
                        width: '100%',
                        height: '100%',
                      }}
                    >
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: (theme) => alpha(theme.palette[stat.color as 'success' | 'error' | 'info' | 'primary'].main, 0.08),
                          color: (theme) => theme.palette[stat.color as 'success' | 'error' | 'info' | 'primary'].main,
                        }}
                      >
                        <Iconify icon={stat.icon} width={18} />
                      </Box>
                      <Stack spacing={0.2}>
                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                          {stat.label}
                        </Typography>
                        <Typography variant="h6" fontWeight={800} lineHeight={1}>
                          {stat.value}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Grid>
                ))}
              </Grid>

              {/* Pass/Fail Distribution */}
              <Box
                sx={{
                  mt: 1.5,
                  p: 1.5,
                  bgcolor: 'background.paper',
                  borderRadius: 1.5,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  boxShadow: (theme) => `0 4px 12px 0 ${alpha(theme.palette.grey[500], 0.03)}`,
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1.25 }} fontWeight={700}>
                  Pass / Fail Distribution
                </Typography>
                <Stack spacing={1.5} sx={{ flexGrow: 1, justifyContent: 'center' }}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
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
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
                      }}
                    />
                  </Box>

                  <Box>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
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
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                      }}
                    />
                  </Box>
                </Stack>
              </Box>
            </Box>
          </Grid>

          {/* Right Column: Validation Issues & Blocker Checks */}
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography
                variant="overline"
                color="text.secondary"
                display="block"
                sx={{ mb: 0.75, letterSpacing: 1 }}
              >
                Result Readiness Validation
              </Typography>

              {/* Blocker alert */}
              {validation.blockers.length > 0 ? (
                <Alert
                  severity="error"
                  sx={{
                    mb: 1.5,
                    borderRadius: 1.5,
                    border: (theme) => `1px solid ${theme.palette.error.light}`,
                    bgcolor: (theme) => alpha(theme.palette.error.main, 0.03),
                  }}
                  icon={<Iconify icon="solar:shield-warning-bold" width={24} />}
                >
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'error.dark' }}>
                    {validation.blockers.length} Blocker(s) Found
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    You must fix all blockers before submitting marks.
                  </Typography>
                </Alert>
              ) : (
                <Alert
                  severity="success"
                  sx={{
                    mb: 1.5,
                    borderRadius: 1.5,
                    border: (theme) => `1px solid ${theme.palette.success.light}`,
                    bgcolor: (theme) => alpha(theme.palette.success.main, 0.03),
                  }}
                  icon={<Iconify icon="solar:shield-check-bold" width={24} />}
                >
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'success.dark' }}>
                    No validation blockers
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    All mandatory validation checks passed. Ready for submission.
                  </Typography>
                </Alert>
              )}

              {/* Detailed list of Blockers & Warnings */}
              <Box
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 1.5,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  boxShadow: (theme) => `0 4px 12px 0 ${alpha(theme.palette.grey[500], 0.03)}`,
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 220,
                }}
              >
                <Box
                  sx={{
                    p: 1.25,
                    borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                    bgcolor: (theme) => alpha(theme.palette.grey[500], 0.01),
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={700}>
                    Validation Checks Detail
                  </Typography>
                </Box>
                <Box sx={{ flexGrow: 1, overflow: 'hidden', p: 0.5, display: 'flex', flexDirection: 'column' }}>
                  <Scrollbar sx={{ flexGrow: 1, height: '50px' }}>
                    <List disablePadding>
                      {/* Blockers List */}
                      {validation.blockers.map((issue, idx) => (
                        <ListItem
                          key={`b-${idx}`}
                          sx={{
                            py: 0.5,
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
                                sx={{ fontWeight: 700 }}
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
                            py: 0.5,
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
                                sx={{ fontWeight: 700 }}
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
                            primaryTypographyProps={{
                              variant: 'body2',
                              color: 'text.primary',
                              fontWeight: 500,
                            }}
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
                  </Scrollbar>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2.5, borderTop: (theme) => `1px solid ${theme.palette.divider}` }}>
        <CancelButton buttonText="Back to Entry" onClick={onClose} />
        <SubmitButton
          buttonText={submitLabel}
          loading={isSubmitLoading}
          disabled={!validation.isValid}
          onClick={onSubmit}
          startIcon={<Iconify icon="solar:plain-bold" />}
        />
      </DialogActions>
    </CustomDialog>)
}
