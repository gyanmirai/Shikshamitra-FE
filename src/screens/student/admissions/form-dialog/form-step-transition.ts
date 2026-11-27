import { keyframes } from '@mui/material/styles';

const revealStep = keyframes`
  from { opacity: 0; transform: translateX(40px); }
  to { opacity: 1; transform: translateX(0); }
`;

export const formStepTransition = {
  animation: `${revealStep} 280ms ease-out`,
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
} as const;
