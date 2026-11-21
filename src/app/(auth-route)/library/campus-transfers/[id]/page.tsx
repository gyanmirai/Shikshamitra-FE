import CampusTransferRecord from 'src/screens/library/campus-transfers/CampusTransferRecord';

export default async function CampusTransferRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CampusTransferRecord id={id} />;
}
