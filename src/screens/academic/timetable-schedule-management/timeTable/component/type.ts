import type { UseBooleanReturn } from 'src/hooks/use-boolean';

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
  roomDialog: UseBooleanReturn;
  selectedRoom: string;
  slotData: any;
  onRoomSelect: (value: string) => void;
}

export interface IAssignTeacherProps {
  teacherDialog: UseBooleanReturn;
  slotData: any;
  onTeacherSelect: (value: string) => void;
}
