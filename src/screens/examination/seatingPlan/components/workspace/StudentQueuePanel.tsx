import { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import {
  Box,
  Menu,
  Button,
  Checkbox,
  MenuItem,
  TextField,
  Typography,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';

import StudentCard from './StudentCard';

import type { SeatingStudent, SeatingAssignment } from '../../types';

type SortKey =
  | 'roll-number'
  | 'alphabetical'
  | 'division'
  | 'unallocated-first'
  | 'special-first'
  | 'random';

const SORT_OPTIONS: { key: SortKey; label: string; icon: string }[] = [
  { key: 'roll-number', label: 'Roll Number (Ascending)', icon: 'mdi:format-list-numbered' },
  { key: 'alphabetical', label: 'Student Name (A - Z)', icon: 'mdi:sort-alphabetical-ascending' },
  { key: 'division', label: 'Division Name', icon: 'mdi:domain' },
  { key: 'unallocated-first', label: 'Unallocated First', icon: 'mdi:account-clock-outline' },
  { key: 'special-first', label: 'Special Requirements First', icon: 'mdi:star-outline' },
  { key: 'random', label: 'Random Shuffle', icon: 'mdi:shuffle-variant' },
];

const SORT_KEY_LABELS: Record<SortKey, string> = {
  'roll-number': 'Roll Number',
  'alphabetical': 'Name (A-Z)',
  division: 'Division',
  'unallocated-first': 'Unallocated First',
  'special-first': 'Special First',
  random: 'Random Shuffle',
};

interface Props {
  students: SeatingStudent[];
  assignments: SeatingAssignment[];
  conflictStudentIds: Set<string>;
  multiSelectedIds: Set<string>;
  onToggleMultiSelect: (studentId: string) => void;
  onSelectAll?: (studentIds: string[]) => void;
  onDeselectAll?: () => void;
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
  onSelectAll,
  onDeselectAll,
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
      case 'unallocated-first':
        return list.sort((a, b) => {
          const aAlloc = assignedIds.has(a.studentId) ? 1 : 0;
          const bAlloc = assignedIds.has(b.studentId) ? 1 : 0;
          if (aAlloc !== bAlloc) return aAlloc - bAlloc;
          return a.rollNo - b.rollNo;
        });
      case 'special-first':
        return list.sort((a, b) => {
          const aSpec = a.hasSpecialRequirement ? 0 : 1;
          const bSpec = b.hasSpecialRequirement ? 0 : 1;
          if (aSpec !== bSpec) return aSpec - bSpec;
          return a.rollNo - b.rollNo;
        });
      case 'random':
        return list.sort(() => Math.random() - 0.5);
      case 'roll-number':
      default:
        return list.sort((a, b) => a.rollNo - b.rollNo);
    }
  }, [searched, sortKey, assignedIds]);

  const unallocatedVisibleStudents = useMemo(
    () => sorted.filter((s) => !assignedIds.has(s.studentId)),
    [sorted, assignedIds]
  );
  const unallocatedVisibleIds = useMemo(
    () => unallocatedVisibleStudents.map((s) => s.studentId),
    [unallocatedVisibleStudents]
  );

  const selectedUnallocatedIds = useMemo(
    () => Array.from(multiSelectedIds).filter((id) => !assignedIds.has(id)),
    [multiSelectedIds, assignedIds]
  );

  const isAllUnallocatedSelected =
    unallocatedVisibleIds.length > 0 &&
    unallocatedVisibleIds.every((id) => multiSelectedIds.has(id));
  const isSomeSelected = unallocatedVisibleIds.some((id) => multiSelectedIds.has(id));
  const isIndeterminate = isSomeSelected && !isAllUnallocatedSelected;

  const handleMasterCheckboxToggle = () => {
    if (isReadOnly || unallocatedVisibleIds.length === 0) return;
    if (isAllUnallocatedSelected) {
      onDeselectAll?.();
    } else {
      onSelectAll?.(unallocatedVisibleIds);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Search Bar */}
      <Box sx={{ py: 1 }}>
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

      {/* Select All Checkbox & Sort Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 0.5,
          mb: 1,
          px: 0.5,
        }}
      >
        {!isReadOnly && (
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={isAllUnallocatedSelected}
                indeterminate={isIndeterminate}
                disabled={unallocatedVisibleIds.length === 0}
                onChange={handleMasterCheckboxToggle}
                sx={{ p: 0.5 }}
              />
            }
            label={
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ userSelect: 'none' }}>
                {isAllUnallocatedSelected ? 'Deselect All' : 'Select All'}
                {multiSelectedIds.size > 0 && ` (${multiSelectedIds.size})`}
              </Typography>
            }
            sx={{ mr: 0 }}
          />
        )}

        <Button
          size="small"
          variant="text"
          startIcon={<Iconify icon="mdi:sort-variant" width={16} />}
          endIcon={<Iconify icon="mdi:chevron-down" width={16} />}
          onClick={(e) => setBulkMenuAnchor(e.currentTarget)}
          sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem', ml: 'auto' }}
        >
          {SORT_KEY_LABELS[sortKey]}
        </Button>
        <Menu anchorEl={bulkMenuAnchor} open={!!bulkMenuAnchor} onClose={() => setBulkMenuAnchor(null)}>
          {SORT_OPTIONS.map((opt) => (
            <MenuItem
              key={opt.key}
              selected={sortKey === opt.key}
              onClick={() => {
                setSortKey(opt.key);
                setBulkMenuAnchor(null);
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon={opt.icon} width={16} />
                <Typography variant="body2">{opt.label}</Typography>
              </Box>
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {/* Bulk actions header bar */}
      {multiSelectedIds.size > 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1,
            py: 0.75,
            mb: 1,
            borderRadius: 1,
            bgcolor: 'action.selected',
            border: '1px solid',
            borderColor: 'primary.main',
            gap: 0.5,
          }}
        >
          <Typography variant="caption" fontWeight={700} color="primary.main">
            {multiSelectedIds.size} Selected
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Button
              size="small"
              variant="contained"
              disabled={isReadOnly || selectedUnallocatedIds.length === 0}
              onClick={() => onBulkAllocateSequential(selectedUnallocatedIds)}
              sx={{ fontSize: '0.7rem', px: 1, py: 0.25 }}
            >
              Allocate ({selectedUnallocatedIds.length})
            </Button>
            <Button
              size="small"
              color="error"
              variant="outlined"
              disabled={isReadOnly}
              onClick={() => onBulkExclude([...multiSelectedIds])}
              sx={{ fontSize: '0.7rem', px: 1, py: 0.25 }}
            >
              Exclude
            </Button>
          </Box>
        </Box>
      )}

      {/* Student List */}
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
