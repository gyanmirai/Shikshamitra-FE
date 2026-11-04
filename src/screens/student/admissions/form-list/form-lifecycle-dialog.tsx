import type { AdmissionFormArchiveImpact } from 'src/redux/student/admissions/admission-forms-api';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Box, Stack, Button, Typography, CircularProgress } from '@mui/material';

import type { PendingFormLifecycle } from './use-form-lifecycle-actions';

type Props = {
  pending: PendingFormLifecycle;
  impact?: AdmissionFormArchiveImpact;
  loading: boolean;
  busy: boolean;
  canConfirm: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: () => void;
  requiresReload?: boolean;
  onReload?: () => void;
};

export function FormLifecycleDialog({
  pending,
  impact,
  loading,
  busy,
  canConfirm,
  error,
  onClose,
  onConfirm,
  requiresReload,
  onReload,
}: Props) {
  const restoring = pending?.action === 'restore';
  const inquiry = pending?.form.purpose === 0;
  const outcome = restoring ? 'Restore' : 'Archive';
  return (
    <ConfirmDialog
      open={Boolean(pending)}
      onClose={onClose}
      icon={restoring ? 'info' : 'warning'}
      title={`${outcome} ${inquiry ? 'Inquiry' : 'Registration'} Form?`}
      disableBackdropClick
      disableCancel={busy}
      disableEscapeKeyDown={busy}
      content={
        <Stack spacing={1.5}>
          <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
            {pending?.form.name}
          </Typography>
          {loading && (
            <Stack direction="row" spacing={1} role="status" alignItems="center">
              <CircularProgress size={16} />
              <Typography variant="body2">Checking Form Usage…</Typography>
            </Stack>
          )}
          {restoring ? (
            <Typography variant="body2">
              Restore and publish the same form version. Existing links, saved answers and history
              are retained. Linked offerings and workflows can use it again when their other
              requirements are met.
            </Typography>
          ) : (
            impact && (
              <>
                <Typography variant="body2" component="div">
                  Visible Usage: {impact.offeringCount} Offerings, {impact.workflowCount} Workflows
                  And {impact.publicLinkCount} public inquiry links.
                </Typography>
                {impact.dependencies.length > 0 && (
                  <Box component="ul" sx={{ pl: 2.5, my: 0, maxHeight: 200, overflowY: 'auto' }}>
                    {impact.dependencies.map((item, index) => (
                      <Typography
                        key={`${item.kind}-${item.id}-${index}`}
                        component="li"
                        variant="body2"
                        sx={{ overflowWrap: 'anywhere' }}
                      >
                        {item.name}
                        {item.workflowStageName ? ` · ${item.workflowStageName}` : ''}
                        {' · '}
                        {
                          {
                            offering: 'Offering',
                            workflow: 'Workflow',
                            publicLink: 'Public inquiry link',
                            registrationForm: 'Registration form',
                          }[item.kind]
                        }
                      </Typography>
                    ))}
                  </Box>
                )}
                {(impact.hasRestrictedOfferings || impact.hasRestrictedDependencies) && (
                  <Typography variant="body2">
                    Some usage details are restricted by your access. Ask an administrator to review
                    the full impact.
                  </Typography>
                )}
                <Typography variant="body2">
                  {inquiry ? 'New Inquiries' : 'New Registration Submissions'} requiring this form
                  will be blocked. Restore this form or select a published replacement in the
                  affected setup. Public inquiry links keep their selected form and must be updated
                  separately.
                </Typography>
                <Typography variant="body2">
                  In Your Permitted Scope, {impact.inquiryCount} Existing Inquiries And{' '}
                  {impact.applicationCount} applications keep their saved answers and history. This
                  action keeps all links and does not update existing records.
                </Typography>
                <Typography variant="body2">You can restore this form later.</Typography>
              </>
            )
          )}
          {error && (
            <Typography variant="body2" color="error" role="alert">
              {error}
            </Typography>
          )}
          {requiresReload && (
            <Button
              type="button"
              size="small"
              variant="text"
              disabled={loading || busy}
              startIcon={<Iconify icon="mdi:refresh" />}
              onClick={onReload}
            >
              Reload Latest
            </Button>
          )}
        </Stack>
      }
      action={
        <Button
          type="button"
          variant="contained"
          size="small"
          disabled={!canConfirm || busy}
          loading={busy}
          startIcon={<Iconify icon={restoring ? 'mdi:restore' : 'mdi:archive-outline'} />}
          onClick={onConfirm}
        >
          {outcome}
        </Button>
      }
    />
  );
}
