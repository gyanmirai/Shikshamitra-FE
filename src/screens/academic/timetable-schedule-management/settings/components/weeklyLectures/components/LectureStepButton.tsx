import { Tooltip, IconButton, Typography } from '@mui/material';

interface LectureStepButtonProps {
  direction: 'increase' | 'decrease';
  disabled: boolean;
  hasError: boolean;
  onClick: () => void;
  subjectName?: string;
}

export function LectureStepButton({
  direction,
  subjectName,
  disabled,
  hasError,
  onClick,
}: LectureStepButtonProps) {
  const isIncrease = direction === 'increase';
  const label = `${isIncrease ? 'Increase' : 'Decrease'} lecture count${subjectName ? ` for ${subjectName}` : ''}`;

  return (
    <Tooltip title={label} arrow>
      <span>
        <IconButton
          size="small"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          sx={{
            width: 28,
            height: 28,
            border: '1px solid',
            borderColor: hasError ? 'error.main' : 'divider',
            borderRadius: 1,
            flexShrink: 0,
            transition: 'background-color 150ms ease',
            '&:hover:not(:disabled)': { bgcolor: 'action.hover' },
          }}
        >
          <Typography component="span" sx={{ fontSize: 16, lineHeight: 1, userSelect: 'none' }}>
            {isIncrease ? '+' : '−'}
          </Typography>
        </IconButton>
      </span>
    </Tooltip>
  );
}
