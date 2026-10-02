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

type Props = {
  fields: AdmissionFormSystemFieldMetadata[];
  usedBindings?: readonly string[];
  loading?: boolean;
  error?: boolean;
  onAdd: (field: AdmissionFormSystemFieldMetadata) => void;
  onAddSection?: (name: string, fields: AdmissionFormSystemFieldMetadata[]) => void;
};

export function StudentFieldPalette({
  fields,
  usedBindings = [],
  loading = false,
  error = false,
  onAdd,
  onAddSection,
}: Props) {
  const paletteId = useId();
  const [search, setSearch] = useState('');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const normalizedSearch = search.trim().toLowerCase();
  const groupedFields = groupStudentFields(fields);
  const visibleGroups = groupedFields
    .map((group) => ({
      ...group,
      allFields: group.fields,
      fields: group.fields.filter((field) =>
        `${field.displayName} ${field.key} ${group.name}`.toLowerCase().includes(normalizedSearch)
      ),
    }))
    .filter((group) => group.fields.length > 0);
  const used = new Set(usedBindings.map((key) => key.toLowerCase()));
  const availableCount = fields.filter((field) => !used.has(field.key.toLowerCase())).length;
  const visibleCount = visibleGroups.reduce((count, group) => count + group.fields.length, 0);
  return (
    <>
      <TextField
        fullWidth
        size="small"
        label="Search student fields"
        value={search}
        disabled={loading || error}
        onChange={(event) => setSearch(event.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="mdi:magnify" />
            </InputAdornment>
          ),
        }}
      />
      <Typography variant="caption" color="text.secondary">
        {loading
          ? 'Loading student fields…'
          : error
            ? 'Student fields unavailable'
            : normalizedSearch
              ? `${visibleCount} matching fields`
              : `${availableCount} available of ${fields.length} student fields`}
      </Typography>
      <Scrollbar
        fillContent
        aria-label="Student field categories"
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
                (field) => !used.has(field.key.toLowerCase())
              );
              const groupId = `${paletteId}-group-${index}`;
              return (
                <Stack
                  key={group.name}
                  sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}
                >
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ px: 0.5 }}>
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
                        px: 1,
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
                        sx={{ overflowWrap: 'anywhere' }}
                      >
                        {group.name} ({group.fields.length})
                      </Typography>
                      <Iconify icon={expanded ? 'mdi:chevron-up' : 'mdi:chevron-down'} width={18} />
                    </ButtonBase>
                    {onAddSection && (
                      <IconButton
                        aria-label={`Add ${group.name} section`}
                        disabled={!availableFields.length}
                        onClick={() => {
                          onAddSection(group.name, group.allFields);
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
                      {group.fields.map((field) => (
                        <PaletteFieldButton
                          key={field.key}
                          label={field.displayName}
                          icon={fieldTypeIcon(field.fieldType)}
                          description={field.description}
                          disabled={used.has(field.key.toLowerCase())}
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
                {fields.length ? 'No matching fields' : 'No student fields available'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {fields.length
                  ? 'Try a different name or add a custom field.'
                  : 'Add a custom field to continue building this form.'}
              </Typography>
              {search && (
                <Button size="small" sx={{ minHeight: 44 }} onClick={() => setSearch('')}>
                  Clear search
                </Button>
              )}
            </Stack>
          )}
        </Stack>
      </Scrollbar>
    </>
  );
}
