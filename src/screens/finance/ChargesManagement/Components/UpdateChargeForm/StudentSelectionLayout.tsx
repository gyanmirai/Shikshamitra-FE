'use client';

import { Iconify } from 'src/components/iconify';
import React, { useMemo, useState, useCallback } from 'react';
import {
  Box,
  List,
  Stack,
  Paper,
  Button,
  Checkbox,
  ListItem,
  Skeleton,
  TextField,
  Typography,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from '@mui/material';

interface IStudentOption {
  id: string;
  label: string;
  rollNumber?: number;
  grNumber?: string;
  divisionName?: string;
}

interface StudentSelectionLayoutProps {
  students: IStudentOption[];
  selectedStudentIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  isLoading?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  divisionFilter?: string;
	disabled?: boolean;
}

/**
 * Student Selection Layout Component
 * Displays list of students with checkboxes and search capability
 * Uses debounced search to avoid API spam
 */
export const StudentSelectionLayout: React.FC<StudentSelectionLayoutProps> = ({
  students,
  selectedStudentIds,
  onSelectionChange,
  isLoading = false,
  searchQuery = '',
  onSearchChange,
  divisionFilter,
	disabled = false,
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Debounce search with 500ms delay
  const handleSearchChange = useCallback(
    (query: string) => {
      setLocalSearchQuery(query);

      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const timer = setTimeout(() => {
        if (onSearchChange) {
          onSearchChange(query);
        }
      }, 500);

      setDebounceTimer(timer);
    },
    [onSearchChange, debounceTimer]
  );

  // Handle individual student selection
  const handleStudentToggle = useCallback(
    (studentId: string) => {
      const isSelected = selectedStudentIds.includes(studentId);
      const newSelection = isSelected
        ? selectedStudentIds.filter((id) => id !== studentId)
        : [...selectedStudentIds, studentId];

      onSelectionChange(newSelection);
    },
    [selectedStudentIds, onSelectionChange]
  );

  // Handle select all toggle
  const handleSelectAllToggle = useCallback(() => {
    const allStudentIds = students.map((s) => s.id);
    const allSelected = allStudentIds.every((id) => selectedStudentIds.includes(id));

    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(allStudentIds);
    }
  }, [students, selectedStudentIds, onSelectionChange]);

  // Filter students based on search
  const filteredStudents = useMemo(
    () =>
      students.filter((student) => {
        const matchesSearch =
          !localSearchQuery ||
          student.label.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
          student.grNumber?.toString().includes(localSearchQuery) ||
          student.rollNumber?.toString().includes(localSearchQuery);

        const matchesDivision = !divisionFilter || student.divisionName === divisionFilter;

        return matchesSearch && matchesDivision;
      }),
    [students, localSearchQuery, divisionFilter]
  );

  const selectAllChecked = useMemo(
    () =>
      filteredStudents.length > 0 &&
      filteredStudents.every((s) => selectedStudentIds.includes(s.id)),
    [filteredStudents, selectedStudentIds]
  );

  return (
	<Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', opacity: disabled ? 0.6 : 1 }}>
      {/* Search Header */}
      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          height: '100%',
          borderRadius: 2,
          transition: 'box-shadow 0.2s ease',
          '&:hover': { boxShadow: 4 },
        }}
      >
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              fullWidth
              placeholder="Search by name, admission #, or roll #"
              value={localSearchQuery}
			  disabled={disabled}
              onChange={(e) => handleSearchChange(e.target.value)}
              InputProps={{
                startAdornment: <Iconify icon="solar:magnifer-linear" sx={{ mr: 1 }} />,
              }}
            />
            <Button
              size="small"
              variant={selectAllChecked ? 'contained' : 'outlined'}
              onClick={handleSelectAllToggle}
              color="success"
			  disabled={disabled || filteredStudents.length === 0}
              sx={{ whiteSpace: 'nowrap', minWidth: 96 }}
            >
              {selectAllChecked ? 'Clear All' : 'Select All'}
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {selectedStudentIds.length} student{selectedStudentIds.length !== 1 ? 's' : ''} selected
          </Typography>
        </Stack>

        {/* Student List */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {isLoading ? (
            <Stack spacing={1}>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
              ))}
            </Stack>
          ) : filteredStudents.length === 0 ? (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Iconify icon="solar:user-search-line-duotone" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {localSearchQuery
                  ? 'No students found matching your search'
                  : 'No students available'}
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {/* Individual Students */}
              {filteredStudents.map((student) => (
                <ListItem key={student.id} disablePadding>
                  <ListItemButton
					disabled={disabled}
                    onClick={() => handleStudentToggle(student.id)}
                    sx={{ py: 1, px: 1 }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Checkbox
                        edge="start"
                        checked={selectedStudentIds.includes(student.id)}
                        tabIndex={-1}
                        disableRipple
						disabled={disabled}
                      />
                    </ListItemIcon>
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
      </Paper>
    </Box>
  );
};

export default StudentSelectionLayout;
