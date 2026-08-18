import type { AdmissionOffering } from 'src/redux/student/admissions/admission-offerings-api';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { formatDateOnly } from 'src/utils/date-only';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Stack, Button, Divider, Typography, DialogActions } from '@mui/material';

import { AdmissionOfferingReadiness } from './admission-offering-readiness';

type Props = { open: boolean; offering: AdmissionOffering | null; onClose: () => void };

const Detail = ({ label, value }: { label: string; value: string }) => (
  <Stack spacing={0.25}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2">{value}</Typography>
  </Stack>
);

export function AdmissionOfferingDetailsDialog({ open, offering, onClose }: Props) {
  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      title="Admission Offering Details"
      maxWidth="sm"
    >
      <DialogScrollContent dividers sx={{ display: 'grid', gap: 1.5 }}>
        {offering && (
          <>
            <Typography variant="body2" color="text.secondary">
              Review the effective academic identity, admission window, frozen configuration
              defaults, and current readiness.
            </Typography>
            <Detail label="Cycle" value={offering.admissionCycleName} />
            <Detail label="Offering" value={`${offering.code} · ${offering.standardName}`} />
            <Detail
              label="Academic hierarchy"
              value={`${offering.boardName} · ${offering.mediumName} · ${offering.stageName}`}
            />
            <Detail
              label="Effective window"
              value={`${formatDateOnly(offering.effectiveOpenDate, 'DD MMM YYYY')} – ${formatDateOnly(offering.effectiveCloseDate, 'DD MMM YYYY')}`}
            />
            <Divider />
            <Detail
              label="Workflow"
              value={
                offering.workflowName
                  ? `${offering.workflowName} v${offering.workflowVersion}`
                  : 'Not configured'
              }
            />
            <Detail
              label="Inquiry form"
              value={
                offering.inquiryFormName
                  ? `${offering.inquiryFormName} v${offering.inquiryFormVersion}`
                  : 'Not configured'
              }
            />
            <Detail
              label="Application form"
              value={
                offering.applicationFormName
                  ? `${offering.applicationFormName} v${offering.applicationFormVersion}`
                  : 'Not configured'
              }
            />
            <Detail label="Applications" value={String(offering.applicationCount)} />
            <AdmissionOfferingReadiness result={offering.configuration} />
          </>
        )}
      </DialogScrollContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={onClose}
        >
          Close
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
