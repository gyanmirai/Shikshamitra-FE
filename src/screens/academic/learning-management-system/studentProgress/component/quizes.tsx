'use client';

import CustomizableTable from 'src/components/customizabaleTable';

const Quizzes = () => (
  <CustomizableTable
    tableId="quiz-table"
    columns={[
      { id: 'quizName', label: 'Quiz Name' },
      { id: 'attempts', label: 'Attempts' },
      { id: 'gradeImpact', label: 'Grade Impact' },
      { id: 'score', label: 'Score' },
    ]}
    data={[]}
  />
);

export default Quizzes;
