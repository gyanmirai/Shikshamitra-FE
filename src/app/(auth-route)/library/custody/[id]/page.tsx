import CustodyDetailWorkspace from 'src/screens/library/custody/CustodyDetailWorkspace';

export default async function CustodyRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CustodyDetailWorkspace id={id} />;
}
