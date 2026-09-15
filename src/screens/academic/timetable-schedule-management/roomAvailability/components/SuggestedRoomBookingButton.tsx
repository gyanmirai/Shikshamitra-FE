import LoadingButton from '@mui/lab/LoadingButton';

interface SuggestedRoomBookingButtonProps {
  roomId: string;
  roomName: string;
  bookingRoomId: string | null;
  isCritical: boolean;
  isWarning: boolean;
  onBook: () => void;
}

export const SuggestedRoomBookingButton = ({
  roomId,
  roomName,
  bookingRoomId,
  isCritical,
  isWarning,
  onBook,
}: SuggestedRoomBookingButtonProps) => {
  const isBookingThisRoom = bookingRoomId === roomId;
  const label = isCritical
    ? 'Unavailable'
    : isWarning
      ? 'Book (Requires Approval)'
      : 'Book Instantly';

  return (
    <LoadingButton
      variant={isWarning ? 'outlined' : 'contained'}
      color={isCritical ? 'inherit' : isWarning ? 'warning' : 'primary'}
      fullWidth
      size="medium"
      loading={isBookingThisRoom}
      disabled={isCritical || Boolean(bookingRoomId)}
      onClick={onBook}
      aria-label={isBookingThisRoom ? `Booking ${roomName}` : `${label}: ${roomName}`}
      sx={{ mt: 0.5, py: 1, fontWeight: 600, borderRadius: 1.5 }}
    >
      {label}
    </LoadingButton>
  );
};
