import type { useSortable } from '@dnd-kit/sortable';
import type { AdmissionFormSection } from 'src/redux/student/admissions/admission-forms-api';

import { useRef } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Iconify } from 'src/components/iconify';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CustomTooltip from 'src/components/custom-tooltip';

import { FormBuilderDeleteUnit } from './form-builder-delete-unit';
import { FormBuilderUnitSettings } from './form-builder-unit-settings';

type Props = {
  section: AdmissionFormSection;
  sectionIndex: number;
  selected: boolean;
  settingsOpen: boolean;
  reorderEnabled: boolean;
  sortable: ReturnType<typeof useSortable>;
  onSelect: () => void;
  onToggleSettings: () => void;
  nameError?: string;
  onNameChange: (value: string) => void;
  onNameBlur: () => void;
  onDelete: () => void;
};

export function FormBuilderSectionHeader({
  section,
  sectionIndex,
  selected,
  settingsOpen,
  reorderEnabled,
  sortable,
  onSelect,
  onToggleSettings,
  nameError,
  onNameChange,
  onNameBlur,
  onDelete,
}: Props) {
  const name = section.name || `Section ${sectionIndex + 1}`;
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const finishEditing = () => {
    onToggleSettings();
    editButtonRef.current?.focus();
  };
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.5}
      sx={{
        px: 1.5,
        py: 1,
        bgcolor: 'background.paper',
        borderRadius: 'inherit',
      }}
    >
      {reorderEnabled && (
        <CustomTooltip title="Drag to reorder. With a keyboard, press Space, then arrow keys.">
          <IconButton
            size="small"
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
      {settingsOpen ? (
        <FormBuilderUnitSettings
          id={`section-heading-${section.id}`}
          unit="Section"
          name={section.name}
          nameError={nameError}
          onNameChange={onNameChange}
          onNameBlur={onNameBlur}
          onDone={finishEditing}
        />
      ) : (
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
            <Typography component="h3" variant="h6" sx={{ overflowWrap: 'anywhere' }}>
              {name}
            </Typography>
            {selected && (
              <Typography variant="caption" color="text.secondary">
                Adding fields here
              </Typography>
            )}
          </Box>
        </ButtonBase>
      )}
      <CustomTooltip title={settingsOpen ? 'Finish editing heading' : 'Edit section heading'}>
        <IconButton
          size="small"
          ref={editButtonRef}
          aria-label={`Edit ${name} section`}
          aria-expanded={settingsOpen}
          aria-controls={settingsOpen ? `section-heading-${section.id}` : undefined}
          onClick={() => {
            if (settingsOpen) onNameBlur();
            else onSelect();
            if (!settingsOpen || section.name.trim()) onToggleSettings();
          }}
          sx={{ width: 44, height: 44, flexShrink: 0 }}
        >
          <Iconify icon={settingsOpen ? 'mdi:check' : 'mdi:pencil-outline'} width={18} />
        </IconButton>
      </CustomTooltip>
      <FormBuilderDeleteUnit name={name} unit="section" onDelete={onDelete} />
    </Stack>
  );
}
