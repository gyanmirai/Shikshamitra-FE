import { Box, Stack, Typography } from '@mui/material';

// ---------------------------------------------------------------------------
// ValidationCheck — single row in the publish checklist sidebar
// ---------------------------------------------------------------------------
interface ValidationCheckProps {
  label: string;
  valid: boolean;
}

export function ValidationCheck({ label, valid }: ValidationCheckProps) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ py: 0.2 }}>
      <Box
        sx={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          bgcolor: valid ? 'success.main' : 'action.disabled',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'background-color 0.3s',
        }}
      >
        {valid && (
          <Typography sx={{ fontSize: '0.5rem', color: 'white', lineHeight: 1, fontWeight: 900 }}>
            ✓
          </Typography>
        )}
      </Box>
      <Typography
        variant="caption"
        sx={{ fontSize: '0.7rem', color: valid ? 'text.primary' : 'text.disabled' }}
      >
        {label}
      </Typography>
    </Stack>
  );
}
