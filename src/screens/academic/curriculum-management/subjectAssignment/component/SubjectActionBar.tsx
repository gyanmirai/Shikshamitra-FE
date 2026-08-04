import type { RootState } from 'src/redux/store';
import type { Standards } from 'src/types/school';

import React from 'react';
import { useSelector } from 'react-redux';
import CustomSelect from 'src/components/custom-select';
import { hasGrantedPermission } from 'src/utils/permissions';
import { academicPermissions } from 'src/constants/academic-menu';
import { Add, Close, Search, ContentCopy } from '@mui/icons-material';
import { Box, Card, Button, Tooltip, TextField, IconButton, InputAdornment } from '@mui/material';

interface SubjectActionBarProps {
  allClass: Standards[];
  classId: string;
  teacherSearch: string;
  onClassChange: (value: string | number) => void;
  onTeacherSearchChange: (value: string) => void;
  onAddNew: () => void;
  onCopySubjects?: () => void;
}

const SubjectActionBar = ({
  allClass,
  classId,
  teacherSearch,
  onClassChange,
  onTeacherSearchChange,
  onAddNew,
  onCopySubjects,
}: SubjectActionBarProps) => {
  const { permissions } = useSelector((state: RootState) => state.auth);

  const addEditPermission = hasGrantedPermission(
    permissions,
    `${academicPermissions.curriculum.subjectsAssignment}.Add`
  );

  return (
    <Card sx={{ boxShadow: 'var(--shadows-4)', p: 1, mb: 1 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        <CustomSelect
          label="Class"
          name="class"
          options={allClass}
          valueKey="id"
          labelKey="name"
          formControlProps={{ sx: { maxWidth: '247px', width: '100%' } }}
          value={classId}
          onChange={(value) => onClassChange(value as string | number)}
        />
        <TextField
          size="small"
          label="Teacher"
          placeholder="Search teacher"
          value={teacherSearch}
          onChange={(event) => onTeacherSearchChange(event.target.value)}
          sx={{ maxWidth: 260, width: '100%' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: teacherSearch ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  aria-label="Clear teacher search"
                  onClick={() => onTeacherSearchChange('')}
                  edge="end"
                >
                  <Close fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : undefined,
          }}
        />
        {addEditPermission && (
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            {onCopySubjects && (
              <Tooltip
                title={!classId ? 'Select a class first' : ''}
                disableHoverListener={!!classId}
              >
                <span>
                  <Button
                    size="small"
                    startIcon={<ContentCopy />}
                    variant="outlined"
                    disabled={!classId}
                    onClick={onCopySubjects}
                    sx={{ px: '20px' }}
                  >
                    Copy Subject from Class
                  </Button>
                </span>
              </Tooltip>
            )}
            <Button
              size="small"
              startIcon={<Add />}
              variant="contained"
              onClick={onAddNew}
              sx={{ px: '32px' }}
            >
              Subject Allocation
            </Button>
          </Box>
        )}
      </Box>
    </Card>
  );
};

/**
 * Memoization Justification:
 * Receives stable toolbar props from the parent hook, including the teacher
 * search handler. React.memo keeps table loading, dialog, and selected-subject
 * state changes from repainting the filter toolbar.
 */
export default React.memo(SubjectActionBar);
