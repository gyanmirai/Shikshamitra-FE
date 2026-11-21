import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';

export function useLoanYearChoices(requestedYear: string) {
  const context = useSelector((state: RootState) => state.globalState?.currentYear) as
    { id?: string; name?: string } | undefined;
  const options = [{ id: 'all', name: 'All authorized recorded years' }];
  if (context?.id)
    options.push({ id: context.id, name: `${context.name || 'Selected context year'} (context)` });
  if (requestedYear && requestedYear !== context?.id)
    options.push({ id: requestedYear, name: `Requested recorded year: ${requestedYear}` });
  return options;
}
