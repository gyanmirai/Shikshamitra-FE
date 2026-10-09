import Box from '@mui/material/Box';
import { motion } from 'framer-motion';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';

export default function PermissionEmptyState() {
  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'text.secondary',
        py: 3,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
          <Iconify
            icon="solar:lock-password-unlocked-bold-duotone"
            width={80}
            sx={{ color: 'primary.main' }}
          />
        </Box>
      </motion.div>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Select a Sub-module
      </Typography>
      <Typography variant="body2" sx={{ maxWidth: 300, textAlign: 'center' }}>
        Choose a sub-module from the navigation to manage its permissions.
      </Typography>
    </Box>
  );
}
