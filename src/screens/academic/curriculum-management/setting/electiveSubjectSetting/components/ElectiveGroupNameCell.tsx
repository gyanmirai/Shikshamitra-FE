import { Box, Typography } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';

import type { IElectiveSubject } from '../type';

export default function ElectiveGroupNameCell({ group }: { group: IElectiveSubject }) {
  const description = group.description || `${group.subjects?.length || 0} subjects`;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, maxWidth: 288 }}>
      <Box
        component="span"
        aria-hidden="true"
        sx={{
          width: 3,
          height: 20,
          flexShrink: 0,
          borderRadius: 0.5,
          bgcolor: group.color || 'primary.main',
        }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <CustomTooltip title={group.name} arrow>
          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
            {group.name}
          </Typography>
        </CustomTooltip>
        <CustomTooltip title={description} arrow placement="top">
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            tabIndex={0}
            onClick={(event) => event.stopPropagation()}
            sx={{
              display: 'block',
              '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
            }}
          >
            {description}
          </Typography>
        </CustomTooltip>
      </Box>
    </Box>
  );
}
