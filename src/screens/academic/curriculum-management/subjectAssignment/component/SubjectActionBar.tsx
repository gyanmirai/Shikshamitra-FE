import type { RootState } from 'src/redux/store';
import type { Standards } from 'src/types/school';

import React from 'react';
import { Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { Box, Card, Button } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import { hasGrantedPermission } from 'src/utils/permissions';
import { academicPermissions } from 'src/constants/academic-menu';

interface SubjectActionBarProps {
  allClass: Standards[];
  classId: string;
  onClassChange: (value: string | number) => void;
  onAddNew: () => void;
}

const SubjectActionBar = ({
  allClass,
  classId,
  onClassChange,
  onAddNew,
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
          justifyContent: 'space-between',
          alignItems: 'center',
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
        {addEditPermission && (
          <Button
            size="small"
            startIcon={<Add />}
            variant="contained"
            onClick={onAddNew}
            sx={{ px: '32px' }}
          >
            Subject Allocation
          </Button>
        )}
      </Box>
    </Card>
  );
};

/**
 * Memoization Justification:
 * Contains a dropdown and button that only depend on class list and classId.
 * React.memo avoids re-renders from table data loading, dialog state, or
 * selected subject changes that are frequent in the parent.
 */
export default React.memo(SubjectActionBar);
