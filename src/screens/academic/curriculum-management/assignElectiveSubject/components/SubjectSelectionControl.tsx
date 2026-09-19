'use client';

import { Check as CheckIcon } from '@mui/icons-material';
import { Box, Tooltip, ButtonBase, Typography } from '@mui/material';

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
      flexDirection="row"
      flexWrap="wrap"
      gap={1}
    >
      {subjects.map((s) => {
        const isSelected = selectedSubjectId === s.subjectId;
        const actionLabel = `${isSelected ? 'Unassign' : 'Assign'} ${s.subjectName} ${
          isSelected ? 'from' : 'to'
        } ${ariaLabelPrefix}`;

        return (
          <Tooltip key={s.subjectId} title={actionLabel} arrow>
            <span>
              <ButtonBase
                disabled={disabled}
                aria-label={actionLabel}
                aria-pressed={isSelected}
                onClick={() => onToggle(s.subjectId)}
                sx={(theme) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  minHeight: 44,
                  px: 1.25,
                  py: 0.5,
                  borderRadius: 1,
                  border: '1px solid',
                  userSelect: 'none',
                  transition: theme.transitions.create([
                    'background-color',
                    'border-color',
                    'box-shadow',
                    'opacity',
                  ]),
                  '&:focus-visible': {
                    outline: `2px solid ${theme.vars.palette.primary.main}`,
                    outlineOffset: 2,
                  },
                  '&.Mui-disabled': { opacity: 0.4 },
                  ...(isSelected
                    ? {
                        borderColor: s.subjectColor || 'primary.main',
                        backgroundColor: 'action.selected',
                        boxShadow: theme.vars.customShadows.z1,
                        '&:hover': { backgroundColor: 'action.hover' },
                      }
                    : {
                        opacity: 0.72,
                        borderColor: 'divider',
                        '&:hover': {
                          opacity: 1,
                          backgroundColor: 'action.hover',
                          borderColor: 'text.secondary',
                        },
                      }),
                })}
              >
                {isSelected ? (
                  <CheckIcon
                    sx={(theme) => ({
                      width: 16,
                      height: 16,
                      color: s.subjectColor || theme.vars.palette.primary.main,
                      flexShrink: 0,
                    })}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 3,
                      height: 16,
                      borderRadius: 1,
                      flexShrink: 0,
                      backgroundColor: 'grey.300',
                    }}
                  />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? 'text.primary' : 'text.secondary',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s.subjectName}
                </Typography>
              </ButtonBase>
            </span>
          </Tooltip>
        );
      })}
    </Box>
  );
}
