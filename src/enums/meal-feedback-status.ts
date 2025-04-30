export enum FeedBackStatusType {
  Ok,
  Good,
  Bad,
  VeryBad,
  Superb,
  Amezing,
  LovedIt,
}

export const FeedBackStatusOptions = [
  {
    label: 'Ok',
    value: FeedBackStatusType.Ok,
  },
  {
    label: 'Good',
    value: FeedBackStatusType.Good,
  },
  {
    label: 'Bad',
    value: FeedBackStatusType.Bad,
  },
  {
    label: 'VeryBad',
    value: FeedBackStatusType.VeryBad,
  },
  {
    label: 'Superb',
    value: FeedBackStatusType.Superb,
  },
  {
    label: 'Amezing',
    value: FeedBackStatusType.Amezing,
  },
  {
    label: 'LovedIt',
    value: FeedBackStatusType.LovedIt,
  },
];

export const FeedBackStatusColors = {
  [FeedBackStatusType.Ok]: 'warning',
  [FeedBackStatusType.Good]: 'success',
  [FeedBackStatusType.Bad]: 'error',
  [FeedBackStatusType.VeryBad]: 'error',
  [FeedBackStatusType.Superb]: 'success',
  [FeedBackStatusType.Amezing]: 'success',
  [FeedBackStatusType.LovedIt]: 'success',
};
