import { useState } from 'react';
import { Icon } from '@iconify/react';
import {
  Box,
  List,
  Paper,
  TextField,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  InputAdornment,
} from '@mui/material';

import type { ReportCategory } from './types';

interface LeftPanelProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  categories: ReportCategory[];
}

export default function LeftPanel({
  selectedCategory,
  onSelectCategory,
  categories = [],
}: LeftPanelProps) {
  const [search, setSearch] = useState('');

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ p: 1.5 }}>
        <TextField
          fullWidth
          size="small"
          label="Search categories"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Icon icon="eva:search-fill" color="text.disabled" />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1.5 }}>
        <List disablePadding sx={{ maxHeight: '100%', height: '100%' }}>
          {filteredCategories.map((category) => (
            <ListItemButton
              key={category.id}
              selected={selectedCategory === category.id}
              onClick={() => onSelectCategory(category.id)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Icon icon={category.icon as string} width={24} />
              </ListItemIcon>
              <ListItemText
                primary={category.name}
                primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Paper>
  );
}
