import { useState, useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Skeleton, Typography } from '@mui/material';

import type { ParentRegistrationTransport } from './parent-registration-transport';

export function ParentRegistrationLogo({
  schoolName,
  loadLogo,
}: {
  schoolName: string;
  loadLogo: ParentRegistrationTransport['logo'];
}) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let imageUrl: string | undefined;
    loadLogo(controller.signal)
      .then((logo) => {
        if (controller.signal.aborted || !logo.size || !/^image\/(png|jpeg)$/.test(logo.type))
          return;
        imageUrl = URL.createObjectURL(logo);
        setLogoUrl(imageUrl);
      })
      .catch(() => {
        // Branding is optional. The school name is the fallback if the logo cannot load.
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => {
      controller.abort();
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [loadLogo]);

  if (loading) return <Skeleton variant="rounded" width={48} height={48} aria-hidden />;
  if (logoUrl)
    return (
      <Box
        component="img"
        src={logoUrl}
        alt={`${schoolName} logo`}
        onError={() => setLogoUrl(null)}
        sx={{ width: 48, height: 48, objectFit: 'contain', objectPosition: 'left center' }}
      />
    );
  return (
    <Typography variant="subtitle1" component="p" fontWeight={700} sx={{ overflowWrap: 'anywhere' }}>
      {schoolName}
    </Typography>
  );
}

const millisecondsPerDay = 24 * 60 * 60 * 1000;

function expiryLabel(expiresAt: string, now: number) {
  const remaining = Date.parse(expiresAt) - now;
  if (!Number.isFinite(remaining)) return 'Registration link expiry unavailable';
  if (remaining <= 0) return 'Registration link expired';
  if (remaining < millisecondsPerDay) return 'Link expires in less than a day';
  const days = Math.ceil(remaining / millisecondsPerDay);
  return `Link expires in ${days} ${days === 1 ? 'day' : 'days'}`;
}

export function ParentRegistrationExpiry({ expiresAt }: { expiresAt: string }) {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Iconify
        icon="mdi:clock-outline"
        width={18}
        aria-hidden
        sx={{ color: 'warning.main', flexShrink: 0 }}
      />
      <Typography variant="body2">{expiryLabel(expiresAt, now)}</Typography>
    </Stack>
  );
}
