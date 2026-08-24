'use client';

import React, { useState, useMemo } from 'react';
import { varAlpha } from 'src/theme/styles';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import {
  Box,
  Stack,
  Divider,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';

import type { INavigatorSubjectItem, INavigatorElectiveGroup } from '../type';

interface QuickSubjectSwitcherProps {
  currentSubjectName: string;
  coreSubjects: INavigatorSubjectItem[];
  electiveGroups: INavigatorElectiveGroup[];
  selectedAssignmentId: string | null;
  selectedSubjectCode: string | null;
  selectedSubjectId: string | null;
  onSelectSubject: (item: INavigatorSubjectItem) => void;
}

export const QuickSubjectSwitcher: React.FC<QuickSubjectSwitcherProps> = ({
  currentSubjectName,
  coreSubjects,
  electiveGroups,
  selectedAssignmentId,
  selectedSubjectCode,
  selectedSubjectId,
  onSelectSubject,
}) => {
  const theme = useTheme();
  const popover = usePopover();
  const [filterText, setFilterText] = useState('');

  const isSelected = (item: INavigatorSubjectItem) => {
    if (item.assignmentId !== selectedAssignmentId) return false;
    if (selectedSubjectCode && item.subjectCode) {
      return item.subjectCode === selectedSubjectCode;
    }
    if (selectedSubjectId && item.subjectId) {
      return item.subjectId === selectedSubjectId;
    }
    return item.assignmentId === selectedAssignmentId;
  };

  const handleItemClick = (item: INavigatorSubjectItem) => {
    onSelectSubject(item);
    popover.onClose();
  };

  const { filteredCores, filteredGroups, totalMatches } = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    if (!q) {
      return {
        filteredCores: coreSubjects,
        filteredGroups: electiveGroups,
        totalMatches:
          coreSubjects.length + electiveGroups.reduce((acc, g) => acc + g.subjects.length, 0),
      };
    }

    const cores = coreSubjects.filter(
      (s) => s.subjectName.toLowerCase().includes(q) || s.subjectCode.toLowerCase().includes(q)
    );

    const groups: INavigatorElectiveGroup[] = [];
    electiveGroups.forEach((g) => {
      const gMatch = g.electiveGroupName.toLowerCase().includes(q);
      const sMatches = g.subjects.filter(
        (s) => s.subjectName.toLowerCase().includes(q) || s.subjectCode.toLowerCase().includes(q)
      );
      if (gMatch || sMatches.length > 0) {
        groups.push({
          ...g,
          subjects: gMatch ? g.subjects : sMatches,
        });
      }
    });

    return {
      filteredCores: cores,
      filteredGroups: groups,
      totalMatches: cores.length + groups.reduce((acc, g) => acc + g.subjects.length, 0),
    };
  }, [coreSubjects, electiveGroups, filterText]);

  return (
    <>
      <Box
        onClick={popover.onOpen}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          cursor: 'pointer',
          py: 0.25,
          px: 0.75,
          borderRadius: 1,
          transition: 'all 0.15s ease',
          '&:hover': {
            bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.08),
          },
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            fontSize: { xs: '1.15rem', sm: '1.35rem', md: '1.5rem' },
          }}
        >
          {currentSubjectName || 'Select Subject'}
        </Typography>
        <Iconify
          icon="eva:chevron-down-fill"
          width={20}
          sx={{
            color: 'text.secondary',
            transition: 'transform 0.2s',
            transform: popover.open ? 'rotate(180deg)' : 'none',
          }}
        />
      </Box>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{
          paper: {
            sx: {
              width: 320,
              p: 0,
              maxHeight: 460,
              display: 'flex',
              flexDirection: 'column',
            },
          },
          arrow: { placement: 'top-left' },
        }}
      >
        {/* Switcher Search */}
        <Box sx={{ p: 1.25, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <TextField
            size="small"
            fullWidth
            autoFocus
            placeholder="Search subject..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" width={16} sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
                endAdornment: filterText ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setFilterText('')} sx={{ p: 0.25 }}>
                      <Iconify icon="eva:close-fill" width={14} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
                sx: { height: 32, fontSize: '0.8125rem' },
              },
            }}
          />
        </Box>

        {/* Switcher Items */}
        <Scrollbar sx={{ flexGrow: 1, p: 0.75 }}>
          {totalMatches === 0 ? (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.disabled">
                No subjects found
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1}>
              {/* CORE */}
              {filteredCores.length > 0 && (
                <Box>
                  <Typography
                    variant="overline"
                    sx={{
                      px: 1,
                      py: 0.5,
                      display: 'block',
                      color: 'text.disabled',
                      fontSize: '0.675rem',
                      letterSpacing: 0.8,
                    }}
                  >
                    CORE ({filteredCores.length})
                  </Typography>
                  {filteredCores.map((sub) => {
                    const active = isSelected(sub);
                    return (
                      <MenuItem
                        key={`${sub.assignmentId}-${sub.subjectCode || sub.subjectId}`}
                        onClick={() => handleItemClick(sub)}
                        selected={active}
                        sx={{
                          borderRadius: 1,
                          py: 0.75,
                          px: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          bgcolor: active
                            ? varAlpha(theme.palette.primary.mainChannel, 0.08)
                            : 'transparent',
                          '&.Mui-selected': {
                            bgcolor: varAlpha(theme.palette.primary.mainChannel, 0.12),
                          },
                        }}
                      >
                        <SubjectColorIndicator color={sub.color} />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{
                              fontWeight: active ? 700 : 500,
                              color: active ? 'primary.main' : 'text.primary',
                              fontSize: '0.8125rem',
                            }}
                          >
                            {sub.subjectName}
                          </Typography>
                          {sub.subjectCode && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'text.secondary',
                                fontSize: '0.675rem',
                                fontFamily: 'monospace',
                              }}
                            >
                              {sub.subjectCode}
                            </Typography>
                          )}
                        </Box>
                        {active && (
                          <Iconify
                            icon="eva:checkmark-fill"
                            width={16}
                            sx={{ color: 'primary.main' }}
                          />
                        )}
                      </MenuItem>
                    );
                  })}
                </Box>
              )}

              {/* ELECTIVE */}
              {filteredGroups.length > 0 && (
                <Box>
                  {filteredCores.length > 0 && <Divider sx={{ my: 0.5, borderStyle: 'dashed' }} />}
                  <Typography
                    variant="overline"
                    sx={{
                      px: 1,
                      py: 0.5,
                      display: 'block',
                      color: 'text.disabled',
                      fontSize: '0.675rem',
                      letterSpacing: 0.8,
                    }}
                  >
                    ELECTIVE GROUPS
                  </Typography>

                  {filteredGroups.map((group) => (
                    <Box key={group.electiveGroupId} sx={{ mb: 0.75 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          px: 1,
                          py: 0.25,
                          display: 'block',
                          color: 'secondary.main',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}
                      >
                        {group.electiveGroupName}
                      </Typography>

                      <Box sx={{ pl: 1 }}>
                        {group.subjects.map((sub) => {
                          const active = isSelected(sub);
                          return (
                            <MenuItem
                              key={`${sub.assignmentId}-${sub.subjectCode || sub.subjectId}`}
                              onClick={() => handleItemClick(sub)}
                              selected={active}
                              sx={{
                                borderRadius: 1,
                                py: 0.5,
                                px: 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                bgcolor: active
                                  ? varAlpha(theme.palette.primary.mainChannel, 0.08)
                                  : 'transparent',
                                '&.Mui-selected': {
                                  bgcolor: varAlpha(theme.palette.primary.mainChannel, 0.12),
                                },
                              }}
                            >
                              <SubjectColorIndicator color={sub.color} />
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography
                                  variant="body2"
                                  noWrap
                                  sx={{
                                    fontWeight: active ? 700 : 500,
                                    color: active ? 'primary.main' : 'text.primary',
                                    fontSize: '0.8125rem',
                                  }}
                                >
                                  {sub.subjectName}
                                </Typography>
                                {sub.subjectCode && (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: 'text.secondary',
                                      fontSize: '0.675rem',
                                      fontFamily: 'monospace',
                                    }}
                                  >
                                    {sub.subjectCode}
                                  </Typography>
                                )}
                              </Box>
                              {active && (
                                <Iconify
                                  icon="eva:checkmark-fill"
                                  width={16}
                                  sx={{ color: 'primary.main' }}
                                />
                              )}
                            </MenuItem>
                          );
                        })}
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Stack>
          )}
        </Scrollbar>
      </CustomPopover>
    </>
  );
};

export default React.memo(QuickSubjectSwitcher);
