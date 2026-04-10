import React from 'react';
import { ReligionTypeArray } from 'src/enums/religion';
import CustomSelect from 'src/components/custom-select';
import { MotherTongueTypeArray } from 'src/enums/mother-tongue';
import ShakingTextField from 'src/components/shaking-text-field';
import { toNumericWithMax, toLettersTitleCase } from 'src/utils/input-format';
import { Box, Grid, TextField, FormLabel, FormHelperText } from '@mui/material';
import { EmployeeCastType, EmployeeCastTypeArray } from 'src/enums/employee-cast';
import { OTPInput, REGEXP_ONLY_DIGITS, REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp';
import {
  SectionCard,
  CardActions,
} from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import RenderInquiryPrefrance from '../RenderInquiryPrefrance';

import type { SectionProps } from './section-types';

// ── Slot: single character box ────────────────────────────────────────────────
const Slot: React.FC<{
  char: string | null;
  isActive: boolean;
  hasFakeCaret: boolean;
  error?: boolean;
  disabled?: boolean;
}> = ({ char, isActive, hasFakeCaret, error = false, disabled = false }) => (
  <Box
    sx={{
      width: 25,
      height: 30,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.875rem',
      fontWeight: 400,
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      border: '1px solid',
      borderColor: isActive
        ? error
          ? 'error.main'
          : 'primary.main'
        : error
          ? 'error.main'
          : 'grey.400',
      borderRadius: '8px',
      bgcolor: disabled ? 'action.disabledBackground' : 'background.paper',
      color: disabled ? 'text.disabled' : 'text.primary',
      boxShadow: isActive ? (error ? '0 0 0 2px #d32f2f33' : '0 0 0 2px #1976d233') : 'none',
      transition: 'border-color 0.15s, box-shadow 0.15s',
      position: 'relative',
      userSelect: 'none',
    }}
  >
    {char}
    {hasFakeCaret && (
      <Box
        sx={{
          position: 'absolute',
          width: '1px',
          height: '55%',
          bgcolor: 'text.primary',
          animation: 'blink 1s step-end infinite',
          '@keyframes blink': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0 } },
        }}
      />
    )}
  </Box>
);

// ── Separator ─────────────────────────────────────────────────────────────────
const Sep = () => (
  <Box sx={{ width: 8, height: 1, bgcolor: 'text.disabled', flexShrink: 0, alignSelf: 'center' }} />
);

// ── OtpInputField: label + boxes + helper text ────────────────────────────────
const OtpInputField: React.FC<{
  label: string;
  value: string;
  maxLength: number;
  pattern?: string;
  groupBy?: number; // insert separator every N chars (e.g. 4 for Aadhaar)
  onChange: (val: string) => void;
  onBlur?: () => void;
  error?: boolean;
  helperText?: React.ReactNode;
  disabled?: boolean;
  pasteTransformer?: (pasted: string) => string;
}> = ({
  label,
  value,
  maxLength,
  pattern,
  groupBy,
  onChange,
  onBlur,
  error = false,
  helperText,
  disabled = false,
  pasteTransformer,
}) => (
  <Box sx={{ position: 'relative' }}>
    <FormLabel
      error={error}
      sx={{
        fontSize: '0.75rem',
        display: 'block',
        mb: 0.5,
        color: error ? 'error.main' : 'text.secondary',
      }}
    >
      {label}
    </FormLabel>
    <OTPInput
      maxLength={maxLength}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      pattern={pattern}
      disabled={disabled}
      pasteTransformer={pasteTransformer}
      containerClassName=""
      render={({ slots }) => (
        <Box display="flex" gap={0.75} alignItems="center" flexWrap="nowrap">
          {slots.map((slot, i) => (
            <React.Fragment key={i}>
              <Slot {...slot} error={error} disabled={disabled} />
              {groupBy && i < maxLength - 1 && (i + 1) % groupBy === 0 && <Sep />}
            </React.Fragment>
          ))}
        </Box>
      )}
    />
    {helperText && (
      <FormHelperText error={error} sx={{ mx: '14px', mt: '3px' }}>
        {helperText}
      </FormHelperText>
    )}
  </Box>
);
// ─────────────────────────────────────────────────────────────────────────────

const IdentificationSection: React.FC<SectionProps> = ({
  formik,
  isMainForm,
  isEdit,
  onSave,
  onCancel,
}) => (
  <SectionCard
    title="Identification & Personal Details"
    headerContent={
      !isMainForm && (
        <CardActions
          isLoading={formik.isSubmitting}
          isEdit={isEdit}
          onSave={onSave}
          onCancel={onCancel}
        />
      )
    }
  >
    <Grid size={{ xs: 12, md: 6.5 }}>
      <ShakingTextField
        error={(formik.touched as any).adharNo && Boolean((formik.errors as any).adharNo)}
      >
        <OtpInputField
          label="Aadhaar No."
          maxLength={12}
          pattern={REGEXP_ONLY_DIGITS}
          groupBy={4}
          value={String((formik.values as any).adharNo || '')}
          onChange={(val) => {
            formik.setFieldValue('adharNo', val);
          }}
          onBlur={() => formik.setFieldTouched('adharNo', true, true)}
          error={(formik.touched as any).adharNo && Boolean((formik.errors as any).adharNo)}
          helperText={(formik.touched as any).adharNo && (formik.errors as any).adharNo}
          disabled={!isEdit.value}
          pasteTransformer={(s) => s.replace(/\D/g, '').slice(0, 12)}
        />
      </ShakingTextField>
    </Grid>

    <Grid size={{ xs: 12, md: 5.5 }}>
      <ShakingTextField
        error={(formik.touched as any).panNo && Boolean((formik.errors as any).panNo)}
      >
        <OtpInputField
          label="PAN No."
          maxLength={10}
          pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
          groupBy={5}
          value={String((formik.values as any).panNo ?? '').toUpperCase()}
          onChange={(val) => {
            formik.setFieldValue('panNo', val.toUpperCase(), true);
            formik.setFieldTouched('panNo', true, false);
          }}
          onBlur={() => formik.setFieldTouched('panNo', true, true)}
          error={(formik.touched as any).panNo && Boolean((formik.errors as any).panNo)}
          helperText={(formik.touched as any).panNo && (formik.errors as any).panNo}
          disabled={!isEdit.value}
          pasteTransformer={(s) =>
            s
              .replace(/[^A-Za-z0-9]/g, '')
              .toUpperCase()
              .slice(0, 10)
          }
        />
      </ShakingTextField>
    </Grid>

    <Grid size={{ xs: 12 }}>
      <ShakingTextField
        error={(formik.touched as any).apparId && Boolean((formik.errors as any).apparId)}
      >
        <OtpInputField
          label="Appar Id"
          maxLength={12}
          groupBy={4}
          pattern={REGEXP_ONLY_DIGITS}
          value={String((formik.values as any).apparId || '')}
          onChange={(val) => {
            formik.setFieldValue('apparId', val);
            formik.setFieldTouched('apparId', true, false);
          }}
          onBlur={() => formik.setFieldTouched('apparId', true, false)}
          error={(formik.touched as any).apparId && Boolean((formik.errors as any).apparId)}
          helperText={(formik.touched as any).apparId && (formik.errors as any).apparId}
          disabled={!isEdit.value}
          pasteTransformer={(s) => s.replace(/\D/g, '').slice(0, 12)}
        />
      </ShakingTextField>
    </Grid>

    <Grid size={{ xs: 12, md: 3 }}>
      <ShakingTextField
        error={(formik.touched as any).pennNo && Boolean((formik.errors as any).pennNo)}
      >
        <TextField
          key="pennNo"
          size="small"
          label="PENN No."
          name="pennNo"
          value={(formik.values as any).pennNo}
          onBlur={formik.handleBlur}
          error={(formik.touched as any).pennNo && Boolean((formik.errors as any).pennNo)}
          helperText={(formik.touched as any).pennNo && (formik.errors as any).pennNo}
          fullWidth
          onChange={(e) => {
            formik.setFieldValue('pennNo', toNumericWithMax(e.target.value, 11));
          }}
          inputProps={{
            maxLength: 11,
          }}
          disabled={!isEdit.value}
        />
      </ShakingTextField>
    </Grid>

    <Grid size={{ xs: 12, md: 3 }}>
      <ShakingTextField
        error={
          (formik.touched as any).inquiryPreference &&
          Boolean((formik.errors as any).inquiryPreference)
        }
      >
        <RenderInquiryPrefrance formik={formik} disabled={!isEdit.value} />
      </ShakingTextField>
    </Grid>

    <Grid size={{ xs: 12, md: 3 }}>
      <ShakingTextField
        error={(formik.touched as any).religion && Boolean((formik.errors as any).religion)}
      >
        <CustomSelect
          labelId="religion-label"
          value={(formik.values as any).religion}
          onChange={(value) => {
            formik.setFieldValue('religion', value);
          }}
          size="small"
          onBlur={formik.handleBlur}
          label="Religion "
          name="religion"
          options={ReligionTypeArray}
          valueKey="value"
          labelKey="label"
          error={(formik.touched as any)?.religion && (formik.errors as any)?.religion}
          helperText={(formik.touched as any)?.religion && (formik.errors as any)?.religion}
        />
      </ShakingTextField>
    </Grid>

    <Grid size={{ xs: 12, md: 3 }}>
      <ShakingTextField
        error={(formik.touched as any).familyCast && Boolean((formik.errors as any).familyCast)}
      >
        <TextField
          key="familyCast *"
          size="small"
          label="Family Caste *"
          name="familyCast"
          value={(formik.values as any).familyCast}
          onBlur={formik.handleBlur}
          error={(formik.touched as any).familyCast && Boolean((formik.errors as any).familyCast)}
          helperText={(formik.touched as any).familyCast && (formik.errors as any).familyCast}
          fullWidth
          onChange={(e) => {
            formik.setFieldValue('familyCast', toLettersTitleCase(e.target.value));
            formik.setFieldTouched('familyCast', true, false);
          }}
          disabled={!isEdit.value}
        />
      </ShakingTextField>
    </Grid>

    <Grid size={{ xs: 12, md: 3 }}>
      <ShakingTextField
        error={(formik.touched as any).castCategory && Boolean((formik.errors as any).castCategory)}
      >
        <CustomSelect
          labelId="castCategory-label"
          value={(formik.values as any).castCategory ?? ''}
          onChange={(val) => {
            formik.setFieldValue('castCategory', val);
          }}
          size="small"
          inputProps={{ shrink: true }}
          onBlur={formik.handleBlur}
          label="Caste Category *"
          name="castCategory"
          error={
            (formik.touched as any).castCategory && Boolean((formik.errors as any).castCategory)
          }
          helperText={(formik.touched as any).castCategory && (formik.errors as any).castCategory}
          disabled={!isEdit.value}
          options={EmployeeCastTypeArray.map((_, index) => ({
            value: index,
            label: (EmployeeCastType as any)[index],
          }))}
        />
      </ShakingTextField>
    </Grid>

    <Grid size={{ xs: 12, md: 3 }}>
      <ShakingTextField
        error={(formik.touched as any).nationality && Boolean((formik.errors as any).nationality)}
      >
        <TextField
          key="nationality"
          size="small"
          label="Nationality"
          name="nationality"
          value={(formik.values as any).nationality}
          onBlur={formik.handleBlur}
          error={(formik.touched as any).nationality && Boolean((formik.errors as any).nationality)}
          helperText={(formik.touched as any).nationality && (formik.errors as any).nationality}
          fullWidth
          onChange={(e) => {
            formik.setFieldValue('nationality', toLettersTitleCase(e.target.value));
            formik.setFieldTouched('nationality', true);
          }}
          disabled={!isEdit.value}
        />
      </ShakingTextField>
    </Grid>

    <Grid size={{ xs: 12, md: 3 }}>
      <ShakingTextField
        error={(formik.touched as any).birthPlace && Boolean((formik.errors as any).birthPlace)}
      >
        <TextField
          key="birthPlace"
          size="small"
          label="Birth Place"
          name="birthPlace"
          value={(formik.values as any).birthPlace}
          onBlur={formik.handleBlur}
          error={(formik.touched as any).birthPlace && Boolean((formik.errors as any).birthPlace)}
          helperText={(formik.touched as any).birthPlace && (formik.errors as any).birthPlace}
          fullWidth
          onChange={(e) => {
            formik.setFieldValue('birthPlace', toLettersTitleCase(e.target.value));
            formik.setFieldTouched('birthPlace', true, true);
          }}
          disabled={!isEdit.value}
        />
      </ShakingTextField>
    </Grid>

    <Grid size={{ xs: 12, md: 3 }}>
      <ShakingTextField
        error={(formik.touched as any).motherTongue && Boolean((formik.errors as any).motherTongue)}
      >
        <CustomSelect
          labelId="mother-tongue-label"
          name="motherTongue"
          value={(formik.values as any).motherTongue}
          label="Mother Tongue"
          onChange={(value) => {
            formik.setFieldValue('motherTongue', value);
          }}
          onBlur={formik.handleBlur}
          options={MotherTongueTypeArray.map((tongue) => ({
            value: tongue,
            label: tongue,
          }))}
          valueKey="value"
          labelKey="label"
          error={(formik.touched as any)?.motherTongue && (formik.errors as any)?.motherTongue}
          helperText={(formik.touched as any)?.motherTongue && (formik.errors as any)?.motherTongue}
        />
      </ShakingTextField>
    </Grid>
  </SectionCard>
);

export default IdentificationSection;
