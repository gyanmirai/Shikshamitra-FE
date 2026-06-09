/** Matches backend FeeAdjustmentStatus numeric values. */
export enum AdjustmentStatusEnum {
  Pending = 0,
  Approved = 1,
  PartiallyApplied = 2,
  Rejected = 3,
  Cancelled = 4,
}

export enum AdjustmentType {
  FeeCorrection = 1,
  OverpaymentAdjustment = 2,
  DiscountAdjustment = 3,
  RefundAdjustment = 4,
  ManualAdjustment = 5,
  ScholarshipAdjustment = 6,
}

/** Tab keys used by AdjustmentTable (not all map 1:1 to API status). */
export enum AdjustmentTabEnum {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
}
