// src/data/schoolData.ts
export interface Assignment {
  title: string;
  dueDate: string;
  status: string;
}

export interface Chapter {
  id: number;
  chapterName: string;
  content: string;
  progress: number;
  assignments: Assignment[];
}

export interface Subject {
  name: string;
  assignedTeacher: string;
  progress: number;
  material: {
    videos: number;
    pdfs: number;
  };
  chapters: Chapter[];
}

export interface Division {
  id: string;
  name: string;
  subjects: Subject[];
}

export interface TClass {
  id: string;
  name: string;
  divisions: Division[];
}

export const subjectTempData = {
  classes: [
    {
      id: '1',
      name: '1',
      divisions: [
        {
          id: 'A',
          name: 'A',
          subjects: [
            {
              name: 'Math',
              assignedTeacher: 'Jeny',
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
                  assignments: [
                    { title: 'Algebra Assignment', dueDate: '01-01-2024', status: 'Pending' },
                    { title: 'Geometry Assignment', dueDate: '01-02-2024', status: 'Received' },
                  ],
                },
                {
                  id: 2,
                  chapterName: 'Geometry',
                  content: 'Basic geometric concepts and theorems.',
                  progress: 60,
                  assignments: [
                    { title: 'Algebra Assignment', dueDate: '01-01-2024', status: 'Pending' },
                    { title: 'Geometry Assignment', dueDate: '01-02-2024', status: 'Received' },
                  ],
                },
              ],
            },
            {
              name: 'Science',
              assignedTeacher: 'Heny',
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
                  content: 'Introduction to physics and its principles.',
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
              assignedTeacher: 'Helly',
              progress: 80,
              material: {
                videos: 50,
                pdfs: 60,
              },
              chapters: [
                {
                  id: 1,
                  chapterName: 'Algebra Basics',
                  content: 'Introduction to algebraic expressions and equations.',
                  assignments: [
                    { title: 'Algebra Assignment', dueDate: '01-04-2024', status: 'Received' },
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
              assignedTeacher: 'Kreni',
              progress: 92,
              material: {
                videos: 50,
                pdfs: 60,
              },
              chapters: [
                {
                  id: 4,
                  chapterName: 'Cell Biology',
                  progress: 80,
                  content: 'Study of cell structure and function.',
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
