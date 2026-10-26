import { Button } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import SubmitButton from 'src/components/submit-button';

import type { useAiReport } from '../hooks/use-ai-report';

export function ReportAiActions({
  workflow,
  ready,
  permittedPlan,
  onClose,
  onPrepare,
}: {
  workflow: ReturnType<typeof useAiReport>;
  ready: boolean;
  permittedPlan: boolean;
  onClose: () => void;
  onPrepare: () => void;
}) {
  return (
    <>
      <Button
        size="small"
        variant="outlined"
        disabled={workflow.busy}
        onClick={onClose}
        startIcon={<Iconify icon={GlobalIcons.cancel} />}
      >
        Close
      </Button>
      {workflow.plan && (
        <Button
          size="small"
          disabled={workflow.busy}
          onClick={workflow.reset}
          startIcon={<Iconify icon={GlobalIcons.edit} />}
        >
          Edit request
        </Button>
      )}
      {ready ? (
        <SubmitButton
          type="button"
          buttonText="Approve and generate report"
          loading={workflow.busy}
          disabled={!workflow.preview || !permittedPlan}
          onClick={workflow.generate}
        />
      ) : (
        !workflow.plan && (
          <SubmitButton
            type="button"
            loading={workflow.busy}
            buttonText="Prepare report plan"
            onClick={onPrepare}
          />
        )
      )}
    </>
  );
}
