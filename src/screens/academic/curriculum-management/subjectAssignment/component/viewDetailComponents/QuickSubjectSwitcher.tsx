'use client';

import { varAlpha } from 'src/theme/styles';
import { useTheme } from '@mui/material/styles';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import {
  Box,
  Stack,
  Divider,
  MenuItem,
  TextField,
  ButtonBase,
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
      <ButtonBase
        aria-label={`Switch subject: ${currentSubjectName || 'Select subject'}`}
        aria-haspopup="menu"
        aria-expanded={popover.open}
        onClick={popover.onOpen}
        sx={{
          display: 'inline-flex',
          minWidth: 0,
          textAlign: 'left',
          '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'info.main' },
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
          component="span"
          sx={{
            fontWeight: 700,
            overflowWrap: 'anywhere',
            minWidth: 0,
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
      </ButtonBase>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{
          paper: {
            sx: {
              width: 320,
              maxWidth: 'calc(100vw - 32px)',
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
            inputProps={{ 'aria-label': 'Search subjects to switch' }}
            placeholder="Search subject..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" width={16} sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: filterText ? (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Clear subject switcher search"
                      size="small"
                      onClick={() => setFilterText('')}
                    >
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
              <Typography variant="body2" color="text.secondary">
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
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                      letterSpacing: 0,
                      textTransform: 'none',
                    }}
                  >
                    Core Subjects ({filteredCores.length})
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
                              color: 'text.primary',
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
                                fontSize: '0.75rem',
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
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                      letterSpacing: 0,
                      textTransform: 'none',
                    }}
                  >
                    Elective Groups
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
                                    color: 'text.primary',
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
                                      fontSize: '0.75rem',
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
