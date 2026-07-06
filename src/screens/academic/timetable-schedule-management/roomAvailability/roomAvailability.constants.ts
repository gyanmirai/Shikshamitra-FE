import type {
  Priority,
  RoomStatus,
  RoomFacility,
  ReservationType,
  ConflictSeverity,
  ReservationStatus,
  MaintenanceSeverity,
  RoomAvailabilityFilters,
} from './types';

// ─── Permission Names ─────────────────────────────────────────────────────────
export const ROOM_AVAILABILITY_PERMISSIONS = {
  VIEW: 'Academic.Timetable.RoomAvailability.View',
  RESERVE: 'Academic.Timetable.RoomAvailability.Reserve',
  APPROVE: 'Academic.Timetable.RoomAvailability.Approve',
  CANCEL: 'Academic.Timetable.RoomAvailability.Cancel',
  OVERRIDE_CONFLICT: 'Academic.Timetable.RoomAvailability.OverrideConflict',
  MANAGE_MAINTENANCE: 'Academic.Timetable.RoomAvailability.ManageMaintenance',
  ANALYTICS: 'Academic.Timetable.RoomAvailability.Analytics',
  EXPORT: 'Academic.Timetable.RoomAvailability.Export',
  AI: 'Academic.Timetable.RoomAvailability.AI',
} as const;

// ─── Status Labels ────────────────────────────────────────────────────────────
export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  available: 'Available',
  occupied: 'Occupied',
  reserved: 'Reserved',
  maintenance: 'Maintenance',
  blocked: 'Blocked',
  conflict: 'Conflict',
  pendingApproval: 'Pending Approval',
  checkedIn: 'Checked In',
  noShow: 'No Show',
  completed: 'Completed',
};

// ─── Status Colors ────────────────────────────────────────────────────────────
export const ROOM_STATUS_COLORS: Record<
  RoomStatus,
  'success' | 'warning' | 'error' | 'info' | 'default' | 'primary' | 'secondary'
> = {
  available: 'success',
  occupied: 'warning',
  reserved: 'info',
  maintenance: 'error',
  blocked: 'error',
  conflict: 'error',
  pendingApproval: 'warning',
  checkedIn: 'success',
  noShow: 'default',
  completed: 'default',
};

// ─── Status Icons ─────────────────────────────────────────────────────────────
export const ROOM_STATUS_ICONS: Record<RoomStatus, string> = {
  available: 'mdi:door-open',
  occupied: 'mdi:account-multiple',
  reserved: 'mdi:calendar-check',
  maintenance: 'mdi:wrench',
  blocked: 'mdi:block-helper',
  conflict: 'mdi:alert-circle',
  pendingApproval: 'mdi:clock-outline',
  checkedIn: 'mdi:check-circle',
  noShow: 'mdi:account-off',
  completed: 'mdi:check-all',
};

// ─── Conflict Severity Labels ────────────────────────────────────────────────
export const CONFLICT_SEVERITY_LABELS: Record<ConflictSeverity, string> = {
  critical: 'Critical',
  warning: 'Warning',
  info: 'Info',
};

export const CONFLICT_SEVERITY_COLORS: Record<ConflictSeverity, 'error' | 'warning' | 'info'> = {
  critical: 'error',
  warning: 'warning',
  info: 'info',
};

// ─── Reservation Status Labels ────────────────────────────────────────────────
export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  draft: 'Draft',
  pendingApproval: 'Pending Approval',
  approved: 'Approved',
  active: 'Active',
  checkedIn: 'Checked In',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
  noShow: 'No Show',
  expired: 'Expired',
};

export const RESERVATION_STATUS_COLORS: Record<
  ReservationStatus,
  'success' | 'warning' | 'error' | 'info' | 'default' | 'primary'
> = {
  draft: 'default',
  pendingApproval: 'warning',
  approved: 'success',
  active: 'primary',
  checkedIn: 'success',
  completed: 'default',
  cancelled: 'error',
  rejected: 'error',
  noShow: 'warning',
  expired: 'default',
};

// ─── Reservation Type Options ────────────────────────────────────────────────
export const RESERVATION_TYPE_OPTIONS: { value: ReservationType; label: string; icon: string }[] = [
  { value: 'class', label: 'Class', icon: 'mdi:school' },
  { value: 'practical', label: 'Practical', icon: 'mdi:flask' },
  { value: 'exam', label: 'Exam', icon: 'mdi:file-document-edit' },
  { value: 'meeting', label: 'Meeting', icon: 'mdi:account-group' },
  { value: 'event', label: 'Event', icon: 'mdi:calendar-star' },
  { value: 'maintenance', label: 'Maintenance', icon: 'mdi:wrench' },
  { value: 'other', label: 'Other', icon: 'mdi:dots-horizontal' },
];

// ─── Facility Labels & Icons ──────────────────────────────────────────────────
export const FACILITY_LABELS: Record<RoomFacility, string> = {
  projector: 'Projector',
  smartBoard: 'Smart Board',
  ac: 'AC',
  computer: 'Computer',
  labEquipment: 'Lab Equipment',
  speaker: 'Speaker',
  internet: 'Internet',
  cctv: 'CCTV',
  whiteboard: 'Whiteboard',
};

export const FACILITY_ICONS: Record<RoomFacility, string> = {
  projector: 'mdi:projector',
  smartBoard: 'mdi:television-play',
  ac: 'mdi:air-conditioner',
  computer: 'mdi:desktop-classic',
  labEquipment: 'mdi:flask',
  speaker: 'mdi:speaker',
  internet: 'mdi:wifi',
  cctv: 'mdi:cctv',
  whiteboard: 'mdi:draw',
};

const FACILITY_KEYS = Object.keys(FACILITY_LABELS) as RoomFacility[];
const normalizeFacilityKey = (value: string) => value.toLowerCase().replace(/[\s_-]/g, '');

// Backend facility values don't always match the frontend's RoomFacility casing/naming,
// so match loosely (by key or label) before falling back to the raw value.
export const resolveFacility = (raw: string) => {
  const normalizedRaw = normalizeFacilityKey(raw);
  const key = FACILITY_KEYS.find(
    (k) => normalizeFacilityKey(k) === normalizedRaw || normalizeFacilityKey(FACILITY_LABELS[k]) === normalizedRaw
  );
  return {
    label: key ? FACILITY_LABELS[key] : raw,
    icon: key ? FACILITY_ICONS[key] : 'mdi:check-circle-outline',
  };
};

// ─── Priority Options ─────────────────────────────────────────────────────────
export const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'default' },
  { value: 'normal', label: 'Normal', color: 'primary' },
  { value: 'high', label: 'High', color: 'warning' },
  { value: 'urgent', label: 'Urgent', color: 'error' },
];

// ─── Maintenance Severity Options ─────────────────────────────────────────────
export const MAINTENANCE_SEVERITY_OPTIONS: {
  value: MaintenanceSeverity;
  label: string;
  color: string;
}[] = [
  { value: 'low', label: 'Low', color: 'info' },
  { value: 'medium', label: 'Medium', color: 'warning' },
  { value: 'high', label: 'High', color: 'error' },
  { value: 'critical', label: 'Critical', color: 'error' },
];

// ─── Lecture Slot Options ─────────────────────────────────────────────────────
export const LECTURE_SLOT_OPTIONS = [
  { value: 'all', label: 'All Periods' },
  { value: 'p1', label: 'Period 1 · 09:00–09:45', startTime: '09:00', endTime: '09:45' },
  { value: 'p2', label: 'Period 2 · 10:00–10:45', startTime: '10:00', endTime: '10:45' },
  { value: 'p3', label: 'Period 3 · 11:00–11:45', startTime: '11:00', endTime: '11:45' },
  { value: 'p4', label: 'Period 4 · 12:00–12:45', startTime: '12:00', endTime: '12:45' },
  { value: 'p5', label: 'Period 5 · 13:30–14:15', startTime: '13:30', endTime: '14:15' },
];

// ─── Building Options ─────────────────────────────────────────────────────────
export const BUILDING_OPTIONS = [
  { value: 'all', label: 'All Buildings' },
  { value: 'A Block', label: 'A Block' },
  { value: 'B Block', label: 'B Block' },
  { value: 'Science Wing', label: 'Science Wing' },
  { value: 'Activity Center', label: 'Activity Center' },
];

// ─── Floor Options ────────────────────────────────────────────────────────────
export const FLOOR_OPTIONS: Record<string, { value: string; label: string }[]> = {
  'A Block': [
    { value: 'all', label: 'All Floors' },
    { value: '1', label: 'Floor 1' },
    { value: '2', label: 'Floor 2' },
    { value: '3', label: 'Floor 3' },
  ],
  'B Block': [
    { value: 'all', label: 'All Floors' },
    { value: '1', label: 'Floor 1' },
    { value: '2', label: 'Floor 2' },
  ],
  'Science Wing': [
    { value: 'all', label: 'All Floors' },
    { value: '1', label: 'Floor 1' },
  ],
  'Activity Center': [
    { value: 'all', label: 'All Floors' },
    { value: 'Ground', label: 'Ground Floor' },
  ],
  all: [{ value: 'all', label: 'All Floors' }],
};

// ─── Room Type Options ────────────────────────────────────────────────────────
export const ROOM_TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'Classroom', label: 'Classroom' },
  { value: 'Science Lab', label: 'Science Lab' },
  { value: 'Computer Lab', label: 'Computer Lab' },
  { value: 'Auditorium', label: 'Auditorium' },
  { value: 'Meeting Room', label: 'Meeting Room' },
  { value: 'Library', label: 'Library' },
  { value: 'Sports Hall', label: 'Sports Hall' },
];

// ─── Source Options ───────────────────────────────────────────────────────────
export const SOURCE_OPTIONS = [
  { value: 'all', label: 'All Sources' },
  { value: 'Timetable', label: 'Timetable' },
  { value: 'Room Reservation', label: 'Room Reservation' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Free', label: 'Free' },
];

// ─── Status Filter Options ────────────────────────────────────────────────────
export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'available', label: 'Available' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'pendingApproval', label: 'Pending Approval' },
  { value: 'conflict', label: 'Conflict' },
];

// ─── Conflict Severity Filter Options ────────────────────────────────────────
export const CONFLICT_FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'critical', label: 'Critical Only' },
  { value: 'warning', label: 'Warning+' },
  { value: 'info', label: 'Info+' },
];

// ─── Quick Filter Chips ───────────────────────────────────────────────────────
export const QUICK_FILTERS = [
  { label: 'Free Rooms', icon: 'mdi:door-open', filter: { status: 'available' } },
  { label: 'Labs Only', icon: 'mdi:flask', filter: { roomType: 'Science Lab' } },
  { label: 'Large Rooms', icon: 'mdi:seat', filter: { minimumCapacity: 80 } },
  { label: 'Maintenance', icon: 'mdi:wrench', filter: { status: 'maintenance' } },
  { label: 'Conflicts Only', icon: 'mdi:alert', filter: { conflictSeverity: 'critical' } },
  { label: 'Today', icon: 'mdi:calendar-today', filter: { date: 'today' } },
] as const;

// ─── Default Filters ──────────────────────────────────────────────────────────
export const DEFAULT_ROOM_AVAILABILITY_FILTERS: RoomAvailabilityFilters = {
  date: new Date().toISOString().split('T')[0],
  lectureSlot: 'all',
  building: 'all',
  floor: 'all',
  roomType: 'all',
  facilities: [],
  minimumCapacity: 0,
  status: 'all',
  source: 'all',
  conflictSeverity: 'all',
  search: '',
  includeOccupied: true,
  onlyAvailable: false,
};

// ─── Facility Options for Multi-select ───────────────────────────────────────
export const FACILITY_OPTIONS: { value: RoomFacility; label: string; icon: string }[] = [
  { value: 'projector', label: 'Projector', icon: 'mdi:projector' },
  { value: 'smartBoard', label: 'Smart Board', icon: 'mdi:television-play' },
  { value: 'ac', label: 'AC', icon: 'mdi:air-conditioner' },
  { value: 'computer', label: 'Computer', icon: 'mdi:desktop-classic' },
  { value: 'labEquipment', label: 'Lab Equipment', icon: 'mdi:flask' },
  { value: 'speaker', label: 'Speaker', icon: 'mdi:speaker' },
  { value: 'internet', label: 'Internet', icon: 'mdi:wifi' },
  { value: 'cctv', label: 'CCTV', icon: 'mdi:cctv' },
  { value: 'whiteboard', label: 'Whiteboard', icon: 'mdi:draw' },
];

// ─── Class Options ────────────────────────────────────────────────────────────
export const CLASS_OPTIONS = [
  { value: '6-A', label: 'Class 6 - A' },
  { value: '6-B', label: 'Class 6 - B' },
  { value: '7-A', label: 'Class 7 - A' },
  { value: '7-B', label: 'Class 7 - B' },
  { value: '8-A', label: 'Class 8 - A' },
  { value: '8-B', label: 'Class 8 - B' },
  { value: '9-A', label: 'Class 9 - A' },
  { value: '9-B', label: 'Class 9 - B' },
  { value: '10-A', label: 'Class 10 - A' },
  { value: '10-B', label: 'Class 10 - B' },
  { value: '10-C', label: 'Class 10 - C' },
];

// ─── Teacher Options ──────────────────────────────────────────────────────────
export const TEACHER_OPTIONS = [
  { value: 'Anita Sharma', label: 'Anita Sharma' },
  { value: 'Rohit Mehta', label: 'Rohit Mehta' },
  { value: 'Farah Khan', label: 'Farah Khan' },
  { value: 'Kiran Patel', label: 'Kiran Patel' },
  { value: 'Suresh Nair', label: 'Suresh Nair' },
  { value: 'Priya Desai', label: 'Priya Desai' },
];

// ─── Badge Labels ─────────────────────────────────────────────────────────────
export const SUGGESTION_BADGE_LABELS = {
  bestMatch: 'Best Match',
  availableFullDuration: 'Full Duration',
  capacityMatch: 'Capacity Match',
  facilityMatch: 'Facility Match',
  nearClass: 'Near Class',
  lowUtilization: 'Low Utilization',
  needsApproval: 'Needs Approval',
  warning: 'Warning',
} as const;

// ─── Capacity Options ────────────────────────────────────────────────────────
export const CAPACITY_OPTIONS = [
  { value: 0, label: 'Any Capacity' },
  { value: 20, label: '20+ seats' },
  { value: 30, label: '30+ seats' },
  { value: 40, label: '40+ seats' },
  { value: 50, label: '50+ seats' },
  { value: 80, label: '80+ seats' },
  { value: 100, label: '100+ seats' },
];

// ─── Schedule Status Colors ───────────────────────────────────────────────────
export const SCHEDULE_STATUS_COLORS: Record<
  string,
  'success' | 'warning' | 'info' | 'error' | 'default'
> = {
  free: 'success',
  class: 'warning',
  exam: 'info',
  event: 'default',
  maintenance: 'error',
  reserved: 'info',
};
