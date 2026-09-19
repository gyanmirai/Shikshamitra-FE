import { Button } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';

type AdditionalFieldsActionButtonProps = {
  configuredCount: number;
  onClick: () => void;
};

export function AdditionalFieldsActionButton({
  configuredCount,
  onClick,
}: AdditionalFieldsActionButtonProps) {
  const hasConfiguredFields = configuredCount > 0;

  return (
    <Button
      variant={hasConfiguredFields ? 'outlined' : 'contained'}
      size="small"
      onClick={onClick}
      startIcon={
        <Iconify
          icon={hasConfiguredFields ? GlobalIcons.edit : 'solar:add-circle-linear'}
          width={16}
        />
      }
      sx={{ minHeight: 44, width: { xs: '100%', sm: 'auto' }, flexShrink: 0 }}
    >
      {hasConfiguredFields ? 'Edit Additional Fields' : 'Add Additional Fields'}
    </Button>
  );
}
