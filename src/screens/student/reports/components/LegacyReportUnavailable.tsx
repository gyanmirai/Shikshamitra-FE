import { Typography } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { FormSectionCard } from 'src/components/form-section-card';

export default function LegacyReportUnavailable() {
  return (
    <FormSectionCard
      title="Report Availability"
      icon={GlobalIcons.report}
      descriptionTooltip="The report remains in the catalog, but its dedicated preview and export service is not available in this version."
    >
      <Typography variant="body2">
        Preview and export are unavailable for this report. No report has been generated.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        The Compliance category provides the supported student baseline, GSEB reconciliation,
        identity exceptions and benefit-tracking reports.
      </Typography>
    </FormSectionCard>
  );
}
