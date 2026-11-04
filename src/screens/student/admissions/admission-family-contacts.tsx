import type { FormikErrors, FormikTouched } from 'formik';
import type { AdmissionParentRelationship } from 'src/redux/student/admissions/admission-parent-family-types';

import { normalizeEmail } from 'src/utils/input-format';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { Stack, Checkbox, TextField, FormControlLabel } from '@mui/material';

import {
  buildAdmissionFamilyContacts,
  initialAdmissionFamilyContacts,
  type AdmissionFamilyContactsFormValues,
} from './admission-family-contacts-model';

type Props = {
  parentRelationship?: '' | AdmissionParentRelationship;
  value?: AdmissionFamilyContactsFormValues;
  errors?: FormikErrors<AdmissionFamilyContactsFormValues>;
  touched?: FormikTouched<AdmissionFamilyContactsFormValues>;
  submitted: boolean;
  disabled: boolean;
  onChange: (value: AdmissionFamilyContactsFormValues) => void;
  onBlur: (field: keyof AdmissionFamilyContactsFormValues) => void;
};

export function AdmissionFamilyContacts({
  parentRelationship,
  value = initialAdmissionFamilyContacts,
  errors,
  touched,
  submitted,
  disabled,
  onChange,
  onBlur,
}: Props) {
  const parentLabel = parentRelationship === 'father' ? 'Father' : 'Mother';
  const otherLabel = parentRelationship === 'father' ? 'Mother' : 'Father';
  const mainContact = parentRelationship
    ? buildAdmissionFamilyContacts(value, parentRelationship).mainContactRelationship
    : '';
  const change = (field: keyof AdmissionFamilyContactsFormValues, next: string | boolean) => {
    const draft = { ...value, [field]: next };
    if (
      parentRelationship &&
      draft.mainContactRelationship &&
      buildAdmissionFamilyContacts(draft, parentRelationship).mainContactRelationship !==
        draft.mainContactRelationship
    ) {
      draft.mainContactRelationship = '';
    }
    onChange(draft);
  };
  const field = (
    name: keyof AdmissionFamilyContactsFormValues,
    label: string,
    required = false
  ) => {
    const error = (submitted || touched?.[name]) && errors?.[name];
    const email = name.endsWith('Email');
    const mobile = name.endsWith('Mobile');
    return (
      <ShakingTextField error={Boolean(error)}>
        <TextField
          fullWidth
          size="small"
          name={`familyContacts.${name}`}
          label={label}
          required={required}
          disabled={disabled}
          value={value[name]}
          type={email ? 'email' : 'text'}
          inputProps={
            mobile
              ? { inputMode: 'numeric', maxLength: 10 }
              : { maxLength: name === 'guardianRelationship' ? 128 : 256 }
          }
          error={Boolean(error)}
          helperText={error || undefined}
          onBlur={() => onBlur(name)}
          onChange={(event) =>
            change(name, email ? normalizeEmail(event.target.value) : event.target.value)
          }
        />
      </ShakingTextField>
    );
  };
  return (
    <FormSectionCard
      title="Family Contacts"
      icon="mdi:account-group-outline"
      descriptionTooltip="One Parent Is Enough. Add Another Parent or Guardian Only When Needed. The Main School Contact Is Separate From App Access."
    >
      <FormControlLabel
        label="Add Other Parent"
        control={
          <Checkbox
            size="small"
            checked={value.addOtherParent}
            disabled={disabled || !parentRelationship}
            onChange={(_, checked) => change('addOtherParent', checked)}
          />
        }
      />
      {value.addOtherParent && (
        <Stack spacing={2}>
          {field('otherParentFullName', `${otherLabel} Full Name`, true)}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {field('otherParentMobile', `${otherLabel} Mobile`)}
            {field('otherParentEmail', `${otherLabel} Email`)}
          </Stack>
        </Stack>
      )}
      <FormControlLabel
        label="Add Other Guardian"
        control={
          <Checkbox
            size="small"
            checked={value.addGuardian}
            disabled={disabled || !parentRelationship}
            onChange={(_, checked) => change('addGuardian', checked)}
          />
        }
      />
      {value.addGuardian && (
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {field('guardianFullName', 'Guardian Full Name', true)}
            {field('guardianRelationship', 'Guardian Relationship', true)}
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {field('guardianMobile', 'Guardian Mobile')}
            {field('guardianEmail', 'Guardian Email')}
          </Stack>
        </Stack>
      )}
      <CustomSelect
        fullWidth
        size="small"
        label="Main School Contact"
        name="familyContacts.mainContactRelationship"
        value={mainContact}
        disabled={disabled || !parentRelationship}
        helperText={
          !parentRelationship ? 'Select Father or Mother in Parent Details first.' : undefined
        }
        onChange={(next) => change('mainContactRelationship', String(next))}
        options={
          parentRelationship
            ? [
                { value: parentRelationship, label: parentLabel },
                ...(value.addOtherParent
                  ? [
                      {
                        value: parentRelationship === 'father' ? 'mother' : 'father',
                        label: otherLabel,
                      },
                    ]
                  : []),
                ...(value.addGuardian
                  ? [
                      {
                        value: 'guardian',
                        label: value.guardianRelationship.trim()
                          ? `Guardian (${value.guardianRelationship.trim()})`
                          : 'Guardian',
                      },
                    ]
                  : []),
              ]
            : []
        }
      />
    </FormSectionCard>
  );
}
