import type { RootState } from 'src/redux/store';

import Box from '@mui/material/Box';
import { useSelector } from 'react-redux';
import Typography from '@mui/material/Typography';
import { RouterLink } from 'src/routes/components';
import { Logo, LogoWithText } from 'src/components/logo';
import { useGetTenantByIdQuery } from 'src/redux/tenant/tenantApi';

import { SchoolBrandingLogo } from './school-branding-logo';

export function SchoolNavigationBrand({
  href,
  compact = false,
}: {
  href?: string;
  compact?: boolean;
}) {
  const context = useSelector((state: RootState) => state.auth.sessionContext);
  const tenantId = context?.accountMode === 'tenant' ? (context.tenantId ?? undefined) : undefined;
  const tenant = useGetTenantByIdQuery(tenantId, { skip: !tenantId });
  const schoolCode = tenant.currentData?.name;
  if (!tenantId) return compact ? <Logo href={href} /> : <LogoWithText href={href} />;
  return (
    <Box
      component={RouterLink}
      href={href ?? '/dashboard'}
      aria-label={schoolCode ? `${schoolCode} home` : 'School home'}
      title={schoolCode}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1.5,
        maxWidth: 1,
        minWidth: 0,
        textDecoration: 'none',
      }}
    >
      <SchoolBrandingLogo tenantId={tenantId} disableLink />
      {!compact && (
        <Typography
          component="span"
          noWrap
          sx={{ color: 'primary.main', fontSize: 28, lineHeight: 1, fontWeight: 400 }}
        >
          {schoolCode}
        </Typography>
      )}
    </Box>
  );
}
