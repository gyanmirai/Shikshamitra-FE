import { redirect } from 'next/navigation';
import { studentPaths } from 'src/constants/student-menu';

type Props = {
  searchParams: Promise<{ cycle?: string | string[] }>;
};

export default async function EnrollmentSettingsPage({ searchParams }: Props) {
  const params = await searchParams;
  const cycle = Array.isArray(params.cycle) ? params.cycle[0] : params.cycle;
  const target = new URL(
    studentPaths.enrollment.settingsSections.journey,
    'https://student-enrollment.local'
  );
  if (cycle) target.searchParams.set('cycle', cycle);
  redirect(`${target.pathname}${target.search}`);
}
