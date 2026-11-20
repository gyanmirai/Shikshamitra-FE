import StockImportDetail from 'src/screens/library/receiving/stock-import/StockImportDetail';

export default async function StockImportDetailPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;
  return <StockImportDetail id={batchId} />;
}
