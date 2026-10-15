import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
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
        py: { xs: 3, sm: 4 },
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      })}
    >
      <LoginHeader />
      <Box
        sx={{
          flex: 1,
          display: { xs: 'flex', sm: 'grid', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 0.8fr)',
          columnGap: 3,
        }}
      >
        <Box sx={{ mt: { xs: 3, sm: 4, md: 3 }, maxWidth: 420 }}>
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
              fontSize: { xs: '2rem', sm: '2.5rem', md: 'clamp(2.25rem, 3.2vw, 3rem)' },
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
          <Stack
            direction="row"
            useFlexGap
            flexWrap="wrap"
            spacing={1}
            sx={{ mt: 2, display: { xs: 'none', sm: 'flex' } }}
          >
            {['Academics', 'Administration', 'Communication'].map((label) => (
              <Typography
                key={label}
                variant="caption"
                sx={(theme) => ({
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 1,
                  bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
                  color: 'primary.dark',
                  ...theme.applyStyles('dark', { color: 'primary.light' }),
                })}
              >
                {label}
              </Typography>
            ))}
          </Stack>
        </Box>
        <Box
          sx={{
            my: 2,
            mx: { sm: 'auto', md: -2 },
            width: { sm: 1, md: 'calc(100% + 32px)' },
            alignSelf: 'center',
            display: { xs: 'none', sm: 'block' },
            '& svg': {
              maxHeight: { sm: 230, md: 260 },
              '@media (min-height: 850px) and (min-width: 900px)': { maxHeight: 340 },
            },
          }}
        >
          <SchoolIllustration />
        </Box>
      </Box>
      <Typography
        variant="caption"
        sx={(theme) => ({
          mt: 'auto',
          pt: 2,
          color: 'grey.700',
          display: { xs: 'none', md: 'block' },
          ...theme.applyStyles('dark', { color: 'text.secondary' }),
        })}
      >
        School management
      </Typography>
    </Box>
  );
}
