import React from 'react';
import { Grid, TextField } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { ReligionType, ReligionTypeArray } from 'src/enums/religion';
import { toNumericWithMax, toLettersTitleCase } from 'src/utils/input-format';
import { EmployeeCastType, EmployeeCastTypeArray } from 'src/enums/employee-cast';
import { MotherTongueType, MotherTongueTypeArray } from 'src/enums/mother-tongue';
import {
  SectionCard,
  CardActions,
} from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import RenderInquiryPrefrance from '../RenderInquiryPrefrance';

import type { SectionProps } from './section-types';

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
    <Grid size={{ xs: 12, md: 3 }}>
      <ShakingTextField
        error={(formik.touched as any).adharNo && Boolean((formik.errors as any).adharNo)}
      >
        <TextField
          key="adharNo"
          size="small"
          type="number"
          label="Aadhaar No. "
          name="adharNo"
          value={(formik.values as any).adharNo}
          onBlur={formik.handleBlur}
          error={(formik.touched as any).adharNo && Boolean((formik.errors as any).adharNo)}
          helperText={(formik.touched as any).adharNo && (formik.errors as any).adharNo}
          fullWidth
          onKeyDown={(e) => {
            if (['e', 'E', '+', '-', '.', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
              e.preventDefault();
            }
          }}
          onChange={(e) => {
            formik.setFieldValue('adharNo', toNumericWithMax(e.target.value, 12));
          }}
          inputProps={{
            maxLength: 12,
            pattern: '[0-9]*',
          }}
          onWheel={(e) => (e.target as HTMLElement).blur()}
          disabled={!isEdit.value}
        />
      </ShakingTextField>
    </Grid>

    <Grid size={{ xs: 12, md: 3 }}>
      <ShakingTextField
        error={(formik.touched as any).apparId && Boolean((formik.errors as any).apparId)}
      >
        <TextField
          key="apparId"
          size="small"
          type="number"
          label="Appar Id"
          name="apparId"
          value={(formik.values as any).apparId}
          onBlur={formik.handleBlur}
          error={(formik.touched as any).apparId && Boolean((formik.errors as any).apparId)}
          helperText={(formik.touched as any).apparId && (formik.errors as any).apparId}
          fullWidth
          onChange={(e) => {
            formik.setFieldValue('apparId', toNumericWithMax(e.target.value, 12));
          }}
          inputProps={{
            maxLength: 12,
            pattern: '[0-9]*',
          }}
          onKeyDown={(e) => {
            if (['e', 'E', '+', '-', '.', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
              e.preventDefault();
            }
          }}
          onWheel={(e) => (e.target as HTMLElement).blur()}
          disabled={!isEdit.value}
        />
      </ShakingTextField>
    </Grid>

    <Grid size={{ xs: 12, md: 3 }}>
      <ShakingTextField
        error={(formik.touched as any).panNo && Boolean((formik.errors as any).panNo)}
      >
        <TextField
          key="panNo"
          size="small"
          label="PAN No."
          name="panNo"
          value={String((formik.values as any).panNo ?? '').toUpperCase()}
          onBlur={formik.handleBlur}
          error={(formik.touched as any).panNo && Boolean((formik.errors as any).panNo)}
          helperText={(formik.touched as any).panNo && (formik.errors as any).panNo}
          fullWidth
          disabled={!isEdit.value}
          inputProps={{
            maxLength: 10,
            inputMode: 'text',
            pattern: '[A-Za-z0-9]{10}',
          }}
          onChange={(e) => {
            const value = e.target.value.toUpperCase();
            const regex = /^[A-Za-z0-9]{0,10}$/;
            if (regex.test(value)) {
              formik.setFieldValue('panNo', value);
            }
          }}
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
          type="number"
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
            pattern: '[0-9]*',
          }}
          disabled={!isEdit.value}
          onKeyDown={(e) => {
            if (['e', 'E', '+', '-', '.', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
              e.preventDefault();
            }
          }}
          onWheel={(e) => (e.target as HTMLElement).blur()}
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
          options={ReligionTypeArray.map((_, index) => ({
            value: index,
            label: (ReligionType as any)[index],
          }))}
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
            formik.setFieldTouched('familyCast', true, true);
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
          value={(formik.values as any).castCategory}
          onChange={(val) => {
            formik.setFieldValue('castCategory', val);
          }}
          size="small"
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
          options={MotherTongueTypeArray.map((_, index) => ({
            value: index,
            label: (MotherTongueType as any)[index],
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
