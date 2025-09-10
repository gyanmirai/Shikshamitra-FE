import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { UploadIllustration } from 'src/assets/illustrations';

interface UploadPlaceholderProps extends React.ComponentProps<typeof Box> {
  onBrowseClick?: () => void;
}

export function UploadPlaceholder({ onBrowseClick, ...other }: UploadPlaceholderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
      {...other}
    >
      <UploadIllustration hideBackground sx={{ width: 200 }} />

      <Stack>
        {/* <Box sx={{ typography: 'h6' }}>Drop file</Box> */}
        <Box
          component="span"
          onClick={(e) => {
            // e.stopPropagation();
            onBrowseClick?.();
          }}
          sx={{
            // mx: 0.5,
            color: 'primary.main',
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
        >
          Upload Document
        </Box>
      </Stack>
    </Box>
  );
}
