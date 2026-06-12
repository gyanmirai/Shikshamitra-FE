import PublicEmployeeApplicationScreen from 'src/screens/public/employee-application';

const page = async ({ params }: { params: Promise<{ token: string }> }) => {
  const { token } = await params;
  return <PublicEmployeeApplicationScreen token={token} />;
};

export default page;
