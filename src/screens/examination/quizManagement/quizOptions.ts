// Example quiz data
export const quizData = [
  {
    question: 'What is the capital of France?',
    questionType: 'multiple-choice',
    options: [
      { value: 'paris', label: 'Paris' },
      { value: 'london', label: 'London' },
      { value: 'berlin', label: 'Berlin' },
    ],
    isRequired: true,
    correctAnswer: 'paris',
    marks: 5,
  },
  {
    question: 'The Earth is flat.',
    questionType: 'trueFalse',
    isRequired: true,
    correctAnswer: 'false',
    marks: 2,
  },
  {
    question: 'Explain the concept of gravity in your own words.',
    questionType: 'shortAns',
    isRequired: false,
    marks: 8,
  },
];

// Using the component
