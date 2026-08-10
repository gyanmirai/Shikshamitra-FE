import PublicFamilyAccessScreen from 'src/screens/public/admissions-crm/public-family-access';

const page = async ({ params }: { params: Promise<{ tenantId: string }> }) => {
  const { tenantId } = await params;
  return <PublicFamilyAccessScreen tenantId={tenantId} />;
};

export default page;
