import React from 'react';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Avatar, CardHeader, Typography } from '@mui/material';

interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  value?: string | number;
  icon?: string;
  color?: string;
  avatarUrl?: string;
}

interface GenericListProps {
  title: string;
  subheader?: string;
  list: ListItem[];
}

const GenericList = ({ title, subheader, list }: GenericListProps) => (
  <Card sx={{ height: '100%' }}>
    <CardHeader title={title} subheader={subheader} />
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {list.map((item) => (
        <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {item.avatarUrl ? (
            <Avatar src={item.avatarUrl} alt={item.title} />
          ) : (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (theme) => (item.color ? `${item.color}1A` : theme.palette.action.hover),
                color: item.color || 'text.secondary',
              }}
            >
              <Iconify icon={item.icon || 'mdi:circle-small'} width={24} />
            </Box>
          )}
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2">{item.title}</Typography>
            {item.subtitle && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {item.subtitle}
              </Typography>
            )}
          </Box>
          {item.value && (
            <Typography variant="subtitle2" sx={{ color: item.color || 'text.primary' }}>
              {item.value}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  </Card>
);

export default GenericList;
