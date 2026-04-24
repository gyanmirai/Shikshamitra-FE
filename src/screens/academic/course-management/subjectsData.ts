export type DocumentType = 'pdf' | 'doc' | 'video' | 'image' | 'other';

interface Document {
  id: string;
  name: string;
  url: string;
  file?: File;
}

interface Assignment {
  title: string;
  dueDate: string;
  status: string;
}

interface Chapter {
  id: number;
  chapterName: string;
  content: string;
  timeLine: string;
  documents: Document[];
  progress: number;
  assignments: Assignment[];
}

interface Subject {
  name: string;
  primaryTeacher: string;
  secondaryTeacher: string[] | null;
  progress: number;
  material: {
    videos: number;
    pdfs: number;
  };
  chapters: Chapter[];
}

interface Division {
  name: string;
  subjects: Subject[];
}

interface Class {
  name: string;
  divisions: Division[];
}

interface SubjectData {
  classes: Class[];
}

export type { Class, Chapter, Subject, Document, Division, Assignment, SubjectData };

export const subjectTempData = {
  classes: [
    {
      id: '1',
      name: '5',
      divisions: [
        {
          id: 'A',
          name: 'A',
          subjects: [
            {
              name: 'Math',
              primaryTeacher: 'Ms. Johnson',
              secondaryTeacher: ['Mr. Smith'],
              progress: 20,
              material: {
                videos: 50,
                pdfs: 60,
              },
              chapters: [
                {
                  id: 1,
                  chapterName: 'Algebra Basics',
                  progress: 80,
                  content: 'Introduction to algebraic expressions and equations.',
                  timeLine: '12/01/2025',
                  documents: [],
                  assignedTeacher: 'Mr. Smith',
                  assignments: [
                    { title: 'Algebra Assignment', dueDate: '01-01-2024', status: 'Pending' },
                    { title: 'Geometry Assignment', dueDate: '01-02-2024', status: 'Received' },
                  ],
                },
                {
                  id: 2,
                  chapterName: 'Geometry',
                  content: 'Basic geometric concepts and theorems.',
                  timeLine: '10/05/2025',
                  assignedTeacher: 'Mr. Smith',
                  documents: [],
                  progress: 30,
                  assignments: [
                    { title: 'Algebra Assignment', dueDate: '01-01-2024', status: 'Pending' },
                    { title: 'Geometry Assignment', dueDate: '01-02-2024', status: 'Received' },
                  ],
                },
              ],
            },
            {
              name: 'Science',
              primaryTeacher: 'Ms. Johnson',
              secondaryTeacher: ['Mr. Smith'],
              progress: 50,
              material: {
                videos: 65,
                pdfs: 20,
              },
              chapters: [
                {
                  id: 3,
                  chapterName: 'Physics Basics',
                  progress: 60,
                  assignedTeacher: 'Mr. Smith',
                  content: 'Introduction to physics and its principles.',
                  timeLine: '05/01/2025',
                  documents: [],
                  assignments: [
                    { title: 'Algebra Assignment', dueDate: '01-01-2024', status: 'Pending' },
                    { title: 'Geometry Assignment', dueDate: '01-02-2024', status: 'Received' },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'B',
          name: 'B',
          subjects: [
            {
              name: 'Math',
              primaryTeacher: 'Ms. Johnson',
              secondaryTeacher: ['Mr. Smith'],
              progress: 80,
              material: {
                videos: 50,
                pdfs: 60,
              },
              chapters: [
                {
                  id: 1,
                  chapterName: 'Algebra Basics',
                  assignedTeacher: 'Mr. Smith',
                  progress: 60,
                  content: 'Introduction to algebraic expressions and equations.',
                  timeLine: '05/01/2025',
                  documents: [],
                  assignments: [
                    { title: 'Algebra Assignment', dueDate: '01-04-2024', status: 'Received' },
                  ],
                },
                {
                  id: 2,
                  chapterName: 'Geometry',
                  assignedTeacher: 'Mr. Smith',
                  content: 'Basic geometric concepts and theorems.',
                  timeLine: '06/01/2025',
                  documents: [],
                  progress: 30,
                  assignments: [
                    { title: 'Algebra Assignment', dueDate: '01-01-2024', status: 'Pending' },
                    { title: 'Geometry Assignment', dueDate: '01-02-2024', status: 'Received' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: '2',
      name: '2',
      divisions: [
        {
          id: 'A',
          name: 'A',
          subjects: [
            {
              name: 'Biology',
              primaryTeacher: 'Ms. Johnson',
              secondaryTeacher: ['Mr. Smith'],
              progress: 92,
              material: {
                videos: 50,
                pdfs: 60,
              },
              chapters: [
                {
                  id: 4,
                  chapterName: 'Cell Biology',
                  assignedTeacher: 'Mr. Smith',
                  progress: 80,
                  content: 'Study of cell structure and function.',
                  timeLine: '20/01/2025',
                  documents: [],
                  assignments: [
                    { title: 'Cell Biology Assignment', dueDate: '01-05-2024', status: 'Pending' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
