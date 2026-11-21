import { ReservationCreateDialog } from '../../../reservations/ReservationCreateDialog';

export default function ReservationBookModal({
  editData,
  onClose,
  onBusyChange,
}: {
  editData: { id: string; title: string } | null;
  onClose: (event: unknown, submitted: boolean) => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  return editData ? (
    <ReservationCreateDialog
      book={editData}
      onClose={(submitted) => onClose(null, submitted)}
      onBusyChange={onBusyChange}
    />
  ) : null;
}
