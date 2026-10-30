'use client';

import React, { useMemo } from 'react';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Chip,
  List,
  Stack,
  Paper,
  Button,
  Divider,
  ListItem,
  Typography,
  ListItemText,
  ListItemButton,
} from '@mui/material';

interface ISelectedStudent {
  id: string;
  label: string;
  rollNumber?: number;
  grNumber?: string;
  divisionName?: string;
}

interface SelectedStudentsPanelProps {
  selectedStudents: ISelectedStudent[];
  onRemove?: (studentId: string) => void;
  onClearAll?: () => void;
  isSticky?: boolean;
}

/**
 * Selected Students Panel
 * Displays list of selected students with option to remove
 * Can be made sticky for easy reference while scrolling
 */
export const SelectedStudentsPanel: React.FC<SelectedStudentsPanelProps> = ({
  selectedStudents,
  onRemove,
  onClearAll,
  isSticky = true,
}) => {
  const totalCount = useMemo(() => selectedStudents.length, [selectedStudents]);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minWidth: 0,
        position: isSticky ? 'sticky' : 'relative',
        top: isSticky ? 0 : 'auto',
        backgroundColor: 'background.paper',
        zIndex: 10,
        transition: 'box-shadow 0.2s ease',
        '&:hover': { boxShadow: 4 },
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Box display="flex" alignItems="center" gap={1}>
          <Iconify icon="solar:users-group-rounded-bold-duotone" sx={{ color: 'primary.main' }} />
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              Selected Students
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {totalCount} student{totalCount !== 1 ? 's' : ''} chosen
            </Typography>
          </Box>
        </Box>
        {totalCount > 0 && (
          <Chip
            label={totalCount}
            color="primary"
            variant="filled"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        )}
      </Stack>

      <Divider sx={{ mb: 1.5 }} />

      {/* Students List */}
      <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        {selectedStudents.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Iconify
              icon="solar:user-check-line-duotone"
              sx={{ fontSize: 40, mb: 1, opacity: 0.5 }}
            />
            <Typography variant="body2" color="text.secondary">
              No students selected yet
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Add students from the list
            </Typography>
          </Box>
        ) : (
          <List
            disablePadding
            sx={{
              '& .MuiListItem-root': {
                borderRadius: 1,
                mb: 0.5,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              },
            }}
          >
            {selectedStudents.map((student) => (
              <ListItem
                key={student.id}
                disablePadding
                secondaryAction={
                  onRemove && (
                    <Button
                      size="small"
                      color="error"
                      onClick={() => onRemove(student.id)}
                      sx={{ ml: 1 }}
                    >
                      <Iconify icon="solar:trash-bin-2-line-duotone" sx={{ fontSize: 16 }} />
                    </Button>
                  )
                }
              >
                <ListItemButton
                  disableRipple
                  sx={{
                    py: 0.75,
                    px: 1,
                    cursor: 'default',
                    '&:hover': {
                      backgroundColor: 'transparent',
                    },
                  }}
                >
                  <Iconify icon="solar:user-circle-bold-duotone" sx={{ mr: 1, fontSize: 20 }} />
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={500}>
                        {student.label}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {student.grNumber && `GR #${student.grNumber}`}
                        {student.grNumber && student.rollNumber && ' • '}
                        {student.rollNumber && `Roll #${student.rollNumber}`}
                        {student.divisionName && ` • ${student.divisionName}`}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Footer Actions */}
      {selectedStudents.length > 0 && onClearAll && (
        <>
          <Divider sx={{ my: 1 }} />
          <Button
            variant="text"
            color="error"
            size="small"
            fullWidth
            onClick={onClearAll}
            startIcon={<Iconify icon="solar:trash-bin-2-line-duotone" />}
          >
            Clear All
          </Button>
        </>
      )}
    </Paper>
  );
};

export default SelectedStudentsPanel;
