import { m } from 'framer-motion';

import { Box } from '@mui/material';

export default function ShakingTextField({
  error,
  children,
}: {
  error?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <Box
      component={m.div}
      animate={error ? { x: [-5, 5, -5, 5, 0] } : { x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </Box>
  );
}
