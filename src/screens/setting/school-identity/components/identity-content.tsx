import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { FormSectionCard } from 'src/components/form-section-card';

import { IdentityAssets } from './identity-assets';
import { IdentityDocumentLayout } from './identity-document-layout';

import type { IdentityContext, IdentityProfile } from '../types';

export function IdentityContent({
  profile,
  context,
  disabled = false,
}: {
  profile?: IdentityProfile;
  context: IdentityContext;
  disabled?: boolean;
}) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1.1fr) minmax(0, 1fr)' },
        gap: 2,
        alignItems: 'start',
        minWidth: 0,
      }}
    >
      {profile ? (
        <>
          <IdentityAssets profile={profile} context={context} />
          <IdentityDocumentLayout profile={profile} context={context} disabled={disabled} />
        </>
      ) : (
        <>
          <FormSectionCard icon="mdi:image-multiple-outline" title="Identity assets">
            <Box aria-busy="true">
              <Typography role="status" variant="body2">
                Loading school identity assets…
              </Typography>
              {[0, 1, 2].map((item) => (
                <Skeleton key={item} variant="rounded" height={80} sx={{ mt: 2 }} />
              ))}
            </Box>
          </FormSectionCard>
          <FormSectionCard icon="mdi:file-eye-outline" title="Document layout preview">
            <Skeleton
              variant="rounded"
              sx={{
                width: 1,
                maxWidth: 280,
                aspectRatio: '210 / 297',
                height: 'auto',
                mx: 'auto',
              }}
            />
          </FormSectionCard>
        </>
      )}
    </Box>
  );
}
