import type { useSortable } from '@dnd-kit/sortable';
import type { AdmissionFormSection } from 'src/redux/student/admissions/admission-forms-api';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useRef, useEffect } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomTooltip from 'src/components/custom-tooltip';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

import { FormBuilderDeleteUnit } from './form-builder-delete-unit';
import { FormBuilderUnitSettings } from './form-builder-unit-settings';

type Props = {
  section: AdmissionFormSection;
  sectionIndex: number;
  selected: boolean;
  settingsOpen: boolean;
  expanded: boolean;
  contentId: string;
  onToggleExpanded: () => void;
  reorderEnabled: boolean;
  sortable: ReturnType<typeof useSortable>;
  onSelect: () => void;
  onToggleSettings: () => void;
  nameError?: string;
  onNameChange: (value: string) => void;
  onNameBlur: () => void;
  onDelete: () => void;
  readOnly?: boolean;
  deleteDisabled?: boolean;
};

export function FormBuilderSectionHeader({
  section,
  sectionIndex,
  selected,
  settingsOpen,
  expanded,
  contentId,
  onToggleExpanded,
  reorderEnabled,
  sortable,
  onSelect,
  onToggleSettings,
  nameError,
  onNameChange,
  onNameBlur,
  onDelete,
  readOnly = false,
  deleteDisabled = false,
}: Props) {
  const name = section.name || `Section ${sectionIndex + 1}`;
  const confirmDelete = useBoolean();
  const actionsRef = useRef<HTMLDivElement>(null);
  const wasEditing = useRef(settingsOpen);
  useEffect(() => {
    if (wasEditing.current && !settingsOpen) actionsRef.current?.querySelector('button')?.focus();
    wasEditing.current = settingsOpen;
  }, [settingsOpen]);
  const finishEditing = () => {
    onToggleSettings();
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
          id={`section-select-${section.id}`}
          onClick={onSelect}
          aria-label={readOnly ? `Review ${name} section` : `Add fields to ${name}`}
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
            {readOnly && (
              <Typography variant="caption" color="text.secondary">
                Questions From Inquiry
              </Typography>
            )}
          </Box>
        </ButtonBase>
      )}
      <CustomTooltip title={expanded ? 'Collapse section' : 'Expand section'}>
        <IconButton
          size="small"
          aria-label={`${expanded ? 'Collapse' : 'Expand'} ${name} section`}
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={onToggleExpanded}
          sx={{ width: 44, height: 44, flexShrink: 0 }}
        >
          <Iconify icon={expanded ? 'mdi:chevron-up' : 'mdi:chevron-down'} width={20} />
        </IconButton>
      </CustomTooltip>
      {readOnly ? null : settingsOpen ? (
        <CustomTooltip title="Finish editing heading">
          <IconButton
            size="small"
            aria-label="Finish editing section heading"
            aria-expanded={settingsOpen}
            aria-controls={settingsOpen ? `section-heading-${section.id}` : undefined}
            onClick={() => {
              if (settingsOpen) onNameBlur();
              else onSelect();
              if (!settingsOpen || section.name.trim()) onToggleSettings();
            }}
            sx={{ width: 44, height: 44, flexShrink: 0 }}
          >
            <Iconify icon="mdi:check" width={18} />
          </IconButton>
        </CustomTooltip>
      ) : (
        <Box ref={actionsRef}>
          <AdaptiveThreeDotsActions
            directActionLimit={2}
            collapseOnOverflow={false}
            moreLabel={`More actions for ${name} section`}
            sx={{ flexShrink: 0, gap: 0.5, '& .MuiIconButton-root': { width: 44, height: 44 } }}
            actions={[
              {
                id: 'edit',
                label: `Edit ${name} section`,
                icon: GlobalIcons.edit,
                onClick: () => {
                  onSelect();
                  onToggleSettings();
                },
              },
              {
                id: 'delete',
                label: `Delete ${name} section`,
                disabled: deleteDisabled,
                tooltip: deleteDisabled
                  ? 'This section contains required, locked Inquiry fields.'
                  : undefined,
                icon: GlobalIcons.delete,
                color: 'error.main',
                onClick: () => {
                  if (!deleteDisabled) confirmDelete.onTrue();
                },
              },
            ]}
          />
        </Box>
      )}
      <FormBuilderDeleteUnit
        name={name}
        unit="section"
        onDelete={() => {
          if (!deleteDisabled) onDelete();
        }}
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        hideTrigger
      />
    </Stack>
  );
}
