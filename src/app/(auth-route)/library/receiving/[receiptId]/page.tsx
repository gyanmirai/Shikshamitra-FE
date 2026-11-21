import ReceivingReceiptWorkspace from 'src/screens/library/receiving/ReceivingReceiptWorkspace';

export default async function ReceivingReceiptPage({
  params,
}: {
  params: Promise<{ receiptId: string }>;
}) {
  const { receiptId } = await params;
  return <ReceivingReceiptWorkspace id={receiptId} />;
}
