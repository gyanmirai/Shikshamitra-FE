import React from 'react';

import { Card, ListItem, Typography, CardContent, ListItemText } from '@mui/material';

import { Scrollbar } from '../scrollbar/scrollbar';

interface ScrollableListCardProps {
  title: string;
  items: any[];
}

const ScrollableListCard: React.FC<ScrollableListCardProps> = ({ title, items }) => (
  <Card sx={{ backgroundColor: 'white', color: 'black', boxShadow: 3 }}>
    <CardContent>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
        {title}
      </Typography>
      <Scrollbar
        sx={{ minHeight: '215px', maxHeight: '215px', overflowY: 'auto', bgcolor: 'white' }}
      >
        {items.map((item, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={[
                item.subject,
                item.date && `- ${item.date}`,
                item.name && `- ${item.name} - ${item.class} - ${item.room}`,
              ]
                .filter(Boolean)
                .join(' ')}
            />
          </ListItem>
        ))}
      </Scrollbar>
    </CardContent>
  </Card>
);

export default ScrollableListCard;
