import type { FormikProps, FormikErrors } from 'formik';

import { useState } from 'react';
import { Box, Switch, TextField } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IBookCopy, IBookPayload } from '../Components/type';

interface BookCopiesStepProps {
  formik: FormikProps<IBookPayload>;
}

const BookCopiesStep = ({ formik }: BookCopiesStepProps) => {
  const [copies, setCopies] = useState<IBookCopy[]>(formik.values.copies || []);

  return (
    <>
      {copies.length > 0 && (
        <Box mt={2}>
          <CustomizableTable
            tableId="copies-table"
            isSearch={false}
            isFilter={false}
            columns={[
              {
                id: 'copyNo',
                label: 'Copy No.',
                align: 'left',
                minWidth: 100,
                render: (_, row) => <span>{row.copyNo}</span>,
              },
              {
                id: 'accessionNo',
                label: 'Accession No.',
                minWidth: 170,
                align: 'left',
                render: (value, row) => (
                  <Box mb={1}>
                    <ShakingTextField
                      error={
                        !!(
                          formik?.touched?.copies?.[row.copyNo - 1]?.accessionNo &&
                          Array.isArray(formik?.errors?.copies) &&
                          typeof formik?.errors?.copies?.[row.copyNo - 1] === 'object' &&
                          (formik.errors.copies[row.copyNo - 1] as FormikErrors<IBookCopy>)
                            ?.accessionNo
                        )
                      }
                    >
                      <TextField
                        size="small"
                        fullWidth
                        label="Accession No *"
                        value={formik.values.copies[row.copyNo - 1]?.accessionNo || ''}
                        onChange={(e) => {
                          const val = e.target.value
                            .replace(/[^a-zA-Z0-9-]/g, '')
                            .split(' ')
                            .map((word) => word || '')
                            .join(' ');

                          if (val.length <= 11) {
                            formik.setFieldValue(`copies.${row.copyNo - 1}.accessionNo`, val);
                            const updated = [...copies];
                            updated[row.copyNo - 1].accessionNo = val;
                            setCopies(updated);
                            formik.setFieldTouched(`copies.${row.copyNo - 1}.accessionNo`, false);
                          }
                        }}
                        error={
                          !!(
                            formik?.touched?.copies?.[row.copyNo - 1]?.accessionNo &&
                            Array.isArray(formik?.errors?.copies) &&
                            typeof formik?.errors?.copies?.[row.copyNo - 1] === 'object' &&
                            (formik.errors.copies[row.copyNo - 1] as FormikErrors<IBookCopy>)
                              ?.accessionNo
                          )
                        }
                        helperText={
                          (formik?.touched?.copies?.[row.copyNo - 1]?.accessionNo &&
                            Array.isArray(formik?.errors?.copies) &&
                            typeof formik?.errors?.copies?.[row.copyNo - 1] === 'object' &&
                            (formik.errors.copies[row.copyNo - 1] as FormikErrors<IBookCopy>)
                              ?.accessionNo) ||
                          ''
                        }
                      />
                    </ShakingTextField>
                  </Box>
                ),
              },
              {
                id: 'rfidEnabled',
                label: 'RFID Enabled',
                minWidth: 130,
                align: 'left',
                render: (_, row) => (
                  <Box mb={1}>
                    <ShakingTextField
                      error={
                        !!(
                          formik?.touched?.copies?.[row.copyNo - 1]?.rfidEnabled &&
                          Array.isArray(formik?.errors?.copies) &&
                          typeof formik?.errors?.copies?.[row.copyNo - 1] === 'object' &&
                          (formik.errors.copies[row.copyNo - 1] as FormikErrors<IBookCopy>)
                            ?.rfidEnabled
                        )
                      }
                    >
                      <Switch
                        size="small"
                        checked={formik.values.copies[row.copyNo - 1]?.rfidEnabled || false}
                        onChange={(e) => {
                          const updated = [...copies];
                          updated[row.copyNo - 1].rfidEnabled = e.target.checked;
                          setCopies(updated);
                          formik.setFieldValue('copies', updated);
                          formik.setFieldTouched(`copies.${row.copyNo - 1}.rfidEnabled`, true);
                        }}
                      />
                    </ShakingTextField>
                  </Box>
                ),
              },
              {
                id: 'rfidId',
                label: 'RFID',

                align: 'left',
                render: (_, row) => (
                  <Box mb={1}>
                    <ShakingTextField
                      error={
                        !!(
                          formik?.touched?.copies?.[row.copyNo - 1]?.rfidId &&
                          Array.isArray(formik?.errors?.copies) &&
                          typeof formik?.errors?.copies?.[row.copyNo - 1] === 'object' &&
                          (formik.errors.copies[row.copyNo - 1] as FormikErrors<IBookCopy>)?.rfidId
                        )
                      }
                    >
                      <TextField
                        size="small"
                        fullWidth
                        label="RFID *"
                        value={formik.values.copies[row.copyNo - 1]?.rfidId || ''}
                        disabled={!formik.values.copies[row.copyNo - 1]?.rfidEnabled}
                        onChange={(e) => {
                          const val = e.target.value
                            .replace(/[^a-zA-Z0-9\s]/g, '')
                            .split(' ')
                            .map((word) => word || '')
                            .join(' ');

                          const updated = [...copies];
                          updated[row.copyNo - 1].rfidId = val;
                          setCopies(updated);
                          formik.setFieldValue('copies', updated);
                          formik.setFieldTouched(`copies.${row.copyNo - 1}.rfidId`, false);
                        }}
                        error={
                          !!(
                            formik?.touched?.copies?.[row.copyNo - 1]?.rfidId &&
                            Array.isArray(formik?.errors?.copies) &&
                            typeof formik?.errors?.copies?.[row.copyNo - 1] === 'object' &&
                            (formik.errors.copies[row.copyNo - 1] as FormikErrors<IBookCopy>)
                              ?.rfidId
                          )
                        }
                        helperText={
                          (formik?.touched?.copies?.[row.copyNo - 1]?.rfidId &&
                            Array.isArray(formik?.errors?.copies) &&
                            typeof formik?.errors?.copies?.[row.copyNo - 1] === 'object' &&
                            (formik.errors.copies[row.copyNo - 1] as FormikErrors<IBookCopy>)
                              ?.rfidId) ||
                          ''
                        }
                      />
                    </ShakingTextField>
                  </Box>
                ),
              },
              {
                id: 'vendor',
                label: 'Vendor',
                align: 'left',
                render: (_, row) => (
                  <Box mb={1}>
                    <ShakingTextField
                      error={
                        !!(
                          formik?.touched?.copies?.[row.copyNo - 1]?.vendor &&
                          Array.isArray(formik?.errors?.copies) &&
                          typeof formik?.errors?.copies?.[row.copyNo - 1] === 'object' &&
                          (formik.errors.copies[row.copyNo - 1] as FormikErrors<IBookCopy>)?.vendor
                        )
                      }
                    >
                      <CustomSelect
                        label="Vendor"
                        options={[
                          { value: 'amazon', label: 'Amazon' },
                          { value: 'flipkart', label: 'Flipkart' },
                          { value: 'local_store', label: 'Local Bookstore' },
                          { value: 'publisher_direct', label: 'Direct from Publisher' },
                          { value: 'other', label: 'Other' },
                        ]}
                        name="vendor"
                        value={formik.values.copies[row.copyNo - 1]?.vendor || ''}
                        onChange={(val) => {
                          const updated = [...copies];
                          updated[row.copyNo - 1].vendor = val as string;
                          setCopies(updated);
                          formik.setFieldValue('copies', updated);
                          formik.setFieldTouched(`copies.${row.copyNo - 1}.vendor`, true);
                        }}
                        helperText={
                          (formik?.touched?.copies?.[row.copyNo - 1]?.vendor &&
                            Array.isArray(formik?.errors?.copies) &&
                            typeof formik?.errors?.copies?.[row.copyNo - 1] === 'object' &&
                            (formik.errors.copies[row.copyNo - 1] as FormikErrors<IBookCopy>)
                              ?.vendor) ||
                          ''
                        }
                        error={
                          !!(
                            formik?.touched?.copies?.[row.copyNo - 1]?.vendor &&
                            Array.isArray(formik?.errors?.copies) &&
                            typeof formik?.errors?.copies?.[row.copyNo - 1] === 'object' &&
                            (formik.errors.copies[row.copyNo - 1] as FormikErrors<IBookCopy>)
                              ?.vendor
                          )
                        }
                        formControlProps={{ sx: { minWidth: 275 } }}
                      />
                    </ShakingTextField>
                  </Box>
                ),
              },
            ]}
            data={copies}
          />
        </Box>
      )}
    </>
  );
};

export default BookCopiesStep;
