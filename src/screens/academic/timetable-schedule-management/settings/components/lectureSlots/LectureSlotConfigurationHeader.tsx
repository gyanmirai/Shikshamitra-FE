import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Chip, Stack, IconButton } from '@mui/material';
import { FormSectionHeader } from 'src/components/form-section-card';

type Props = {
  id: string;
  'aria-controls': string;
  title: string;
  activeDaysLabel: string;
  slotCount: number;
  lectureCount: number;
  breakCount: number;
  expanded: boolean;
  onToggle: () => void;
};

export function LectureSlotConfigurationHeader({
  id,
  title,
  activeDaysLabel,
  slotCount,
  lectureCount,
  breakCount,
  expanded,
  onToggle,
  'aria-controls': contentId,
}: Props) {
  return (
    <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
      <FormSectionHeader
        icon={GlobalIcons.clock}
        title={title}
        titleTypographyProps={{ id }}
        descriptionTooltip="Saved active weekdays and the ordered lecture and break slots for this configuration."
        action={
          <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
            <Chip
              label={`${slotCount} ${slotCount === 1 ? 'slot' : 'slots'}`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`${lectureCount} ${lectureCount === 1 ? 'lecture' : 'lectures'}`}
              size="small"
              variant="soft"
              color="success"
            />
            {breakCount > 0 && (
              <Chip
                label={`${breakCount} ${breakCount === 1 ? 'break' : 'breaks'}`}
                size="small"
                variant="soft"
                color="warning"
              />
            )}
            <IconButton
              type="button"
              size="small"
              aria-label={`${expanded ? 'Collapse' : 'Expand'} ${title}`}
              aria-expanded={expanded}
              aria-controls={contentId}
              onClick={onToggle}
              sx={{ minWidth: 44, minHeight: 44 }}
            >
              <Iconify icon={expanded ? 'mingcute:up-line' : 'mingcute:down-line'} />
            </IconButton>
          </Stack>
        }
      />
      {activeDaysLabel && (
        <Chip
          icon={<Iconify icon={GlobalIcons.calendar} width={16} />}
          label={activeDaysLabel}
          size="small"
          variant="outlined"
          sx={{ mt: 1 }}
        />
      )}
    </Box>
  );
}
