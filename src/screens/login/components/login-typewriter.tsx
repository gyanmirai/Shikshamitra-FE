import Box from '@mui/material/Box';

import { LOGIN_TAGLINES, useLoginTypewriter } from '../hooks/use-login-typewriter';

import type { LoginSceneMotion } from '../hooks/use-login-scene-motion';

const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)',
} as const;

export function LoginTypewriter({ motion }: { motion: LoginSceneMotion }) {
  const text = useLoginTypewriter({
    paused: motion.motionPaused,
    reducedMotion: motion.reducedMotion,
  });
  return (
    <>
      <Box component="span" sx={visuallyHidden}>
        {LOGIN_TAGLINES[0]}
      </Box>
      <Box component="span" aria-hidden="true">
        <Box component="span" data-login-typewriter>
          {text}
        </Box>
        {!motion.reducedMotion && (
          <Box
            component="span"
            data-typewriter-cursor
            sx={{
              display: 'inline-block',
              width: '2px',
              height: '1em',
              bgcolor: 'currentColor',
              verticalAlign: 'text-bottom',
              ml: '2px',
              animation: 'login-caret 1s step-end infinite',
              animationPlayState: motion.motionPaused ? 'paused' : 'running',
              '@keyframes login-caret': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0 } },
              '@media (prefers-reduced-motion: reduce)': { display: 'none', animation: 'none' },
            }}
          />
        )}
      </Box>
    </>
  );
}
