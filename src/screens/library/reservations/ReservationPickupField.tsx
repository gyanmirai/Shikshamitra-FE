import { Alert, Stack, Button } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import { useGetReservationPickupLocationsQuery } from 'src/redux/library/reservations-api';

export function ReservationPickupField({
  academicYearId,
  value,
  onChange,
  enabled,
  disabled,
}: {
  academicYearId: string;
  value: string;
  onChange: (id: string) => void;
  enabled: boolean;
  disabled: boolean;
}) {
  const query = useGetReservationPickupLocationsQuery(
    { academicYearId },
    { skip: !enabled || !academicYearId, refetchOnMountOrArgChange: true }
  );
  if (query.isError) {
    return (
      <Alert severity="warning" action={<Button onClick={() => query.refetch()}>Retry</Button>}>
        Pickup locations are unavailable.
        {value && (
          <Button color="inherit" onClick={() => onChange('')} disabled={disabled}>
            Clear pickup selection
          </Button>
        )}
      </Alert>
    );
  }
  const locations = query.currentData ?? [];
  if (!locations.length && !value) return null;
  const selectedExists = !value || locations.some((location) => location.sectionId === value);
  return (
    <Stack spacing={1}>
      <CustomSelect
        label="Pickup location"
        name="pickupSectionId"
        value={selectedExists ? value : ''}
        onChange={(selection) => onChange(String(selection))}
        options={[
          { id: '', name: 'Any library location' },
          ...locations.map((row) => ({ id: row.sectionId, name: row.label })),
        ]}
        disabled={disabled}
        size="small"
      />
      {!selectedExists && (
        <Alert
          severity="warning"
          action={
            <Button onClick={() => onChange('')} disabled={disabled}>
              Clear selection
            </Button>
          }
        >
          The selected pickup location is no longer listed.
        </Alert>
      )}
    </Stack>
  );
}
