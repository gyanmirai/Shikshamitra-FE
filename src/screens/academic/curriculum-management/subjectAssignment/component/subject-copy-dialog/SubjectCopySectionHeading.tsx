import { Box, IconButton, Stack, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';

type Props = {
  step: number;
  title: string;
  description: string;
};

type InfoTooltipProps = {
  label: string;
  description: string;
};

export function SubjectCopyInfoTooltip({ label, description }: InfoTooltipProps) {
  return (
    <CustomTooltip arrow placement="right" title={description}>
      <IconButton aria-label={`${label} information`} size="small" sx={{ p: 0.25 }}>
        <Iconify icon="lucide:info" width={16} color="info.main" aria-hidden />
      </IconButton>
    </CustomTooltip>
  );
}

export function SubjectCopySectionHeading({ step, title, description }: Props) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="center">
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
        <Stack direction="row" alignItems="center" spacing={0.25}>
          <Typography variant="subtitle2">{title}</Typography>
          <SubjectCopyInfoTooltip label={title} description={description} />
        </Stack>
      </Box>
    </Stack>
  );
}
