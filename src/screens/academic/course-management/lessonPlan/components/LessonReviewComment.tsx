import { Iconify } from 'src/components/iconify';
import { Alert, Typography } from '@mui/material';

type Props = {
  remarks: string;
  inline?: boolean;
  severity?: 'warning' | 'error';
};

export function LessonReviewComment({ remarks, inline = false, severity = 'warning' }: Props) {
  return (
    <Alert
      severity={severity}
      icon={inline ? <Iconify icon="mdi:alert-circle" width={15} /> : false}
      sx={{
        minWidth: 0,
        py: inline ? 0.25 : 1.5,
        px: inline ? 1 : 1.5,
        borderRadius: inline ? 1 : 1.5,
        alignItems: 'center',
        '& .MuiAlert-message': { minWidth: 0, py: 0, overflowWrap: 'anywhere' },
      }}
    >
      {inline ? (
        <Typography component="span" color="inherit" sx={{ fontSize: 11.5 }}>
          <strong>HOD requested:</strong> {remarks}
        </Typography>
      ) : (
        <>
          <Typography variant="caption" color="inherit">
            Admin Comment
          </Typography>
          <Typography
            variant="body2"
            fontWeight={600}
            color="inherit"
            sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}
          >
            {remarks}
          </Typography>
        </>
      )}
    </Alert>
  );
}
