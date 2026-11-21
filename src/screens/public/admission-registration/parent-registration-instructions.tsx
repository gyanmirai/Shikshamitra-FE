import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Stack, Button, Checkbox, Typography, FormControlLabel } from '@mui/material';

export function ParentRegistrationInstructions({
  hasDocuments,
  onContinue,
  mobile,
}: {
  hasDocuments: boolean;
  onContinue: () => void;
  mobile: boolean;
}) {
  const [acknowledged, setAcknowledged] = useState(false);

  if (mobile) {
    const instructions = [
      'Use names from official documents.',
      'Check the date of birth and contact details.',
      'Complete all required fields marked *.',
      ...(hasDocuments ? ['Keep your documents ready.'] : []),
    ];
    return (
      <FormSectionCard
        title="Before You Start"
        titleTypographyProps={{ variant: 'h5' }}
        descriptionTooltip="Keep the following ready to complete the registration smoothly."
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          border: 0,
          borderTop: 1,
          borderColor: 'divider',
          borderRadius: 0,
          p: 0,
          pt: 2,
          boxShadow: 'none',
          overflow: 'visible',
        }}
        contentSx={{ flex: 1 }}
      >
        <Stack component="ul" spacing={1.5} sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {instructions.map((instruction) => (
            <Stack
              key={instruction}
              component="li"
              direction="row"
              spacing={1}
              alignItems="flex-start"
            >
              <Iconify
                icon="mdi:check-circle"
                width={18}
                sx={{ color: 'success.main', flexShrink: 0, mt: 0.25 }}
                aria-hidden
              />
              <Typography variant="body2">{instruction}</Typography>
            </Stack>
          ))}
        </Stack>
        <FormControlLabel
          sx={{ alignSelf: 'flex-start', ml: '-9px', mr: 0 }}
          control={
            <Checkbox checked={acknowledged} onChange={(_, checked) => setAcknowledged(checked)} />
          }
          label="I have read the instructions"
        />
        <Box sx={{ flex: 1 }} />
        <Stack
          direction="row"
          justifyContent="flex-end"
          sx={{ borderTop: 1, borderColor: 'divider', py: 1 }}
        >
          <Button
            size="small"
            variant="contained"
            disabled={!acknowledged}
            onClick={onContinue}
            endIcon={<Iconify icon="mdi:arrow-right" width={16} />}
          >
            Start Registration
          </Button>
        </Stack>
      </FormSectionCard>
    );
  }

  return (
    <FormSectionCard
      title="Before You Start"
      icon={GlobalIcons.info}
      descriptionTooltip="Keep the following ready to complete the registration smoothly."
      contentSpacing={2}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1.7fr) minmax(280px, 1fr)' },
          gap: { xs: 2, md: 3 },
        }}
      >
        <Stack
          component="ol"
          spacing={1.5}
          sx={{ m: 0, pl: 2.5, color: 'text.primary', minWidth: 0 }}
        >
          <Box component="li" sx={{ pl: 0.5 }}>
            <Typography variant="body2" fontWeight={600}>
              Use names as shown on official documents.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your name and other details exactly as they appear on official documents (e.g.,
              birth certificate, Aadhaar, etc.).
            </Typography>
          </Box>
          <Box component="li" sx={{ pl: 0.5 }}>
            <Typography variant="body2" fontWeight={600}>
              Check the date of birth and contact details carefully.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ensure your date of birth, phone number and email are correct.
            </Typography>
          </Box>
          <Box component="li" sx={{ pl: 0.5 }}>
            <Typography variant="body2" fontWeight={600}>
              Complete each required field marked *.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fill in all fields that are marked with an asterisk (*).
            </Typography>
          </Box>
          {hasDocuments && (
            <Box component="li" sx={{ pl: 0.5 }}>
              <Typography variant="body2" fontWeight={600}>
                Upload clear documents in the Documents step.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload legible, complete and valid documents in the Documents step.
              </Typography>
            </Box>
          )}
          <Box component="li" sx={{ pl: 0.5 }}>
            <Typography variant="body2" fontWeight={600}>
              Review your answers{hasDocuments ? ' and documents' : ''} before sending them to
              school.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Check all information and uploads carefully to avoid delays.
            </Typography>
          </Box>
        </Stack>

        <Stack
          spacing={2}
          justifyContent="center"
          sx={{
            minWidth: 0,
            borderLeft: { md: 1 },
            borderColor: { md: 'divider' },
            pl: { md: 3 },
          }}
        >
          <Box
            sx={{
              p: 1.5,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1.5,
              bgcolor: 'background.neutral',
            }}
          >
            <FormControlLabel
              sx={{ m: 0, alignItems: 'flex-start', '& .MuiFormControlLabel-label': { pt: 0.5 } }}
              control={
                <Checkbox
                  checked={acknowledged}
                  onChange={(event) => setAcknowledged(event.target.checked)}
                  inputProps={{
                    'aria-label': 'I have read these instructions and am ready to continue.',
                  }}
                />
              }
              label={
                <Typography variant="body2" fontWeight={600}>
                  I have read these instructions and am ready to continue.
                </Typography>
              }
            />
          </Box>
          <Button
            size="small"
            variant="contained"
            disabled={!acknowledged}
            onClick={onContinue}
            endIcon={<Iconify icon="ic:round-arrow-forward" width={20} />}
          >
            Continue to application form
          </Button>
        </Stack>
      </Box>
    </FormSectionCard>
  );
}
