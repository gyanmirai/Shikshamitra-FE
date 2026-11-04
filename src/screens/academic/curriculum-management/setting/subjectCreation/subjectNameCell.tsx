import { Box, Stack, Typography } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';

import type { ISubject } from './type';

const SubjectNameCell = ({ value, subject }: { value: string; subject: ISubject }) => {
  const displayName = subject.displayName || value;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        minWidth: 0,
      }}
    >
      <Box
        component="span"
        aria-hidden="true"
        sx={{
          width: 3,
          height: 20,
          flexShrink: 0,
          borderRadius: 0.5,
          bgcolor: subject.color || 'primary.main',
        }}
      />

      <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            lineHeight: 1.25,
            color: 'text.primary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {value}
        </Typography>
        {displayName !== value && (
          <CustomTooltip title={`Display: ${displayName}`} arrow>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              tabIndex={0}
              sx={{ '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' } }}
            >
              Display: {displayName}
            </Typography>
          </CustomTooltip>
        )}
      </Stack>
    </Box>
  );
};

export default SubjectNameCell;
