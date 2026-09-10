import { Box, IconButton } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';

type Props = {
  title: string;
  archived: boolean;
  disabled: boolean;
  onClick: () => void;
};

export function GradeScaleArchiveAction({ title, archived, disabled, onClick }: Props) {
  return (
    <CustomTooltip title={title} arrow placement="top">
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
        <IconButton
          size="small"
          color={archived ? 'success' : 'warning'}
          disabled={disabled}
          aria-label={title}
          onClick={(event) => {
            event.stopPropagation();
            onClick();
          }}
          sx={{ width: 30, height: 30, p: 0 }}
        >
          <Iconify
            icon={archived ? 'solar:restart-bold' : 'solar:archive-bold'}
            width={16}
            height={16}
          />
        </IconButton>
      </Box>
    </CustomTooltip>
  );
}
