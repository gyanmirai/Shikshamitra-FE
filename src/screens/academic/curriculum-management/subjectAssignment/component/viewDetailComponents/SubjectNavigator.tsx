'use client';

import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomTooltip from 'src/components/custom-tooltip';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import {
  Box,
  Card,
  Stack,
  Button,
  Collapse,
  TextField,
  Typography,
  IconButton,
  ButtonBase,
  InputAdornment,
} from '@mui/material';

import type { INavigatorSubjectItem, INavigatorElectiveGroup } from '../type';

interface SubjectNavigatorProps {
  coreSubjects: INavigatorSubjectItem[];
  electiveGroups: INavigatorElectiveGroup[];
  totalSubjectsCount: number;
  totalFilteredCount: number;
  selectedSubjectCode: string | null;
  selectedSubjectId: string | null;
  selectedAssignmentId: string | null;
  onSelectSubject: (item: INavigatorSubjectItem) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  expandedGroups: Record<string, boolean>;
  onToggleGroup: (groupId: string) => void;
}

const SubjectNavigator: React.FC<SubjectNavigatorProps> = ({
  coreSubjects,
  electiveGroups,
  totalSubjectsCount,
  totalFilteredCount,
  selectedSubjectCode,
  selectedSubjectId,
  selectedAssignmentId,
  onSelectSubject,
  searchQuery,
  onSearchChange,
  expandedGroups,
  onToggleGroup,
}) => {
  const theme = useTheme();

  const isSubjectSelected = (item: INavigatorSubjectItem) => {
    if (item.assignmentId !== selectedAssignmentId) return false;
    if (selectedSubjectCode && item.subjectCode) {
      return item.subjectCode === selectedSubjectCode;
    }
    if (selectedSubjectId && item.subjectId) {
      return item.subjectId === selectedSubjectId;
    }
    return item.assignmentId === selectedAssignmentId;
  };

  return (
    <Card
      sx={{
        height: '100%',
        p: 1.5,
        boxShadow: 'var(--shadows-4)',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        minHeight: 0,
      }}
    >
      {/* Navigator Top Header */}
      <Box sx={{ pb: 1.5, mb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Iconify icon="solar:notebook-bold-duotone" width={20} sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
              SUBJECTS
            </Typography>
          </Stack>
          <Label variant="soft" color="default" sx={{ height: 20, fontWeight: 700, fontSize: 11 }}>
            {totalFilteredCount} {searchQuery ? `of ${totalSubjectsCount}` : ''}
          </Label>
        </Stack>

        {/* Search Input */}
        <TextField
          size="small"
          fullWidth
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search subjects..."
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" width={16} sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => onSearchChange('')} sx={{ p: 0.25 }}>
                    <Iconify icon="eva:close-fill" width={14} />
                  </IconButton>
                </InputAdornment>
              ) : null,
              sx: {
                height: 34,
                fontSize: '0.8125rem',
                bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.04),
              },
            },
          }}
        />
      </Box>

      {/* Navigator List Container */}
      <Scrollbar sx={{ flexGrow: 1, minHeight: 0, pr: 0.5 }}>
        {totalFilteredCount === 0 ? (
          <Box sx={{ py: 5, px: 2, textAlign: 'center' }}>
            <Iconify
              icon="solar:magnifer-broken"
              width={40}
              sx={{ color: 'text.disabled', mb: 1, opacity: 0.6 }}
            />
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
              No subjects found
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
              No subjects match &quot;{searchQuery}&quot;
            </Typography>
            {searchQuery && (
              <Button
                size="small"
                variant="text"
                onClick={() => onSearchChange('')}
                sx={{ mt: 1, fontSize: '0.75rem' }}
              >
                Clear filter
              </Button>
            )}
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {/* ── CORE SUBJECTS SECTION ── */}
            {coreSubjects.length > 0 && (
              <Box>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ px: 1, py: 0.5, mb: 0.5 }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: 'text.disabled',
                      letterSpacing: 0.8,
                      textTransform: 'uppercase',
                    }}
                  >
                    Core Subjects
                  </Typography>
                  <Label variant="soft" color="primary" sx={{ height: 18, fontSize: 10 }}>
                    {coreSubjects.length}
                  </Label>
                </Stack>

                <Stack spacing={0.5}>
                  {coreSubjects.map((item) => {
                    const isSelected = isSubjectSelected(item);
                    return (
                      <CustomTooltip
                        key={`${item.assignmentId}-${item.subjectCode || item.subjectId}`}
                        title={item.subjectName}
                        arrow
                        placement="right"
                        disableHoverListener={item.subjectName.length < 24}
                      >
                        <ButtonBase
                          aria-label={`Select ${item.subjectName}`}
                          aria-pressed={isSelected}
                          onClick={() => onSelectSubject(item)}
                          sx={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            gap: 1,
                            p: 1,
                            cursor: 'pointer',
                            textAlign: 'left',
                            borderRadius: 1.5,
                            transition: 'all 0.15s ease-in-out',
                            bgcolor: 'transparent',
                            borderLeft: isSelected
                              ? `3px solid ${theme.palette.primary.main}`
                              : '3px solid transparent',
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                          }}
                        >
                          <SubjectColorIndicator color={item.color} />
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography
                              variant="body2"
                              noWrap
                              sx={{
                                fontWeight: isSelected ? 700 : 500,
                                color: isSelected ? 'primary.main' : 'text.primary',
                                fontSize: '0.8125rem',
                              }}
                            >
                              {item.subjectName}
                            </Typography>
                            {item.subjectCode && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: 'text.secondary',
                                  fontSize: '0.7rem',
                                  fontFamily: 'monospace',
                                  display: 'block',
                                }}
                              >
                                {item.subjectCode}
                              </Typography>
                            )}
                          </Box>

                          {isSelected && (
                            <Iconify
                              icon="eva:checkmark-fill"
                              width={16}
                              sx={{ color: 'primary.main', flexShrink: 0 }}
                            />
                          )}
                        </ButtonBase>
                      </CustomTooltip>
                    );
                  })}
                </Stack>
              </Box>
            )}

            {/* ── ELECTIVE GROUPS SECTION ── */}
            {electiveGroups.length > 0 && (
              <Box>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ px: 1, py: 0.5, mb: 0.5 }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: 'text.disabled',
                      letterSpacing: 0.8,
                      textTransform: 'uppercase',
                    }}
                  >
                    Elective Groups
                  </Typography>
                  <Label variant="soft" color="secondary" sx={{ height: 18, fontSize: 10 }}>
                    {electiveGroups.length}
                  </Label>
                </Stack>

                <Stack spacing={0.75}>
                  {electiveGroups.map((group) => {
                    const isExpanded = expandedGroups[group.electiveGroupId] !== false;
                    const hasSelectedChild = group.subjects.some((s) => isSubjectSelected(s));

                    return (
                      <Box
                        key={group.electiveGroupId}
                        sx={{
                          borderRadius: 1.5,
                          border: `1px solid ${varAlpha(theme.palette.dividerChannel, 0.8)}`,
                          bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.02),
                          overflow: 'hidden',
                        }}
                      >
                        {/* Group Header Row */}
                        <Box
                          onClick={() => onToggleGroup(group.electiveGroupId)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                            px: 1,
                            py: 0.75,
                            cursor: 'pointer',
                            userSelect: 'none',
                            bgcolor: 'transparent',
                            transition: 'background-color 0.15s ease',
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                          }}
                        >
                          <Iconify
                            icon={isExpanded ? 'eva:chevron-down-fill' : 'eva:chevron-right-fill'}
                            width={16}
                            sx={{ color: 'text.secondary', flexShrink: 0 }}
                          />

                          <CustomTooltip
                            title={group.electiveGroupName}
                            arrow
                            placement="top"
                            disableHoverListener={group.electiveGroupName.length < 20}
                          >
                            <Typography
                              variant="subtitle2"
                              noWrap
                              sx={{
                                fontWeight: hasSelectedChild ? 700 : 600,
                                fontSize: '0.8125rem',
                                color: hasSelectedChild ? 'secondary.main' : 'text.primary',
                                flex: 1,
                              }}
                            >
                              {group.electiveGroupName}
                            </Typography>
                          </CustomTooltip>

                          <Label
                            variant="soft"
                            color="default"
                            sx={{ height: 18, fontSize: 10, fontWeight: 600 }}
                          >
                            {group.subjects.length}
                          </Label>
                        </Box>

                        {/* Indented Group Children */}
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Stack
                            spacing={0.5}
                            sx={{
                              p: 0.75,
                              pt: 0.25,
                              pl: 1.5,
                              borderTop: `1px dashed ${theme.palette.divider}`,
                            }}
                          >
                            {group.subjects.map((item) => {
                              const isSelected = isSubjectSelected(item);
                              return (
                                <CustomTooltip
                                  key={`${item.assignmentId}-${item.subjectCode || item.subjectId}`}
                                  title={item.subjectName}
                                  arrow
                                  placement="right"
                                  disableHoverListener={item.subjectName.length < 22}
                                >
                                  <ButtonBase
                                    aria-label={`Select ${item.subjectName}`}
                                    aria-pressed={isSelected}
                                    onClick={() => onSelectSubject(item)}
                                    sx={{
                                      width: '100%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'flex-start',
                                      gap: 1,
                                      p: 0.75,
                                      cursor: 'pointer',
                                      textAlign: 'left',
                                      borderRadius: 1.25,
                                      transition: 'all 0.15s ease',
                                      bgcolor: 'transparent',
                                      borderLeft: isSelected
                                        ? `3px solid ${theme.palette.primary.main}`
                                        : '3px solid transparent',
                                      '&:hover': {
                                        bgcolor: 'action.hover',
                                      },
                                    }}
                                  >
                                    <SubjectColorIndicator color={item.color} />
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                      <Typography
                                        variant="body2"
                                        noWrap
                                        sx={{
                                          fontWeight: isSelected ? 700 : 500,
                                          color: isSelected ? 'primary.main' : 'text.primary',
                                          fontSize: '0.78125rem',
                                        }}
                                      >
                                        {item.subjectName}
                                      </Typography>
                                      {item.subjectCode && (
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: 'text.secondary',
                                            fontSize: '0.675rem',
                                            fontFamily: 'monospace',
                                            display: 'block',
                                          }}
                                        >
                                          {item.subjectCode}
                                        </Typography>
                                      )}
                                    </Box>

                                    {isSelected && (
                                      <Iconify
                                        icon="eva:checkmark-fill"
                                        width={14}
                                        sx={{ color: 'primary.main', flexShrink: 0 }}
                                      />
                                    )}
                                  </ButtonBase>
                                </CustomTooltip>
                              );
                            })}
                          </Stack>
                        </Collapse>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            )}
          </Stack>
        )}
      </Scrollbar>
    </Card>
  );
};

export default React.memo(SubjectNavigator);
