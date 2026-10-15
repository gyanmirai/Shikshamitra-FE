import Box from '@mui/material/Box';
import { varAlpha } from 'src/theme/styles';
import Typography from '@mui/material/Typography';

import { LoginHeader } from './login-header';
import { SchoolIllustration } from './school-illustration';

export function LoginBrandPanel() {
  return (
    <Box
      component="section"
      aria-labelledby="school-welcome-heading"
      sx={(theme) => ({
        bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
        color: 'text.primary',
        px: { xs: 3, sm: 4, lg: 5 },
        py: { xs: 3, sm: 4, lg: 5 },
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        '@media (min-width: 900px) and (max-height: 800px)': { py: 3 },
      })}
    >
      <LoginHeader />
      <Box
        sx={{
          flex: 1,
          display: { xs: 'flex', sm: 'grid', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          width: 1,
          mt: { xs: 3, sm: 4 },
          '@media (min-width: 900px) and (max-height: 800px)': { mt: 2 },
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 0.8fr)',
          columnGap: 3,
        }}
      >
        <Box sx={{ maxWidth: 440 }}>
          <Typography
            variant="body2"
            sx={(theme) => ({
              color: 'primary.dark',
              fontWeight: 600,
              mb: 1.5,
              ...theme.applyStyles('dark', { color: 'primary.light' }),
            })}
          >
            School management, simplified
          </Typography>
          <Typography
            id="school-welcome-heading"
            component="h1"
            sx={(theme) => ({
              fontSize: { xs: '2rem', sm: '2.5rem', md: '2.625rem' },
              fontWeight: 700,
              lineHeight: 1.12,
              letterSpacing: '-0.035em',
              color: 'primary.darker',
              ...theme.applyStyles('dark', { color: 'primary.lighter' }),
            })}
          >
            More time for
            <br />
            what matters.
          </Typography>
          <Typography
            variant="body2"
            sx={(theme) => ({
              mt: 1.5,
              maxWidth: 340,
              lineHeight: 1.7,
              color: 'grey.700',
              ...theme.applyStyles('dark', { color: 'text.secondary' }),
            })}
          >
            Bring your academics, administration, and school community together.
          </Typography>
        </Box>
        <Box
          sx={{
            mt: { sm: 0, md: 3 },
            '@media (min-width: 900px) and (max-height: 800px)': { mt: 2 },
            mx: 'auto',
            width: 1,
            alignSelf: 'center',
            display: { xs: 'none', sm: 'block' },
            '& img': {
              maxHeight: { sm: 230, md: 360, lg: 390 },
              '@media (min-width: 900px) and (max-height: 800px)': {
                maxHeight: 'min(44dvh, 340px)',
              },
            },
          }}
        >
          <SchoolIllustration />
        </Box>
      </Box>
    </Box>
  );
}
