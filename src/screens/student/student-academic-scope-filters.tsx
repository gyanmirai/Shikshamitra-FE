'use client';

import { Alert, Stack } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useStudentAcademicScope } from 'src/hooks/use-student-academic-scope';

export function StudentAcademicScopeFilters() {
  const scope = useStudentAcademicScope();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const change = (key: 'board' | 'medium', value: string) => {
    const next = new URLSearchParams(params.toString());
    ['organization', 'class', 'division', 'student', 'page', 'leavePage'].forEach((name) =>
      next.delete(name)
    );
    if (key === 'board') next.delete('medium');
    next.set(key, value);
    router.push(`${pathname}?${next.toString()}`);
  };
  return (
    <Stack spacing={1} sx={{ px: 1, py: 1 }}>
      {scope.isError && (
        <Alert severity="error">Academic access could not be verified. Refresh to try again.</Alert>
      )}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <CustomSelect
          fullWidth
          size="small"
          label="Board"
          options={scope.boards}
          labelKey="name"
          valueKey="id"
          value={scope.currentBoard?.id ?? ''}
          isLoading={scope.isLoading}
          onChange={(value) => change('board', String(value))}
        />
        <CustomSelect
          fullWidth
          size="small"
          label="Medium"
          options={scope.mediums}
          labelKey="name"
          valueKey="id"
          value={scope.currentMedium?.id ?? ''}
          isLoading={scope.isLoading}
          onChange={(value) => change('medium', String(value))}
        />
      </Stack>
    </Stack>
  );
}
