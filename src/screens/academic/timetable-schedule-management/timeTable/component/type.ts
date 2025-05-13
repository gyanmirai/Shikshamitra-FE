export interface ITimeTableCellProps {
  timeSlot: string;
  day: string;
  slotData: any;
  isBreak: boolean;
  selectedRoom: string;
  onDrop: (e: any, timeSlot: string, day: string) => void;
  onTeacherSelect: (teacher: string, timeSlot: string, day: string) => void;
  onRoomSelect: (room: string, timeSlot: string, day: string) => void;
  onDeleteSlot: (timeSlot: string, day: string) => void;
}

export interface IAssignRoomProps {
  selectedRoom: string;
  slotData: any;
  onRoomSelect: (value: string) => void;
}
