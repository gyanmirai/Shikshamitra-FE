import dayjs from 'dayjs';

export type RoomAvailabilityStatus = 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';

export type RoomAvailabilityRow = {
  id: string;
  roomId: string;
  roomName: string;
  roomNumber: string;
  buildingName: string;
  floor: string;
  roomTypeName: string;
  capacity: number;
  isAvailable: boolean;
  status: RoomAvailabilityStatus;
  conflictReason?: string;
  occupiedByClass?: string;
  occupiedBySubject?: string;
  occupiedByTeacher?: string;
  reservationPurpose?: string;
  currentAssignmentSource?: string;
};

export type RoomReservationRow = {
  id: string;
  roomId: string;
  roomName: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  reservationType: string;
  reservedFor: string;
  teacherName: string;
  status: 'Active' | 'Cancelled';
  remarks?: string;
};

export type RoomScheduleSlot = {
  period: string;
  time: string;
  status: 'Free' | 'Class' | 'Exam' | 'Event' | 'Maintenance';
  details: string;
};

export const todayIso = dayjs().format('YYYY-MM-DD');

export const lectureSlotOptions = [
  { value: 'p1', label: 'Period 1 - 09:00 to 09:45' },
  { value: 'p2', label: 'Period 2 - 10:00 to 10:45' },
  { value: 'p3', label: 'Period 3 - 11:00 to 11:45' },
  { value: 'p4', label: 'Period 4 - 12:00 to 12:45' },
  { value: 'p5', label: 'Period 5 - 13:30 to 14:15' },
];

export const buildingOptions = [
  { value: 'all', label: 'All Buildings' },
  { value: 'A Block', label: 'A Block' },
  { value: 'B Block', label: 'B Block' },
  { value: 'Science Wing', label: 'Science Wing' },
  { value: 'Activity Center', label: 'Activity Center' },
];

export const roomTypeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'Classroom', label: 'Classroom' },
  { value: 'Science Lab', label: 'Science Lab' },
  { value: 'Computer Lab', label: 'Computer Lab' },
  { value: 'Auditorium', label: 'Auditorium' },
  { value: 'Meeting Room', label: 'Meeting Room' },
];

export const reservationTypeOptions = [
  { value: 'Class', label: 'Class' },
  { value: 'Exam', label: 'Exam' },
  { value: 'Event', label: 'Event' },
  { value: 'Meeting', label: 'Meeting' },
  { value: 'Activity', label: 'Activity' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Other', label: 'Other' },
];

export const classOptions = [
  { value: '7-A', label: 'Class 7 - A' },
  { value: '8-B', label: 'Class 8 - B' },
  { value: '9-A', label: 'Class 9 - A' },
  { value: '10-C', label: 'Class 10 - C' },
];

export const teacherOptions = [
  { value: 'Anita Sharma', label: 'Anita Sharma' },
  { value: 'Rohit Mehta', label: 'Rohit Mehta' },
  { value: 'Farah Khan', label: 'Farah Khan' },
  { value: 'Kiran Patel', label: 'Kiran Patel' },
];

export const initialRoomRows: RoomAvailabilityRow[] = [
  {
    id: 'room-201',
    roomId: 'room-201',
    roomName: 'Room 201',
    roomNumber: '201',
    buildingName: 'A Block',
    floor: '2',
    roomTypeName: 'Classroom',
    capacity: 48,
    isAvailable: false,
    status: 'Occupied',
    conflictReason: 'Assigned in timetable for the selected period',
    occupiedByClass: '7-A',
    occupiedBySubject: 'Science',
    occupiedByTeacher: 'Anita Sharma',
    currentAssignmentSource: 'Timetable',
  },
  {
    id: 'room-202',
    roomId: 'room-202',
    roomName: 'Room 202',
    roomNumber: '202',
    buildingName: 'A Block',
    floor: '2',
    roomTypeName: 'Classroom',
    capacity: 42,
    isAvailable: true,
    status: 'Available',
    currentAssignmentSource: 'Free',
  },
  {
    id: 'lab-physics',
    roomId: 'lab-physics',
    roomName: 'Physics Lab',
    roomNumber: 'LAB-1',
    buildingName: 'Science Wing',
    floor: '1',
    roomTypeName: 'Science Lab',
    capacity: 32,
    isAvailable: false,
    status: 'Reserved',
    conflictReason: 'Reserved for practical assessment',
    reservationPurpose: 'Grade 9 Physics Practical',
    currentAssignmentSource: 'Room Reservation',
  },
  {
    id: 'computer-lab',
    roomId: 'computer-lab',
    roomName: 'Computer Lab',
    roomNumber: 'CL-2',
    buildingName: 'B Block',
    floor: '1',
    roomTypeName: 'Computer Lab',
    capacity: 36,
    isAvailable: true,
    status: 'Available',
    currentAssignmentSource: 'Free',
  },
  {
    id: 'auditorium',
    roomId: 'auditorium',
    roomName: 'Auditorium',
    roomNumber: 'AUD',
    buildingName: 'Activity Center',
    floor: 'Ground',
    roomTypeName: 'Auditorium',
    capacity: 180,
    isAvailable: false,
    status: 'Maintenance',
    conflictReason: 'Sound system maintenance',
    currentAssignmentSource: 'Maintenance',
  },
];

export const initialReservations: RoomReservationRow[] = [
  {
    id: 'res-1',
    roomId: 'lab-physics',
    roomName: 'Physics Lab',
    reservationDate: todayIso,
    startTime: '11:00',
    endTime: '11:45',
    purpose: 'Grade 9 Physics Practical',
    reservationType: 'Exam',
    reservedFor: '9-A',
    teacherName: 'Rohit Mehta',
    status: 'Active',
    remarks: 'Equipment setup required before Period 3.',
  },
  {
    id: 'res-2',
    roomId: 'auditorium',
    roomName: 'Auditorium',
    reservationDate: todayIso,
    startTime: '09:00',
    endTime: '12:45',
    purpose: 'Sound system maintenance',
    reservationType: 'Maintenance',
    reservedFor: 'Administration',
    teacherName: 'Kiran Patel',
    status: 'Active',
  },
];

export const roomSchedules: Record<string, RoomScheduleSlot[]> = {
  'room-201': [
    { period: 'Period 1', time: '09:00 - 09:45', status: 'Class', details: '7-A Science' },
    { period: 'Period 2', time: '10:00 - 10:45', status: 'Free', details: 'Free' },
    { period: 'Period 3', time: '11:00 - 11:45', status: 'Class', details: '8-B Mathematics' },
    { period: 'Period 4', time: '12:00 - 12:45', status: 'Free', details: 'Free' },
    { period: 'Period 5', time: '13:30 - 14:15', status: 'Event', details: 'Club meeting' },
  ],
  'room-202': [
    { period: 'Period 1', time: '09:00 - 09:45', status: 'Free', details: 'Free' },
    { period: 'Period 2', time: '10:00 - 10:45', status: 'Free', details: 'Free' },
    { period: 'Period 3', time: '11:00 - 11:45', status: 'Free', details: 'Free' },
    { period: 'Period 4', time: '12:00 - 12:45', status: 'Class', details: '6-C English' },
    { period: 'Period 5', time: '13:30 - 14:15', status: 'Free', details: 'Free' },
  ],
  'lab-physics': [
    { period: 'Period 1', time: '09:00 - 09:45', status: 'Free', details: 'Free' },
    { period: 'Period 2', time: '10:00 - 10:45', status: 'Free', details: 'Free' },
    { period: 'Period 3', time: '11:00 - 11:45', status: 'Exam', details: 'Grade 9 Practical' },
    { period: 'Period 4', time: '12:00 - 12:45', status: 'Free', details: 'Free' },
    { period: 'Period 5', time: '13:30 - 14:15', status: 'Class', details: '10-C Physics' },
  ],
  'computer-lab': [
    { period: 'Period 1', time: '09:00 - 09:45', status: 'Class', details: '8-B ICT' },
    { period: 'Period 2', time: '10:00 - 10:45', status: 'Free', details: 'Free' },
    { period: 'Period 3', time: '11:00 - 11:45', status: 'Free', details: 'Free' },
    { period: 'Period 4', time: '12:00 - 12:45', status: 'Free', details: 'Free' },
    { period: 'Period 5', time: '13:30 - 14:15', status: 'Class', details: '9-A ICT' },
  ],
  auditorium: [
    { period: 'Period 1', time: '09:00 - 09:45', status: 'Maintenance', details: 'Sound check' },
    { period: 'Period 2', time: '10:00 - 10:45', status: 'Maintenance', details: 'Sound check' },
    { period: 'Period 3', time: '11:00 - 11:45', status: 'Maintenance', details: 'Sound check' },
    { period: 'Period 4', time: '12:00 - 12:45', status: 'Free', details: 'Free' },
    { period: 'Period 5', time: '13:30 - 14:15', status: 'Event', details: 'Assembly practice' },
  ],
};
