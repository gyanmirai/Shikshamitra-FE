import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  AdmissionDocumentRequirement,
  ApplicationDocumentVerification,
} from 'src/redux/student/admissions/admission-document-types';

import { useMemo, useState } from 'react';
import { Alert, Stack, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { DocumentFileControl } from './document-file-control';
import { DocumentTableActions } from './document-table-actions';
import { DocumentDownloadButton } from './document-download-button';
import { DocumentEvidenceHistory } from './document-evidence-history';
import { DocumentStatusLabel, documentStatusLabels } from './document-status';
import { getDocumentTableFile, getDocumentTableFormat } from './document-table-model';

import type { DocumentAction } from './document-action-model';
import type { useDocumentPermissions } from './use-document-permissions';

export function DocumentRequirementTable({
  summary,
  requirements,
  permissions,
  disabled,
  readOnly,
  onAction,
}: {
  summary: ApplicationDocumentVerification;
  requirements: AdmissionDocumentRequirement[];
  permissions: ReturnType<typeof useDocumentPermissions>;
  disabled: boolean;
  readOnly: boolean;
  onAction: (action: DocumentAction, requirement: AdmissionDocumentRequirement) => void;
}) {
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const selected = summary.requirements.find((item) => item.code === selectedCode);
  const data = useMemo(
    () =>
      requirements.map((requirement) => {
        const format = getDocumentTableFormat(requirement, summary.policy);
        return {
          id: requirement.code,
          name: requirement.name,
          format: format.actual || format.accepted || format.fallback,
          formatDetails: format,
          status: documentStatusLabels[requirement.status],
          requirement,
          file: getDocumentTableFile(requirement),
        };
      }),
    [requirements, summary.policy]
  );
  const columns = useMemo<IColumn[]>(
    () => [
      {
        id: 'name',
        label: 'Document Name',
        minWidth: 220,
        isSort: true,
        filterType: 'string',
        render: (_, row) => (
          <Stack spacing={0.25}>
            <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
              {row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.requirement.isRequired
                ? 'Required'
                : row.requirement.requirement === 'conditional'
                  ? 'Conditional'
                  : 'Optional'}
              {row.file ? ` · Copy version ${row.file.versionNumber}` : ''}
            </Typography>
            {row.requirement.description && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ overflowWrap: 'anywhere' }}
              >
                {row.requirement.description}
              </Typography>
            )}
            {row.requirement.blockers.map((blocker: string) => (
              <Typography
                key={blocker}
                variant="caption"
                color="warning.main"
                sx={{ overflowWrap: 'anywhere' }}
              >
                {blocker}
              </Typography>
            ))}
          </Stack>
        ),
      },
      {
        id: 'format',
        label: 'Format',
        minWidth: 120,
        filterType: 'string',
        render: (_, row) => (
          <Stack spacing={0.25}>
            <Typography variant="body2">{row.format}</Typography>
            {row.formatDetails.actual && row.formatDetails.accepted && (
              <Typography variant="caption" color="text.secondary">
                Accepted: {row.formatDetails.accepted}
              </Typography>
            )}
          </Stack>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        minWidth: 110,
        filterType: 'string',
        isSort: true,
        render: (_, row) => <DocumentStatusLabel status={row.requirement.status} />,
      },
      {
        id: 'upload',
        label: 'Upload',
        isSort: false,
        isFilter: false,
        minWidth: 80,
        align: 'center',
        excludeFromExport: true,
        render: (_, row) => (
          <DocumentFileControl
            label={`${row.file ? 'Upload replacement' : 'Upload document'} for ${row.name}`}
            icon="mdi:upload"
            disabled={readOnly || disabled || !permissions.upload || !row.requirement.canUpload}
            reason={
              readOnly
                ? 'This document step is read-only.'
                : disabled
                  ? 'Wait for the current operation to finish.'
                  : !permissions.upload
                    ? 'Document upload permission is required.'
                    : 'Upload is not available for this requirement.'
            }
            onClick={() => onAction('upload', row.requirement)}
          />
        ),
      },
      {
        id: 'view',
        label: 'View',
        isSort: false,
        isFilter: false,
        minWidth: 80,
        align: 'center',
        excludeFromExport: true,
        render: (_, row) => (
          <DocumentFileControl
            label={`View document details for ${row.name}`}
            icon="mdi:eye-outline"
            disabled={!row.file || !permissions.view}
            reason={
              !row.file
                ? 'No uploaded file is available. Recorded originals and waivers are in evidence history.'
                : 'Document access permission is required.'
            }
            onClick={() => setSelectedCode(row.requirement.code)}
          />
        ),
      },
      {
        id: 'download',
        label: 'Download',
        isSort: false,
        isFilter: false,
        minWidth: 100,
        align: 'center',
        excludeFromExport: true,
        render: (_, row) =>
          row.file?.canDownload && permissions.download ? (
            <DocumentDownloadButton
              compact
              evidenceId={row.file.id}
              fileName={row.file.fileName}
              label={`Download document for ${row.name}`}
            />
          ) : (
            <DocumentFileControl
              label={`Download document for ${row.name}`}
              icon="mdi:download"
              disabled
              reason={
                row.file
                  ? 'Download is not available for this evidence.'
                  : 'No uploaded file is available.'
              }
            />
          ),
      },
      {
        id: 'actions',
        label: 'Actions',
        isSort: false,
        isFilter: false,
        sticky: true,
        stickyPosition: 'right',
        minWidth: 80,
        align: 'center',
        excludeFromExport: true,
        render: (_, row) => (
          <DocumentTableActions
            requirement={row.requirement}
            permissions={permissions}
            disabled={disabled}
            readOnly={readOnly}
            allowWaivers={summary.policy?.allowWaivers === true}
            onAction={(action) => onAction(action, row.requirement)}
            onHistory={() => setSelectedCode(row.requirement.code)}
          />
        ),
      },
    ],
    [permissions, disabled, readOnly, summary.policy?.allowWaivers, onAction]
  );
  return (
    <>
      <CustomizableTable
        // A changed visible checklist must not retain an out-of-range page or stale criteria.
        key={requirements.map((item) => item.code).join('|')}
        tableId={`admission-document-requirements-${summary.applicationId}-${summary.stageInstanceId}`}
        tableTitle="Document requirements"
        exportLabel="Export"
        columns={columns}
        data={data}
        isPagination
        defaultRowsPerPage={25}
        rowsPerPageOptions={[10, 25, 100]}
        isFilter
        searchFieldProps={{
          placeholder: 'Search documents...',
          inputProps: { 'aria-label': 'Search documents' },
        }}
        tableContainerProps={{
          'aria-label': 'Admission document requirements',
          sx: { minWidth: 0 },
        }}
        wrapperProps={{ sx: { minWidth: 0, minHeight: 0 } }}
        noDataText="No applicable document requirements."
      />
      {selected && permissions.view && (
        <CustomDialog
          open
          title={`${selected.name} · Document Details`}
          handleClose={() => setSelectedCode(null)}
          maxWidth="sm"
          hasForm={false}
          guardUnsavedChanges={false}
        >
          <DialogScrollContent>
            <Stack spacing={1.5}>
              <DocumentStatusLabel status={selected.status} />
              {selected.description && (
                <Typography variant="body2">{selected.description}</Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                Uploaded file information, recorded originals, waivers and review history.
              </Typography>
              {selected.blockers.map((blocker) => (
                <Alert key={blocker} severity="info">
                  {blocker}
                </Alert>
              ))}
              <DocumentEvidenceHistory
                evidence={selected.evidence}
                allowDownload={permissions.download}
              />
            </Stack>
          </DialogScrollContent>
        </CustomDialog>
      )}
    </>
  );
}
