import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import { Label } from 'src/components/label';
import Typography from '@mui/material/Typography';
import { FormSectionCard } from 'src/components/form-section-card';

import { IdentityPreviewButton } from './identity-preview';
import { IdentityDocumentAsset } from './identity-document-asset';

import type { IdentityContext, IdentityProfile } from '../types';

const SAMPLE_PARAGRAPHS = [
  [60, 100, 94, 100, 72],
  [100, 68, 26],
];

export function IdentityDocumentLayout({
  profile,
  context,
  disabled = false,
}: {
  profile: IdentityProfile;
  context: IdentityContext;
  disabled?: boolean;
}) {
  const signature = profile.canAccessSignature ? profile.effective.signature : undefined;
  return (
    <FormSectionCard
      icon="mdi:file-eye-outline"
      title="Document Layout Preview"
      titleTypographyProps={{ id: 'identity-layout-heading' }}
      descriptionTooltip="This sample shows where the effective logo, letterhead and signature appear. Use Preview document to check the generated PDF before printing."
      action={<IdentityPreviewButton context={context} disabled={disabled} />}
      actionFullWidthOnMobile
    >
      <Stack
        spacing={2}
        sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: 'background.neutral', borderRadius: 1.5 }}
      >
        <Stack
          direction="row"
          gap={1}
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
        >
          <Typography variant="caption" color="text.secondary">
            A4 · Portrait
          </Typography>
          <Label sx={{ color: 'text.primary' }}>Sample layout only</Label>
        </Stack>
        <Paper
          variant="outlined"
          sx={{
            width: 1,
            maxWidth: 280,
            mx: 'auto',
            aspectRatio: '210 / 297',
            p: { xs: 1.5, sm: 2 },
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            borderRadius: 0.5,
            boxShadow: (theme) => theme.customShadows.z4,
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)',
              gap: 1.5,
              pb: 1.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <IdentityDocumentAsset
                item={profile.effective.logo}
                context={context}
                label="Logo"
                height={56}
              />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <IdentityDocumentAsset
                item={profile.effective.banner}
                context={context}
                label="Letterhead"
                height={56}
              />
            </Box>
          </Box>
          <Stack spacing={2} aria-hidden="true" sx={{ flex: 1, py: 2 }}>
            {SAMPLE_PARAGRAPHS.map((paragraph, index) => (
              <Stack key={index} spacing={1}>
                {paragraph.map((width, line) => (
                  <Box
                    key={line}
                    sx={{ width: `${width}%`, height: 4, borderRadius: 0.5, bgcolor: 'divider' }}
                  />
                ))}
              </Stack>
            ))}
          </Stack>
          <Stack spacing={0.5} sx={{ width: '45%', alignSelf: 'flex-end', minWidth: 0 }}>
            {profile.canAccessSignature ? (
              <IdentityDocumentAsset
                item={signature}
                context={context}
                label="Signature"
                height={44}
              />
            ) : (
              <Typography variant="caption" color="text.secondary">
                Signature hidden
              </Typography>
            )}
            {signature?.selection.mode !== 2 && signature?.selection.principalName && (
              <Typography variant="caption" sx={{ overflowWrap: 'anywhere' }}>
                {signature.selection.principalName}
              </Typography>
            )}
            {signature?.selection.mode !== 2 && signature?.selection.designation && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ overflowWrap: 'anywhere' }}
              >
                {signature.selection.designation}
              </Typography>
            )}
          </Stack>
        </Paper>
      </Stack>
    </FormSectionCard>
  );
}
