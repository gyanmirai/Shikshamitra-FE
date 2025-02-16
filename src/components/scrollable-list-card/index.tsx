import React from 'react';

import { Card, ListItem, Typography, CardContent, ListItemText } from '@mui/material';

import { Scrollbar } from '../scrollbar/scrollbar';

interface ScrollableListCardProps {
  title: string;
  items: string[];
}

const ScrollableListCard: React.FC<ScrollableListCardProps> = ({ title, items }) => (
  <Card sx={{ backgroundColor: 'white', color: 'black', boxShadow: 3 }}>
    <CardContent>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
        {title}
      </Typography>
      <Scrollbar sx={{ maxHeight: 200, overflowY: 'auto', bgcolor: 'white' }}>
        {items.map((item, index) => (
          <ListItem key={index}>
            <ListItemText primary={item} sx={{ color: 'black' }} />
          </ListItem>
        ))}
      </Scrollbar>
    </CardContent>
  </Card>
);

export default ScrollableListCard;
