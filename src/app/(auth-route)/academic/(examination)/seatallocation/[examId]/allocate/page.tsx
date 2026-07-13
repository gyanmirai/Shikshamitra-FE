import React from 'react';
import SeatingAllocationPage from 'src/screens/examination/seatingPlan/pages/SeatingAllocationPage';

const page = async ({ params }: { params: Promise<{ examId: string }> }) => {
  const { examId } = await params;
  return <SeatingAllocationPage examId={examId} />;
};

export default page;
