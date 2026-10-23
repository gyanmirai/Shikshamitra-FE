import type { TooltipProps } from '@mui/material';

import { IconButton } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';

type Props = TooltipProps & { label?: string };

export default function HelpTooltip({ children, label = 'Form information', ...props }: Props) {
  return (
    <CustomTooltip {...props}>
      <IconButton type="button" size="small" aria-label={label} sx={{ color: 'info.main' }}>
        {children}
      </IconButton>
    </CustomTooltip>
  );
}
