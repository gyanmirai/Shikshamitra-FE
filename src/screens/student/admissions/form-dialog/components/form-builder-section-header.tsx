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
import { usePopover, CustomPopover } from 'src/components/custom-popover';

import { FormBuilderDeleteUnit } from './form-builder-delete-unit';
import { FormBuilderUnitSettings } from './form-builder-unit-settings';

const sectionActionButtonSx = {
  p: 0,
  width: { xs: 44, sm: 30 },
  height: { xs: 44, sm: 30 },
};

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
  const actions = usePopover();
  const actionsId = `${contentId}-actions`;
  const actionsRef = useRef<HTMLButtonElement>(null);
  const managingSection = settingsOpen || confirmDelete.value;
  const wasManagingSection = useRef(managingSection);
  useEffect(() => {
    if (wasManagingSection.current && !managingSection) actionsRef.current?.focus();
    wasManagingSection.current = managingSection;
  }, [managingSection]);
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
        <CustomTooltip title="Drag to Reorder. With a Keyboard, Press Space, Then Arrow Keys.">
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
          aria-label={readOnly ? `Review ${name} Section` : `Add Fields To ${name}`}
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
      <CustomTooltip title={expanded ? 'Collapse Section' : 'Expand Section'}>
        <IconButton
          size="small"
          aria-label={`${expanded ? 'Collapse' : 'Expand'} ${name} Section`}
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={onToggleExpanded}
          sx={{ width: 44, height: 44, flexShrink: 0 }}
        >
          <Iconify icon={expanded ? 'mdi:chevron-up' : 'mdi:chevron-down'} width={20} />
        </IconButton>
      </CustomTooltip>
      {readOnly ? null : settingsOpen ? (
        <CustomTooltip title="Finish Editing Heading">
          <IconButton
            size="small"
            aria-label="Finish Editing Section Heading"
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
        <CustomTooltip title="More Actions">
          <IconButton
            ref={actionsRef}
            size="small"
            aria-label={`More Actions For ${name} Section`}
            aria-haspopup="dialog"
            aria-expanded={actions.open}
            aria-controls={actions.open ? actionsId : undefined}
            onClick={actions.onOpen}
            sx={{ width: 44, height: 44, flexShrink: 0 }}
          >
            <Iconify icon="eva:more-vertical-fill" width={18} />
          </IconButton>
        </CustomTooltip>
      )}
      <CustomPopover
        open={actions.open && !readOnly && !settingsOpen}
        onClose={actions.onClose}
        anchorEl={actions.anchorEl}
        slotProps={{
          arrow: { placement: 'top-right' },
          paper: { id: actionsId, role: 'dialog', 'aria-label': `Actions for ${name} section` },
        }}
      >
        <Stack direction="row" spacing={0.5} sx={{ p: 0.5 }}>
          <CustomTooltip title="Edit">
            <IconButton
              autoFocus
              size="small"
              aria-label={`Edit ${name} Section`}
              sx={sectionActionButtonSx}
              onClick={() => {
                actions.onClose();
                onSelect();
                onToggleSettings();
              }}
            >
              <Iconify icon={GlobalIcons.edit} width={16} />
            </IconButton>
          </CustomTooltip>
          <CustomTooltip
            title={deleteDisabled ? 'This Section Contains Protected Core Fields.' : 'Delete'}
          >
            <span>
              <IconButton
                size="small"
                aria-label={`Delete ${name} Section`}
                color="error"
                disabled={deleteDisabled}
                sx={sectionActionButtonSx}
                onClick={() => {
                  actions.onClose();
                  confirmDelete.onTrue();
                }}
              >
                <Iconify icon={GlobalIcons.delete} width={16} />
              </IconButton>
            </span>
          </CustomTooltip>
        </Stack>
      </CustomPopover>
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
