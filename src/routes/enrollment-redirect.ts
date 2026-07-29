import 'server-only';
import { redirect } from 'next/navigation';

type SearchParamValue = string | string[] | undefined;

export type EnrollmentRouteSearchParams = Promise<Record<string, SearchParamValue>>;

export async function redirectEnrollmentRoute(
  destination: string,
  searchParams: EnrollmentRouteSearchParams,
  overrides: Record<string, string> = {}
): Promise<never> {
  const source = await searchParams;
  const query = new URLSearchParams();

  Object.entries(source).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => query.append(key, entry));
    } else if (value !== undefined) {
      query.set(key, value);
    }
  });

  Object.entries(overrides).forEach(([key, value]) => query.set(key, value));

  const serialized = query.toString();
  redirect(serialized ? `${destination}?${serialized}` : destination);
}
