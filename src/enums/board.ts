export enum BoardEnum {
  CBSE,
  GSEB,
  ICSE,
  IB,
  StateBoard,
  IGCSE,
  Custom,
}

export const BoardList = [
  {
    value: BoardEnum.CBSE,
    label: 'CBSE',
  },
  {
    value: BoardEnum.GSEB,
    label: 'GSEB',
  },
  { value: BoardEnum.ICSE, label: 'ICSE' },
  { value: BoardEnum.IB, label: 'IB' },
  { value: BoardEnum.StateBoard, label: 'State Board' },
  { value: BoardEnum.IGCSE, label: 'IGCSE' },
  { value: BoardEnum.Custom, label: '+ Add Custom Board' },
];
