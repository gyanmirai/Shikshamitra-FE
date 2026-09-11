import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Iconify } from 'src/components/iconify';
import {
  Stack,
  Button,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { getBuilderIssues } from './form-builder-issues';

export { getBuilderIssues } from './form-builder-issues';

type Props = { form: CreateUpdateAdmissionForm; onSelectField: (fieldId: string) => void };

export function FormValidationPanel({ form, onSelectField }: Props) {
  const issues = getBuilderIssues(form);
  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{
        flexShrink: 0,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        '&:before': { display: 'none' },
      }}
    >
      <AccordionSummary
        expandIcon={<Iconify icon="mdi:chevron-down" />}
        id="form-checks-heading"
        aria-controls="form-checks-content"
        sx={{ minHeight: 44, '& .MuiAccordionSummary-content': { my: 1 } }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Iconify
            icon={issues.length ? 'mdi:information-outline' : 'mdi:check-circle-outline'}
            color={issues.length ? 'warning.main' : 'success.main'}
            width={20}
          />
          <Typography variant="body2" fontWeight={600}>
            {issues.length
              ? `${issues.length} ${issues.length === 1 ? 'item' : 'items'} to review before publishing`
              : 'Form checks passed'}
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0, maxHeight: 160, overflowY: 'auto' }}>
        <Stack spacing={0.5}>
          {issues.map((issue, index) =>
            issue.fieldId ? (
              <Button
                key={issue.message + index}
                size="small"
                color="inherit"
                startIcon={<Iconify icon="mdi:arrow-right" />}
                sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
                onClick={() => {
                  if (issue.fieldId) onSelectField(issue.fieldId);
                }}
              >
                {issue.message}
              </Button>
            ) : (
              <Typography key={issue.message + index} variant="body2">
                {issue.message}
              </Typography>
            )
          )}
          <Typography variant="caption" color="text.secondary">
            Review these items before publishing. Save draft keeps your form private.
          </Typography>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
