'use client';

import type { RootState } from 'src/redux/store';
import type { AssessmentRubricDto } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { academicPermissions } from 'src/constants/academic-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { TimetableSettingsSummaryCards } from 'src/screens/academic/components/AcademicSummaryInsights';
import {
  Box,
  Card,
  Grid,
  Paper,
  Stack,
  Button,
  Typography,
  DialogActions,
} from '@mui/material';
import {
  RubricStatus,
  useGetRubricsQuery,
  useAddRubricMutation,
  useArchiveRubricMutation,
  usePublishRubricMutation,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import RubricConfigForm from './rubricConfigForm';
import RubricConfigTable from './rubricConfigTable';
import { RubricTemplatePreview } from './components/RubricTemplatePreview';
import {
  RUBRIC_STATUS_LABELS,
  RUBRIC_WORK_TYPE_LABELS,
  RUBRIC_SCORING_MODEL_LABELS,
} from './constants';

const RubricConfigScreen = () => {
  const addDialog = useBoolean();
  const insightsDrawer = useBoolean();
  const archiveDialog = useBoolean();
  const previewDialog = useBoolean();
  const usageDialog = useBoolean();
  const [selectedData, setSelectedData] = useState<AssessmentRubricDto | null>(null);
  const [statusFilter, setStatusFilter] = useState<RubricStatus | 'all'>('all');

  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const { permissions } = useSelector((state: RootState) => state.auth);

  const canAdd = hasGrantedPermission(
    permissions,
    `${academicPermissions.homework.settings.rubricConfig}.Add`
  );
  const canDelete = hasGrantedPermission(
    permissions,
    `${academicPermissions.homework.settings.rubricConfig}.Delete`
  );

  const {
    data: rubricData = [],
    isLoading,
    isFetching,
  } = useGetRubricsQuery(
    { academicMediumId: currentMedium?.id, isTemplate: true },
    { skip: !currentMedium?.id }
  );
  const { data: allRubrics = [] } = useGetRubricsQuery(
    { academicMediumId: currentMedium?.id },
    { skip: !currentMedium?.id }
  );

  const [addRubric, { isLoading: isDuplicating }] = useAddRubricMutation();
  const [publishRubric, { isLoading: isPublishing }] = usePublishRubricMutation();
  const [archiveRubric, { isLoading: isArchiving }] = useArchiveRubricMutation();

  const handleClose = (_event: unknown, isSubmit?: boolean) => {
    addDialog.onFalse();
    setSelectedData(null);
  };

  const activeRubrics = rubricData.filter((rubric) => rubric.status === RubricStatus.Published);
  const draftRubrics = rubricData.filter((rubric) => rubric.status === RubricStatus.Draft);
  const archivedRubrics = rubricData.filter((rubric) => rubric.status === RubricStatus.Archived);
  const linkedRubrics = allRubrics.filter(
    (rubric) => !rubric.isTemplate && rubric.sourceTemplateId
  );
  const usageCountByTemplate = linkedRubrics.reduce<Record<string, number>>((usageMap, rubric) => {
    if (!rubric.sourceTemplateId) return usageMap;
    return {
      ...usageMap,
      [rubric.sourceTemplateId]: (usageMap[rubric.sourceTemplateId] || 0) + 1,
    };
  }, {});
  const tableData = rubricData
    .filter((rubric) => statusFilter === 'all' || rubric.status === statusFilter)
    .map((rubric) => ({
      ...rubric,
      usageCount: usageCountByTemplate[rubric.id] || 0,
    }));

  const duplicateRubric = async (rubric: AssessmentRubricDto, title: string) => {
    try {
      await addRubric({
        standardId: null,
        subjectId: null,
        academicMediumId: rubric.academicMediumId || currentMedium?.id || null,
        homeworkId: null,
        assignmentId: null,
        homeworkTypeId: rubric.homeworkTypeId,
        assignmentTypeId: rubric.assignmentTypeId,
        isTemplate: true,
        appliesToWorkType: rubric.appliesToWorkType,
        scoringModel: rubric.scoringModel,
        visibility: rubric.visibility,
        title,
        description: rubric.description,
        evaluationInstructions: rubric.evaluationInstructions,
        studentInstructions: rubric.studentInstructions,
        tags: rubric.tags || [],
        performanceLevels: rubric.performanceLevels || [],
        criteria: rubric.criteria.map((criterion, index) => ({
          title: criterion.title,
          description: criterion.description,
          studentDescription: criterion.studentDescription,
          teacherGuidance: criterion.teacherGuidance,
          isRequired: criterion.isRequired,
          maxMarks: criterion.maxMarks,
          displayOrder: index + 1,
        })),
      }).unwrap();
      shikshaMitraToast.success({ message: 'Rubric template duplicated as draft.' });
    } catch (error: unknown) {
      const apiError = error as { data?: { message?: string; detail?: string } };
      shikshaMitraToast.error({
        message:
          apiError.data?.detail || apiError.data?.message || 'Failed to duplicate rubric template.',
      });
    }
  };

  const isFormOpen = addDialog.value && canAdd;

  return (
    <Box height="100%" display="flex" flexDirection="column">
      {/* Breadcrumbs — adapt based on form/list state, like SubjectBreadcrumbs */}
      {isFormOpen ? (
        <CustomBreadcrumbs
          heading={selectedData ? 'Update Rubric Template' : 'Create Rubric Template'}
          description={
            selectedData
              ? 'Revise the rubric template details, scoring model, and criteria to keep your assessment framework up to date.'
              : 'Build a reusable scoring rubric by defining a name, scoring model, performance levels, and evaluation criteria.'
          }
          isBack
          onBack={() => handleClose(null, false)}
          links={[
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Homework & Assignment' },
            { name: 'Settings' },
            { name: 'Rubric Templates', href: undefined },
          ]}
          sx={{ px: 1 }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Rubric Templates"
          links={[
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Homework & Assignment' },
            { name: 'Settings' },
            { name: 'Rubric Templates' },
          ]}
          description="Create reusable scoring frameworks for homework, assignments, projects, practicals, presentations, and academic activities."
          action={
            <Stack direction="row" alignItems="center" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<Iconify icon="solar:chart-2-outline" width={18} />}
                onClick={insightsDrawer.onTrue}
              >
                View full insights
              </Button>
              {canAdd && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Iconify icon="mdi:plus" />}
                  aria-label="Add Rubric Template"
                  onClick={addDialog.onTrue}
                  sx={{ px: '32px' }}
                >
                  Rubric Template
                </Button>
              )}
            </Stack>
          }
        />
      )}

      {/* Form view — inline Card replacing the old dialog */}
      {isFormOpen ? (
        <Card sx={{ flex: 1, minHeight: 0, boxShadow: 'var(--shadows-4)', overflow: 'hidden' }}>
          <RubricConfigForm editData={selectedData} onClose={handleClose} />
        </Card>
      ) : (
        <>
          {/* KPI summary cards */}
          <TimetableSettingsSummaryCards
            open={insightsDrawer.value}
            onClose={insightsDrawer.onFalse}
            hideTrigger
            cards={[
              {
                label: 'Total Templates',
                value: rubricData.length,
                icon: 'solar:document-bold',
                color: 'primary',
              },
              {
                label: 'Published',
                value: activeRubrics.length,
                icon: 'mdi:check-circle-outline',
                color: 'success',
              },
              {
                label: 'Draft',
                value: draftRubrics.length,
                icon: 'mdi:file-document-edit-outline',
                color: 'warning',
              },
              {
                label: 'In Use',
                value: linkedRubrics.length,
                icon: 'solar:link-circle-bold',
                color: 'info',
              },
              {
                label: 'Used This Term',
                value: linkedRubrics.length,
                icon: 'solar:calendar-mark-bold',
                color: 'primary',
              },
              {
                label: 'Archived',
                value: archivedRubrics.length,
                icon: 'solar:archive-bold',
                color: 'error',
              },
            ]}
          />

          <RubricConfigTable
            data={tableData}
            isLoading={isLoading || isFetching}
            canAdd={canAdd}
            canDelete={canDelete}
            onEdit={(row) => {
              setSelectedData(row);
              addDialog.onTrue();
            }}
            onDuplicate={(row) => duplicateRubric(row, `${row.title} Copy`)}
            onVersion={(row) => duplicateRubric(row, `${row.title} Version ${row.version + 1}`)}
            onPreview={(row) => {
              setSelectedData(row);
              previewDialog.onTrue();
            }}
            onUsage={(row) => {
              setSelectedData(row);
              usageDialog.onTrue();
            }}
            onPublish={async (row) => {
              try {
                await publishRubric(row.id).unwrap();
                shikshaMitraToast.success({ message: 'Rubric template published successfully.' });
              } catch (error: unknown) {
                const apiError = error as { data?: { message?: string; detail?: string } };
                shikshaMitraToast.error({
                  message:
                    apiError.data?.detail ||
                    apiError.data?.message ||
                    'Failed to publish rubric template.',
                });
              }
            }}
            onArchive={(row) => {
              setSelectedData(row);
              archiveDialog.onTrue();
            }}
          />
        </>
      )}

      <CustomDialog
        open={previewDialog.value}
        handleClose={() => {
          setSelectedData(null);
          previewDialog.onFalse();
        }}
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" fontWeight={700}>
              {selectedData?.title || 'Rubric'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="You can view rubric template details and preview them here."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        maxWidth="md"
      >
        <DialogScrollContent>
          <Stack spacing={2.5} sx={{ py: 1 }}>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              <Label
                variant="soft"
                color={selectedData?.appliesToWorkType === 0 ? 'info' : 'secondary'}
                sx={{ py: 1.5, px: 1.5, borderRadius: 1, textTransform: 'capitalize' }}
                startIcon={
                  <Iconify
                    icon={
                      selectedData?.appliesToWorkType === 0
                        ? 'solar:document-bold'
                        : 'solar:bill-list-bold'
                    }
                  />
                }
              >
                {selectedData?.appliesToWorkType !== undefined &&
                  selectedData?.appliesToWorkType !== null
                  ? RUBRIC_WORK_TYPE_LABELS[selectedData.appliesToWorkType]
                  : 'Homework & Assignment'}
              </Label>
              <Label
                variant="soft"
                color="success"
                sx={{ py: 1.5, px: 1.5, borderRadius: 1 }}
                startIcon={<Iconify icon="solar:calculator-bold" />}
              >
                {selectedData
                  ? RUBRIC_SCORING_MODEL_LABELS[selectedData.scoringModel] ||
                  selectedData.scoringModel
                  : 'Points-Based'}
              </Label>
              <Label
                variant="soft"
                color={
                  selectedData?.status === 1
                    ? 'success'
                    : selectedData?.status === 0
                      ? 'warning'
                      : 'default'
                }
                sx={{ py: 1.5, px: 1.5, borderRadius: 1 }}
                startIcon={<Iconify icon="solar:shield-check-bold" />}
              >
                {selectedData ? RUBRIC_STATUS_LABELS[selectedData.status] : 'Draft'}
              </Label>
              <Label
                variant="filled"
                color="primary"
                sx={{ py: 1.5, px: 1.5, borderRadius: 1 }}
                startIcon={<Iconify icon="solar:medal-ribbon-star-bold" />}
              >
                {selectedData?.totalMarks || 0} Points Max
              </Label>
            </Stack>

            {selectedData && (
              <Box component="section" aria-label="Rubric template preview">
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                  Rubric template preview
                </Typography>
                <RubricTemplatePreview
                  scoringModel={selectedData.scoringModel}
                  criteria={[...selectedData.criteria].sort(
                    (first, second) => first.displayOrder - second.displayOrder
                  )}
                  performanceLevels={selectedData.performanceLevels}
                />
              </Box>
            )}

            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 1.5,
                bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.02),
                border: (theme) =>
                  `1px dashed ${varAlpha(theme.vars.palette.primary.mainChannel, 0.2)}`,
                display: 'flex',
                gap: 1.5,
                alignItems: 'flex-start',
              }}
            >
              <Iconify
                icon="solar:info-circle-bold-duotone"
                sx={{ color: 'primary.main', mt: 0.25 }}
                width={20}
                height={20}
              />
              <Stack spacing={0.5} width="100%">
                <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                  Instructions for Students & Evaluators
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                  {selectedData?.studentInstructions ||
                    selectedData?.description ||
                    'No student-facing instructions or description added for this template.'}
                </Typography>
              </Stack>
            </Paper>
          </Stack>
        </DialogScrollContent>
        <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="mdi:close" />}
            size="small"
            onClick={() => {
              setSelectedData(null);
              previewDialog.onFalse();
            }}
          >
            Close
          </Button>
        </DialogActions>
      </CustomDialog>
      <CustomDialog
        open={usageDialog.value}
        handleClose={() => {
          setSelectedData(null);
          usageDialog.onFalse();
        }}
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" fontWeight={700}>
              Rubric Usage
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="You can view rubric usage details here."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        maxWidth="md"
      >
        <DialogScrollContent>
          <Stack spacing={1.5}>
            <Grid container spacing={1}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Used In
                  </Typography>
                  <Typography variant="h6">
                    {selectedData ? usageCountByTemplate[selectedData.id] || 0 : 0}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Evaluated Submissions
                  </Typography>
                  <Typography variant="h6">-</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Last Used
                  </Typography>
                  <Typography variant="h6">-</Typography>
                </Paper>
              </Grid>
            </Grid>
            <Typography variant="body2" color="text.secondary">
              Detailed submission and teacher-level usage requires a dedicated backend usage
              endpoint. Current usage is counted from task rubrics copied from this template.
            </Typography>
          </Stack>
        </DialogScrollContent>
        <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="mdi:close" />}
            size="small"
            onClick={() => {
              setSelectedData(null);
              usageDialog.onFalse();
            }}
          >
            Close
          </Button>
        </DialogActions>
      </CustomDialog>
      <ConfirmDialog
        open={archiveDialog.value}
        disableBackdropClick
        onClose={() => {
          setSelectedData(null);
          archiveDialog.onFalse();
        }}
        title="Archive"
        content={
          <>
            Are you sure you want to archive rubric template <strong>{selectedData?.title}</strong>?
          </>
        }
        action={
          <LoadingButton
            loading={isArchiving || isPublishing || isDuplicating}
            variant="contained"
            color="error"
            size="small"
            onClick={async () => {
              if (!selectedData) return;
              try {
                await archiveRubric(selectedData.id).unwrap();
                shikshaMitraToast.success({ message: 'Rubric template archived successfully.' });
              } catch (error: unknown) {
                const apiError = error as { data?: { message?: string; detail?: string } };
                shikshaMitraToast.error({
                  message:
                    apiError.data?.detail ||
                    apiError.data?.message ||
                    'Failed to archive rubric template.',
                });
              }
              archiveDialog.onFalse();
              setSelectedData(null);
            }}
          >
            Archive
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default RubricConfigScreen;
