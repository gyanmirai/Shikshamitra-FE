export enum RuleOperator {
  /**
   * Equal to value
   */
  Equals = 0,

  /**
   * Not equal to value
   */
  NotEquals = 1,

  /**
   * Contains value (string)
   */
  Contains = 2,

  /**
   * Starts with value (string)
   */
  StartsWith = 3,

  /**
   * Ends with value (string)
   */
  EndsWith = 4,

  /**
   * Greater than value (numeric/date)
   */
  GreaterThan = 5,

  /**
   * Less than value (numeric/date)
   */
  LessThan = 6,

  /**
   * Greater than or equal to value (numeric/date)
   */
  GreaterOrEqual = 7,

  /**
   * Less than or equal to value (numeric/date)
   */
  LessOrEqual = 8,

  /**
   * Value is in a list (comma-separated)
   */
  In = 9,
}
