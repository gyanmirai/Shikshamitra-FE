import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import type { DayData } from '../type';

export interface ITimeTableCellProps {
  timeSlot: string;
  day: any;
  slotData: any;
  isBreak: boolean;
  rowIndex: any;
  colIndex: any;
  item: any;
  onDrop: (
    e: React.DragEvent<HTMLDivElement>,
    item: DayData,
    rowIndex: number,
    colIndex: number
  ) => void;
  onTeacherSelect: (teacher: string, rowIndex: number, colIndex: number) => void;
  onRoomSelect: (room: string, rowIndex: number, colIndex: number) => void;
  onDeleteSlot: (rowIndex: number, colIndex: number) => void;
  isThreeDots?: boolean;
}

export interface IAssignRoomProps {
  roomDialog: UseBooleanReturn;
  slotData: any;
  onRoomSelect: (value: string) => void;
  onClose?: (e: any, isSubmit: boolean) => void;
}

export interface IAssignTeacherProps {
  teacherDialog: UseBooleanReturn;
  slotData: any;
  onTeacherSelect: (value: string) => void;
  onClose?: (e: any, isSubmit: boolean) => void;
}
