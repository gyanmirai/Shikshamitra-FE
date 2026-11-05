import type { EsiPolicy } from 'src/redux/hr/esi-policy-api';

import { useRef, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Alert, Stack, Button, Typography } from '@mui/material';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useArchiveEsiPolicyMutation,
  useGetEsiPolicyArchiveReviewQuery,
} from 'src/redux/hr/esi-policy-api';

export function EsiPolicyArchiveDialog({
  policy,
  onClose,
}: {
  policy: EsiPolicy;
  onClose: () => void;
}) {
  const review = useGetEsiPolicyArchiveReviewQuery(policy.id, { refetchOnMountOrArgChange: true });
  const [archive, state] = useArchiveEsiPolicyMutation();
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const current = review.currentData;
  const ready = !review.isFetching && !review.isError && current?.policy.id === policy.id;
  const canArchive = ready && current?.canArchive;

  return (
    <ConfirmDialog
      open
      title={`Archive ${policy.name}?`}
      icon="warning"
      maxWidth="sm"
      onClose={() => {
        if (!submitting.current) onClose();
      }}
      disableCancel={state.isLoading}
      content={
        <Stack spacing={1.5} sx={{ overflowWrap: 'anywhere' }}>
          <Typography variant="body2">
            Archiving prevents new salary assignments from using this policy. Existing staff
            assignments, payroll history and issued payslips retain their policy versions. Missing
            or expired effective versions still require a reviewed correction.
          </Typography>
          {review.isFetching && (
            <Typography role="status">Checking salary template dependencies…</Typography>
          )}
          {review.isError && (
            <Alert
              severity="error"
              action={<Button onClick={() => review.refetch()}>Retry</Button>}
            >
              Dependencies could not be verified. Archive is unavailable.
            </Alert>
          )}
          {ready && current && (
            <>
              {current.policy.isArchived ? (
                <Alert severity="info">This policy is already archived.</Alert>
              ) : current.policy.isDefault ? (
                <Alert severity="warning">The school default cannot be archived.</Alert>
              ) : current.templates.length ? (
                <>
                  <Alert severity="warning">
                    Archive is blocked. Select a usable replacement in each listed salary template
                    and preview the relevant salary month before saving, or archive the unused
                    template. New assignments otherwise cannot calculate ESIC with this selection.
                  </Alert>
                  <Typography variant="subtitle2">Affected salary templates</Typography>
                  <Stack component="ul" spacing={1} sx={{ pl: 2, my: 0 }}>
                    {current.templates.map((item) => (
                      <Typography
                        component="li"
                        variant="body2"
                        key={`${item.templateId}:${item.version}`}
                      >
                        {item.templateName} — version {item.version} ({item.status})
                      </Typography>
                    ))}
                  </Stack>
                </>
              ) : (
                <Typography>No live salary templates select this policy.</Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                Salary templates have no effective date range. Recorded policy version dates: these
                dates do not confirm version activity or availability for a payroll month.
              </Typography>
              {current.policy.versions.length ? (
                current.policy.versions.map((version) => (
                  <Typography variant="body2" key={version.id}>
                    Version {version.version}: {version.effectiveFrom.slice(0, 10)} to{' '}
                    {version.effectiveTo?.slice(0, 10) || 'no recorded end date'}
                  </Typography>
                ))
              ) : (
                <Typography>No policy versions are recorded.</Typography>
              )}
            </>
          )}
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      }
      action={
        <Button
          variant="contained"
          disabled={!canArchive || state.isLoading}
          loading={state.isLoading}
          onClick={async () => {
            if (!canArchive || !current || submitting.current) return;
            submitting.current = true;
            setError('');
            try {
              await archive({
                id: policy.id,
                concurrencyStamp: current.policy.concurrencyStamp,
                confirmed: true,
              }).unwrap();
              shikshaMitraToast.success({ message: 'ESIC policy archived.' });
              onClose();
            } catch (cause) {
              setError(parseApiProblemDetail(cause).detail);
              review.refetch();
            } finally {
              submitting.current = false;
            }
          }}
        >
          Archive policy
        </Button>
      }
    />
  );
}
