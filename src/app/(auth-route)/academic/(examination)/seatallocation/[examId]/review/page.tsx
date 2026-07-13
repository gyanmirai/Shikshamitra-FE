import React from 'react';
import SeatingReviewPage from 'src/screens/examination/seatingPlan/pages/SeatingReviewPage';

const page = async ({ params }: { params: Promise<{ examId: string }> }) => {
  const { examId } = await params;
  return <SeatingReviewPage examId={examId} />;
};

export default page;
