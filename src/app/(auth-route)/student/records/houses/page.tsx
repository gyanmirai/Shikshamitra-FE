import { redirect } from 'next/navigation';
import { studentPaths } from 'src/constants/student-menu';
import HouseManagement from 'src/screens/student/house-management';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  if (params.tab === 'houses') {
    const catalogueQuery = new URLSearchParams();
    ['board', 'medium', 'search', 'sort', 'page', 'pageSize'].forEach((key) => {
      const value = params[key];
      if (typeof value === 'string' && value) catalogueQuery.set(key, value);
    });
    const query = catalogueQuery.toString();
    const path = studentPaths.records.settingsSections.createHouse;
    redirect(query ? `${path}?${query}` : path);
  }
  return <HouseManagement />;
}
