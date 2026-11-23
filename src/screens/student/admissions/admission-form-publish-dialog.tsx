import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { LoadingButton } from 'src/components/loading-button';
import { StudentFeedback } from 'src/components/student-feedback';
import { useGetAdmissionFormUsageQuery } from 'src/redux/student/admissions/admission-forms-api';
import {
  List,
  Stack,
  Button,
  ListItem,
  Typography,
  ListItemIcon,
  ListItemText,
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
  const checking = validating || issues === null;
  const validationIssues = checking ? [] : issues;
  const hasIssues = validationIssues.length > 0;
  const busy = checking || publishing;

  return (
    <ConfirmDialog
      open={Boolean(form)}
      onClose={onClose}
      disableBackdropClick
      disableEscapeKeyDown={busy}
      disableCancel={busy}
      icon={hasIssues ? 'error' : 'info'}
      title={hasIssues ? 'Form Needs Changes' : `Publish ${form?.name ?? 'form'}?`}
      sx={{ '& .MuiDialogActions-root': { p: 2, borderTop: 1, borderColor: 'divider' } }}
      content={
        hasIssues ? (
          <Stack spacing={1}>
            <StudentFeedback notificationKey="STU-0068" presentation="persistent" severity="error">
              Resolve all {validationIssues.length}{' '}
              {validationIssues.length === 1 ? 'Issue' : 'Issues'} before publishing.
            </StudentFeedback>
            <List dense disablePadding sx={{ maxHeight: 240, overflowY: 'auto' }}>
              {validationIssues.map((issue, index) => (
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
          <Stack spacing={1.5}>
            <Typography variant="body2">
              Version {form?.version} will become available for new admission offerings. Published
              versions cannot be edited; create a new version for future changes.
            </Typography>
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
            color="primary"
            startIcon={<Iconify icon="mdi:pencil-outline" />}
            onClick={onEdit}
          >
            Edit Draft
          </Button>
        ) : (
          <LoadingButton
            size="small"
            variant="contained"
            color="inherit"
            loading={busy}
            loadingPosition="start"
            startIcon={<Iconify icon={GlobalIcons.publish} />}
            onClick={onPublish}
          >
            Publish Form
          </LoadingButton>
        )
      }
    />
  );
}
