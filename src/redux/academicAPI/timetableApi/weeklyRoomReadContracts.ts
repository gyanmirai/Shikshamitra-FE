export type WeeklyTimetableDay =
  'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface WeeklyRoomInput {
  weeklyTimetableDay: WeeklyTimetableDay;
  startTime: string;
  endTime: string;
  standardId: string;
  divisionId: string;
  includeOccupied: boolean;
}

export interface WeeklyRoomRow {
  roomId: string;
  roomName: string;
  buildingName: string;
  floorName: string;
  capacity: number;
  status: 'available' | 'occupied' | 'maintenance';
  conflictReason?: string | null;
}
