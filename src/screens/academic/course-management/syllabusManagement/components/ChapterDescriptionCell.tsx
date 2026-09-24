import { Box, Typography } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';

interface ChapterDescriptionCellProps {
  value: string;
  htmlContent: string;
}

export function ChapterDescriptionCell({ value, htmlContent }: ChapterDescriptionCellProps) {
  return (
    <CustomTooltip
      title={
        htmlContent && (
          <Box
            sx={{
              p: 1.5,
              maxWidth: { xs: 'calc(100vw - 48px)', sm: 420 },
              maxHeight: 'min(360px, 50vh)',
              overflow: 'auto',
              textAlign: 'left',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
              lineHeight: 1.45,
              '& p': { m: 0 },
              '& p + p': { mt: 1 },
            }}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        )
      }
      arrow
      placement="left-start"
      sx={{ '& .MuiTooltip-tooltip': { maxWidth: { xs: 'calc(100vw - 48px)', sm: 420 } } }}
    >
      <Typography
        variant="body2"
        noWrap
        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', maxWidth: 180 }}
      >
        {value || '-'}
      </Typography>
    </CustomTooltip>
  );
}
