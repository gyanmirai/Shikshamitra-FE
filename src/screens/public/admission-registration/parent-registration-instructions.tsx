import { GlobalIcons } from 'src/utils/icons';
import { Box, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

export function ParentRegistrationInstructions({ hasDocuments }: { hasDocuments: boolean }) {
  return (
    <FormSectionCard
      title="Before You Start"
      icon={GlobalIcons.info}
      description="Use names from official documents. Fields marked * are required."
      descriptionTooltip="Follow the instructions shown beside each field and document upload."
      collapsible
      actionFullWidthOnMobile
      defaultExpanded={false}
      toggleLabels={{ expand: 'View instructions', collapse: 'Hide instructions' }}
    >
      <Box component="ol" sx={{ m: 0, pl: 2.5, '& > li + li': { mt: 1 }, color: 'text.primary' }}>
        <Typography component="li" variant="body2">
          Names must match the official documents.
          <Typography component="span" variant="body2" color="text.secondary" display="block">
            Use CAPITAL LETTERS where requested. Example: MOHIT RANA
          </Typography>
        </Typography>
        <Typography component="li" variant="body2">
          Check the date of birth and contact details carefully.
        </Typography>
        <Typography component="li" variant="body2">
          Complete all required fields marked with *.
        </Typography>
        {hasDocuments && (
          <Typography component="li" variant="body2">
            Upload clear, complete documents in the Documents step.
            <Typography component="span" variant="body2" color="text.secondary" display="block">
              Allowed file types and sizes appear beside each upload.
            </Typography>
          </Typography>
        )}
        <Typography component="li" variant="body2">
          Review your answers{hasDocuments ? ' and documents' : ''} before sending them to school.
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        You can save a draft and return using this private link before it expires. Contact the
        school admissions team if you need help or notice an incorrect locked detail.
      </Typography>
    </FormSectionCard>
  );
}
