import type { ReservationReadRow } from 'src/redux/academicAPI/timetableApi/roomReadContracts';

import type { RoomReservation, ReservationType } from './types';

const types: Record<string, ReservationType> = { 1: 'class', 2: 'practical', 3: 'exam', 4: 'meeting', 5: 'event', 6: 'maintenance', 7: 'other', class: 'class', practical: 'practical', exam: 'exam', meeting: 'meeting', event: 'event', maintenance: 'maintenance', other: 'other' };

export const roomReservationRead = (row: ReservationReadRow): RoomReservation => ({
  id: row.id, roomId: row.roomId, roomName: row.roomName || '', buildingName: row.buildingName || '',
  date: row.date?.split('T')[0] || '', startTime: row.startTime?.substring(0, 5) || '', endTime: row.endTime?.substring(0, 5) || '',
  purpose: row.purpose || '', reservationType: types[String(row.reservationType)] || 'other',
  requestedBy: row.requestedBy || '',
  status: row.status === 1 ? 'draft' : row.status === 2 ? 'pendingApproval' : row.status === 7 ? 'cancelled' : row.status === 8 ? 'rejected' : 'active',
  approvalStatus: row.status === 3 || row.status === 4 ? 'approved' : row.status === 8 ? 'rejected' : row.status === 2 ? 'pending' : row.status === 7 ? 'cancelled' : 'none',
  createdAt: row.creationTime || '', creatorId: row.creatorId, canReview: row.canReview === true,
  remarks: row.remarks, isRecurring: row.isRecurring, recurringUntilDate: row.recurringUntilDate?.split('T')[0],
});
