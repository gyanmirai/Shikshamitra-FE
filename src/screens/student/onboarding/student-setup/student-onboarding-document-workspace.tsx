'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';
import type { DocumentAction } from 'src/screens/student/admissions/document-verification/document-action-model';
import type { useDocumentPermissions } from 'src/screens/student/admissions/document-verification/use-document-permissions';
import type {
  AdmissionDocumentRequirement,
  ApplicationDocumentVerification,
} from 'src/redux/student/admissions/admission-document-types';

import { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
import { shikshaMitraToast } from 'src/components/toast';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Stack, Button, MenuItem, Typography } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { getDocumentTableFile } from 'src/screens/student/admissions/document-verification/document-table-model';
import { documentActionLabels } from 'src/screens/student/admissions/document-verification/document-action-model';
import { useDownloadAdmissionDocumentMutation } from 'src/redux/student/admissions/admission-document-download-api';
import { DocumentEvidenceHistory } from 'src/screens/student/admissions/document-verification/document-evidence-history';
import {
  DocumentStatusLabel,
  documentStatusLabels,
} from 'src/screens/student/admissions/document-verification/document-status';

import { getOnboardingErrorMessage } from './student-onboarding-messages';
import { StudentOnboardingDocumentPreview } from './student-onboarding-document-preview';

type Permissions = ReturnType<typeof useDocumentPermissions>;
type WriteAction = Exclude<DocumentAction, 'waive'>;
function writeActions(
  requirement: AdmissionDocumentRequirement,
  permissions: Permissions,
  readOnly: boolean
): WriteAction[] {
  if (readOnly) return [];
  const actions: WriteAction[] = [];
  if (requirement.canUpload && permissions.upload) actions.push('upload');
  if (requirement.canRecordOriginal && permissions.original) actions.push('original');
  if ((requirement.canAccept ?? requirement.canReview) && permissions.review)
    actions.push('accept');
  if (requirement.canReview && permissions.review) actions.push('reject');
  return actions;
}
const actionIcons: Record<WriteAction, string> = {
  upload: 'mdi:upload',
  original: 'mdi:file-check-outline',
  accept: 'mdi:check',
  reject: 'mdi:undo-variant',
};

function DocumentWorkspaceActions({
  requirement,
  permissions,
  disabled,
  readOnly,
  onAction,
  onView,
  onHistory,
}: {
  requirement: AdmissionDocumentRequirement;
  permissions: Permissions;
  disabled: boolean;
  readOnly: boolean;
  onAction: (action: DocumentAction, requirement: AdmissionDocumentRequirement) => void;
  onView: () => void;
  onHistory: () => void;
}) {
  const [download, { isLoading: downloading }] = useDownloadAdmissionDocumentMutation();
  const file = getDocumentTableFile(requirement);
  const allowed = !!file?.canDownload && permissions.view && permissions.download;
  const writes = writeActions(requirement, permissions, readOnly);
  const downloadFile = async () => {
    if (!allowed || !file?.fileName || downloading) return;
    try {
      await download({ evidenceId: file.id, fileName: file.fileName }).unwrap();
    } catch (failure) {
      shikshaMitraToast.error({
        message: getOnboardingErrorMessage(
          failure,
          'The document could not be downloaded. Try again.'
        ),
      });
    }
  };
  const unavailable = !file
    ? 'No uploaded copy is available.'
    : 'Document access is not available.';
  return (
    <ThreeDotsActions
      showViewIcon
      viewIcon="mdi:eye-outline"
      viewLabel={allowed ? `View ${requirement.name}` : `View ${requirement.name}: ${unavailable}`}
      disableViewIcon={!allowed}
      handleViewClick={onView}
      directActions={[
        {
          id: 'download',
          icon: 'mdi:download',
          label: `Download ${requirement.name}`,
          tooltip: allowed ? `Download ${requirement.name}` : unavailable,
          disabled: !allowed,
          loading: downloading,
          onClick: downloadFile,
        },
        {
          id: 'history',
          icon: 'mdi:history',
          label: `History for ${requirement.name}`,
          tooltip: requirement.evidence.length
            ? `History for ${requirement.name}`
            : 'No document history yet.',
          disabled: !permissions.view || !requirement.evidence.length,
          onClick: onHistory,
        },
      ]}
      showThreeDots={writes.length > 0}
      moreLabel={`More actions for ${requirement.name}`}
      actions={({ popover }) =>
        writes.map((action) => (
          <MenuItem
            key={action}
            disabled={disabled}
            onClick={() => {
              popover.onClose();
              onAction(action, requirement);
            }}
          >
            <Iconify icon={actionIcons[action]} width={18} />
            {documentActionLabels[action]}
          </MenuItem>
        ))
      }
      sx={{ justifyContent: 'flex-start', gap: 0.5 }}
    />
  );
}

export function StudentOnboardingDocumentWorkspace({
  summary,
  permissions,
  disabled,
  readOnly,
  onAction,
}: {
  summary: ApplicationDocumentVerification;
  permissions: Permissions;
  disabled: boolean;
  readOnly: boolean;
  onAction: (action: DocumentAction, requirement: AdmissionDocumentRequirement) => void;
}) {
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const compact = useResponsive('down', 'sm');
  const [historyCode, setHistoryCode] = useState<string | null>(null);
  const showNotApplicable = useBoolean();
  const visible = useMemo(
    () =>
      summary.requirements.filter(
        (item) => item.status !== 'notRequired' || showNotApplicable.value
      ),
    [summary.requirements, showNotApplicable.value]
  );
  const notApplicable = summary.requirements.filter((item) => item.status === 'notRequired').length;
  const closePreview = () => {
    setPreviewCode(null);
  };
  const selected = visible.find((item) => item.code === previewCode);
  const file = selected && getDocumentTableFile(selected);
  const showPreview = selected && file?.canDownload && permissions.view && permissions.download;
  const history = visible.find((item) => item.code === historyCode);
  const required = summary.requirements.filter((item) => item.isRequired);
  const complete = required.filter(
    (item) => item.status === 'accepted' || item.status === 'waived'
  ).length;
  const locked =
    readOnly ||
    !summary.requirements.some((item) => writeActions(item, permissions, false).length > 0);
  // AdmissionDocumentReadService mixes this inactive-stage notice into readiness blockers.
  // Omit only that redundant notice; real readiness failures remain visible.
  const blockers = summary.blockers.filter(
    (blocker) =>
      !(locked && !summary.isActive && blocker === 'This document verification stage is read-only.')
  );
  const rows = useMemo(
    () =>
      visible.map((requirement) => ({
        id: requirement.code,
        name: requirement.name,
        status: requirement.status,
        requirement,
      })),
    [visible]
  );
  const columns = useMemo<IColumn[]>(() => {
    const all: IColumn[] = [
      {
        id: 'name',
        label: 'Document',
        filterType: 'string',
        minWidth: 180,
        render: (_, row) => (
          <Stack spacing={0.25}>
            <Typography component="span" variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
              {row.name}
            </Typography>
            {compact && (
              <Box>
                <DocumentStatusLabel status={row.requirement.status} />
              </Box>
            )}
            {row.requirement.blockers.map((blocker: string) => (
              <Typography key={blocker} variant="caption" color="text.secondary">
                {blocker}
              </Typography>
            ))}
          </Stack>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        filterType: 'enum',
        enumOptions: Object.entries(documentStatusLabels).map(([value, label]) => ({
          value,
          label,
        })),
        sticky: true,
        stickyPosition: 'right',
        width: 90,
        minWidth: 90,
        render: (_, row) => <DocumentStatusLabel status={row.requirement.status} />,
      },
      {
        id: 'actions',
        label: 'Actions',
        isSort: false,
        isFilter: false,
        excludeFromExport: true,
        sticky: true,
        stickyPosition: 'right',
        width: 116,
        minWidth: 116,
        cellSx: { px: 0.5 },
        headerSx: { px: 0.5 },
        align: 'left',
        render: (_, row) => (
          <DocumentWorkspaceActions
            requirement={row.requirement}
            permissions={permissions}
            disabled={disabled}
            readOnly={readOnly}
            onAction={onAction}
            onView={() => setPreviewCode(row.requirement.code)}
            onHistory={() => setHistoryCode(row.requirement.code)}
          />
        ),
      },
    ];
    return all.filter((column) => !compact || column.id !== 'status');
  }, [permissions, disabled, readOnly, onAction, compact]);
  return (
    <Stack spacing={1} sx={{ minWidth: 0 }}>
      {required.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'flex-end' }}>
          {complete} of {required.length} required documents resolved
        </Typography>
      )}
      {summary.policy?.requireIndependentReview && (
        <Typography variant="caption" color="text.secondary">
          A different authorized reviewer must check collected evidence.
        </Typography>
      )}
      {blockers.length > 0 && !readOnly && (
        <StudentFeedback notificationKey="STU-0990" presentation="persistent" severity="warning">
          {blockers.join(' ')}
        </StudentFeedback>
      )}
      <CustomizableTable
        tableId={`student-setup-documents-${summary.applicationId}-${summary.stageInstanceId}`}
        tableTitle="Admission documents"
        columns={columns}
        data={rows}
        showToolbar={false}
        isPagination={false}
        isShowedDense={false}
        isSearch={false}
        isFilter={false}
        wrapperProps={{ sx: { minWidth: 0 } }}
        tableContainerProps={{ 'aria-label': 'Admission documents', sx: { minWidth: 0 } }}
        noDataText="No document requirements for this admission."
      />
      {showPreview && (
        <StudentOnboardingDocumentPreview
          key={file.id}
          evidence={file}
          name={selected.name}
          onClose={closePreview}
        />
      )}
      {notApplicable > 0 && (
        <Button
          size="small"
          sx={{ alignSelf: 'flex-start' }}
          aria-expanded={showNotApplicable.value}
          onClick={() => {
            setPreviewCode(null);
            setHistoryCode(null);
            showNotApplicable.onToggle();
          }}
        >
          {showNotApplicable.value ? 'Hide' : 'Show'} not applicable ({notApplicable})
        </Button>
      )}
      {history && permissions.view && (
        <CustomDialog
          open
          title={`${history.name} · Document History`}
          handleClose={() => setHistoryCode(null)}
          maxWidth="sm"
          hasForm={false}
          guardUnsavedChanges={false}
        >
          <DialogScrollContent>
            <Stack spacing={1.5}>
              <DocumentStatusLabel status={history.status} />
              {history.description && (
                <Typography variant="body2">{history.description}</Typography>
              )}
              <DocumentEvidenceHistory
                evidence={history.evidence}
                allowDownload={permissions.download}
              />
            </Stack>
          </DialogScrollContent>
        </CustomDialog>
      )}
    </Stack>
  );
}
