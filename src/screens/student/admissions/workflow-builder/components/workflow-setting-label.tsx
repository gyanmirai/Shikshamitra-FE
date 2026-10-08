import { Box, IconButton } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';

export function WorkflowSettingLabel({ label, help }: { label: string; help: string }) {
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
      {label}
      <CustomTooltip title={help} arrow placement="right">
        <IconButton
          type="button"
          size="small"
          aria-label={`${label} information`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          sx={{ color: 'info.main', width: { xs: 44, sm: 28 }, height: { xs: 44, sm: 28 } }}
        >
          <Iconify icon="mdi:information-outline" width={16} />
        </IconButton>
      </CustomTooltip>
    </Box>
  );
}
