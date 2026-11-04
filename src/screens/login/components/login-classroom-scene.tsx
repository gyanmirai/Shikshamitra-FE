import { useId } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { classroomActors } from './login-classroom-actors';
import { classroomMotion } from './login-classroom-motion';
import { LoginClassroomActor } from './login-classroom-actor';
import { ClassroomBackground } from './login-classroom-props';

import type { LoginCompanionState } from '../hooks/use-login-companion';
import type { LoginSceneMotion } from '../hooks/use-login-scene-motion';

export function LoginClassroomScene({
  state,
  motion,
}: {
  state: LoginCompanionState;
  motion: LoginSceneMotion;
}) {
  const id = useId().replace(/:/g, '');
  return (
    <Box
      component="figure"
      aria-label="Your school team: Finance, HR and Payroll, Academics, and Students. Illustrative school activities."
      data-companion-state={state}
      data-motion-paused={motion.motionPaused}
      data-looking-away={state === 'password'}
      sx={[
        classroomMotion,
        (theme) => ({
          m: 0,
          width: 1,
          minWidth: 0,
          color: 'text.primary',
          '& svg': { display: 'block', width: 1, height: 'auto', overflow: 'hidden' },
          '& [data-classroom-actor]': {
            ...theme.applyStyles('dark', {
              filter: `drop-shadow(0 0 1px ${theme.vars.palette.primary.lighter})`,
            }),
          },
        }),
      ]}
    >
      <svg viewBox="0 0 1024 495" aria-hidden="true" focusable="false" data-classroom-artwork>
        <g fill="#118b62" opacity="0.1">
          {classroomActors.map((actor) => (
            <ellipse key={actor.name} cx={actor.x + 112} cy="469" rx="103" ry="13" />
          ))}
        </g>
        <ClassroomBackground />
        {classroomActors.map((actor) => (
          <LoginClassroomActor key={actor.name} actor={actor} sceneId={id} />
        ))}
      </svg>
      <Box
        component="figcaption"
        sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 1, mt: 1 }}
      >
        {classroomActors.map((actor) => (
          <Box key={actor.name} sx={{ minWidth: 0, textAlign: 'center' }}>
            <Typography
              component="span"
              variant="subtitle2"
              sx={{ display: 'block', fontSize: { xs: '0.65rem', sm: '0.8rem', lg: '0.9rem' } }}
            >
              {actor.title}
            </Typography>
            <Typography
              component="span"
              variant="caption"
              sx={{
                display: { xs: 'none', sm: 'block' },
                color: 'text.secondary',
                lineHeight: 1.5,
                mt: 0.5,
              }}
            >
              {actor.caption}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
