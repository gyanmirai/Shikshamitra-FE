import type { ReactNode, MouseEvent } from 'react';

import { useEffect } from 'react';
import { Box, Link, Stack, Typography } from '@mui/material';

import { publicAdmissionsCopy } from './public-admissions-copy';
import { getSafePublicAdmissionsAccent } from './public-admissions-portal';

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
  const accentColor = getSafePublicAdmissionsAccent(portal?.primaryColor);

  const skipToMainContent = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const main = document.getElementById('public-admissions-content');
    if (!main) return;
    main.focus({ preventScroll: true });
    main.scrollIntoView({ block: 'start' });
  };

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
        overflowX: 'hidden',
        '& a, & button': { touchAction: 'manipulation' },
      }}
    >
      <Box
        component="a"
        href="#public-admissions-content"
        onClick={skipToMainContent}
        sx={{
          position: 'fixed',
          top: 8,
          left: 8,
          zIndex: (theme) => theme.zIndex.tooltip + 1,
          transform: 'translateY(-160%)',
          bgcolor: 'background.paper',
          color: 'text.primary',
          px: 1.5,
          py: 1,
          borderRadius: 1,
          boxShadow: 3,
          transition: (theme) => theme.transitions.create('transform'),
          '&:focus-visible': { transform: 'translateY(0)' },
          '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        }}
      >
        {copy.skipToContent}
      </Box>
      <Stack spacing={2.5} sx={{ width: '100%', maxWidth: 780, mx: 'auto' }}>
        <Stack
          component="header"
          direction="row"
          spacing={1.5}
          alignItems="flex-start"
          sx={{
            borderTop: accentColor ? `4px solid ${accentColor}` : undefined,
            pt: accentColor ? 1.5 : 0,
          }}
        >
          {portal?.logoDataUrl ? (
            <Box
              component="img"
              src={portal.logoDataUrl}
              alt={`${portal.schoolName} logo`}
              width={56}
              height={56}
              loading="eager"
              sx={{ objectFit: 'contain', borderRadius: 1, flexShrink: 0 }}
            />
          ) : null}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="overline" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
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
        <Box
          id="public-admissions-content"
          component="main"
          tabIndex={-1}
          sx={{ minWidth: 0, scrollMarginTop: 2 }}
        >
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
