import type { AdmissionDocumentRequirement } from 'src/redux/student/admissions/admission-document-types';

import { Stack, Button } from '@mui/material';

import type { DocumentAction } from './document-action-model';
import type { useDocumentPermissions } from './use-document-permissions';

export function DocumentRequirementActions({
  requirement,
  permissions,
  disabled,
  onAction,
}: {
  requirement: AdmissionDocumentRequirement;
  permissions: ReturnType<typeof useDocumentPermissions>;
  disabled: boolean;
  onAction: (action: DocumentAction) => void;
}) {
  return (
    <Stack direction="row" gap={1} flexWrap="wrap">
      {requirement.canUpload && permissions.upload && (
        <Button
          size="small"
          variant="outlined"
          disabled={disabled}
          onClick={() => onAction('upload')}
        >
          {requirement.evidence.some((item) => item.fileName)
            ? 'Upload replacement'
            : 'Upload document'}
        </Button>
      )}
      {requirement.canRecordOriginal && permissions.original && (
        <Button
          size="small"
          variant="outlined"
          disabled={disabled}
          onClick={() => onAction('original')}
        >
          Record original
        </Button>
      )}
      {(requirement.canAccept ?? requirement.canReview) && permissions.review && (
        <Button
          size="small"
          variant="contained"
          disabled={disabled}
          onClick={() => onAction('accept')}
        >
          Accept
        </Button>
      )}
      {requirement.canReview && permissions.review && (
        <Button
          size="small"
          variant="outlined"
          disabled={disabled}
          onClick={() => onAction('reject')}
        >
          Request replacement
        </Button>
      )}
      {requirement.canWaive && permissions.waive && (
        <Button size="small" disabled={disabled} onClick={() => onAction('waive')}>
          Waive requirement
        </Button>
      )}
    </Stack>
  );
}
