import type { useSortable } from '@dnd-kit/sortable';
import type { AdmissionFormSection } from 'src/redux/student/admissions/admission-forms-api';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Iconify } from 'src/components/iconify';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CustomTooltip from 'src/components/custom-tooltip';

import { FormBuilderDeleteUnit } from './form-builder-delete-unit';

type Props = {
  section: AdmissionFormSection;
  sectionIndex: number;
  selected: boolean;
  canDelete: boolean;
  settingsOpen: boolean;
  reorderEnabled: boolean;
  sortable: ReturnType<typeof useSortable>;
  onSelect: () => void;
  onToggleSettings: () => void;
  onDelete: () => void;
};

export function FormBuilderSectionHeader({
  section,
  sectionIndex,
  selected,
  canDelete,
  settingsOpen,
  reorderEnabled,
  sortable,
  onSelect,
  onToggleSettings,
  onDelete,
}: Props) {
  const name = section.name || `Section ${sectionIndex + 1}`;
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.5}
      sx={{
        px: 0.5,
        py: 0.5,
        bgcolor: selected ? 'action.selected' : 'background.neutral',
        borderRadius: 'inherit',
      }}
    >
      {reorderEnabled && (
        <CustomTooltip title="Drag to reorder. With a keyboard, press Space, then arrow keys.">
          <IconButton
            ref={sortable.setActivatorNodeRef}
            {...sortable.attributes}
            {...sortable.listeners}
            aria-label={`Reorder ${name}`}
            sx={{ width: 44, height: 44, flexShrink: 0, cursor: 'grab', touchAction: 'none' }}
          >
            <Iconify icon="mdi:drag-vertical" width={20} />
          </IconButton>
        </CustomTooltip>
      )}
      <ButtonBase
        onClick={onSelect}
        aria-label={`Add fields to ${name}`}
        aria-pressed={selected}
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 44,
          textAlign: 'left',
          justifyContent: 'flex-start',
          borderRadius: 1,
          '&:focus-visible': { outline: 2, outlineColor: 'text.primary' },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
            {name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {section.fields.length} {section.fields.length === 1 ? 'field' : 'fields'}
            {selected ? ' · Adding fields here' : ' · Select to add fields'}
            {section.visibilityRuleJson ? ' · Conditional' : ''}
          </Typography>
        </Box>
      </ButtonBase>
      <CustomTooltip title={settingsOpen ? 'Close section settings' : 'Edit section'}>
        <IconButton
          aria-label={`Edit ${name} section`}
          aria-expanded={settingsOpen}
          aria-controls={`section-settings-${section.id}`}
          onClick={onToggleSettings}
          sx={{ width: 44, height: 44, flexShrink: 0 }}
        >
          <Iconify icon={settingsOpen ? 'mdi:chevron-up' : 'mdi:pencil-outline'} width={18} />
        </IconButton>
      </CustomTooltip>
      <FormBuilderDeleteUnit name={name} unit="section" canDelete={canDelete} onDelete={onDelete} />
    </Stack>
  );
}
