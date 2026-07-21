'use client';

import { Box, Tooltip, Typography } from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';

import type { ElectiveSubjectOption } from '../types';

interface SubjectSelectionControlProps {
  subjects: ElectiveSubjectOption[];
  selectedSubjectId?: string;
  onSelect: (subjectId: string) => void;
  disabled?: boolean;
  ariaLabelPrefix?: string;
}

export default function SubjectSelectionControl({
  subjects,
  selectedSubjectId,
  onSelect,
  disabled,
  ariaLabelPrefix = 'Assign',
}: SubjectSelectionControlProps) {
  return (
    <Box
      role="radiogroup"
      aria-label={`${ariaLabelPrefix} elective subject`}
      display="flex"
      flexDirection="row"
      flexWrap="wrap"
      gap={1}
    >
      {subjects.map((s) => {
        const isSelected = selectedSubjectId === s.subjectId;
        const color = s.subjectColor || '#3b82f6';

        return (
          <Tooltip key={s.subjectId} title={isSelected ? `${s.subjectName} (selected)` : s.subjectName}>
            <Box
              role="radio"
              aria-checked={isSelected}
              aria-disabled={disabled}
              tabIndex={disabled ? -1 : 0}
              onClick={() => !disabled && onSelect(s.subjectId)}
              onKeyDown={(e) => {
                if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onSelect(s.subjectId);
                }
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                pl: 1,
                pr: 1.5,
                py: 0.625,
                borderRadius: 1,
                border: '1px solid',
                cursor: disabled ? 'default' : 'pointer',
                userSelect: 'none',
                transition: 'all 0.18s ease',
                pointerEvents: disabled ? 'none' : 'auto',
                outline: 'none',
                '&:focus-visible': {
                  boxShadow: (theme) => `0 0 0 2px ${theme.vars.palette.primary.main}`,
                },
                ...(isSelected
                  ? {
                      borderColor: color,
                      boxShadow: `0 1px 4px ${color}30`,
                      '&:hover': { backgroundColor: disabled ? 'transparent' : `${color}22` },
                    }
                  : {
                      opacity: disabled ? 0.4 : 0.65,
                      borderColor: 'divider',
                      '&:hover': {
                        backgroundColor: disabled ? 'transparent' : 'background.paper',
                        borderColor: 'divider',
                      },
                    }),
              }}
            >
              {isSelected ? (
                <CheckIcon sx={{ width: 14, height: 14, color, flexShrink: 0 }} />
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
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}
