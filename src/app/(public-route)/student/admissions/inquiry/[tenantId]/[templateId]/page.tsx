import PublicAdmissionInquiryFormScreen from 'src/screens/public/admissions-crm/public-inquiry-form';
import { buildPublicAdmissionTrackingFieldValues } from 'src/screens/public/admissions-crm/public-inquiry-utils';

const page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ tenantId: string; templateId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const { tenantId, templateId } = await params;
  const trackingFieldValues = buildPublicAdmissionTrackingFieldValues(
    searchParams ? await searchParams : {}
  );
  return (
    <PublicAdmissionInquiryFormScreen
      tenantId={tenantId}
      templateId={templateId}
      trackingFieldValues={trackingFieldValues}
    />
  );
};

export default page;
