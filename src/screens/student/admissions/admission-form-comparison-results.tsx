import type {
  AdmissionFormFieldChange,
  AdmissionFormVersionComparison,
} from 'src/redux/student/admissions/admission-forms-api';

import { Label } from 'src/components/label';
import { Box, List, Paper, Stack, ListItem, Typography } from '@mui/material';

const changeTypes = {
  added: { label: 'Added', color: 'success' },
  removed: { label: 'Removed', color: 'error' },
  changed: { label: 'Changed', color: 'info' },
} as const;

function readLegacyFieldChange(message: string, changeIndex: number): AdmissionFormFieldChange[] {
  const match = /^Field (added|removed|changed): ([\s\S]+)\)$/.exec(message);
  if (!match) return [];

  const [, kind, details] = match;
  // The section is the final parenthesized suffix. Either name may contain parentheses.
  let depth = 1;
  let sectionStart = details.length;
  while (sectionStart > 0 && depth > 0) {
    sectionStart -= 1;
    if (details[sectionStart] === ')') depth += 1;
    if (details[sectionStart] === '(') depth -= 1;
  }
  if (depth !== 0 || details[sectionStart - 1] !== ' ') return [];

  const fieldName = details.slice(0, sectionStart).trim();
  const sectionName = details.slice(sectionStart + 1).trim();
  if (!fieldName || !sectionName) return [];
  return [
    {
      changeIndex,
      sectionCode: sectionName,
      sectionName,
      fieldName,
      kind: kind as AdmissionFormFieldChange['kind'],
    },
  ];
}

export function AdmissionFormComparisonResults({
  comparison,
}: {
  comparison: AdmissionFormVersionComparison;
}) {
  const { changes } = comparison;
  if (!changes.length)
    return (
      <Typography role="status" variant="body2" color="text.secondary" sx={{ py: 0.5 }}>
        No structural changes between these versions.
      </Typography>
    );

  const fieldChanges = comparison.fieldChanges ?? changes.flatMap(readLegacyFieldChange);
  const sections = new Map<string, AdmissionFormFieldChange[]>();
  const fieldIndexes = new Set<number>();
  const counts = { added: 0, removed: 0, changed: 0 };
  fieldChanges.forEach((field) => {
    const section = sections.get(field.sectionCode) ?? [];
    section.push(field);
    sections.set(field.sectionCode, section);
    fieldIndexes.add(field.changeIndex);
    counts[field.kind] += 1;
  });

  const summary = Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([kind, count]) => `${count} ${count === 1 ? 'field' : 'fields'} ${kind}`)
    .join(' · ');
  const otherChanges = changes
    .map((message, index) => ({ message, index }))
    .filter(({ index }) => !fieldIndexes.has(index));

  return (
    <Stack spacing={1.25} sx={{ overflowWrap: 'anywhere' }}>
      <Box role="status">
        <Typography component="h3" variant="subtitle1">
          {summary || 'Changes'}
        </Typography>
      </Box>
      {Array.from(sections, ([code, fields]) => (
        <Paper
          key={code}
          component="section"
          variant="outlined"
          aria-label={fields[0].sectionName}
          sx={{ borderRadius: 1, overflow: 'hidden' }}
        >
          <Typography
            component="h4"
            variant="subtitle2"
            sx={{ px: 1.5, py: 1, bgcolor: 'background.neutral' }}
          >
            {fields[0].sectionName}
          </Typography>
          <List dense disablePadding>
            {fields.map(({ changeIndex, fieldName, kind }) => (
              <ListItem
                key={changeIndex}
                sx={{ px: 1.5, py: 0.5, gap: 1, borderTop: 1, borderColor: 'divider' }}
              >
                <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }}>
                  {fieldName}
                </Typography>
                <Label color={changeTypes[kind].color} sx={{ flexShrink: 0 }}>
                  {changeTypes[kind].label}
                </Label>
              </ListItem>
            ))}
          </List>
        </Paper>
      ))}
      {otherChanges.length > 0 && (
        <Paper variant="outlined" sx={{ borderRadius: 1 }}>
          {sections.size > 0 && (
            <Typography component="h4" variant="subtitle2" sx={{ px: 1.5, pt: 1 }}>
              Other changes
            </Typography>
          )}
          <List dense disablePadding aria-label="Other version changes">
            {otherChanges.map(({ message, index }) => (
              <ListItem
                key={index}
                sx={{ px: 1.5, py: 1, '& + &': { borderTop: 1, borderColor: 'divider' } }}
              >
                <Typography variant="body2">{message}</Typography>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Stack>
  );
}
