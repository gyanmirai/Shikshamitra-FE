import { ReservationWorkspace } from '../../../reservations/ReservationWorkspace';

export default function ViewReservedMembersTable({
  editData,
  onClose,
}: {
  editData: { id: string; title: string } | null;
  onClose: () => void;
}) {
  return editData ? <ReservationWorkspace book={editData} onClose={onClose} /> : null;
}
