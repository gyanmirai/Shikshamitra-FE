import { it, vi, expect } from 'vitest';

import FinalizeOnboardingPage from './finalize-page';
import Page, {
  metadata,
} from '../../../app/(auth-route)/hr/(Employee)/employee/onboarding/[applicationId]/finalize/page';

vi.mock('./finalize-page', () => ({ default: () => null }));

it('awaits the real application route param and delegates to the dedicated page with a meaningful document title', async () => {
  const applicationId = '11111111-1111-1111-1111-111111111111';
  const result = await Page({ params: Promise.resolve({ applicationId }) });
  expect(result.type).toBe(FinalizeOnboardingPage);
  expect(result.props.applicationId).toBe(applicationId);
  expect(metadata.title).toBe('Finalize Staff Onboarding');
});
