import { Box, IconButton } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';

type Props = {
  title: string;
  helpText: string;
  helpLabel?: string;
};

export function AdmissionDialogTitle({ title, helpText, helpLabel }: Props) {
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
      {title}
      <CustomTooltip arrow placement="right" title={helpText}>
        <IconButton
          aria-label={helpLabel ?? `About ${title}`}
          size="small"
          sx={{ width: { xs: 44, sm: 28 }, height: { xs: 44, sm: 28 }, color: 'info.main' }}
        >
          <Iconify icon="mdi:information-outline" width={18} />
        </IconButton>
      </CustomTooltip>
    </Box>
  );
}
