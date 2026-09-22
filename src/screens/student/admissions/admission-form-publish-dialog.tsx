import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { LoadingButton } from 'src/components/loading-button';
import { useGetAdmissionFormUsageQuery } from 'src/redux/student/admissions/admission-forms-api';
import {
  List,
  Stack,
  Alert,
  Button,
  ListItem,
  Typography,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material';

type Props = {
  form: AdmissionForm | null;
  issues: string[] | null;
  validating: boolean;
  publishing: boolean;
  onClose: () => void;
  onEdit: () => void;
  onPublish: () => void;
};

export function AdmissionFormPublishDialog({
  form,
  issues,
  validating,
  publishing,
  onClose,
  onEdit,
  onPublish,
}: Props) {
  const usage = useGetAdmissionFormUsageQuery(form?.id ?? '', { skip: !form });
  const hasIssues = Boolean(issues?.length);

  return (
    <ConfirmDialog
      open={Boolean(form)}
      onClose={onClose}
      icon={hasIssues ? 'error' : 'warning'}
      title={hasIssues ? 'Form needs changes' : `Publish ${form?.name ?? 'form'}?`}
      content={
        validating || issues === null ? (
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 1 }}>
            <CircularProgress size={22} />
            <Typography variant="body2">Checking every field and rule...</Typography>
          </Stack>
        ) : hasIssues ? (
          <Stack spacing={1}>
            <Alert severity="error">
              Resolve all {issues.length} {issues.length === 1 ? 'issue' : 'issues'} before
              publishing.
            </Alert>
            <List dense disablePadding sx={{ maxHeight: 240, overflowY: 'auto' }}>
              {issues.map((issue, index) => (
                <ListItem key={`${issue}-${index}`} disableGutters alignItems="flex-start">
                  <ListItemIcon sx={{ minWidth: 28, mt: 0.25 }}>
                    <Iconify icon="mdi:alert-circle-outline" color="error.main" width={18} />
                  </ListItemIcon>
                  <ListItemText primary={issue} primaryTypographyProps={{ variant: 'body2' }} />
                </ListItem>
              ))}
            </List>
          </Stack>
        ) : (
          <Stack spacing={1}>
            <Alert severity="success">All publish-readiness checks passed.</Alert>
            <Typography variant="body2">
              Version {form?.version} will become available for new admission offerings. Published
              versions cannot be edited; create a new version for future changes.
            </Typography>
            {usage.data && (
              <Typography variant="caption" color="text.secondary">
                This version is currently linked to {usage.data.offeringCount}{' '}
                {usage.data.offeringCount === 1 ? 'offering' : 'offerings'} and{' '}
                {usage.data.applicationCount}{' '}
                {usage.data.applicationCount === 1 ? 'application' : 'applications'}. Existing
                applications keep their assigned version.
              </Typography>
            )}
            {usage.isError && (
              <Typography variant="caption" color="warning.main">
                Usage details are unavailable. Publishing still affects only future assignments.
              </Typography>
            )}
          </Stack>
        )
      }
      action={
        hasIssues ? (
          <Button
            size="small"
            variant="contained"
            startIcon={<Iconify icon="mdi:pencil-outline" />}
            onClick={onEdit}
          >
            Edit draft
          </Button>
        ) : (
          <LoadingButton
            size="small"
            variant="contained"
            loading={publishing || validating}
            disabled={issues === null}
            startIcon={<Iconify icon="mdi:publish" />}
            onClick={onPublish}
          >
            Publish form
          </LoadingButton>
        )
      }
    />
  );
}
