'use client';

import React from 'react';

import { Box, Paper, MenuList, MenuItem, TextField, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';

type ItemAction = {
  label: string;
  icon: string;
  color?: string;
  onClick: () => void;
};

type ItemCardWithActionsProps = {
  title: string;
  subtitle?: string;
  assignedLocation?: string;
  locationUpdate: (guardName: string, location: string, day: string, timeSlot: string) => void;
  guardName: string;
  day: string;
  timeSlot: string;
  bgColor?: string;
  onDragStart?: (e: React.DragEvent) => void;
  actions: ItemAction[];
};

const ItemCardWithActions: React.FC<ItemCardWithActionsProps> = ({
  title,
  subtitle,
  assignedLocation = '',
  locationUpdate,
  guardName,
  day,
  timeSlot,
  bgColor = 'white',
  onDragStart,
  actions,
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 1,
      bgcolor: bgColor,
      border: '1px solid #ccc',
      borderRadius: 1,

      position: 'relative',
      '& .action-menu': {
        opacity: 0,
        transition: 'opacity 0.2s ease-in-out',
      },
      '&:hover .action-menu': {
        opacity: 1,
      },
    }}
    draggable={!!onDragStart}
    onDragStart={onDragStart}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Typography variant="body2" fontWeight="medium">
        {title}
      </Typography>

      <Box className="action-menu">
        <ThreeDotsActions
          placement="bottom-center"
          onClickThreeDots={(e) => e.stopPropagation()}
          sx={{
            position: 'absolute',
            top: 8,
            right: 5,
            '& .MuiIconButton-root': {
              padding: '4px',
            },
          }}
          actions={({ popover }) => (
            <MenuList>
              {actions.map((action) => (
                <MenuItem
                  key={action.label}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick();
                    popover.onClose();
                  }}
                >
                  <Iconify
                    icon={action.icon}
                    sx={{ height: 18, width: 18, mr: 1 }}
                    color={action.color}
                  />
                  {action.label}
                </MenuItem>
              ))}
            </MenuList>
          )}
        />
      </Box>
    </Box>

    <TextField
      size="small"
      variant="standard"
      placeholder="Duty Location."
      value={assignedLocation}
      onChange={(e) => {
        const newLocation = e.target.value.trim();
        if (newLocation !== '') {
          locationUpdate(guardName, newLocation, day, timeSlot);
        }
      }}
      sx={{ mt: 2 }}
    />
  </Paper>
);

export default ItemCardWithActions;
