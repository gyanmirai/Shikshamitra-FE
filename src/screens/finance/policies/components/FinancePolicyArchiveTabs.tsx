import { Label } from 'src/components/label';
import { Stack, Button } from '@mui/material';

type ArchiveView = 'current' | 'archived';

type FinancePolicyArchiveTabsProps = {
  value: ArchiveView;
  onChange: (value: ArchiveView) => void;
  archivedCount?: number;
  ariaLabel: string;
};

export function FinancePolicyArchiveTabs({
  value,
  onChange,
  archivedCount,
  ariaLabel,
}: FinancePolicyArchiveTabsProps) {
  return (
    <Stack direction="row" spacing={1} role="group" aria-label={ariaLabel}>
      <Button
        size="small"
        variant={value === 'current' ? 'contained' : 'outlined'}
        onClick={() => onChange('current')}
      >
        Current
      </Button>
      <Button
        size="small"
        variant={value === 'archived' ? 'contained' : 'outlined'}
        onClick={() => onChange('archived')}
        endIcon={
          <Label color="default" variant="soft">
            {archivedCount ?? 0}
          </Label>
        }
      >
        Archived
      </Button>
    </Stack>
  );
}
