import { Box, Stack, Typography } from '@mui/material';

type Props = {
  step: number;
  title: string;
  description: string;
};

export function SubjectCopySectionHeading({ step, title, description }: Props) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Box
        aria-hidden
        sx={{
          width: 28,
          height: 28,
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
          borderRadius: '50%',
          bgcolor: 'action.selected',
          color: 'text.primary',
          typography: 'subtitle2',
        }}
      >
        {step}
      </Box>
      <Box>
        <Typography variant="subtitle2">{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
    </Stack>
  );
}
