import { Box } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import type { RollNumberConfiguration } from '../onboarding-settings-model';

export const rollGroupingOptions = [
  { value: 'mixed', label: 'Mixed' },
  { value: 'boys-first', label: 'Boys First' },
  { value: 'girls-first', label: 'Girls First' },
];
export const rollSortOptions = [
  { value: 'studentName', label: 'Student Name' },
  { value: 'grNumber', label: 'GR Number' },
  { value: 'admissionDate', label: 'Admission Date' },
  { value: 'admissionNumber', label: 'Admission Number' },
];

export default function RollOrderingFields({
  value,
  errors,
  touched,
  onChange,
  onBlur,
}: {
  value: RollNumberConfiguration;
  errors: Record<string, string | undefined>;
  touched: Record<string, boolean | undefined>;
  onChange: (values: Partial<RollNumberConfiguration>) => void;
  onBlur: (field: string) => void;
}) {
  const field = value.orderingRules?.[0]?.field ?? value.arrangeBy;
  const direction = value.orderingRules?.[0]?.direction ?? value.arrangeType;
  const controls = [
    {
      name: 'grouping',
      label: 'Grouping',
      selected: value.grouping ?? 'mixed',
      options: rollGroupingOptions,
    },
    { name: 'arrangeBy', label: 'Sort By', selected: field, options: rollSortOptions },
    ...(field === 'studentName'
      ? [
          {
            name: 'nameFormat',
            label: 'Name Format',
            selected: value.nameFormat ?? 'first-name-first',
            options: [
              { value: 'first-name-first', label: 'First Name First' },
              { value: 'surname-first', label: 'Surname First' },
            ],
          },
        ]
      : []),
    {
      name: 'arrangeType',
      label: 'Sort Direction',
      selected: direction,
      options: [
        {
          value: 'ascending',
          label:
            field === 'studentName'
              ? 'A–Z'
              : field === 'admissionDate'
                ? 'Oldest First'
                : 'Ascending',
        },
        {
          value: 'descending',
          label:
            field === 'studentName'
              ? 'Z–A'
              : field === 'admissionDate'
                ? 'Newest First'
                : 'Descending',
        },
      ],
    },
  ];
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
        gap: 1,
      }}
    >
      {controls.map((control) => (
        <ShakingTextField
          key={control.name}
          error={Boolean(touched[control.name] && errors[control.name])}
        >
          <CustomSelect
            label={control.label}
            required
            fullWidth
            size="small"
            value={control.selected}
            options={control.options}
            error={Boolean(touched[control.name] && errors[control.name])}
            helperText={touched[control.name] ? errors[control.name] : undefined}
            onBlur={() => onBlur(control.name)}
            onChange={(selected) => {
              if (control.name === 'arrangeBy' || control.name === 'arrangeType') {
                const arrangeBy =
                  control.name === 'arrangeBy'
                    ? (selected as RollNumberConfiguration['arrangeBy'])
                    : field;
                const arrangeType =
                  control.name === 'arrangeType'
                    ? (selected as RollNumberConfiguration['arrangeType'])
                    : direction;
                onChange({
                  arrangeBy,
                  arrangeType,
                  orderingRules: [{ field: arrangeBy, direction: arrangeType }],
                });
              } else onChange({ [control.name]: selected });
            }}
          />
        </ShakingTextField>
      ))}
    </Box>
  );
}
