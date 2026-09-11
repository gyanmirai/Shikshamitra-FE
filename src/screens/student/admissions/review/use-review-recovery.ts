import { useState } from 'react';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';

export function useReviewRecovery<T>(
  initial: T,
  onReload: () => Promise<T>,
  context: 'review' | 'application' = 'review'
) {
  const [summary, setSummary] = useState(initial);
  const [error, setError] = useState('');
  const [reloading, setReloading] = useState(false);
  const fail = (failure: unknown) => {
    const problem = parseApiProblemDetail(failure);
    setError(
      `${problem.detail === 'Something went wrong' ? `Unable to update the ${context}.` : problem.detail} Your edits are still here. Reload the latest ${context} if another person changed the application.`
    );
  };
  const reload = async (reset: (updated: T) => void) => {
    setReloading(true);
    try {
      const updated = await onReload();
      setSummary(updated);
      reset(updated);
      setError('');
    } catch {
      setError(`Unable to reload the ${context}. Your edits are still here. Try again.`);
    } finally {
      setReloading(false);
    }
  };
  return { summary, setSummary, error, setError, reloading, fail, reload };
}
