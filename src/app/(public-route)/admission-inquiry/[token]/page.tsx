import PublicAdmissionInquiryScreen from 'src/screens/public/admission-inquiry';

const page = async ({ params }: { params: Promise<{ token: string }> }) => {
  const { token } = await params;
  return <PublicAdmissionInquiryScreen token={token} />;
};

export default page;
