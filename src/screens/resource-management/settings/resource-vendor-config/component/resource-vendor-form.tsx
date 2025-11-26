'use client';

import React from 'react';
import { useFormik } from 'formik';
import { Scrollbar } from 'src/components/scrollbar';
import SubmitButton from 'src/components/submit-button';
import CancelButton from 'src/components/cancel-button';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Grid, TextField, DialogActions } from '@mui/material';
import CityComponent from 'src/components/stardard-address/city-component';
import StateComponent from 'src/components/stardard-address/state-component';
import CountryComponent from 'src/components/stardard-address/country-component';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { getResourceVendorInitialValues } from '../initialValue';
import { resourceVendorValidationSchema } from '../validationSchema';

import type { IResourceVendorFormProps } from '../resource-vendor-config-interface';

const ResourceVendorForm: React.FC<IResourceVendorFormProps> = ({ isEdit, data, onClose }) => {
  const formik = useFormik({
    initialValues: getResourceVendorInitialValues(data),
    validationSchema: resourceVendorValidationSchema,
    onSubmit: (values) => {},
  });

  const isDisabled = data !== null && isEdit === false;
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={2}>
              {[
                {
                  name: 'vendorName',
                  label: 'Vendor Name *',
                },
                {
                  name: 'vendorComponyName',
                  label: 'Company Name *',
                },
                {
                  name: 'vendorContactNumber',
                  label: 'Primary Contact Number *',
                },
                {
                  name: 'vendorSecondaryContactNumber',
                  label: 'Secondary Contact Number',
                },

                {
                  name: 'vendorComponyEmail',
                  label: 'Company Email *',
                },

                {
                  name: 'vendorComponyZipCode',
                  label: 'Company Zip Code *',
                },
                {
                  name: 'vendorComponyAddress',
                  label: 'Company Address *',
                },
                {
                  name: 'vendorGstNumber',
                  label: 'GST Number *',
                },
                {
                  name: 'vendorPanNumber',
                  label: 'PAN Number *',
                },
                {
                  name: 'vendorBankName',
                  label: 'Bank Name *',
                },
                {
                  name: 'vendorBankAccountNumber',
                  label: 'Bank Account Number *',
                },
                {
                  name: 'vendorBankIfscCode',
                  label: 'Bank IFSC Code *',
                },
                {
                  name: 'vendorBankBranchName',
                  label: 'Bank Branch Name *',
                },
                {
                  name: 'vendorBankAccountType',
                  label: 'Bank Account Type *',
                },
                {
                  name: 'vendorUpiId',
                  label: 'UPI ID',
                },
                {
                  name: 'vendorComponyDescription',
                  label: 'Company Description',
                },
                {
                  name: 'vendorTagForQuickSearch',
                  label: 'Quick Search Tag',
                },
                {
                  name: 'vendorComponyCountry',
                  label: 'Company Country *',
                  render: (
                    <Grid size={{ xs: 12, md: 6 }} key="vendorComponyCountry">
                      <ShakingTextField
                        error={
                          !!(
                            formik.touched.vendorComponyCountry &&
                            formik.errors?.vendorComponyCountry
                          )
                        }
                      >
                        <CountryComponent
                          value={formik.values.vendorComponyCountry}
                          onChange={(_e, value) => {
                            formik.setFieldValue('vendorComponyState', null);
                            formik.setFieldValue('vendorComponyCity', null);
                            formik.setFieldValue('vendorComponyCountry', value);
                          }}
                          error={
                            formik.touched.vendorComponyCountry &&
                            Boolean(formik.errors?.vendorComponyCountry)
                          }
                          helperText={String(
                            (formik.touched.vendorComponyCountry &&
                              formik.errors?.vendorComponyCountry) ||
                              ''
                          )}
                        />
                      </ShakingTextField>
                    </Grid>
                  ),
                },
                {
                  name: 'vendorComponyState',
                  label: 'Company State *',
                  render: (
                    <Grid size={{ xs: 12, md: 6 }} key="vendorComponyState">
                      <ShakingTextField
                        error={
                          !!(formik.touched.vendorComponyState && formik.errors?.vendorComponyState)
                        }
                      >
                        <StateComponent
                          value={formik.values.vendorComponyState}
                          onChange={(_e, value) => {
                            formik.setFieldValue('vendorComponyCity', null);
                            formik.setFieldValue('vendorComponyState', value);
                          }}
                          countryValue={formik.values.vendorComponyCountry}
                          error={
                            formik.touched.vendorComponyState &&
                            Boolean(formik.errors?.vendorComponyState)
                          }
                          helperText={String(
                            (formik.touched.vendorComponyState &&
                              formik.errors?.vendorComponyState) ||
                              ''
                          )}
                        />
                      </ShakingTextField>
                    </Grid>
                  ),
                },
                {
                  name: 'vendorComponyCity',
                  label: 'Company City *',
                  render: (
                    <Grid size={{ xs: 12, md: 6 }} key="vendorComponyCity">
                      <ShakingTextField
                        error={
                          !!(formik.touched.vendorComponyCity && formik.errors?.vendorComponyCity)
                        }
                      >
                        <CityComponent
                          value={formik.values.vendorComponyCity}
                          onChange={(_e, value) => formik.setFieldValue('vendorComponyCity', value)}
                          stateValue={formik.values.vendorComponyState}
                          error={
                            formik.touched.vendorComponyCity &&
                            Boolean(formik.errors?.vendorComponyCity)
                          }
                          helperText={String(
                            (formik.touched.vendorComponyCity &&
                              formik.errors?.vendorComponyCity) ||
                              ''
                          )}
                        />
                      </ShakingTextField>
                    </Grid>
                  ),
                },
              ].map((field) =>
                field.render ? (
                  field.render // use custom render if defined
                ) : (
                  <Grid size={{ xs: 12, md: 6 }} pb="10px" key={field.name}>
                    <ShakingTextField
                      error={Boolean(
                        formik.touched[field.name as keyof typeof formik.touched] &&
                          formik.errors[field.name as keyof typeof formik.errors]
                      )}
                    >
                      <TextField
                        disabled={isDisabled}
                        name={field.name}
                        label={field.label}
                        value={formik.values[field.name as keyof typeof formik.values]}
                        onChange={formik.handleChange}
                        size="small"
                        fullWidth
                        error={Boolean(
                          formik.touched[field.name as keyof typeof formik.touched] &&
                            formik.errors[field.name as keyof typeof formik.errors]
                        )}
                        helperText={String(
                          (formik.touched[field.name as keyof typeof formik.touched] &&
                            formik.errors[field.name as keyof typeof formik.errors]) ||
                            ''
                        )}
                      />
                    </ShakingTextField>
                  </Grid>
                )
              )}
            </Grid>
          </Scrollbar>

          <DialogActions>
            <CancelButton
              onClick={() => {
                onClose();
              }}
            />
            <SubmitButton onClick={() => {}} />
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default ResourceVendorForm;
