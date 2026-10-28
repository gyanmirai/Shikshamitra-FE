import { Box } from '@mui/material';
import React, { useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { useStudentAcademicScope } from 'src/hooks/use-student-academic-scope';

const ClassDivisionFilter = () => {
  const scope = useStudentAcademicScope();
  const contextKey = `${scope.currentYear?.id ?? ''}:${scope.currentMedium?.id ?? ''}`;
  const [selection, setSelection] = useState({ contextKey, classId: '', divisionId: '' });
  const classes = !scope.isError
    ? (scope.currentMedium?.educationMediumStages?.flatMap((stage) => stage.standards ?? []) ?? [])
    : [];
  const selectedClass =
    selection.contextKey === contextKey && classes.some((item) => item.id === selection.classId)
      ? selection.classId
      : '';
  const divisions = classes.find((item) => item.id === selectedClass)?.divisions ?? [];
  const selectedDivision = divisions.some((item) => item.id === selection.divisionId)
    ? selection.divisionId
    : '';
  useEffect(() => {
    if (scope.isError)
      shikshaMitraToast.error({ message: 'Could not load Institute Setup options.' });
  }, [scope.isError]);

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <CustomSelect
        options={[{ id: '', name: 'All classes' }, ...classes]}
        label="Class"
        value={selectedClass}
        onChange={(val) => setSelection({ contextKey, classId: String(val), divisionId: '' })}
        size="small"
        isSearch
        isLoading={scope.isLoading}
        disabled={scope.isError || !scope.currentMedium}
        labelKey="name"
        valueKey="id"
        formControlProps={{ sx: { minWidth: '90px' } }}
      />
      <CustomSelect
        options={[{ id: '', name: 'All divisions' }, ...divisions]}
        label="Division"
        value={selectedDivision}
        onChange={(val) =>
          setSelection({ contextKey, classId: selectedClass, divisionId: String(val) })
        }
        size="small"
        isSearch
        isLoading={scope.isLoading}
        labelKey="name"
        valueKey="id"
        formControlProps={{ sx: { minWidth: '90px' } }}
        disabled={scope.isError || !selectedClass}
        helperText={!selectedClass ? 'Select a class to filter divisions.' : undefined}
      />
    </Box>
  );
};

export default ClassDivisionFilter;
