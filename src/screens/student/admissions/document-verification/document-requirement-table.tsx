import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  DocumentStageKey,
  AdmissionDocumentRequirement,
  ApplicationDocumentVerification,
} from 'src/redux/student/admissions/admission-document-types';

import { useMemo } from 'react';
import { Stack, Typography } from '@mui/material';
import { useResponsive } from 'src/hooks/use-responsive';
import CustomizableTable from 'src/components/customizabaleTable';

import { ADMISSION_PAGE_SIZES } from '../admission-page-sizes';
import { DocumentTableActions } from './document-table-actions';
import { DocumentStatusLabel, documentStatusLabels } from './document-status';
import { getDocumentTableFile, getDocumentTableFormat } from './document-table-model';

import type { DocumentAction } from './document-action-model';
import type { useDocumentPermissions } from './use-document-permissions';

const noRequirements: AdmissionDocumentRequirement[] = [];

export function DocumentRequirementTable({
  applicationId,
  stageInstanceId,
  policy = null,
  requirements = noRequirements,
  permissions,
  onView,
  onAction,
  disabled = false,
  readOnly = false,
  isLoading = false,
}: DocumentStageKey & {
  policy?: ApplicationDocumentVerification['policy'];
  requirements?: AdmissionDocumentRequirement[];
  permissions: ReturnType<typeof useDocumentPermissions>;
  onView?: (requirement: AdmissionDocumentRequirement) => void;
  onAction?: (action: DocumentAction, requirement: AdmissionDocumentRequirement) => void;
  disabled?: boolean;
  readOnly?: boolean;
  isLoading?: boolean;
}) {
  const compact = useResponsive('down', 'sm');
  const data = useMemo(
    () =>
      requirements.map((requirement) => {
        const format = getDocumentTableFormat(requirement, policy);
        return {
          id: requirement.code,
          name: requirement.name,
          format:
            format.actual || (requirement.collectionMode === 'original' ? format.fallback : '—'),
          status: documentStatusLabels[requirement.status],
          requirement,
          file: getDocumentTableFile(requirement),
        };
      }),
    [requirements, policy]
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
          <Stack spacing={0.25} alignItems="flex-start">
            <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere', maxWidth: 1 }}>
              {row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 1 }}>
              {row.requirement.isRequired
                ? 'Required'
                : row.requirement.requirement === 'conditional'
                  ? 'Conditional'
                  : 'Optional'}
              {row.file ? ` · Copy version ${row.file.versionNumber}` : ''}
            </Typography>
            {compact && <DocumentStatusLabel status={row.requirement.status} />}
          </Stack>
        ),
      },
      {
        id: 'format',
        label: 'Format',
        minWidth: 90,
        filterType: 'string',
        render: (_, row) => <Typography variant="body2">{row.format}</Typography>,
      },
      {
        id: 'status',
        label: 'Status',
        minWidth: 110,
        filterType: 'enum',
        enumOptions: Object.values(documentStatusLabels).map((label) => ({ label, value: label })),
        isSort: true,
        sticky: true,
        stickyPosition: 'right',
        stickyOnMobile: false,
        render: (_, row) => <DocumentStatusLabel status={row.requirement.status} />,
      },
      {
        id: 'actions',
        label: 'Actions',
        isSort: false,
        isFilter: false,
        sticky: true,
        stickyPosition: 'right',
        minWidth: 144,
        width: 144,
        align: 'left',
        excludeFromExport: true,
        render: (_, row) => (
          <DocumentTableActions
            requirement={row.requirement}
            permissions={permissions}
            disabled={disabled}
            readOnly={readOnly}
            allowWaivers={policy?.allowWaivers === true}
            onView={onView ? () => onView(row.requirement) : undefined}
            onAction={onAction ? (action) => onAction(action, row.requirement) : undefined}
          />
        ),
      },
    ],
    [permissions, onView, onAction, disabled, readOnly, policy?.allowWaivers, compact]
  );
  return (
    <CustomizableTable
      // A changed visible checklist must not retain an out-of-range page or stale criteria.
      key={requirements.map((item) => item.code).join('|')}
      tableId={`admission-document-requirements-${applicationId}-${stageInstanceId}`}
      tableTitle="Document Requirements"
      exportLabel="Export"
      columns={columns}
      data={data}
      isLoading={isLoading}
      isPagination
      defaultRowsPerPage={25}
      rowsPerPageOptions={ADMISSION_PAGE_SIZES}
      isFilter
      searchFieldProps={{
        placeholder: 'Search Documents...',
        inputProps: { 'aria-label': 'Search Documents' },
      }}
      tableContainerProps={{
        'aria-label': 'Admission Document Requirements',
        sx: { minWidth: 0, height: 1 },
      }}
      wrapperProps={{ sx: { minWidth: 0, minHeight: 0, flex: 1 } }}
      noDataText="No Applicable Document Requirements."
    />
  );
}
