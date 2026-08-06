// ─── Room Status ─────────────────────────────────────────────────────────────
export type RoomStatus =
  | 'available'
  | 'occupied'
  | 'reserved'
  | 'maintenance'
  | 'blocked'
  | 'conflict'
  | 'pendingApproval'
  | 'checkedIn'
  | 'noShow'
  | 'completed';

// ─── Reservation Types ────────────────────────────────────────────────────────
export type ReservationType =
  | 'class'
  | 'practical'
  | 'exam'
  | 'meeting'
  | 'event'
  | 'maintenance'
  | 'other';

// ─── Conflict Severity ────────────────────────────────────────────────────────
export type ConflictSeverity = 'critical' | 'warning' | 'info';

// ─── Reservation Status ───────────────────────────────────────────────────────
export type ReservationStatus =
  | 'draft'
  | 'pendingApproval'
  | 'approved'
  | 'active'
  | 'checkedIn'
  | 'completed'
  | 'cancelled'
  | 'rejected'
  | 'noShow'
  | 'expired';

// ─── Room Facilities ──────────────────────────────────────────────────────────
export type RoomFacility =
  | 'projector'
  | 'smartBoard'
  | 'ac'
  | 'computer'
  | 'labEquipment'
  | 'speaker'
  | 'internet'
  | 'cctv'
  | 'whiteboard';

// ─── View Types ───────────────────────────────────────────────────────────────
export type ViewType = 'table' | 'timeline' | 'calendar' | 'floor';

// ─── Tab Types ────────────────────────────────────────────────────────────────
export type TabType = 'availability' | 'reservations' | 'approvals' | 'reports';

// ─── Priority ─────────────────────────────────────────────────────────────────
export type Priority = 'low' | 'normal' | 'high' | 'urgent';

// ─── Maintenance Severity ────────────────────────────────────────────────────
export type MaintenanceSeverity = 'low' | 'medium' | 'high' | 'critical';

// ─── Core Interfaces ──────────────────────────────────────────────────────────

export interface Room {
  id: string;
  name: string;
  code?: string;
  buildingId?: string;
  buildingName: string;
  floorId?: string;
  floorName?: string;
  type: string;
  capacity: number;
  facilities: RoomFacility[];
  status: RoomStatus;
  description?: string;
  isActive: boolean;
}

export interface RoomAvailabilityItem {
  roomId: string;
  roomName: string;
  roomCode?: string;
  buildingName: string;
  floorName?: string;
  type: string;
  capacity: number;
  facilities: RoomFacility[];
  status: RoomStatus;
  occupiedBy?: string;
  occupiedByClass?: string;
  occupiedBySubject?: string;
  occupiedByTeacher?: string;
  reservationPurpose?: string;
  conflictReason?: string;
  conflictSeverity?: ConflictSeverity;
  source?: string;
  nextAvailableAt?: string;
  utilizationPercentage?: number;
  lastUpdatedAt?: string;
}

export interface RoomAvailabilitySummary {
  freeRooms: number;
  freeRoomPercentage: number;
  bestAvailableRoom?: string;
  bestAvailableRoomCapacity?: number;
  occupiedRooms: number;
  nextFreeingRoom?: string;
  nextFreeingTime?: string;
  activeReservations: number;
  nextReservation?: string;
  nextReservationTime?: string;
  conflictsVisible: number;
  criticalConflicts: number;
  warningConflicts: number;
}

export interface RoomReservation {
  id: string;
  roomId: string;
  roomName: string;
  buildingName?: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  reservationType: ReservationType;
  reservedFor?: string;
  requestedBy?: string;
  teacherName?: string;
  subject?: string;
  status: ReservationStatus;
  approvalStatus?: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'none';
  conflictStatus?: ConflictSeverity | 'none';
  conflictReason?: string;
  remarks?: string;
  isRecurring?: boolean;
  recurringUntilDate?: string;
  createdAt?: string;
  creatorId?: string;
  updatedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
}

export interface ScheduleSlot {
  period: string;
  time: string;
  status: 'free' | 'class' | 'exam' | 'event' | 'maintenance' | 'reserved';
  details: string;
  occupiedBy?: string;
  teacher?: string;
  reservationId?: string;
}

export interface RoomSchedule {
  roomId: string;
  roomName: string;
  date: string;
  slots: ScheduleSlot[];
}

export interface ConflictCheck {
  roomAvailability: { passed: boolean; message?: string };
  teacherAvailability: { passed: boolean; message?: string };
  classAvailability: { passed: boolean; message?: string };
  maintenanceCheck: { passed: boolean; message?: string };
  examSchedule: { passed: boolean; message?: string };
  holidayCalendar: { passed: boolean; message?: string };
  duplicateReservation: { passed: boolean; message?: string };
  overallSeverity: ConflictSeverity | 'none';
  canSave: boolean;
  requiresApproval: boolean;
  conflicts: ConflictItem[];
}

export interface ConflictItem {
  type: string;
  severity: ConflictSeverity;
  message: string;
  suggestion?: string;
}

export interface SuggestedRoom {
  roomId: string;
  roomName: string;
  buildingName: string;
  floorName?: string;
  type: string;
  capacity: number;
  facilities: RoomFacility[];
  availability: 'full' | 'partial' | 'none';
  matchScore: number;
  reason: string;
  conflictStatus: 'none' | 'warning' | 'critical';
  nextAvailableAt?: string;
  badges: RoomSuggestionBadge[];
  needsApproval: boolean;
}

export type RoomSuggestionBadge =
  | 'bestMatch'
  | 'availableFullDuration'
  | 'capacityMatch'
  | 'facilityMatch'
  | 'nearClass'
  | 'lowUtilization'
  | 'needsApproval'
  | 'warning';

export interface ReservationRequirements {
  reservationType: ReservationType | '';
  purpose: string;
  date: string;
  startTime: string;
  endTime: string;
  lectureSlot?: string;
  requiredCapacity?: number;
  preferredBuilding?: string;
  preferredFloor?: string;
  roomType?: string;
  requiredFacilities: RoomFacility[];
  reservedFor?: string;
  subject?: string;
  teacherName?: string;
  priority: Priority;
  isRecurring: boolean;
  recurringConfig?: RecurringConfig;
  remarks?: string;
  aiCommand?: string;
  selectedRoomId?: string;
  page?: number;
  limit?: number;
}

export interface RecurringConfig {
  repeatType: 'daily' | 'weekly' | 'monthly' | 'custom';
  repeatDays?: number[];
  untilDate?: string;
  occurrences?: number;
  excludeHolidays: boolean;
  excludeExamDays: boolean;
  skipConflictDates: boolean;
}

export interface MaintenanceBlock {
  id?: string;
  roomId: string;
  roomName?: string;
  title: string;
  reason: string;
  severity: MaintenanceSeverity;
  startDateTime: string;
  endDateTime: string;
  assignedStaff?: string;
  expectedCompletion?: string;
  remarks?: string;
  status?: 'scheduled' | 'inProgress' | 'completed';
}

export interface AuditLogEntry {
  id: string;
  action: string;
  user: string;
  dateTime: string;
  oldValue?: string;
  newValue?: string;
  remarks?: string;
  reservationId?: string;
  roomId?: string;
  roomName?: string;
}

export interface UsageReportData {
  roomId: string;
  roomName: string;
  buildingName: string;
  type: string;
  capacity: number;
  totalPeriods: number;
  occupiedPeriods: number;
  freePeriods: number;
  utilizationPercentage: number;
  reservationCount: number;
  maintenanceCount: number;
  conflictCount: number;
  cancellationCount: number;
  mainUsageType: string;
}

export interface RoomAvailabilityFilters {
  date: string;
  lectureSlot: string;
  startTime?: string;
  endTime?: string;
  building: string;
  floor: string;
  roomType: string;
  facilities: RoomFacility[];
  minimumCapacity: number;
  maximumCapacity?: number;
  status: string;
  source: string;
  conflictSeverity: string;
  search: string;
  includeOccupied: boolean;
  onlyAvailable: boolean;
}

export interface AIParseResult {
  reservationType?: ReservationType;
  purpose?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  requiredCapacity?: number;
  roomType?: string;
  requiredFacilities?: RoomFacility[];
  reservedFor?: string;
  subject?: string;
  suggestedRooms?: SuggestedRoom[];
  explanation?: string;
  confidence: number;
}

export interface RoomConfig {
  reservationRequiresApproval: boolean;
  auditoriumRequiresApproval: boolean;
  outsideHoursRequiresApproval: boolean;
  allowTeacherDirectBooking: boolean;
  allowConflictOverride: boolean;
  noShowGracePeriodMinutes: number;
  autoReleaseNoShow: boolean;
  minimumBookingMinutes: number;
  maximumBookingMinutes: number;
  allowRecurringReservation: boolean;
  allowBulkReservation: boolean;
  maintenanceBlocksReservation: boolean;
  notifyBeforeMinutes: number;
  defaultReservationStatus: ReservationStatus;
}
