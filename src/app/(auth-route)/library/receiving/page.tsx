import ReceivingHistoryWorkspace from 'src/screens/library/receiving/ReceivingHistoryWorkspace';

export default async function LibraryReceivingPage({
  searchParams,
}: {
  searchParams: Promise<{ copyId?: string }>;
}) {
  const { copyId } = await searchParams;
  return <ReceivingHistoryWorkspace copyId={copyId} />;
}
