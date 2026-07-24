import { Box, Chip, Stack, Avatar, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

import type { ISubject } from './type';

const subjectIconMap: Record<string, string> = {
  book: 'lucide:book-open',
  calculator: 'lucide:calculator',
  flask: 'lucide:flask-conical',
  monitor: 'lucide:monitor',
  music: 'lucide:music',
  trophy: 'lucide:trophy',
  palette: 'lucide:palette',
};

const SubjectNameCell = ({ value, subject }: { value: string; subject: ISubject }) => {
  const displayName = subject.displayName || value;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        py: 0.25,
        minWidth: 0,
      }}
    >
      <Avatar
        sx={(theme) => {
          const avatarColor = subject.color || theme.palette.primary.main;

          return {
            width: 38,
            height: 38,
            flex: '0 0 38px',
            bgcolor: avatarColor,
            color: theme.palette.getContrastText(avatarColor),
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0,
            boxShadow: `0 0 0 4px ${alpha(avatarColor, 0.12)}`,
          };
        }}
      >
        {subject.icon ? (
          <Iconify
            icon={subjectIconMap[subject.icon] || 'lucide:book-open'}
            width={18}
            height={18}
          />
        ) : (
          value.slice(0, 2).toUpperCase()
        )}
      </Avatar>

      <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
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
        <Chip
          size="small"
          variant="soft"
          label={`Display: ${displayName}`}
          sx={{
            alignSelf: 'flex-start',
            maxWidth: '100%',
            height: 22,
            borderRadius: 0.75,
            color: 'text.secondary',
            bgcolor: 'action.hover',
            '& .MuiChip-label': {
              px: 0.75,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            },
          }}
        />
      </Stack>
    </Box>
  );
};

export default SubjectNameCell;
