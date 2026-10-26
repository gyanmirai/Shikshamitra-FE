import Box from '@mui/material/Box';
import { FormSectionCard } from 'src/components/form-section-card';

import { IDENTITY_KINDS, IDENTITY_LABELS } from '../types';
import { IdentityAssetSummary } from './identity-asset-summary';

import type { IdentityContext, IdentityProfile } from '../types';

export function IdentityAssets({
  profile,
  context,
}: {
  profile: IdentityProfile;
  context: IdentityContext;
}) {
  return (
    <FormSectionCard
      icon="mdi:image-multiple-outline"
      title="Identity Assets"
      titleTypographyProps={{ id: 'identity-assets-heading' }}
      descriptionTooltip="Review the effective school images, their source and file details. Open an image to inspect it at full size."
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: 1.5,
        }}
      >
        {IDENTITY_KINDS.map((kind) => (
          <IdentityAssetSummary
            key={kind}
            kind={kind}
            label={IDENTITY_LABELS[kind]}
            item={
              kind === 'signature' && !profile.canAccessSignature
                ? undefined
                : profile.effective[kind]
            }
            context={context}
            restricted={kind === 'signature' && !profile.canAccessSignature}
          />
        ))}
      </Box>
    </FormSectionCard>
  );
}
