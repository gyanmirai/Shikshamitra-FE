export const classroomMotion = {
  '& .actor-breath': {
    transformOrigin: '222px 870px',
    animation: 'classroom-breathe 4.2s ease-in-out infinite',
  },
  '& .actor-head': { animation: 'classroom-look 8s ease-in-out infinite' },
  '& .actor-eyelids': { opacity: 0, animation: 'classroom-blink 5.3s linear infinite' },
  '& .actor-hand': { animation: 'classroom-point 7.5s ease-in-out infinite' },
  '& .classroom-hr .actor-hand': {
    animation: 'classroom-mark 7s ease-in-out infinite',
    animationDelay: '-2s',
  },
  '& .classroom-finance .actor-hand': {
    animation: 'classroom-write 1.8s ease-in-out infinite',
    animationDelay: '-0.4s',
  },
  '& .classroom-students .actor-hand': {
    animation: 'classroom-wave 8s ease-in-out infinite',
  },
  '& .classroom-hr .actor-breath, & .classroom-hr .actor-head': {
    animationDelay: '-1.7s',
  },
  '& .classroom-academics .actor-breath, & .classroom-academics .actor-head': {
    animationDelay: '-3.1s',
  },
  '& .classroom-students .actor-breath, & .classroom-students .actor-head': {
    animationDelay: '-2.4s',
  },
  '& .classroom-hr .actor-eyelids': { animationDelay: '-1.5s' },
  '& .classroom-academics .actor-eyelids': { animationDelay: '-3.3s' },
  '& .classroom-students .actor-eyelids': { animationDelay: '-2.6s' },
  '& .academic-page': {
    transformOrigin: '218px 402px',
    animation: 'classroom-page 9s ease-in-out infinite',
  },
  '& .finance-receipt': {
    animation: 'classroom-receipt 6s ease-in-out infinite',
  },
  '& .attendance-check': {
    strokeDasharray: 50,
    animation: 'classroom-check 7s ease-in-out infinite',
    animationDelay: '-2s',
  },
  '&[data-motion-paused="true"] *': { animationPlayState: 'paused !important' },
  '&[data-looking-away="true"] .actor-eyelids': { opacity: '1 !important' },
  '&[data-companion-state="welcome"] .classroom-students .actor-hand, &[data-companion-state="success"] .classroom-students .actor-hand':
    {
      animation: 'classroom-wave 1.8s ease-in-out infinite',
    },
  '@media (prefers-reduced-motion: reduce)': { '& *': { animation: 'none !important' } },
  '@keyframes classroom-breathe': {
    '0%, 100%': { transform: 'scale(1, 1)' },
    '50%': { transform: 'scale(1.002, 1.006)' },
  },
  '@keyframes classroom-look': {
    '0%, 20%, 70%, 100%': { transform: 'rotate(0deg)' },
    '32%, 48%': { transform: 'rotate(-1deg)' },
    '82%, 92%': { transform: 'rotate(0.8deg)' },
  },
  '@keyframes classroom-blink': {
    '0%, 91%, 96%, 100%': { opacity: 0 },
    '93%, 94%': { opacity: 1 },
  },
  '@keyframes classroom-point': {
    '0%, 24%, 75%, 100%': { transform: 'rotate(0deg)' },
    '38%, 55%': { transform: 'rotate(-5deg)' },
  },
  '@keyframes classroom-mark': {
    '0%, 18%, 55%, 100%': { transform: 'rotate(0deg)' },
    '25%, 35%': { transform: 'rotate(-2deg) translate(2px, 1px)' },
    '30%, 42%': { transform: 'rotate(1deg) translate(-1px, 2px)' },
  },
  '@keyframes classroom-write': {
    '0%, 100%': { transform: 'rotate(0deg)' },
    '25%, 75%': { transform: 'rotate(1.3deg) translate(2px, 1px)' },
    '50%': { transform: 'rotate(-0.7deg) translate(-1px, 2px)' },
  },
  '@keyframes classroom-wave': {
    '0%, 12%, 30%, 100%': { transform: 'rotate(0deg)' },
    '18%, 26%': { transform: 'rotate(-6deg)' },
    '22%': { transform: 'rotate(3deg)' },
  },
  '@keyframes classroom-receipt': {
    '0%, 12%, 100%': { opacity: 0.25 },
    '25%, 85%': { opacity: 1 },
  },
  '@keyframes classroom-page': {
    '0%, 68%, 92%, 100%': { transform: 'scaleX(1)' },
    '78%': { transform: 'scaleX(0.1) rotate(-4deg)' },
    '84%': { transform: 'scaleX(0.65) rotate(-1deg)' },
  },
  '@keyframes classroom-check': {
    '0%, 21%, 100%': { strokeDashoffset: 50, opacity: 0 },
    '24%': { strokeDashoffset: 50, opacity: 1 },
    '38%, 88%': { strokeDashoffset: 0, opacity: 1 },
    '96%': { strokeDashoffset: 0, opacity: 0 },
  },
};
