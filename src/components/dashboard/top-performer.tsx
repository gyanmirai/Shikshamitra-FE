import type { BoxProps, CardProps } from '@mui/material';

import { orderBy } from 'src/utils/helper';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { fShortenNumber } from 'src/utils/format-number';
import { Box, Card, Avatar, CardHeader } from '@mui/material';

type Props = CardProps & {
  title?: string;
  subheader?: string;
  list: { id: string; name: string; avatarUrl: string; totalMarks: number }[];
};

export function TopPerformer({ title, subheader, list, ...other }: Props) {
  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />
      <Box sx={{ p: 3, gap: 3, display: 'flex', flexDirection: 'column' }}>
        {orderBy(list, ['totalMarks'], ['desc']).map((item, index) => (
          <PerformerItem key={item.id} item={item} index={index} />
        ))}
      </Box>
    </Card>
  );
}

type ItemProps = BoxProps & { index: number; item: Props['list'][number] };

function PerformerItem({ item, index, sx, ...other }: ItemProps) {
  return (
    <Box sx={{ gap: 2, display: 'flex', alignItems: 'center', ...sx }} {...other}>
      <Avatar alt={item.name} src={item.avatarUrl} />
      <Box flexGrow={1} minWidth={0}>
        <Box sx={{ typography: 'subtitle2' }}>{item.name}</Box>
        <Box
          sx={{
            gap: 0.5,
            mt: 0.5,
            alignItems: 'center',
            typography: 'caption',
            display: 'inline-flex',
            color: 'text.secondary',
          }}
        >
          <Iconify icon="fa6-solid:award" width={14} />
          {fShortenNumber(item.totalMarks)}
        </Box>
      </Box>
      <Box
        sx={{
          width: 40,
          height: 40,
          display: 'flex',
          borderRadius: '50%',
          alignItems: 'center',
          color: 'primary.main',
          justifyContent: 'center',
          bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
          ...(index === 1 && {
            color: 'info.main',
            bgcolor: (theme) => varAlpha(theme.vars.palette.info.mainChannel, 0.08),
          }),
          ...(index === 2 && {
            color: 'error.main',
            bgcolor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.08),
          }),
        }}
      >
        <Iconify width={24} icon="solar:cup-star-bold" />
      </Box>
    </Box>
  );
}
