import { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import {
  Box,
  Menu,
  Button,
  MenuItem,
  TextField,
  Typography,
  InputAdornment,
} from '@mui/material';

import StudentCard from './StudentCard';

import type { SeatingStudent, SeatingAssignment } from '../../types';

type SortKey = 'roll-number' | 'alphabetical' | 'division' | 'random';

interface Props {
  students: SeatingStudent[];
  assignments: SeatingAssignment[];
  conflictStudentIds: Set<string>;
  multiSelectedIds: Set<string>;
  onToggleMultiSelect: (studentId: string) => void;
  onBulkAllocateSequential: (studentIds: string[]) => void;
  onBulkExclude: (studentIds: string[]) => void;
  isReadOnly?: boolean;
  isLoading?: boolean;
}

export default function StudentQueuePanel({
  students,
  assignments,
  conflictStudentIds,
  multiSelectedIds,
  onToggleMultiSelect,
  onBulkAllocateSequential,
  onBulkExclude,
  isReadOnly,
  isLoading = false,
}: Props) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('roll-number');
  const [bulkMenuAnchor, setBulkMenuAnchor] = useState<null | HTMLElement>(null);

  const assignedIds = useMemo(() => new Set(assignments.map((a) => a.studentId)), [assignments]);

  const searched = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.trim().toLowerCase();
    return students.filter(
      (s) =>
        s.studentName.toLowerCase().includes(q) ||
        String(s.rollNo).includes(q) ||
        s.admissionNo?.toLowerCase().includes(q) ||
        s.divisionName?.toLowerCase().includes(q)
    );
  }, [students, search]);

  const sorted = useMemo(() => {
    const list = [...searched];
    switch (sortKey) {
      case 'alphabetical':
        return list.sort((a, b) => a.studentName.localeCompare(b.studentName));
      case 'division':
        return list.sort((a, b) => (a.divisionName ?? '').localeCompare(b.divisionName ?? ''));
      case 'random':
        return list.sort(() => Math.random() - 0.5);
      case 'roll-number':
      default:
        return list.sort((a, b) => a.rollNo - b.rollNo);
    }
  }, [searched, sortKey]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      <Box sx={{ display: 'flex', gap: 1, py: 1 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search name, roll, division…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:magnify" width={16} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Button
          size="small"
          variant="text"
          endIcon={<Iconify icon="mdi:chevron-down" width={16} />}
          onClick={(e) => setBulkMenuAnchor(e.currentTarget)}
        >
          Sort
        </Button>
        <Menu anchorEl={bulkMenuAnchor} open={!!bulkMenuAnchor} onClose={() => setBulkMenuAnchor(null)}>
          {(['roll-number', 'alphabetical', 'division', 'random'] as SortKey[]).map((key) => (
            <MenuItem
              key={key}
              selected={sortKey === key}
              onClick={() => {
                setSortKey(key);
                setBulkMenuAnchor(null);
              }}
            >
              {key}
            </MenuItem>
          ))}
        </Menu>

        {multiSelectedIds.size > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Button
              size="small"
              variant="outlined"
              disabled={isReadOnly}
              onClick={() => onBulkAllocateSequential([...multiSelectedIds])}
            >
              Allocate Sequentially ({multiSelectedIds.size})
            </Button>
            <Button
              size="small"
              color="error"
              variant="text"
              disabled={isReadOnly}
              onClick={() => onBulkExclude([...multiSelectedIds])}
            >
              Exclude
            </Button>
          </Box>
        )}
      </Box>

      <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pr: 0.5 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Box
                  key={i}
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: 'action.hover',
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ width: '70%', height: 12, bgcolor: 'action.hover', borderRadius: 0.5, mb: 0.5 }} />
                    <Box sx={{ width: '40%', height: 10, bgcolor: 'action.hover', borderRadius: 0.5 }} />
                  </Box>
                </Box>
              ))}
            </Box>
          ) : sorted.length === 0 ? (
            <Typography variant="body2" color="text.disabled" textAlign="center" py={4}>
              No students in this view
            </Typography>
          ) : (
            sorted.map((student) => (
              <StudentCard
                key={student.studentId}
                student={student}
                assignment={assignments.find((a) => a.studentId === student.studentId)}
                isMultiSelected={multiSelectedIds.has(student.studentId)}
                showCheckbox={!isReadOnly}
                onToggleMultiSelect={onToggleMultiSelect}
                isReadOnly={isReadOnly}
              />
            ))
          )}
        </Box>
      </Scrollbar>
    </Box>
  );
}
