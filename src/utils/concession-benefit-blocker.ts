import type { ConcessionBenefitBlocker } from 'src/redux/finance/ConcessionManagement/types';

import { concessionRequestErrorMessage } from './concession-request-error';
import { isApiProblemCodeMessage, isGenericApiProblemMessage } from './api-problem-details';

const genericTitles = new Set([
  'bad request',
  'conflict',
  'not found',
  'invalid request',
  'request failed',
  'validation failed',
]);

/** Context DTO messages can be untranslated resource keys; keep server-specific reasons intact. */
export function concessionBenefitBlockerMessage(
  blocker?: Pick<ConcessionBenefitBlocker, 'code' | 'message'> | null
): string | undefined {
  if (!blocker) return undefined;
  const code = typeof blocker.code === 'string' ? blocker.code.trim() : '';
  const message = typeof blocker.message === 'string' ? blocker.message.trim() : '';
  const generic = genericTitles.has(message.toLowerCase().replace(/[.]+$/, ''));
  if (
    message &&
    message !== code &&
    !isApiProblemCodeMessage(message) &&
    !isGenericApiProblemMessage(message) &&
    !generic
  )
    return message;

  return (
    concessionRequestErrorMessage(code) ||
    concessionRequestErrorMessage(message) ||
    'This concession type is unavailable. Review existing requests or contact support.'
  );
}
