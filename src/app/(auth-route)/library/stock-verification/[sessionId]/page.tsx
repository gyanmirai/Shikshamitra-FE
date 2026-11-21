import StockCountDetail from 'src/screens/library/stock-verification/StockCountDetail';

export default async function StockCountPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return <StockCountDetail id={sessionId} />;
}
