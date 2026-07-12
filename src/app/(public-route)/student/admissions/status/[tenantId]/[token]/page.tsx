import PublicAdmissionStatusScreen from 'src/screens/public/admissions-crm/public-status';

const page = async ({ params }: { params: Promise<{ tenantId: string; token: string }> }) => {
  const { tenantId, token } = await params;
  return <PublicAdmissionStatusScreen tenantId={tenantId} token={token} />;
};

export default page;
