import type { ReactNode } from 'react';

import { useEffect } from 'react';
import { Box, Link, Stack, Typography } from '@mui/material';

import { publicAdmissionsCopy } from './public-admissions-copy';

import type { PublicAdmissionPortal } from './public-admissions-portal';
import type { PublicAdmissionsLanguage } from './public-admissions-copy';

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  language?: PublicAdmissionsLanguage;
  portal?: PublicAdmissionPortal | null;
};

export function PublicAdmissionsShell({
  eyebrow,
  title,
  description,
  children,
  language = 'en',
  portal,
}: Props) {
  const copy = publicAdmissionsCopy[language];

  useEffect(() => {
    document.title = `${title} | ${portal?.schoolName || 'GyanMirai'}`;
  }, [portal?.schoolName, title]);

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        bgcolor: 'background.neutral',
        color: 'text.primary',
        px: { xs: 1.5, sm: 2.5 },
        pt: { xs: 'max(20px, env(safe-area-inset-top))', sm: 4 },
        pb: { xs: 'max(20px, env(safe-area-inset-bottom))', sm: 4 },
      }}
    >
      <Stack spacing={2.5} sx={{ width: '100%', maxWidth: 780, mx: 'auto' }}>
        <Stack
          component="header"
          direction="row"
          spacing={1.5}
          alignItems="flex-start"
          sx={{
            borderTop: portal?.primaryColor ? `4px solid ${portal.primaryColor}` : undefined,
            pt: portal?.primaryColor ? 1.5 : 0,
          }}
        >
          {portal?.logoDataUrl ? (
            <Box
              component="img"
              src={portal.logoDataUrl}
              alt={`${portal.schoolName} logo`}
              width={56}
              height={56}
              sx={{ objectFit: 'contain', borderRadius: 1, flexShrink: 0 }}
            />
          ) : null}
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="overline"
              color={portal?.primaryColor ? undefined : 'primary.darker'}
              sx={{ color: portal?.primaryColor, overflowWrap: 'anywhere' }}
            >
              {eyebrow || portal?.schoolName || copy.eyebrow}
            </Typography>
            <Typography variant="h4" component="h1" sx={{ textWrap: 'balance' }}>
              {title}
            </Typography>
            {description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5, textWrap: 'pretty' }}
              >
                {description}
              </Typography>
            )}
          </Box>
        </Stack>
        <Box component="main" sx={{ minWidth: 0 }}>
          {children}
        </Box>
        <Stack component="footer" spacing={0.75} alignItems="center" textAlign="center">
          {(portal?.helpText || portal?.admissionsPhone || portal?.admissionsEmail) && (
            <Box>
              <Typography variant="subtitle2">{copy.needHelp}</Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {portal.helpText || copy.admissionsOffice}
              </Typography>
              <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap">
                {portal.admissionsPhone && (
                  <Link variant="caption" href={`tel:${portal.admissionsPhone}`}>
                    {portal.admissionsPhone}
                  </Link>
                )}
                {portal.admissionsEmail && (
                  <Link variant="caption" href={`mailto:${portal.admissionsEmail}`}>
                    {portal.admissionsEmail}
                  </Link>
                )}
              </Stack>
              {portal.officeHours && (
                <Typography variant="caption" color="text.secondary" display="block">
                  {copy.officeHours}: {portal.officeHours}
                </Typography>
              )}
            </Box>
          )}
          <Typography variant="caption" color="text.secondary">
            {copy.privacy}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
