import type { AdmissionFormSystemFieldMetadata } from 'src/redux/student/admissions/admission-forms-api';

import { useId, useState } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import { Iconify } from 'src/components/iconify';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Scrollbar } from 'src/components/scrollbar';
import InputAdornment from '@mui/material/InputAdornment';

import { fieldTypeIcon } from '../form-dialog-model';
import { PaletteFieldButton } from './palette-field-button';
import { groupStudentFields } from '../student-field-groups';
import { getAddressGroupChoice } from '../address-field-group';
import { addressOrderMessage } from '../form-address-dependencies';
import { getAcademicGroupChoice } from '../academic-class-selector';
import { matchesStudentField, studentFieldDestination } from '../student-field-configuration';

type Props = {
  fields: AdmissionFormSystemFieldMetadata[];
  usedBindings?: readonly string[];
  loading?: boolean;
  error?: boolean;
  onAdd: (field: AdmissionFormSystemFieldMetadata) => void;
  onAddSection?: (name: string, fields: AdmissionFormSystemFieldMetadata[]) => void;
  onAddClassSelector?: () => void;
};

const usesAdmissionContext = (field: AdmissionFormSystemFieldMetadata) =>
  Boolean(getAcademicGroupChoice(field.key));

export function StudentFieldPalette({
  fields,
  usedBindings = [],
  loading = false,
  error = false,
  onAdd,
  onAddSection,
  onAddClassSelector,
}: Props) {
  const paletteId = useId();
  const [search, setSearch] = useState('');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const normalizedSearch = search.trim().toLowerCase();
  const groupedFields = groupStudentFields(fields);
  if (onAddClassSelector && !groupedFields.some((group) => group.name === 'Admission preferences'))
    groupedFields.push({ name: 'Admission preferences', fields: [] });
  const visibleGroups = groupedFields
    .map((group) => ({
      ...group,
      allFields: group.fields,
      fields: group.fields.filter((field) =>
        matchesStudentField(field, normalizedSearch, group.name)
      ),
    }))
    .filter(
      (group) =>
        group.fields.length > 0 ||
        (group.name === 'Admission preferences' &&
          onAddClassSelector &&
          (!normalizedSearch ||
            'class selector board medium admission preferences'.includes(normalizedSearch)))
    );
  const used = new Set(usedBindings.map((key) => key.toLowerCase()));
  return (
    <>
      <TextField
        fullWidth
        size="small"
        label="Search Student Fields"
        value={search}
        disabled={loading || error}
        onChange={(event) => setSearch(event.target.value)}
        sx={{
          '&& .MuiInputBase-root': { minHeight: 36 },
          '& .MuiInputBase-input': { py: 0.75 },
        }}
        slotProps={{
          inputLabel: {
            shrink: Boolean(search),
            sx: { '&&.Mui-focused': { color: 'text.secondary' } },
          },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <Iconify icon="mdi:magnify" width={18} />
              </InputAdornment>
            ),
          },
        }}
      />
      {(loading || error) && (
        <Typography variant="caption" color="text.secondary" role="status">
          {loading ? 'Loading Student Fields…' : 'Student Fields Unavailable'}
        </Typography>
      )}
      <Scrollbar
        fillContent
        aria-label="Student Field Categories"
        sx={{
          flex: 1,
          minHeight: 0,
          '& .simplebar-content-wrapper': { overflowX: 'hidden !important' },
          '& .simplebar-track.simplebar-horizontal': { display: 'none' },
        }}
      >
        <Stack spacing={0.75} sx={{ pr: 1, pb: 1 }}>
          {loading &&
            Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} variant="rounded" height={48} />
            ))}
          {!loading &&
            !error &&
            visibleGroups.map((group, index) => {
              const expanded = Boolean(normalizedSearch) || expandedGroup === group.name;
              const availableFields = group.allFields.filter(
                (field) => !used.has(field.key.toLowerCase()) && !usesAdmissionContext(field)
              );
              const showsAddressFields = group.fields.some((field) =>
                getAddressGroupChoice(field.key)
              );
              const groupId = `${paletteId}-group-${index}`;
              return (
                <Stack
                  key={group.name}
                  sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}
                >
                  <Stack direction="row" alignItems="center" sx={{ px: 0.5 }}>
                    <ButtonBase
                      aria-expanded={expanded}
                      aria-controls={groupId}
                      onClick={() =>
                        setExpandedGroup(expandedGroup === group.name ? null : group.name)
                      }
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        minHeight: 44,
                        pl: 1,
                        pr: 0.25,
                        borderRadius: 1,
                        textAlign: 'left',
                        justifyContent: 'space-between',
                        '&:hover': { bgcolor: 'action.hover' },
                        '&:focus-visible': { outline: 2, outlineColor: 'primary.main' },
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        component="h3"
                        sx={{ overflowWrap: 'anywhere', mr: 1 }}
                      >
                        {group.name} (
                        {group.fields.length +
                          (group.name === 'Admission preferences' && onAddClassSelector ? 1 : 0)}
                        )
                      </Typography>
                      <Iconify
                        icon={expanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}
                        width={18}
                        sx={{ flexShrink: 0 }}
                      />
                    </ButtonBase>
                    {onAddSection && (
                      <IconButton
                        aria-label={`Add ${group.name} Section`}
                        disabled={!availableFields.length}
                        onClick={() => {
                          onAddSection(
                            group.name,
                            group.allFields.filter((field) => !usesAdmissionContext(field))
                          );
                          setExpandedGroup(null);
                          setSearch('');
                        }}
                        sx={{ width: 44, height: 44, flexShrink: 0 }}
                      >
                        <Iconify icon="mdi:plus" width={20} />
                      </IconButton>
                    )}
                  </Stack>
                  <Collapse in={expanded} unmountOnExit>
                    <Stack
                      id={groupId}
                      spacing={0.75}
                      sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}
                    >
                      {group.name === 'Admission preferences' && onAddClassSelector && (
                        <PaletteFieldButton
                          label="Class Selector"
                          icon="mdi:school-outline"
                          description="Linked Board, Medium and Class from Institute Setup"
                          onClick={onAddClassSelector}
                        />
                      )}
                      {showsAddressFields && (
                        <Typography variant="caption" color="text.secondary">
                          {addressOrderMessage}
                        </Typography>
                      )}
                      {group.fields.map((field) => (
                        <PaletteFieldButton
                          key={field.key}
                          label={field.displayName}
                          icon={fieldTypeIcon(field.fieldType)}
                          description={
                            getAcademicGroupChoice(field.key)
                              ? 'Adds linked Board, Medium and Class fields from Institute Setup'
                              : getAddressGroupChoice(field.key)
                                ? 'Adds linked Country, State and City fields'
                                : `${studentFieldDestination(field)}${field.description ? ` · ${field.description}` : ''}`
                          }
                          disabled={
                            used.has(field.key.toLowerCase()) &&
                            !getAddressGroupChoice(field.key) &&
                            !getAcademicGroupChoice(field.key)
                          }
                          onClick={() => onAdd(field)}
                        />
                      ))}
                    </Stack>
                  </Collapse>
                </Stack>
              );
            })}
          {!loading && !error && !visibleGroups.length && (
            <Stack spacing={1} alignItems="center" sx={{ py: 3, textAlign: 'center' }}>
              <Iconify icon="mdi:magnify-close" width={28} sx={{ color: 'text.secondary' }} />
              <Typography variant="subtitle2">
                {fields.length ? 'No Matching Fields' : 'No Student Fields Available'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {fields.length
                  ? 'Try a Different Name or Add a Custom Field.'
                  : 'Add a Custom Field to Continue Building This Form.'}
              </Typography>
              {search && (
                <Button size="small" sx={{ minHeight: 44 }} onClick={() => setSearch('')}>
                  Clear Search
                </Button>
              )}
            </Stack>
          )}
        </Stack>
      </Scrollbar>
    </>
  );
}
