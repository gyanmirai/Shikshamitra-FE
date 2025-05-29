import type { IClassData } from '../type';

export const createDummyFile = (name: string): File & { path?: string } => {
  const ext = name.split('.').pop()?.toLowerCase();
  let type = 'application/pdf'; // default fallback

  switch (ext) {
    case 'pdf':
      type = 'application/pdf';
      break;
    case 'doc':
    case 'docx':
      type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      break;
    case 'txt':
      type = 'text/plain';
      break;
    case 'jpg':
    case 'jpeg':
      type = 'image/jpeg';
      break;
    case 'png':
      type = 'image/png';
      break;
    default:
      type = 'application/octet-stream';
  }

  const file = new File(['This is a dummy file content'], name, { type });
  // Add a mock `path` property to simulate file path
  return Object.assign(file, { path: name });
};

export const dummyData: IClassData[] = [
  {
    id: 'class1',
    name: 'Class 1',
    subjects: [
      {
        id: 'math',
        name: 'Mathematics',
        documents: [createDummyFile('Algebra.pdf'), createDummyFile('Geometry')],
        subjectColor: '#ef5350',
      },
      {
        id: 'english',
        name: 'English',
        chapters: [
          {
            id: 'ch1',
            name: 'Chapter 1',
            documents: [createDummyFile('Poem.docx')],
          },
        ],
        documents: [createDummyFile('Poem.docx')],
        subjectColor: '#006400',
      },
    ],
  },
  {
    id: 'class2',
    name: 'Class 2',
    subjects: [
      {
        id: 'science',
        name: 'Science',
        chapters: [
          {
            id: 'ch1',
            name: 'Introduction',
            documents: [createDummyFile('Notes.pdf')],
          },
          {
            id: 'ch2',
            name: 'Advanced Topics',
            documents: [createDummyFile('LabReport.pdf')],
          },
        ],
        subjectColor: '#1a237e', // Darker blue color
        documents: [createDummyFile('Algebra.txt'), createDummyFile('Geometry.txt')],
      },
    ],
  },
];
