import type {
  IBook,
  IBookSummary,
  IFineCirculation,
  IReservationData,
  IMemberCirculation,
} from './dummy-data-interface';

export const memberDataCirculation: IMemberCirculation[] = [
  {
    id: 'S001',
    name: 'Alice',
    role: 'Student',
  },
  {
    id: 'S002',
    name: 'Bob',
    role: 'Student',
  },
  {
    id: 'T001',
    name: 'Charlie',
    role: 'Teacher',
  },
  {
    id: 'T002',
    name: 'Dana',
    role: 'Teacher',
  },
  {
    id: 'S003',
    name: 'Eve',
    role: 'Student',
  },
];

export const booksCirculation: IBook[] = [
  {
    id: 'B001',
    title: 'Introduction to Programming',
    author: 'John Doe',
    publisher: 'TechPress',
    editions: [
      {
        year: 2020,
        totalCopies: 5,
        availableCopies: 2,
        currentIssuers: [
          {
            userId: 'S005',
            name: 'Alice',
            role: 'Student',
            issueDate: '2024-11-10',
            dueDate: '2024-12-01',
          },
          {
            userId: 'S006',
            name: 'Bob',
            role: 'Student',
            issueDate: '2024-11-12',
            dueDate: '2024-12-02',
          },
        ],
        reservedList: [
          { userId: 'S007', name: 'Charlie', role: 'Teacher', reservationDate: '2024-11-15' },
        ],
      },
      {
        year: 2021,
        totalCopies: 3,
        availableCopies: 1,
        currentIssuers: [
          {
            userId: 'S008',
            name: 'Dana',
            role: 'Student',
            issueDate: '2024-11-15',
            dueDate: '2024-12-05',
          },
        ],
        reservedList: [],
      },
    ],
  },
  {
    id: 'B002',
    title: 'Data Structures and Algorithms',
    author: 'Jane Smith',
    publisher: 'CodeWorks',
    editions: [
      {
        year: 2019,
        totalCopies: 6,
        availableCopies: 0,
        currentIssuers: [
          {
            userId: 'S009',
            name: 'Eve',
            role: 'Teacher',
            issueDate: '2024-11-01',
            dueDate: '2024-11-20',
          },
          {
            userId: 'S010',
            name: 'Frank',
            role: 'Student',
            issueDate: '2024-11-05',
            dueDate: '2024-11-25',
          },
          {
            userId: 'S011',
            name: 'Grace',
            role: 'Student',
            issueDate: '2024-11-08',
            dueDate: '2024-11-28',
          },
        ],
        reservedList: [
          { userId: 'S012', name: 'Hannah', role: 'Teacher', reservationDate: '2024-11-18' },
          { userId: 'S013', name: 'Ivy', role: 'Student', reservationDate: '2024-11-20' },
        ],
      },
      {
        year: 2020,
        totalCopies: 4,
        availableCopies: 1,
        currentIssuers: [
          {
            userId: 'S014',
            name: 'Jack',
            role: 'Student',
            issueDate: '2024-11-12',
            dueDate: '2024-12-01',
          },
        ],
        reservedList: [],
      },
    ],
  },
  {
    id: 'B003',
    title: 'Modern Physics',
    author: 'Albert Newton',
    publisher: 'SciPub',
    editions: [
      {
        year: 2018,
        totalCopies: 2,
        availableCopies: 0,
        currentIssuers: [
          {
            userId: 'S015',
            name: 'Kim',
            role: 'Student',
            issueDate: '2024-11-05',
            dueDate: '2024-11-25',
          },
          {
            userId: 'S016',
            name: 'Liam',
            role: 'Teacher',
            issueDate: '2024-11-07',
            dueDate: '2024-11-27',
          },
        ],
        reservedList: [
          { userId: 'S017', name: 'Mia', role: 'Student', reservationDate: '2024-11-20' },
        ],
      },
    ],
  },
  {
    id: 'B004',
    title: 'History of Civilizations',
    author: 'Diana Prince',
    publisher: 'HeritagePress',
    editions: [
      {
        year: 2017,
        totalCopies: 8,
        availableCopies: 5,
        currentIssuers: [
          {
            userId: 'S018',
            name: 'Noah',
            role: 'Teacher',
            issueDate: '2024-11-15',
            dueDate: '2024-12-05',
          },
          {
            userId: 'S019',
            name: 'Olivia',
            role: 'Student',
            issueDate: '2024-11-16',
            dueDate: '2024-12-06',
          },
        ],
        reservedList: [],
      },
    ],
  },
  {
    id: 'B005',
    title: 'Artificial Intelligence: Basics',
    author: 'Sophia Robotics',
    publisher: 'FutureTech',
    editions: [
      {
        year: 2023,
        totalCopies: 10,
        availableCopies: 10,
        currentIssuers: [],
        reservedList: [],
      },
    ],
  },
];

export const bookDataCirculation: IBookSummary[] = [
  {
    id: 'B001',
    title: 'Introduction to Programming',
    author: 'John Doe',
    publisher: 'TechPress',
    editions: [
      {
        year: 2020,
        publisher: 'TechPress',
        totalCopies: 5,
        availableCopies: 2,
      },
      {
        year: 2021,
        publisher: 'TechPress',
        totalCopies: 3,
        availableCopies: 1,
      },
    ],
  },
  {
    id: 'B002',
    title: 'Advanced Programming Techniques',
    author: 'Jane Smith',
    publisher: 'CodePub',
    editions: [
      {
        year: 2021,
        publisher: 'CodePub',
        totalCopies: 4,
        availableCopies: 2,
      },
      {
        year: 2022,
        publisher: 'CodePub',
        totalCopies: 6,
        availableCopies: 4,
      },
    ],
  },
  {
    id: 'B003',
    title: 'Data Structures and Algorithms',
    author: 'Michael Brown',
    publisher: 'AlgoBooks',
    editions: [
      {
        year: 2019,
        publisher: 'AlgoBooks',
        totalCopies: 3,
        availableCopies: 0, // No copies available
      },
      {
        year: 2020,
        publisher: 'AlgoBooks',
        totalCopies: 5,
        availableCopies: 5, // Available for issue
      },
    ],
  },
];

export const dummyDataForFineCirculation: IFineCirculation[] = [
  // Grouped by memberId
  {
    memberId: 'B1019JH8',
    memberName: 'John Doe',
    totalFineAmount: 50,
    status: 'Overdue',
    role: 'Student',
    fines: [
      {
        bookId: 'B101',
        title: 'Introduction to Mathematics',
        issueDate: '01-11-2024',
        dueDate: '08-11-2024',
        returnDate: '12-11-2024',
        status: 'Overdue',
        fineAmount: 50,
        receivedAmount: 0,
        fineReason: 'Late Return',
      },
    ],
  },
  {
    memberId: 'B10879JH8',
    memberName: 'Jane Smith',
    totalFineAmount: 50,
    status: 'Overdue',
    role: 'Student',
    fines: [
      {
        bookId: 'B102',
        title: 'Physics Fundamentals',
        issueDate: '05-11-2024',
        dueDate: '12-11-2024',
        returnDate: null,
        status: 'Pending',
        fineAmount: 50,
        receivedAmount: 0,
        fineReason: 'Late Return',
      },
    ],
  },
  {
    memberId: 'D10879J68',
    memberName: 'Sam Wilson',
    totalFineAmount: 250,
    status: 'Overdue',
    role: 'Student',
    fines: [
      {
        bookId: 'B103',
        title: 'Chemistry Basics',
        issueDate: '08-11-2024',
        dueDate: '15-11-2024',
        returnDate: '18-11-2024',
        status: 'Paid',
        fineAmount: 150,
        receivedAmount: 150,
        fineReason: 'Late Return',
      },
      {
        bookId: 'B104',
        title: 'Biology Essentials',
        issueDate: '10-11-2024',
        dueDate: '17-11-2024',
        returnDate: '20-11-2024',
        status: 'Overdue',
        fineAmount: 100,
        receivedAmount: 0,
        fineReason: 'Late Return',
      },
    ],
  },
];

export const dummyReservationData: IReservationData[] = [
  {
    bookId: 'B101',
    title: 'Introduction to Mathematics',
    memberName: 'John Doe',
    requestedDate: '12-11-23',
    status: 'Collected',
  },
  {
    bookId: 'B102',
    title: 'Physics Fundamentals',
    memberName: 'Jane Smith',
    requestedDate: '14-11-23',
    status: 'Pending',
  },
  {
    bookId: 'B103',
    title: 'Chemistry Basics',
    memberName: 'Sam Wilson',
    requestedDate: '18-11-23',
    status: 'Ready',
  },
  {
    bookId: 'B104',
    title: 'World History Overview',
    memberName: 'Chris Evans',
    requestedDate: '20-11-23',
    status: 'Collected',
  },
  {
    bookId: 'B105',
    title: 'Programming in Python',
    memberName: 'Natasha Romanoff',
    requestedDate: '22-11-23',
    status: 'Pending',
  },
];
