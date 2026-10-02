import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { Paper, Stack } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export function useAttendanceContext() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { currentYear, currentMedium } = useSelector((state: RootState) => state.globalState);
  const standards: Standards[] =
    currentMedium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards) ?? [];
  const requestedClass = params.get('class') ?? '';
  const standard = standards.find((item) => item.id === requestedClass);
  const divisions = standard?.divisions ?? [];
  const requestedDivision = params.get('division') ?? '';
  const update = (values: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(values).forEach(([key, value]) =>
      value ? next.set(key, value) : next.delete(key)
    );
    router.push(`${pathname}?${next.toString()}`);
  };
  return {
    params,
    update,
    currentYear,
    currentMedium,
    standards,
    divisions,
    standardId: standard ? requestedClass : '',
    divisionId: divisions.some((item) => item.id === requestedDivision) ? requestedDivision : '',
  };
}

export function AttendanceClassFilters({
  context,
  requireClass = false,
}: {
  context: ReturnType<typeof useAttendanceContext>;
  requireClass?: boolean;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 1 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <CustomSelect
          fullWidth
          size="small"
          label="Class"
          value={context.standardId}
          options={[
            { value: '', label: requireClass ? 'Select class' : 'All classes' },
            ...context.standards.map((item) => ({ value: item.id, label: item.name })),
          ]}
          onChange={(value) =>
            context.update({
              class: String(value),
              division: undefined,
              student: undefined,
              page: undefined,
              leavePage: undefined,
            })
          }
        />
        <CustomSelect
          fullWidth
          size="small"
          label="Division"
          value={context.divisionId}
          disabled={!context.standardId}
          options={[
            { value: '', label: requireClass ? 'Select division' : 'All divisions' },
            ...context.divisions.map((item) => ({ value: item.id, label: item.name })),
          ]}
          onChange={(value) =>
            context.update({ division: String(value), student: undefined, page: undefined })
          }
        />
      </Stack>
    </Paper>
  );
}
