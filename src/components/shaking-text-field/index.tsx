import { m } from 'framer-motion';

import { Box } from '@mui/material';

export default function ShakingTextField({
  error,
  children,
}: {
  error?: boolean;
  children?: React.ReactNode;
}) {
  console.log(children);
  //   useEffect(() => {
  //     if (error) {
  //       // Mobile vibration (if supported)
  //       if (navigator?.vibrate) {
  //         navigator.vibrate(200); // Vibrate for 200ms
  //       }
  //     }
  //   }, [error]);

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
