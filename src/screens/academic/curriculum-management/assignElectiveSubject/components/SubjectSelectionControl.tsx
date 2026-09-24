'use client';

import { varAlpha } from 'src/theme/styles';
import { Box, Tooltip, ButtonBase, Typography } from '@mui/material';
import {
  CheckCircleOutlineRounded as SelectedIcon,
  RadioButtonUncheckedRounded as UnselectedIcon,
} from '@mui/icons-material';

import type { ElectiveSubjectOption } from '../types';

interface SubjectSelectionControlProps {
  subjects: ElectiveSubjectOption[];
  selectedSubjectId?: string;
  onToggle: (subjectId: string) => void;
  disabled?: boolean;
  ariaLabelPrefix?: string;
}

export default function SubjectSelectionControl({
  subjects,
  selectedSubjectId,
  onToggle,
  disabled,
  ariaLabelPrefix = 'Assign',
}: SubjectSelectionControlProps) {
  return (
    <Box
      role="group"
      aria-label={`Elective subject assignment for ${ariaLabelPrefix}`}
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      gap={0.75}
    >
      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', fontWeight: 600, lineHeight: 1.25 }}
      >
        {disabled ? 'Assignment locked' : ''}
      </Typography>

      <Box display="flex" flexDirection="row" flexWrap="wrap" gap={1}>
        {subjects.map((subject) => {
          const isSelected = selectedSubjectId === subject.subjectId;
          const actionLabel = `${isSelected ? 'Unassign' : 'Assign'} ${subject.subjectName} ${
            isSelected ? 'from' : 'to'
          } ${ariaLabelPrefix}`;

          return (
            <Tooltip
              key={subject.subjectId}
              title={disabled ? 'Assignment locked' : actionLabel}
              arrow
            >
              <span>
                <ButtonBase
                  disabled={disabled}
                  aria-label={actionLabel}
                  aria-pressed={isSelected}
                  onClick={() => onToggle(subject.subjectId)}
                  sx={(theme) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    minWidth: 168,
                    minHeight: 44,
                    px: 1.25,
                    py: 0.75,
                    borderRadius: 1.25,
                    border: '1px solid',
                    userSelect: 'none',
                    touchAction: 'manipulation',
                    cursor: disabled ? 'default' : 'pointer',
                    transition: theme.transitions.create(
                      ['background-color', 'border-color', 'box-shadow', 'color'],
                      { duration: theme.transitions.duration.shorter }
                    ),
                    '&:focus-visible': {
                      outline: `2px solid ${theme.vars.palette.primary.main}`,
                      outlineOffset: 2,
                    },
                    ...(isSelected
                      ? {
                          color: 'primary.main',
                          borderColor: 'primary.main',
                          backgroundColor: varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
                          boxShadow: `inset 0 0 0 1px ${varAlpha(
                            theme.vars.palette.primary.mainChannel,
                            0.16
                          )}`,
                          '&:hover': {
                            backgroundColor: varAlpha(theme.vars.palette.primary.mainChannel, 0.14),
                          },
                          '&.Mui-disabled': {
                            opacity: 1,
                            color: 'primary.main',
                            borderColor: 'primary.main',
                            backgroundColor: varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
                          },
                        }
                      : {
                          color: 'text.primary',
                          borderColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.32),
                          backgroundColor: 'background.paper',
                          boxShadow: `0 1px 2px ${varAlpha(
                            theme.vars.palette.grey['500Channel'],
                            0.12
                          )}`,
                          '&:hover': {
                            color: 'primary.main',
                            borderColor: 'primary.main',
                            backgroundColor: varAlpha(theme.vars.palette.primary.mainChannel, 0.04),
                            boxShadow: `0 2px 6px ${varAlpha(
                              theme.vars.palette.grey['500Channel'],
                              0.18
                            )}`,
                          },
                          '&:active': {
                            backgroundColor: varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
                          },
                          '&.Mui-disabled': {
                            opacity: 0.48,
                            color: 'text.disabled',
                            boxShadow: 'none',
                          },
                        }),
                  })}
                >
                  <Box display="flex" alignItems="center" gap={0.75} minWidth={0}>
                    {isSelected ? (
                      <SelectedIcon sx={{ width: 18, height: 18, flexShrink: 0 }} />
                    ) : (
                      <UnselectedIcon
                        sx={{ width: 18, height: 18, color: 'text.secondary', flexShrink: 0 }}
                      />
                    )}
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.primary', fontWeight: 600, whiteSpace: 'nowrap' }}
                    >
                      {subject.subjectName}
                    </Typography>
                  </Box>

                  {/* <Typography
                    component="span"
                    variant="caption"
                    sx={{
                      color: isSelected ? 'primary.main' : 'text.secondary',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isSelected ? 'Selected' : 'Choose'}
                  </Typography> */}
                </ButtonBase>
              </span>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
}
