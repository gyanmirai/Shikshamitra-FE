import type { CardProps } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import { Box, Card, Stack, CardHeader, Typography } from '@mui/material';

type Props = CardProps & {
  title?: string;
  subheader?: string;
  list: {
    id: string;
    title: string;
    description: string;
    severity: 'info' | 'warning' | 'error';
    date: string;
  }[];
};

export default function FinanceAlertsList({ title, subheader, list, ...other }: Props) {
  return (
    <Card {...other} sx={{ height: '100%' }}>
      <CardHeader title={title} subheader={subheader} />

      <Scrollbar>
        <Box sx={{ p: 3, gap: 3, display: 'flex', flexDirection: 'column' }}>
          {list.map((item) => (
            <Stack key={item.id} direction="row" spacing={2} alignItems="flex-start">
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: (theme) => theme.palette[item.severity].lighter,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              ></Box>

              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2">{item.title}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {item.description}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.disabled', mt: 0.5, display: 'block' }}
                >
                  {item.date}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Box>
      </Scrollbar>
    </Card>
  );
}
