import { useState } from 'react';
import { Alert, Stack, Button, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { FinanceWaiverAction } from 'src/redux/library/charges-management/finance-corrections.types';
import { useGetFinanceExternalWaiverContextQuery } from 'src/redux/library/charges-management/finance-external-api';

import { waiverActionTitle } from './finance-waiver-command';
import { useFinanceWaiverForm } from './useFinanceWaiverForm';
import { FinanceWaiverRequests } from './FinanceWaiverRequests';
import { FinanceWaiverConfirmation } from './FinanceWaiverConfirmation';
import { FinanceWaiverDraft, FinanceWaiverResult } from './FinanceWaiverDraft';

import type { FinanceActionProps } from './finance-flow-types';

export function FinanceWaiverPanel(props: FinanceActionProps & { action: FinanceWaiverAction }) {
  const { action, source, disabled } = props;
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const query = useGetFinanceExternalWaiverContextQuery(
    { source, action, page, pageSize: 20 },
    { refetchOnMountOrArgChange: true }
  );
  const context = query.error ? undefined : query.currentData;
  const reading = query.isLoading || query.isFetching;
  const rows = context?.requests.items || [];
  const selected =
    rows.find((row) => row.requestId === selectedId) ||
    (action === FinanceWaiverAction.Reverse && rows.length === 1 ? rows[0] : undefined);
  const form = useFinanceWaiverForm({
    ...props,
    context,
    selected,
    reading,
    refresh: query.refetch,
    onCompleted: () => setSelectedId(null),
  });
  const showFields = !form.decision && (action === FinanceWaiverAction.Apply || Boolean(selected));
  const locked = disabled || form.busy || form.command.uncertain || Boolean(form.review);
  return (
    <FormSectionCard
      title={waiverActionTitle(action)}
      descriptionTooltip="Use the recorded Finance policy and current authorized source. Requests, decisions and partial reversals retain their original evidence."
    >
      <Stack spacing={2}>
        {query.error && (
          <Alert
            severity="error"
            action={
              <Button type="button" size="small" disabled={locked} onClick={() => query.refetch()}>
                Retry
              </Button>
            }
          >
            {parseApiProblemDetail(query.error).detail}
          </Alert>
        )}
        {reading && <Typography role="status">Loading waiver context…</Typography>}
        {context?.issues.map((issue) => (
          <Alert key={issue} severity="info">
            {issue}
          </Alert>
        ))}
        {context && (
          <FinanceWaiverRequests
            context={context}
            action={action}
            page={page}
            disabled={locked || reading || form.formik.dirty}
            onPage={(next) => {
              setPage(next);
              setSelectedId(null);
            }}
            onSelect={(row) => setSelectedId(row.requestId)}
          />
        )}
        {showFields && <FinanceWaiverDraft form={form} action={action} disabled={locked} />}
        <FinanceWaiverResult result={form.result} />
        <FinanceWaiverConfirmation
          form={form}
          action={action}
          decisionOpen={selectedId !== null}
          disabled={disabled}
        />
      </Stack>
    </FormSectionCard>
  );
}
