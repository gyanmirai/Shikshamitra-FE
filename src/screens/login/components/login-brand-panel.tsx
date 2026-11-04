import Box from '@mui/material/Box';
import { varAlpha } from 'src/theme/styles';
import Typography from '@mui/material/Typography';

import { LoginHeader } from './login-header';
import { LoginTypewriter } from './login-typewriter';
import { SchoolIllustration } from './school-illustration';
import { LoginClassroomScene } from './login-classroom-scene';

import type { LoginCompanionState } from '../hooks/use-login-companion';
import type { LoginSceneMotion } from '../hooks/use-login-scene-motion';

type Props = { companion?: { state: LoginCompanionState; motion: LoginSceneMotion } };

export function LoginBrandPanel({ companion }: Props) {
  return (
    <Box
      component="section"
      aria-labelledby="school-welcome-heading"
      sx={(theme) => ({
        bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
        color: 'text.primary',
        px: { xs: 3, sm: 4, lg: 5 },
        py: { xs: companion ? 2 : 3, sm: 4, lg: 5 },
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
          mt: { xs: companion ? 1.5 : 3, sm: 4 },
          '@media (min-width: 900px) and (max-height: 800px)': { mt: 2 },
          gridTemplateColumns: companion
            ? 'minmax(0, 1fr) minmax(0, 1fr)'
            : 'minmax(0, 1fr) minmax(0, 0.8fr)',
          alignItems: { xs: companion ? 'stretch' : 'center', sm: 'center', md: 'stretch' },
          columnGap: 3,
        }}
      >
        <Box sx={{ maxWidth: 440, width: 1 }}>
          <Typography
            variant="body2"
            sx={(theme) => ({
              color: 'primary.dark',
              fontWeight: 600,
              mb: 1.5,
              display: { xs: companion ? 'none' : 'block', sm: 'block' },
              ...theme.applyStyles('dark', { color: 'primary.light' }),
            })}
          >
            School management, simplified
          </Typography>
          <Typography
            id="school-welcome-heading"
            component="h1"
            sx={(theme) => ({
              fontSize: {
                xs: companion ? '1.25rem' : '2rem',
                sm: companion ? '2rem' : '2.5rem',
                md: '2.625rem',
              },
              fontWeight: 700,
              lineHeight: 1.12,
              letterSpacing: '-0.035em',
              color: 'primary.darker',
              ...theme.applyStyles('dark', { color: 'primary.lighter' }),
            })}
          >
            Your whole school.
            <br />
            Working together.
          </Typography>
          <Typography
            variant="body2"
            sx={(theme) => ({
              mt: 1.5,
              maxWidth: companion ? 440 : 340,
              lineHeight: 1.7,
              minHeight: companion ? '3.4em' : undefined,
              color: 'grey.700',
              display: {
                xs: companion ? 'none' : 'block',
                sm: 'block',
                md: 'block',
              },
              ...theme.applyStyles('dark', { color: 'text.secondary' }),
            })}
          >
            {companion ? (
              <LoginTypewriter motion={companion.motion} />
            ) : (
              'Finance, HR, academics and students in one place.'
            )}
          </Typography>
        </Box>
        <Box
          sx={{
            mt: { xs: companion ? 0.5 : 0, sm: 0, md: 3 },
            '@media (min-width: 900px) and (max-height: 800px)': { mt: 2 },
            mx: 'auto',
            width: 1,
            alignSelf: 'center',
            display: { xs: companion ? 'block' : 'none', sm: 'block' },
            ...(!companion && {
              '& img': {
                maxHeight: { sm: 230, md: 360, lg: 390 },
                '@media (min-width: 900px) and (max-height: 800px)': {
                  maxHeight: 'min(44dvh, 340px)',
                },
              },
            }),
          }}
        >
          {companion ? (
            <LoginClassroomScene state={companion.state} motion={companion.motion} />
          ) : (
            <SchoolIllustration />
          )}
        </Box>
      </Box>
    </Box>
  );
}
