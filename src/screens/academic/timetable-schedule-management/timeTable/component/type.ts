import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import type { DayData, TimetableSlot } from '../type';

export interface ITimeTableCellProps {
  timeSlot: string;
  day: any;
  slotData: any;
  isBreak: boolean;
  rowIndex: any;
  colIndex: any;
  item: any;
  colSpan?: number;
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

export interface ITimeTableView {
  timeTableData: TimetableSlot[];
  isTeacherVisible?: boolean;
  isRoomVisible?: boolean;
  isClassVisible?: boolean;
  isDivisionVisible?: boolean;
  isDrag?: boolean;
  onDrop?: (e: any, item: DayData, rowIndex: number, colIndex: number) => void;
  onTeacherSelect?: (
    updatedSlotData: any, // Contains the updated subjects array with teachers
    rowIndex: number,
    colIndex: number
  ) => void;
  onRoomSelect?: (
    updatedSlotData: any, // Contains the updated subjects array with rooms
    rowIndex: number,
    colIndex: number
  ) => void;
  // isDraggable: boolean;
  handleDeleteSlot?: (rowIndex: number, colIndex: number) => void;
  showThreeDots?: boolean;
  showCreateSlots?: boolean;
}
