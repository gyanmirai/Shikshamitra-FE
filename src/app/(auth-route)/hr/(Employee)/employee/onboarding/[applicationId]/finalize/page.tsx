import FinalizeOnboardingPage from 'src/screens/hr/employee-onboarding/finalize-page';

export const metadata = { title: 'Finalize Staff Onboarding' };

export default async function Page({ params }: { params: Promise<{ applicationId: string }> }) {
  const { applicationId } = await params;
  return <FinalizeOnboardingPage applicationId={applicationId} />;
}
