import type { LabelColor } from 'src/components/label';

import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { SubjectType } from 'src/enums/subject-type';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Card, Typography } from '@mui/material';
import {
  PublishUnpublishStatusType,
  PublishUnpublishStatusTypeColors,
} from 'src/enums/publishUnpublish-status';

interface SubjectSidebarProps {
  subjectAssignmentData: Record<string, any> | null;
  expandedSubject: string | null;
  onSubjectSelect: (subjectCode: string) => void;
  classId?: string;
  classes?: string;
}

const SubjectSidebar = ({
  subjectAssignmentData,
  expandedSubject,
  onSubjectSelect,
  classId,
  classes,
}: SubjectSidebarProps) => {
  const theme = useTheme();
  const subjects = (subjectAssignmentData?.data?.subjects ?? []) as Array<{
    subjectCode: string;
    subjectName: string;
  }>;

  return (
    <Card
      sx={{
        height: '100%',
        p: 2,
        boxShadow: 'var(--shadows-10)',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          pb: 2,
          mb: 2,
          borderBottom: `1px dashed ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            {(subjectAssignmentData?.subjectType as number) === 1 && (
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {subjectAssignmentData?.electiveGroupName as string}
              </Typography>
            )}
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <Iconify icon="mdi:google-classroom" width={16} />
              {(classes as string) || 'N/A'} {' - '}
              {SubjectType[subjectAssignmentData?.data?.subjectType as number] || 'N/A'}
            </Typography>
          </Box>

          <Label
            variant="soft"
            color={
              PublishUnpublishStatusTypeColors[
                subjectAssignmentData?.data?.status as PublishUnpublishStatusType
              ] as LabelColor
            }
          >
            {
              PublishUnpublishStatusType[
                subjectAssignmentData?.data?.status as PublishUnpublishStatusType
              ] as string
            }
          </Label>
        </Box>
      </Box>

      <Typography variant="overline" sx={{ color: 'text.disabled', mb: 1, px: 1 }}>
        Subjects
      </Typography>

      <Scrollbar sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {subjects.map((sub) => {
            const isSelected = expandedSubject === sub.subjectCode;
            return (
              <Box
                key={sub.subjectCode}
                onClick={() => onSubjectSelect(sub.subjectCode)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 1.5,
                  cursor: 'pointer',
                  borderRadius: 1.5,
                  transition: 'all 0.2s',
                  bgcolor: isSelected
                    ? () => varAlpha(theme.palette.primary.mainChannel, 0.08)
                    : 'transparent',
                  color: isSelected ? 'primary.main' : 'text.secondary',
                  '&:hover': {
                    bgcolor: isSelected
                      ? () => varAlpha(theme.palette.primary.mainChannel, 0.12)
                      : 'action.hover',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: isSelected ? 'primary.main' : 'text.disabled',
                    transition: 'background-color 0.2s',
                  }}
                />
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: isSelected ? 600 : 500,
                    color: isSelected ? 'text.primary' : 'text.secondary',
                  }}
                >
                  {sub.subjectName || 'UNNAMED SUBJECT'}
                </Typography>

                {isSelected && (
                  <Iconify
                    icon="eva:arrow-ios-forward-fill"
                    width={16}
                    sx={{ ml: 'auto', color: 'primary.main' }}
                  />
                )}
              </Box>
            );
          })}
        </Box>
      </Scrollbar>
    </Card>
  );
};

/**
 * Memoization Justification:
 * Sidebar re-renders only when subject assignment data or expanded subject changes.
 * React.memo prevents re-renders from tab changes in the sibling content area.
 */
export default React.memo(SubjectSidebar);
