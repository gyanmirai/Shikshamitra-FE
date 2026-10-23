import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { LoadingButton } from 'src/components/loading-button';
import { StudentFeedback } from 'src/components/student-feedback';
import { useGetAdmissionFormUsageQuery } from 'src/redux/student/admissions/admission-forms-api';
import {
  Box,
  List,
  Stack,
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
  const busy = validating || publishing;

  return (
    <ConfirmDialog
      open={Boolean(form)}
      onClose={busy ? () => undefined : onClose}
      disableBackdropClick
      disableEscapeKeyDown={busy}
      disableCancel={busy}
      aria-labelledby="admission-form-publish-title"
      icon={
        hasIssues ? (
          'error'
        ) : (
          <Box
            sx={{
              width: 36,
              height: 36,
              flexShrink: 0,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'info.lighter',
              color: 'info.main',
            }}
          >
            <Iconify icon="mdi:publish" width={20} />
          </Box>
        )
      }
      title={
        <Box component="span" id="admission-form-publish-title">
          {hasIssues ? 'Form needs changes' : `Publish ${form?.name ?? 'form'}?`}
        </Box>
      }
      sx={{ '& .MuiDialogActions-root': { p: 2, borderTop: 1, borderColor: 'divider' } }}
      content={
        validating || issues === null ? (
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 1 }}>
            <CircularProgress size={22} />
            <Typography variant="body2">Checking every field and rule...</Typography>
          </Stack>
        ) : hasIssues ? (
          <Stack spacing={1}>
            <StudentFeedback notificationKey="STU-0068" presentation="persistent" severity="error">
              Resolve all {issues.length} {issues.length === 1 ? 'issue' : 'issues'} before
              publishing.
            </StudentFeedback>
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
