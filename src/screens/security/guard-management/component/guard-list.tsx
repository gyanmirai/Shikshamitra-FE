'use client';

import React from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';

import type { IGuard, IGuardListProps } from '../guard-management-interface';

const GuardList: React.FC<IGuardListProps> = ({ onDragStart, guardList }) => (
  <Stack>
    <Scrollbar sx={{ height: '80vh' }}>
      {guardList.map((guard: IGuard, index: number) => (
        <Paper
          key={index}
          elevation={1}
          draggable
          onDragStart={(e) => onDragStart(e, guard)}
          sx={{
            p: 2,
            cursor: 'move',
            borderLeft: '4px solid #1976d2',
            mb: 2,
            bgcolor: '#f9f9fc', // light background
            borderRadius: 2,
            transition: 'box-shadow 0.3s ease, transform 0.2s ease',
            '&:hover': {
              boxShadow: 6,
              transform: 'scale(1.01)',
            },
          }}
        >
          {/* Guard name and shift summary */}
          <Scrollbar sx={{ height: 100 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" fontWeight="bold">
                {guard.guardName}
              </Typography>
              {/* <Typography variant="body2" color="text.secondary">
              ({guard.assignedShift.length} / {guard.guardShiftPerDay})
            </Typography> */}
            </Box>
            <Box>
              {guard.guardShiftlist?.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Available Shifts:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" mt={0.5}>
                    {guard.guardShiftlist.map((shift, idx) => (
                      <Chip
                        key={`recurring-${idx}`}
                        label={shift}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Assigned Shifts */}
              {/* {guard.assignedShift?.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Assigned Shifts:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" mt={0.5}>
                  {guard.assignedShift.map((shift, idx) => (
                    <Chip key={`assigned-${idx}`} label={shift} size="small" color="success" />
                  ))}
                </Stack>
              </Box>
            )} */}
            </Box>
          </Scrollbar>
        </Paper>
      ))}
    </Scrollbar>
  </Stack>
);

export default GuardList;
