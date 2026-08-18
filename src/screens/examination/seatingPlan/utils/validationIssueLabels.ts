const VALIDATION_ISSUE_LABELS: Record<string, string> = {
  STUDENT_DUPLICATE_ASSIGNMENT: 'Duplicate Student Assignment',
  SEAT_DOUBLE_BOOKED: 'Seat Double Booked',
  SEAT_NOT_FOUND: 'Seat Not Found',
  RESERVED_SEAT_OCCUPIED: 'Reserved Seat Occupied',
  ROOM_CAPACITY_EXCEEDED: 'Room Capacity Exceeded',
  ROOM_LOW_UTILIZATION: 'Low Room Utilization',
  SPECIAL_REQUIREMENT_NOT_SATISFIED: 'Special Requirement Not Satisfied',
};

export function getValidationIssueLabel(code: string): string {
  const normalizedCode = code.trim();
  if (!normalizedCode) return 'Validation Issue';

  return (
    VALIDATION_ISSUE_LABELS[normalizedCode] ??
    normalizedCode
      .toLowerCase()
      .split(/[_\s-]+/)
      .filter(Boolean)
      .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
      .join(' ')
  );
}
