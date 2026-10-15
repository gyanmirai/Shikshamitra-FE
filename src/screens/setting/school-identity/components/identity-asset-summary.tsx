import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import { Label } from 'src/components/label';
import { fData } from 'src/utils/format-number';
import Typography from '@mui/material/Typography';
import LockOutlined from '@mui/icons-material/LockOutlined';
import ImageOutlined from '@mui/icons-material/ImageOutlined';

import { IdentityImage } from './identity-image';

import type { IdentityKind, IdentityContext, EffectiveIdentityAsset } from '../types';

export function IdentityAssetSummary({
  kind,
  label,
  item,
  context,
  restricted = false,
}: {
  kind: IdentityKind;
  label: string;
  item?: EffectiveIdentityAsset;
  context: IdentityContext;
  restricted?: boolean;
}) {
  const asset = restricted || item?.selection.mode === 2 ? null : item?.asset;
  const status = restricted
    ? 'Signature access is restricted'
    : asset
      ? item?.source
      : item?.selection.mode === 2
        ? 'Do not display'
        : 'No image configured';
  return (
    <Box
      component="article"
      aria-label={label}
      sx={{
        p: 1.5,
        minWidth: 0,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: { xs: 72, sm: 112 },
              minHeight: 96,
              flexShrink: 0,
              display: 'grid',
              alignItems: 'center',
              bgcolor: 'background.neutral',
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            {asset ? (
              <IdentityImage
                id={asset.id}
                context={context}
                label={label}
                height={kind === 'logo' ? 96 : 80}
              />
            ) : (
              <Box sx={{ display: 'grid', placeItems: 'center', color: 'text.secondary' }}>
                {restricted ? <LockOutlined /> : <ImageOutlined />}
              </Box>
            )}
          </Box>
          <Stack spacing={0.75} sx={{ minWidth: 0, flex: 1 }}>
            <Typography component="h3" variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
              {label}
            </Typography>
            {asset ? (
              <>
                <Label
                  sx={{
                    alignSelf: 'flex-start',
                    color: 'text.primary',
                    height: 'auto',
                    minHeight: 24,
                    whiteSpace: 'normal',
                  }}
                >
                  {status}
                </Label>
                <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                  {asset.fileName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {asset.width} × {asset.height} px · {fData(asset.size)}
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary">
                  {status}
                </Typography>
                {!restricted && context.boardId && item?.source && (
                  <Typography variant="caption" color="text.secondary">
                    {item.source}
                  </Typography>
                )}
              </>
            )}
          </Stack>
        </Stack>
        {asset && asset.width < (kind === 'banner' ? 1200 : kind === 'logo' ? 300 : 400) && (
          <Alert severity="warning" sx={{ minWidth: 0 }}>
            Low-resolution image. Check the document preview before printing.
          </Alert>
        )}
        {kind === 'signature' &&
          !restricted &&
          item?.selection.mode !== 2 &&
          item?.selection.principalName && (
            <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 1 }}>
              <Typography variant="body2" fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
                {item.selection.principalName}
              </Typography>
              {item.selection.designation && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ overflowWrap: 'anywhere' }}
                >
                  {item.selection.designation}
                </Typography>
              )}
            </Box>
          )}
      </Stack>
    </Box>
  );
}
