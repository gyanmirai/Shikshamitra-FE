export interface ReservationPageInput {
  createdDate?: string;
  isApprovalView?: boolean;
  roomId?: string;
  statusGroup?: string;
  searchTerm?: string;
  searchColumns?: string[];
  filters?: string;
  sorting?: string;
  skipCount: number;
  maxResultCount: number;
}

export interface ReservationReadRow {
  id: string;
  roomId: string;
  roomName?: string;
  buildingName?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  purpose?: string;
  reservationType: number | string;
  requestedBy?: string;
  status: number;
  creationTime?: string;
  creatorId?: string;
  canReview?: boolean;
  remarks?: string;
  isRecurring?: boolean;
  recurringUntilDate?: string;
}

export interface ReservationPage {
  totalCount: number;
  items: ReservationReadRow[];
  statusCounts: Record<string, number>;
}

export interface RoomAuditPageInput {
  roomId?: string;
  searchTerm?: string;
  skipCount: number;
  maxResultCount: number;
}

export interface RoomAuditReadRow {
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

export function reservationPageUrl(input: ReservationPageInput) {
  const params = new URLSearchParams();
  Object.entries(input).forEach(([key, value]) => {
    if (value === undefined) return;
    if (Array.isArray(value)) value.forEach(item => params.append(key, item));
    else params.set(key, String(value));
  });
  return `academics/timetable/room-reservations/page?${params}`;
}
