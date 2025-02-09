import type { Board } from 'src/types/school';
import type { SxProps, GridProps } from '@mui/material';

import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useMemo, useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Stack,
  Select,
  Divider,
  Checkbox,
  MenuItem,
  Collapse,
  Skeleton,
  TextField,
  Typography,
  InputLabel,
  IconButton,
  FormControl,
  Autocomplete,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import calculateAge from 'src/utils/calculate-age';
import { convertBase64Format } from 'src/utils/base64Formate';

import { YesNoArray } from 'src/enums/yes-no';
import { DocumentType } from 'src/enums/documnet-type';
import { useGetYearQuery } from 'src/redux/year/yearApi';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import { GenderType, GenderTypeArray } from 'src/enums/gender';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Category, CategoryArray } from 'src/enums/studnet-category';
import { useGetClassByOrganizationIdQuery } from 'src/redux/class/classApi';
import { EmployeeCastType, EmployeeCastTypeArray } from 'src/enums/employee-cast';
import { useGetStudentDocumentTypeQuery } from 'src/redux/student/document-type/document-type-api';
import {
  useUploadDocumentsMutation,
  useGetStudentDocumentsQuery,
  useGetStudentDocumentByIdQuery,
  useStudentUpdateDocumentMutation,
} from 'src/redux/student/registration/registration-api';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import PhoneInput from 'src/components/phone-input';
import { Subheader } from 'src/components/nav-section';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import UploadButton from 'src/components/upload-button';
import StandardAddress from 'src/components/stardard-address';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IInquiryData } from '../Inquiry';

export interface FieldsType {
  type: string;
  label: string;
  name: string;
  placeholder?: string;
  sx?: SxProps;
  otherProps?: Record<string, any>;
  renderComp?: (props: any) => React.ReactNode;
  gridProps?: GridProps;
}
export const RenderDocuments = (props: any) => {
  const { id } = props;
  const viewDialog = useBoolean();
  const [docId, setDocId] = useState<null | string>(null);

  const [uploadDocument] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUploadDocumentsMutation,
  });

  const [updateDocument] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useStudentUpdateDocumentMutation,
  });

  const { data: documents, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentDocumentTypeQuery,
  });

  const { data: employeeDocuments, isLoading: isEmployeeDocLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentDocumentsQuery,
    params: id,
  });

  const tableData = useMemo(
    () =>
      documents?.items?.map((item: any) => ({
        ...item,
        statusVal: employeeDocuments?.find((doc: any) => doc.fileName === item.documentName)
          ? 'Uploaded'
          : 'Not Uploaded',
        docType: item.documentTypes.map((ite: number) => DocumentType[ite]).join(', '),
        statusColor: employeeDocuments?.find((doc: any) => doc.fileName === item.documentName)
          ? 'success'
          : 'warning',
        uploadDocument: employeeDocuments?.find((doc: any) => doc.fileName === item.documentName),
      })) || [],
    [documents?.items, employeeDocuments]
  );
  return (
    <>
      <CustomizableTable
        isLoading={isLoading || isEmployeeDocLoading}
        tableId="documents"
        columns={[
          { id: 'documentName', label: 'Name' },
          {
            id: 'docType',
            label: 'Document Type',
            isSort: false,
          },
          {
            id: 'statusVal',
            label: 'Status',
            render(value, row) {
              return (
                <Label color={row.uploadDocument ? 'success' : 'warning'}>
                  {row.uploadDocument ? 'Uploaded' : 'Pending'}
                </Label>
              );
            },
          },
          {
            id: 'upload',
            label: 'Upload',
            render(value, row) {
              return (
                <UploadButton
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    const myNewFile = new File([file], row.documentName, { type: file.type });
                    const formData = new FormData();
                    formData.append(row.uploadDocument ? 'file' : 'files', myNewFile);

                    toast.promise(
                      row.uploadDocument
                        ? updateDocument({
                            documentId: row.uploadDocument.id,
                            id,
                            body: formData,
                          })
                        : uploadDocument({ id, body: formData }),
                      {
                        loading: `Uploading Document ${row.documentName} `,
                        success: () => `Upload Successfully!`,
                        error: 'Error',
                        closeButton: false,
                      }
                    );
                  }}
                >
                  <Iconify icon="ri:file-upload-fill" />
                </UploadButton>
              );
            },
          },
          {
            id: 'view',
            label: 'View',
            render(value, row) {
              return (
                <IconButton
                  disabled={!row.uploadDocument}
                  onClick={() => {
                    setDocId(row.uploadDocument.id);
                    viewDialog.onTrue();
                  }}
                >
                  <Iconify icon="carbon:view-filled" />
                </IconButton>
              );
            },
          },
        ]}
        data={tableData}
      />
      <CustomDialog
        title="Preview Document"
        open={viewDialog.value}
        handleClose={viewDialog.onFalse}
        maxWidth="lg"
      >
        <Box p={2}>
          <ViewDocuments id={id} docId={docId} />
        </Box>
      </CustomDialog>
    </>
  );
};

const ViewDocuments = ({ id, docId }: { id: string; docId: string | null }) => {
  const { data: documents, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentDocumentByIdQuery,
    params: { id, documentId: docId },
  });

  return (
    <Box>
      {isLoading ? (
        <Skeleton variant="rectangular" height={300} />
      ) : (
        <iframe
          src={convertBase64Format(documents.content)}
          style={{ width: '100%', height: 500 }}
          title="Employee Document"
        />
      )}
    </Box>
  );
};

const RenderAcademicYear = (props: any) => {
  const { formik } = props;
  const { values, setFieldValue, touched, errors } = formik;
  const { data: academicYear, isLoading: yearLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetYearQuery,
  });
  return (
    <CustomSelect
      name="academicYear"
      label="Academic Year"
      isLoading={yearLoading}
      options={academicYear?.items || []}
      value={values.academicYear}
      labelKey="name"
      valueKey="id"
      onChange={(value) => setFieldValue('academicYear', value)}
      error={!!(touched.academicYear && errors.academicYear) || false}
      helperText={(touched.academicYear && errors.academicYear) || ''}
      formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
    />
  );
};

const RenderBoard = (props: any) => {
  const { formik } = props;
  const { values, setFieldValue, touched, errors } = formik;
  const { data: board, isLoading: boardLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
  });
  return (
    <CustomSelect
      name="board"
      label="Board"
      isLoading={boardLoading}
      options={board?.items || []}
      disabled={!values.academicYear}
      labelKey="name"
      valueKey="id"
      value={values.board}
      onChange={(value) => setFieldValue('board', value)}
      error={!!(touched.board && errors.board) || false}
      helperText={(touched.board && errors.board) || ''}
      formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
    />
  );
};
const RenderMedium = (props: any) => {
  const { formik } = props;
  const { values, setFieldValue, touched, errors } = formik;
  const { data: board, isLoading: boardLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
  });
  return (
    <CustomSelect
      name="medium"
      label="Medium"
      disabled={!values.board}
      options={
        board?.items?.find((item: Board) => item.id === values.board)?.educationMediums || []
      }
      value={values.medium}
      labelKey="name"
      valueKey="id"
      onChange={(value) => setFieldValue('medium', value)}
      error={!!(touched.medium && errors.medium) || false}
      helperText={(touched.medium && errors.medium) || ''}
      formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
    />
  );
};

const RenderClass = (props: any) => {
  const { formik } = props;
  const { values, setFieldValue, touched, errors } = formik;
  const { data: classes, isLoading: classLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassByOrganizationIdQuery,
    options: {
      skip: !values.medium,
    },
    params: values.medium,
  });
  return (
    <CustomSelect
      name="class"
      label="Class"
      isLoading={classLoading}
      disabled={!values.medium}
      labelKey="name"
      valueKey="id"
      options={classes || []}
      value={values.class}
      onChange={(value) => setFieldValue('class', value)}
      error={!!(touched.class && errors.class) || false}
      helperText={(touched.class && errors.class) || ''}
      formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
    />
  );
};

export const generalFormFields: FieldsType[] = [
  { name: 'inquiryNo', label: 'Inquiry No', type: 'text', otherProps: { disabled: true } },
  { name: 'formNo', label: 'Form No', type: 'text' },
  {
    name: 'year',
    label: 'year',
    type: 'text',
    renderComp(props) {
      return <RenderAcademicYear {...props} />;
    },
  },
  {
    name: 'board',
    label: 'board',
    type: 'text',
    renderComp(props) {
      return <RenderBoard {...props} />;
    },
  },
  {
    name: 'medium',
    label: 'medium',
    type: 'text',
    renderComp(props) {
      return <RenderMedium {...props} />;
    },
  },
  {
    name: 'class',
    label: 'class',
    type: 'text',
    renderComp(props) {
      return <RenderClass {...props} />;
    },
  },
  { name: 'previousSchool', label: 'Previous School', type: 'text', otherProps: {} },
  { name: 'firstName', label: 'First Name', type: 'text', otherProps: {} },
  { name: 'lastName', label: 'last Name', type: 'text', otherProps: {} },
  { name: 'middleName', label: 'Middle Name', type: 'text', otherProps: {} },
  {
    name: 'mobileNo',
    label: 'Contact Number',
    type: 'text',
    renderComp(props) {
      const { formik } = props;
      return (
        <PhoneInput
          name="mobileNo"
          value={formik.values.mobileNo}
          onChange={(value) => {
            formik.setFieldValue('mobileNo', value);
          }}
          placeholder="Contact No."
          label="Contact Number"
          error={formik.touched.mobileNo && Boolean(formik.errors.mobileNo)}
          helperText={formik.touched.mobileNo && formik.errors.mobileNo}
          variant="outlined"
          size="small"
        />
      );
    },
  },
  {
    name: 'alternativeContactNumber',
    label: 'Contact Number',
    type: 'text',
    renderComp(props) {
      const { formik } = props;
      return (
        <PhoneInput
          name="alternativeContactNumber"
          value={formik.values.alternativeContactNumber}
          onChange={(value) => {
            formik.setFieldValue('alternativeContactNumber', value);
          }}
          placeholder="Alternative Contact Number"
          label="Alternative Contact Number"
          error={
            formik.touched.alternativeContactNumber &&
            Boolean(formik.errors.alternativeContactNumber)
          }
          helperText={
            formik.touched.alternativeContactNumber && formik.errors.alternativeContactNumber
          }
          variant="outlined"
          size="small"
        />
      );
    },
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    otherProps: {
      InputProps: {
        startAdornment: (
          <>
            <Iconify icon="mdi-light:email" />{' '}
            <Divider orientation="vertical" sx={{ pl: '4px', height: '60%' }} />{' '}
          </>
        ),
      },
    },
  },
  {
    name: 'dob',
    label: 'Date of Birth',
    type: 'date',
    otherProps: {},
    renderComp: (props: any) => (
      <DatePicker
        label="Date of Birth"
        name="dob"
        value={props.formik.values.dob}
        format="DD/MM/YYYY"
        slotProps={{
          textField: {
            placeholder: 'Date of Birth',
            fullWidth: true,
            size: 'small',
          },
        }}
        onChange={(newValue) => {
          const date = newValue?.format();
          if (date) {
            const age = calculateAge(date);
            props.formik.setFieldValue('age', age);
          }
          props.formik.setFieldValue('dob', newValue);
        }}
      />
    ),
  },
  {
    name: 'age',
    label: 'Age',
    type: 'text',
    otherProps: {
      disabled: true,
    },
  },
  {
    name: 'gender',
    label: 'Gender',
    type: 'text',
    otherProps: {},
    renderComp: (props) => (
      <FormControl fullWidth>
        <InputLabel id="dropdown-label" size="small">
          Gender
        </InputLabel>
        <Select
          labelId="dropdown-label"
          id="dropdown"
          value={props.formik.values.gender}
          onChange={props.formik.handleChange}
          size="small"
          label="Gender"
          name="gender"
        >
          {GenderTypeArray.map((i, index) => (
            <MenuItem key={i} value={index}>
              {GenderType[index]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    ),
  },
  { name: 'adharNo', label: 'Adhar No', type: 'text', otherProps: {} },
  { name: 'religion', label: 'Religion', type: 'text', otherProps: {} },
  { name: 'familyCast', label: 'Family Cast', type: 'text', otherProps: {} },
  {
    name: 'castCategory',
    label: 'Cast Category',
    type: 'text',
    otherProps: {},
    renderComp: (props) => (
      <FormControl fullWidth>
        <InputLabel id="dropdown-label" size="small">
          Cast Category
        </InputLabel>
        <Select
          labelId="dropdown-label"
          id="dropdown"
          value={props.formik.values.castCategory}
          onChange={props.formik.handleChange}
          size="small"
          label="Cast Category"
          name="castCategory"
        >
          {EmployeeCastTypeArray.map((i, index) => (
            <MenuItem key={i} value={index}>
              {EmployeeCastType[index]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    ),
  },
  { name: 'motherTongue', label: 'Mother Tongue', type: 'text', otherProps: {} },
  { name: 'nationality', label: 'Nationality', type: 'text', otherProps: {} },
  { name: 'birthPlace', label: 'Birth Place', type: 'text', otherProps: {} },
  { name: 'temporaryGr', label: 'Temporary GR', type: 'text', otherProps: {} },
  { name: 'remarks', label: 'Remarks', type: 'text', otherProps: { multiline: true, rows: 2 } },
];

export const documentFields: FieldsType[] = [
  {
    type: 'text',
    label: 'Certificate Name',
    name: 'certificateName',
    placeholder: 'Enter Certificate Name',
    gridProps: { xs: 12, md: 12 },
    renderComp(props) {
      return <RenderDocuments id={props.formik.values.id} />;
    },
  },
];
export const familyFields: FieldsType[] = [
  {
    name: 'fatherName',
    label: 'Father Name',
    type: 'text',
    otherProps: {},
    gridProps: { xs: 12, md: 12 },
    renderComp(props: any) {
      return <RenderFamilyInformation {...props} />;
    },
  },
];
export const communicationFields: FieldsType[] = [
  {
    name: 'primaryContactNumber',
    label: 'Primary Contact Number',
    type: 'text',
    otherProps: {},
    renderComp(props) {
      const { formik } = props;

      return (
        <PhoneInput
          name="primaryContactNumber"
          value={formik.values.primaryContactNumber}
          onChange={(value) => {
            formik.setFieldValue('primaryContactNumber', value);
          }}
          label="Primary Contact Number"
          placeholder="Primary Contact Number"
          error={formik.touched.primaryContactNumber && Boolean(formik.errors.primaryContactNumber)}
        />
      );
    },
  },
  {
    name: 'parentContactNumber',
    label: 'Parent Contact Number',
    type: 'text',
    otherProps: {},
    renderComp(props) {
      const { formik } = props;

      return (
        <PhoneInput
          name="parentContactNumber"
          value={formik.values.parentContactNumber}
          onChange={(value) => {
            formik.setFieldValue('parentContactNumber', value);
          }}
          label="Parent Contact Number"
          placeholder="Parent Contact Number"
          error={formik.touched.parentContactNumber && Boolean(formik.errors.parentContactNumber)}
        />
      );
    },
  },
  {
    name: 'parentEmail',
    label: 'Parent Email',
    type: 'email',
    otherProps: {
      InputProps: {
        startAdornment: (
          <>
            <Iconify icon="mdi-light:email" />{' '}
            <Divider orientation="vertical" sx={{ pl: '4px', height: '60%' }} />{' '}
          </>
        ),
      },
    },
  },
  {
    name: 'studentContactNo',
    label: 'Student Contact Number',
    type: 'text',
    otherProps: {},
    renderComp(props) {
      const { formik } = props;

      return (
        <PhoneInput
          name="studentContactNo"
          value={formik.values.studentContactNo}
          onChange={(value) => {
            console.log(value, 'value====>');
            formik.setFieldValue('studentContactNo', value);
          }}
          label="Student Contact Number"
          placeholder="Student Contact Number"
          error={formik.touched.studentContactNo && Boolean(formik.errors.studentContactNo)}
        />
      );
    },
  },
  {
    name: 'studentEmail',
    label: 'Student Email',
    type: 'email',
    otherProps: {
      InputProps: {
        startAdornment: (
          <>
            <Iconify icon="mdi-light:email" />{' '}
            <Divider orientation="vertical" sx={{ pl: '4px', height: '60%' }} />{' '}
          </>
        ),
      },
    },
  },
  {
    name: 'whatsAppContactNo',
    label: 'WhatsApp Contact Number',
    type: 'text',
    otherProps: {},
    renderComp(props) {
      const { formik } = props;

      return (
        <PhoneInput
          name="whatsAppContactNo"
          value={formik.values.whatsAppContactNo}
          onChange={(value) => {
            formik.setFieldValue('whatsAppContactNo', value);
          }}
          label="Whatsapp Number"
          placeholder="Whatsapp Number"
          error={formik.touched.whatsAppContactNo && Boolean(formik.errors.whatsAppContactNo)}
        />
      );
    },
  },
  {
    name: 'localAddress',
    label: 'Local Address',
    type: 'text',
    otherProps: { multiline: true, rows: 4 },
    gridProps: { xs: 12, md: 12 },
    renderComp(props) {
      const { formik } = props;
      return (
        <>
          <Subheader
            data-title="Local Address"
            open={formik.values.isOpenLocalAddress}
            onClick={() => {
              formik.setFieldValue('isOpenLocalAddress', !formik.values.isOpenLocalAddress);
            }}
            sx={{ pt: 0, fontWeight: 600 }}
          >
            Local Address
          </Subheader>

          <Collapse in={formik.values.isOpenLocalAddress}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <StandardAddress.RenderAddressField
                  name="localAddressLine1"
                  label="Address Line 1"
                  value={formik.values.localAddressLine1}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.localAddressLine1 && Boolean(formik.errors.localAddressLine1)
                  }
                  helperText={formik.touched.localAddressLine1 && formik.errors.localAddressLine1}
                  fullWidth
                  placeholder="Address Line 1"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StandardAddress.RenderAddressField
                  name="localAddressLine2"
                  label="Address Line 2"
                  value={formik.values.localAddressLine2}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.localAddressLine2 && Boolean(formik.errors.localAddressLine2)
                  }
                  helperText={formik.touched.localAddressLine2 && formik.errors.localAddressLine2}
                  fullWidth
                  placeholder="Address Line 2"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StandardAddress.RenderAddressField
                  name="localAddressLine3"
                  label="Address Line 3"
                  value={formik.values.localAddressLine3}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.localAddressLine3 && Boolean(formik.errors.localAddressLine3)
                  }
                  helperText={formik.touched.localAddressLine3 && formik.errors.localAddressLine3}
                  fullWidth
                  placeholder="Address Line 3"
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <StandardAddress.RenderCountry
                  name="localCountry"
                  value={formik.values.localCountry}
                  onChange={(value) => formik.setFieldValue('localCountry', value)}
                  error={formik.touched.localCountry && Boolean(formik.errors.localCountry)}
                  helperText={formik.touched.localCountry && formik.errors.localCountry}
                  fullWidth
                  placeholder="Country"
                  size="small"
                  label="Country"
                  options={[]}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StandardAddress.RenderState
                  name="localState"
                  value={formik.values.localState}
                  onChange={formik.handleChange}
                  error={formik.touched.state && Boolean(formik.errors.localState)}
                  helperText={formik.touched.localState && formik.errors.localState}
                  fullWidth
                  placeholder="State"
                  size="small"
                  label="State"
                  options={[]}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StandardAddress.RenderCity
                  name="localCity"
                  value={formik.values.localCity}
                  onChange={formik.handleChange}
                  error={formik.touched.localCity && Boolean(formik.errors.localCity)}
                  helperText={formik.touched.localCity && formik.errors.localCity}
                  fullWidth
                  placeholder="City"
                  size="small"
                  label="City"
                  options={[]}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StandardAddress.RenderPincode
                  name="localPincode"
                  value={formik.values.localPincode}
                  onChange={formik.handleChange}
                  error={formik.touched.localPincode && Boolean(formik.errors.localPincode)}
                  helperText={formik.touched.localPincode && formik.errors.localPincode}
                  fullWidth
                  placeholder="Pincode"
                  size="small"
                  label="Pincode"
                />
              </Grid>
            </Grid>
          </Collapse>
        </>
      );
    },
  },
  {
    name: 'permanentAddress',
    label: 'Permanent Address',
    type: 'text',
    otherProps: { multiline: true, rows: 4 },
    gridProps: { xs: 12, md: 12 },
    renderComp(props) {
      const { formik } = props;
      return (
        <>
          <Subheader
            data-title="Permanent Address"
            open={formik.values.isOpenPermanentAddress}
            onClick={() => {}}
            sx={{ pt: 0, fontWeight: 600 }}
          >
            <Checkbox
              checked={formik.values.sameAsLocalForPermanent}
              size="small"
              sx={{ p: 0 }}
              onClick={(e) => {
                e.stopPropagation();
              }}
              onChange={(e) => {
                formik.setFieldValue('sameAsLocalForPermanent', e.target.checked);
                formik.setFieldValue('isOpenPermanentAddress', !e.target.checked);
                if (e.target.checked) {
                  formik.setFieldValue('permanentAddressLine1', formik.values.localAddressLine1);
                  formik.setFieldValue('permanentAddressLine2', formik.values.localAddressLine2);
                  formik.setFieldValue('permanentAddressLine3', formik.values.localAddressLine3);
                  formik.setFieldValue('permanentCountry', formik.values.localCountry);
                  formik.setFieldValue('permanentState', formik.values.localState);
                  formik.setFieldValue('permanentCity', formik.values.localCity);
                  formik.setFieldValue('permanentPincode', formik.values.localPincode);
                }
              }}
              name="sameAsLocal"
            />{' '}
            Permanent Address Same as Local Address{' '}
          </Subheader>
          <Collapse in={formik.values.isOpenPermanentAddress}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <StandardAddress.RenderAddressField
                  name="permanentAddressLine1"
                  label="Address Line 1"
                  value={formik.values.permanentAddressLine1}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.permanentAddressLine1 &&
                    Boolean(formik.errors.permanentAddressLine1)
                  }
                  helperText={
                    formik.touched.permanentAddressLine1 && formik.errors.permanentAddressLine1
                  }
                  fullWidth
                  placeholder="Address Line 1"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StandardAddress.RenderAddressField
                  name="permanentAddressLine2"
                  label="Address Line 2"
                  value={formik.values.permanentAddressLine2}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.permanentAddressLine2 &&
                    Boolean(formik.errors.permanentAddressLine2)
                  }
                  helperText={
                    formik.touched.permanentAddressLine2 && formik.errors.permanentAddressLine2
                  }
                  fullWidth
                  placeholder="Address Line 2"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StandardAddress.RenderAddressField
                  name="permanentAddressLine3"
                  label="Address Line 3"
                  value={formik.values.permanentAddressLine3}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.permanentAddressLine3 &&
                    Boolean(formik.errors.permanentAddressLine3)
                  }
                  helperText={
                    formik.touched.permanentAddressLine3 && formik.errors.permanentAddressLine3
                  }
                  fullWidth
                  placeholder="Address Line 3"
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <StandardAddress.RenderCountry
                  name="permanentCountry"
                  value={formik.values.permanentCountry}
                  onChange={(value) => formik.setFieldValue('permanentCountry', value)}
                  error={formik.touched.permanentCountry && Boolean(formik.errors.permanentCountry)}
                  helperText={formik.touched.permanentCountry && formik.errors.permanentCountry}
                  fullWidth
                  placeholder="Country"
                  size="small"
                  label="Country"
                  options={[]}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StandardAddress.RenderState
                  name="permanentState"
                  value={formik.values.permanentState}
                  onChange={formik.handleChange}
                  error={formik.touched.state && Boolean(formik.errors.permanentState)}
                  helperText={formik.touched.permanentState && formik.errors.permanentState}
                  fullWidth
                  placeholder="State"
                  size="small"
                  label="State"
                  options={[]}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StandardAddress.RenderCity
                  name="permanentCity"
                  value={formik.values.permanentCity}
                  onChange={formik.handleChange}
                  error={formik.touched.permanentCity && Boolean(formik.errors.permanentCity)}
                  helperText={formik.touched.permanentCity && formik.errors.permanentCity}
                  fullWidth
                  placeholder="City"
                  size="small"
                  label="City"
                  options={[]}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StandardAddress.RenderPincode
                  name="permanentPincode"
                  value={formik.values.permanentPincode}
                  onChange={formik.handleChange}
                  error={formik.touched.permanentPincode && Boolean(formik.errors.permanentPincode)}
                  helperText={formik.touched.permanentPincode && formik.errors.permanentPincode}
                  fullWidth
                  placeholder="Pincode"
                  size="small"
                  label="Pincode"
                />
              </Grid>
            </Grid>
          </Collapse>
        </>
      );
    },
  },
  {
    name: 'emergencyAddress',
    label: 'Emergency Address',
    type: 'text',
    otherProps: { multiline: true, rows: 4 },
    gridProps: { xs: 12, md: 12 },
    renderComp(props) {
      const { formik } = props;
      return (
        <>
          <Subheader
            data-title="Emergency Address"
            open={formik.values.isOpenEmergencyAddress}
            // onClick={() => {
            //   formik.setFieldValue('isOpenEmergencyAddress', !formik.values.isOpenEmergencyAddress);
            // }}
            sx={{ pt: 0, fontWeight: 600 }}
          >
            <Checkbox
              checked={formik.values.emergencySameAsLocal}
              onClick={(e) => {
                e.stopPropagation();
              }}
              onChange={(e) => {
                formik.setFieldValue('emergencySameAsLocal', e.target.checked);
                formik.setFieldValue('isOpenEmergencyAddress', !e.target.checked);
                if (e.target.checked) {
                  formik.setFieldValue('emergencyAddressLine1', formik.values.localAddressLine1);
                  formik.setFieldValue('emergencyAddressLine2', formik.values.localAddressLine2);
                  formik.setFieldValue('emergencyAddressLine3', formik.values.localAddressLine3);
                  formik.setFieldValue('emergencyCountry', formik.values.localCountry);
                  formik.setFieldValue('emergencyState', formik.values.localState);
                  formik.setFieldValue('emergencyCity', formik.values.localCity);
                  formik.setFieldValue('emergencyPincode', formik.values.localPincode);
                }
              }}
              sx={{ p: 0 }}
            />{' '}
            Emergency Address Same as Local Address{' '}
          </Subheader>
          <Collapse in={formik.values.isOpenEmergencyAddress}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <StandardAddress.RenderAddressField
                  name="emergencyAddressLine1"
                  label="Address Line 1"
                  value={formik.values.emergencyAddressLine1}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.emergencyAddressLine1 &&
                    Boolean(formik.errors.emergencyAddressLine1)
                  }
                  helperText={
                    formik.touched.emergencyAddressLine1 && formik.errors.emergencyAddressLine1
                  }
                  fullWidth
                  placeholder="Address Line 1"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StandardAddress.RenderAddressField
                  name="emergencyAddressLine2"
                  label="Address Line 2"
                  value={formik.values.emergencyAddressLine2}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.emergencyAddressLine2 &&
                    Boolean(formik.errors.emergencyAddressLine2)
                  }
                  helperText={
                    formik.touched.emergencyAddressLine2 && formik.errors.emergencyAddressLine2
                  }
                  fullWidth
                  placeholder="Address Line 2"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StandardAddress.RenderAddressField
                  name="emergencyAddressLine3"
                  label="Address Line 3"
                  value={formik.values.emergencyAddressLine3}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.emergencyAddressLine3 &&
                    Boolean(formik.errors.emergencyAddressLine3)
                  }
                  helperText={
                    formik.touched.emergencyAddressLine3 && formik.errors.emergencyAddressLine3
                  }
                  fullWidth
                  placeholder="Address Line 3"
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <StandardAddress.RenderCountry
                  name="emergencyCountry"
                  value={formik.values.emergencyCountry}
                  onChange={(value) => formik.setFieldValue('emergencyCountry', value)}
                  error={formik.touched.emergencyCountry && Boolean(formik.errors.emergencyCountry)}
                  helperText={formik.touched.emergencyCountry && formik.errors.emergencyCountry}
                  fullWidth
                  placeholder="Country"
                  size="small"
                  label="Country"
                  options={[]}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StandardAddress.RenderState
                  name="emergencyState"
                  value={formik.values.emergencyState}
                  onChange={formik.handleChange}
                  error={formik.touched.state && Boolean(formik.errors.emergencyState)}
                  helperText={formik.touched.emergencyState && formik.errors.emergencyState}
                  fullWidth
                  placeholder="State"
                  size="small"
                  label="State"
                  options={[]}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StandardAddress.RenderCity
                  name="emergencyCity"
                  value={formik.values.emergencyCity}
                  onChange={formik.handleChange}
                  error={formik.touched.emergencyCity && Boolean(formik.errors.emergencyCity)}
                  helperText={formik.touched.emergencyCity && formik.errors.emergencyCity}
                  fullWidth
                  placeholder="City"
                  size="small"
                  label="City"
                  options={[]}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StandardAddress.RenderPincode
                  name="emergencyPincode"
                  value={formik.values.emergencyPincode}
                  onChange={formik.handleChange}
                  error={formik.touched.emergencyPincode && Boolean(formik.errors.emergencyPincode)}
                  helperText={formik.touched.emergencyPincode && formik.errors.emergencyPincode}
                  fullWidth
                  placeholder="Pincode"
                  size="small"
                  label="Pincode"
                />
              </Grid>
            </Grid>
          </Collapse>
        </>
      );
    },
  },
  {
    name: 'remarks',
    label: 'Remarks',
    type: 'text',
    otherProps: { multiline: true, rows: 4 },
    gridProps: { xs: 12, md: 12 },
  },
];

export const additionalDetailsFields: FieldsType[] = [
  {
    name: 'category',
    label: 'Category',
    type: 'text',
    otherProps: {},
    renderComp(props: any) {
      return (
        <CustomSelect
          options={CategoryArray}
          label="Category"
          value={props.formik.values.category}
          onChange={(value) => {
            props.formik.setFieldValue('category', value);
          }}
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
        />
      );
    },
  },
  {
    name: 'RTE',
    label: 'Right to Education',
    type: 'text',
    otherProps: {},
    renderComp(props: any) {
      return (
        <CustomSelect
          options={YesNoArray}
          label="Right to Education"
          value={props.formik.values.RTE}
          onChange={(value) => {
            props.formik.setFieldValue('RTE', value);
          }}
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
        />
      );
    },
  },
  {
    name: 'bplStudent',
    label: 'BPL Student',
    type: 'text',
    otherProps: {},
    renderComp(props: any) {
      return (
        <CustomSelect
          options={YesNoArray}
          label="BPL Student"
          value={props.formik.values.bplStudent}
          onChange={(value) => {
            props.formik.setFieldValue('bplStudent', value);
          }}
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
        />
      );
    },
  },
  {
    name: 'bplCardNo',
    label: 'BPL Card No',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'personWithDisability',
    label: 'Person With Disability',
    type: 'text',
    otherProps: {},
    renderComp(props: any) {
      return (
        <CustomSelect
          options={YesNoArray}
          label="Person With Disability"
          value={props.formik.values.personWithDisability}
          onChange={(value) => {
            props.formik.setFieldValue('personWithDisability', value);
          }}
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
        />
      );
    },
  },
  {
    name: 'secondLanguage',
    label: 'Second Language',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'emergencyContactNo: ',
    label: 'Emergency Contact No',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'singleParentChild',
    label: 'Single Parent Child',
    type: 'text',
    otherProps: {},
    renderComp(props: any) {
      return (
        <CustomSelect
          options={YesNoArray}
          label="Single Parent Child"
          value={props.formik.values.singleParentChild}
          onChange={(value) => {
            props.formik.setFieldValue('singleParentChild', value);
          }}
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
        />
      );
    },
  },
  {
    name: 'singleChild',
    label: 'Single Child',
    type: 'text',
    otherProps: {},
    renderComp(props: any) {
      return (
        <CustomSelect
          options={YesNoArray}
          label="Single Child"
          value={props.formik.values.singleChild}
          onChange={(value) => {
            props.formik.setFieldValue('singleChild', value);
          }}
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
        />
      );
    },
  },
  {
    name: 'sponsorStudent',
    label: 'Sponsor Student',
    type: 'text',
    otherProps: {},
    renderComp(props: any) {
      return (
        <Autocomplete
          loading={false}
          noOptionsText="No Student Found"
          fullWidth
          value={props.formik.values.sponsorStudent}
          onChange={(e, value: any) => {
            props.formik.setFieldValue('sponsorStudent', value);
          }}
          options={[]}
          getOptionLabel={(option: any) => option?.firstName || ''}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              label="Student"
              placeholder="Search  Student"
              fullWidth
            />
          )}
          renderOption={(prop: any, option: any) => (
            <li {...prop} key={option.id}>
              {option.firstName}
            </li>
          )}
        />
      );
    },
  },
  {
    name: 'sponsorName ',
    label: 'Sponsor Name',
    type: 'text',
    otherProps: {},
  },
];

export const medicalFields: FieldsType[] = [
  {
    name: 'weight',
    label: 'Weight (kg)',
    type: 'number',
    otherProps: {},
  },
  {
    name: 'height',
    label: 'Height (cm)',
    type: 'number',
    otherProps: {},
  },
  {
    name: 'bmi',
    label: 'Body Mass Index (BMI)',
    type: 'number',
    otherProps: {},
  },
  {
    name: 'pulseRate',
    label: 'Pulse Rate',
    type: 'number',
    otherProps: {},
  },
  {
    name: 'haemoglobin',
    label: 'Haemoglobin (hb)',
    type: 'string',
    otherProps: {},
  },
  {
    name: 'allergies',
    label: 'Allergies',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'covidVaccination',
    label: 'Covid Vaccination',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'childImmunisation',
    label: 'Child Immunisation',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'immunisationRemarks',
    label: 'Immunisation Remarks',
    type: 'text',
    otherProps: {},
  },
];

export const previousSchoolFields: FieldsType[] = [
  {
    name: 'schoolName',
    label: 'Previous School Name',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'schoolAddress',
    label: 'Previous School Address',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'schoolBoard',
    label: 'Previous School Board',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'schoolMedium',
    label: 'Previous School Medium',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'tcNumber',
    label: 'TC Number',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'lastClassPassed',
    label: 'Last Class Passed',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'percentage',
    label: 'Percentage',
    type: 'number',
    otherProps: {},
  },
];

export const bankDetailsFields: FieldsType[] = [
  {
    name: 'bankName',
    label: 'Bank Name',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'accountNo',
    label: 'Account No',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'ifscCode',
    label: 'IFSC Code',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'branchName',
    label: 'Branch Name',
    type: 'text',
    otherProps: {},
  },
  {
    name: 'accountHolderName',
    label: 'Account Holder Name',
    type: 'text',
    otherProps: {},
  },
];

export const generalFieldsInitialValues = (editData?: IInquiryData | null) => ({
  inquiryNo: editData?.inquiryNumber || '',
  formNo: editData?.formNumber || '',
  firstName: editData?.firstName || '',
  lastName: editData?.lastName || '',
  middleName: editData?.middleName || '',
  dob: editData?.dateOfBirth ? dayjs(editData?.dateOfBirth) : null,
  age: calculateAge(dayjs(editData?.dateOfBirth).format()),
  gender: editData?.genderType || GenderType.Male,
  adharNo: editData?.studentBasicDetails?.aadhaarNo || '',
  religion: editData?.studentBasicDetails?.religion || '',
  familyCast: editData ? editData?.studentBasicDetails?.familyCast : '',
  castCategory: editData ? editData?.studentBasicDetails?.castType : null,
  motherTongue: editData?.studentBasicDetails?.motherTongue || '',
  nationality: editData?.studentBasicDetails?.nationality || '',
  birthPlace: editData?.studentBasicDetails?.birthPlace || '',
  temporaryGr: editData?.studentBasicDetails?.temporaryGr || '',
  remarks: editData?.studentBasicDetails?.remarks || '',
  mobileNo: editData?.parentContactNumber || '',
  alternativeContactNumber: editData?.alternativeContactNumber || '',
  email: editData?.email || '',
  userId: editData?.studentBasicDetails?.userId || null,
  id: editData?.id || null,
  medium: editData?.educationMediumId || '',
  board: editData?.educationBoardId || '',
  academicYear: editData?.academicYearId || '',
  class: editData?.standardId || '',
  previousSchool: editData?.previousSchoolName || '',
});

export const documentFieldsInitialValues = (editData?: IInquiryData | null) => ({
  documents: [],
});

export const familyFieldsInitialValues = (editData?: IInquiryData | null) => ({
  fatherName: editData?.fatherDetails?.name || '',
  fatherDob: editData?.fatherDetails?.dateOfBirth
    ? dayjs(editData?.fatherDetails.dateOfBirth)
    : null,
  fatherOccupation: editData?.fatherDetails?.occupation || '',
  fatherQualification: editData?.fatherDetails?.qualification || '',
  fatherContactNo: editData?.fatherDetails?.contactNo || '',
  fatherEmail: editData?.fatherDetails?.email || '',
  fatherPassOutYear: editData?.fatherDetails?.passOutYear || '',
  fatherOfficeNo: editData?.fatherDetails?.officeNo || '',
  fatherOfficeAddress: editData?.fatherDetails?.officeAddress || '',
  fatherDesignation: editData?.fatherDetails?.designation || '',
  fatherOrganization: editData?.fatherDetails?.organisation || '',
  fatherAadharNo: editData?.fatherDetails?.aadhaarNo || '',
  fatherRemarks: editData?.fatherDetails?.remarks || '',
  fatherAddress: editData?.fatherDetails?.address || '',
  motherName: editData?.motherDetails?.name || '',
  motherDob: editData?.motherDetails?.dateOfBirth
    ? dayjs(editData?.motherDetails.dateOfBirth)
    : null,
  motherOccupation: editData?.motherDetails?.occupation || '',
  motherQualification: editData?.motherDetails?.qualification || '',
  motherContactNo: editData?.motherDetails?.contactNo || '',
  motherEmail: editData?.motherDetails?.email || '',
  motherPassOutYear: editData?.motherDetails?.passOutYear || '',
  motherOfficeNo: editData?.motherDetails?.officeNo || '',
  motherOfficeAddress: editData?.motherDetails?.officeAddress || '',
  motherDesignation: editData?.motherDetails?.designation || '',
  motherOrganization: editData?.motherDetails?.organisation || '',
  motherAadharNo: editData?.motherDetails?.aadhaarNo || '',
  motherRemarks: editData?.motherDetails?.remarks || '',
  motherAddress: editData?.motherDetails?.address || '',
  guardianName: editData?.guardianDetails?.name || '',
  guardianDob: editData?.guardianDetails?.dateOfBirth
    ? dayjs(editData?.guardianDetails.dateOfBirth)
    : null,
  guardianOccupation: editData?.guardianDetails?.occupation || '',
  guardianQualification: editData?.guardianDetails?.qualification || '',
  guardianContactNo: editData?.guardianDetails?.contactNo || '',
  guardianEmail: editData?.guardianDetails?.email || '',
  guardianPassOutYear: editData?.guardianDetails?.passOutYear || '',
  guardianOfficeNo: editData?.guardianDetails?.officeNo || '',
  guardianOfficeAddress: editData?.guardianDetails?.officeAddress || '',
  guardianDesignation: editData?.guardianDetails?.designation || '',
  guardianOrganization: editData?.guardianDetails?.organisation || '',
  guardianAadharNo: editData?.guardianDetails?.aadhaarNo || '',
  guardianRemarks: editData?.guardianDetails?.remarks || '',
  guardianAddress: editData?.guardianDetails?.address || '',
});

export const CommunicationFieldsInitialValues = (editData?: IInquiryData | null) => ({
  primaryContactNumber: editData?.studentCommunicationDetails?.primaryContactNo || '',
  parentContactNumber: editData?.studentCommunicationDetails?.parentContactNo || '',
  parentEmail: editData?.studentCommunicationDetails?.parentEmail || '',
  studentContactNo: editData?.studentCommunicationDetails?.studentContactNo || '',
  studentEmail: editData?.studentCommunicationDetails?.studentEmail || '',
  whatsAppContactNo: editData?.studentCommunicationDetails?.whatsAppNo || '',

  localCountry: editData?.studentCommunicationDetails?.localCountry || '',
  localState: editData?.studentCommunicationDetails?.localState || '',
  localCity: editData?.studentCommunicationDetails?.localCity || '',
  localPincode: editData?.studentCommunicationDetails?.localPinCode || '',
  localAddressLine1: editData?.studentCommunicationDetails?.localAddressLine1 || '',
  localAddressLine2: editData?.studentCommunicationDetails?.localAddressLine2 || '',
  localAddressLine3: editData?.studentCommunicationDetails?.localAddressLine3 || '',
  isOpenLocalAddress: true,

  emergencyCountry: editData?.studentCommunicationDetails?.emergencyCountry || '',
  emergencyState: editData?.studentCommunicationDetails?.emergencyState || '',
  emergencyCity: editData?.studentCommunicationDetails?.emergencyCity || '',
  emergencyPincode: editData?.studentCommunicationDetails?.emergencyPinCode || '',
  emergencyAddressLine1: editData?.studentCommunicationDetails?.emergencyAddressLine1 || '',
  emergencyAddressLine2: editData?.studentCommunicationDetails?.emergencyAddressLine2 || '',
  emergencyAddressLine3: editData?.studentCommunicationDetails?.emergencyAddressLine3 || '',
  emergencySameAsLocal: false,
  isOpenEmergencyAddress: true,

  permanentAddress: editData?.studentCommunicationDetails?.permanentAddressLine1 || '',
  permanentAddressLine2: editData?.studentCommunicationDetails?.permanentAddressLine2 || '',
  permanentAddressLine3: editData?.studentCommunicationDetails?.permanentAddressLine3 || '',
  permanentCountry: editData?.studentCommunicationDetails?.permanentCountry || '',
  permanentState: editData?.studentCommunicationDetails?.permanentState || '',
  permanentCity: editData?.studentCommunicationDetails?.permanentCity || '',
  permanentPincode: editData?.studentCommunicationDetails?.permanentPinCode || '',
  sameAsLocalForPermanent: false,
  isOpenPermanentAddress: true,

  remarks: editData?.studentCommunicationDetails?.remarks || '',
});

export const additionalDetailsInitialValues = (editData?: IInquiryData | null) => ({
  category: editData?.studentAdditionalDetails?.category || Category.General,
  RTE: editData?.studentAdditionalDetails?.rightToEducation || '',
  bplStudent: editData?.studentAdditionalDetails?.bplStudent || null,
  bplCardNo: editData?.studentAdditionalDetails?.bplCardNo || '',
  personWithDisability: editData?.studentAdditionalDetails?.personWithDisability || null,
  secondLanguage: editData?.studentAdditionalDetails?.secondLanguage || '',
  emergencyContactNo: editData?.studentAdditionalDetails?.emergencyContactNo || '',
  singleParentChild: editData?.studentAdditionalDetails?.singleParentChild || null,
  singleChild: editData?.studentAdditionalDetails?.singleChild || null,
  sponsorStudent: '',
  sponsorName: editData?.studentAdditionalDetails?.sponsorName || '',
});

export const medicalFieldsInitialValues = (editData?: IInquiryData | null) => ({
  weight: editData?.studentMedicalRecords?.weight || '',
  height: editData?.studentMedicalRecords?.height || '',
  bmi: editData?.studentMedicalRecords?.bodyMassIndex || '',
  pulseRate: '',
  haemoglobin: editData?.studentMedicalRecords?.haemoglobin || '',
  allergies: editData?.studentMedicalRecords?.allergies || '',
  covidVaccination: editData?.studentMedicalRecords?.covidVaccination || '',
  childImmunisation: editData?.studentMedicalRecords?.childImmunisation || '',
  immunisationRemarks: editData?.studentMedicalRecords?.immunisationRemarks || '',
});

export const previousSchoolFieldsInitialValues = (editData?: IInquiryData | null) => ({
  schoolName: editData?.previousSchoolDetails?.previousSchoolName || '',
  schoolAddress: editData?.previousSchoolDetails?.previousSchoolAddress || '',
  schoolBoard: editData?.previousSchoolDetails?.previousSchoolBoard || '',
  schoolMedium: editData?.previousSchoolDetails?.previousSchoolMedium || '',
  tcNumber: editData?.previousSchoolDetails?.tcNo || '',
  lastClassPassed: editData?.previousSchoolDetails?.lastClassPassed || '',
  percentage: editData?.previousSchoolDetails?.percentage || '',
});

export const bankDetailsInitialValues = (editData?: IInquiryData | null) => ({
  bankName: editData?.parentBankDetails?.bankName || '',
  accountNo: editData?.parentBankDetails?.accountNumber || '',
  ifscCode: editData?.parentBankDetails?.ifscCode || '',
  branchName: editData?.parentBankDetails?.branchName || '',
  accountHolderName: editData?.parentBankDetails?.accountHolderName || '',
});

function RenderFamilyInformation(props: any) {
  const { formik } = props;
  const [student, setStudent] = useState([]);

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Father Details
            </Typography>
            <Stack spacing={2}>
              <TextField
                name="fatherName"
                label="Father Name"
                value={formik.values.fatherName}
                onChange={formik.handleChange}
                error={formik.touched.fatherName && Boolean(formik.errors.fatherName)}
                helperText={formik.touched.fatherName && formik.errors.fatherName}
                fullWidth
                size="small"
              />
              <DatePicker
                name="fatherDob"
                label="Father DOB"
                value={formik.values.fatherDob}
                onChange={(value) => {
                  formik.setFieldValue('fatherDob', value);
                }}
                slotProps={{
                  textField: {
                    error: formik.touched.fatherDob && Boolean(formik.errors.fatherDob),
                    helperText: formik.touched.fatherDob && formik.errors.fatherDob,
                    fullWidth: true,
                    size: 'small',
                  },
                }}
              />
              <TextField
                name="fatherOccupation"
                label="Father Occupation"
                value={formik.values.fatherOccupation}
                onChange={formik.handleChange}
                error={formik.touched.fatherOccupation && Boolean(formik.errors.fatherOccupation)}
                helperText={formik.touched.fatherOccupation && formik.errors.fatherOccupation}
                fullWidth
                size="small"
              />
              <TextField
                name="fatherQualification"
                label="Father Qualification"
                value={formik.values.fatherQualification}
                onChange={formik.handleChange}
                error={
                  formik.touched.fatherQualification && Boolean(formik.errors.fatherQualification)
                }
                helperText={formik.touched.fatherQualification && formik.errors.fatherQualification}
                fullWidth
                size="small"
              />
              <PhoneInput
                name="fatherContactNo"
                value={formik.values.fatherContactNo}
                onChange={(value) => {
                  formik.setFieldValue('fatherContactNo', value);
                }}
                placeholder="Enter Father Contact No."
                label="Father Contact No."
                error={formik.touched.fatherContactNo && Boolean(formik.errors.fatherContactNo)}
              />

              <TextField
                name="fatherEmail"
                label="Father Email"
                value={formik.values.fatherEmail}
                onChange={formik.handleChange}
                error={formik.touched.fatherEmail && Boolean(formik.errors.fatherEmail)}
                helperText={formik.touched.fatherEmail && formik.errors.fatherEmail}
                fullWidth
                size="small"
                inputProps={{
                  startAdornment: (
                    <>
                      <Iconify icon="mdi-light:email" />{' '}
                      <Divider orientation="vertical" sx={{ pl: '4px', height: '60%' }} />{' '}
                    </>
                  ),
                }}
              />

              <TextField
                name="fatherPassOutYear"
                label="Father Pass out Year"
                type="number"
                value={formik.values.fatherPassOutYear}
                onChange={formik.handleChange}
                error={formik.touched.fatherPassOutYear && Boolean(formik.errors.fatherPassOutYear)}
                helperText={formik.touched.fatherPassOutYear && formik.errors.fatherPassOutYear}
                fullWidth
                size="small"
              />

              <PhoneInput
                name="fatherOfficeNo"
                value={formik.values.fatherOfficeNo}
                onChange={(value) => {
                  formik.setFieldValue('fatherOfficeNo', value);
                }}
                label="Father Office No."
                placeholder="Enter Father Office No."
                error={formik.touched.fatherOfficeNo && Boolean(formik.errors.fatherOfficeNo)}
              />

              <TextField
                name="fatherOfficeAddress"
                multiline
                rows={3}
                label="Father Office Address"
                value={formik.values.fatherOfficeAddress}
                onChange={formik.handleChange}
                error={
                  formik.touched.fatherOfficeAddress && Boolean(formik.errors.fatherOfficeAddress)
                }
                helperText={formik.touched.fatherOfficeAddress && formik.errors.fatherOfficeAddress}
                fullWidth
                size="small"
              />
              <TextField
                name="fatherDesignation"
                label="Father Designation"
                value={formik.values.fatherDesignation}
                onChange={formik.handleChange}
                error={formik.touched.fatherDesignation && Boolean(formik.errors.fatherDesignation)}
                helperText={formik.touched.fatherDesignation && formik.errors.fatherDesignation}
                fullWidth
                size="small"
              />

              <TextField
                name="fatherOrganization"
                label="Father Organization"
                value={formik.values.fatherOrganization}
                onChange={formik.handleChange}
                error={
                  formik.touched.fatherOrganization && Boolean(formik.errors.fatherOrganization)
                }
                helperText={formik.touched.fatherOrganization && formik.errors.fatherOrganization}
                fullWidth
                size="small"
              />

              <TextField
                name="fatherAadharNo"
                label="Father Aadhar No."
                value={formik.values.fatherAadharNo}
                onChange={formik.handleChange}
                error={formik.touched.fatherAadharNo && Boolean(formik.errors.fatherAadharNo)}
                helperText={formik.touched.fatherAadharNo && formik.errors.fatherAadharNo}
                fullWidth
                size="small"
              />

              <TextField
                name="fatherRemarks"
                label="Remarks"
                multiline
                rows={3}
                value={formik.values.fatherRemarks}
                onChange={formik.handleChange}
                error={formik.touched.fatherRemarks && Boolean(formik.errors.fatherRemarks)}
                helperText={formik.touched.fatherRemarks && formik.errors.fatherRemarks}
                fullWidth
                size="small"
              />

              <TextField
                name="fatherAddress"
                multiline
                rows={3}
                label="Father Address"
                value={formik.values.fatherAddress}
                onChange={formik.handleChange}
                error={formik.touched.fatherAddress && Boolean(formik.errors.fatherAddress)}
                helperText={formik.touched.fatherAddress && formik.errors.fatherAddress}
                fullWidth
                size="small"
              />
            </Stack>
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Mother Details
            </Typography>
            <Stack spacing={2}>
              <TextField
                name="motherName"
                label="Mother Name"
                value={formik.values.motherName}
                onChange={formik.handleChange}
                error={formik.touched.motherName && Boolean(formik.errors.motherName)}
                helperText={formik.touched.motherName && formik.errors.motherName}
                fullWidth
                size="small"
              />
              <DatePicker
                name="motherDob"
                label="Mother DOB"
                value={formik.values.motherDob}
                onChange={(value) => {
                  formik.setFieldValue('motherDob', value);
                }}
                slotProps={{
                  textField: {
                    error: formik.touched.motherDob && Boolean(formik.errors.motherDob),
                    helperText: formik.touched.motherDob && formik.errors.motherDob,
                    fullWidth: true,
                    size: 'small',
                  },
                }}
              />
              <TextField
                name="motherOccupation"
                label="Mother Occupation"
                value={formik.values.motherOccupation}
                onChange={formik.handleChange}
                error={formik.touched.motherOccupation && Boolean(formik.errors.motherOccupation)}
                helperText={formik.touched.motherOccupation && formik.errors.motherOccupation}
                fullWidth
                size="small"
              />
              <TextField
                name="motherQualification"
                label="Mother Qualification"
                value={formik.values.motherQualification}
                onChange={formik.handleChange}
                error={
                  formik.touched.motherQualification && Boolean(formik.errors.motherQualification)
                }
                helperText={formik.touched.motherQualification && formik.errors.motherQualification}
                fullWidth
                size="small"
              />
              <PhoneInput
                name="motherContactNo"
                value={formik.values.motherContactNo}
                onChange={(value) => {
                  formik.setFieldValue('motherContactNo', value);
                }}
                label="Mother Contact No."
                placeholder="Enter Mother Contact No."
                error={formik.touched.motherContactNo && Boolean(formik.errors.motherContactNo)}
              />

              <TextField
                name="motherEmail"
                label="Mother Email"
                value={formik.values.motherEmail}
                onChange={formik.handleChange}
                error={formik.touched.motherEmail && Boolean(formik.errors.motherEmail)}
                helperText={formik.touched.motherEmail && formik.errors.motherEmail}
                fullWidth
                size="small"
                inputProps={{
                  startAdornment: (
                    <>
                      <Iconify icon="mdi-light:email" />{' '}
                      <Divider orientation="vertical" sx={{ pl: '4px', height: '60%' }} />{' '}
                    </>
                  ),
                }}
              />

              <TextField
                name="motherPassOutYear"
                label="Mother Pass out Year"
                type="number"
                value={formik.values.motherPassOutYear}
                onChange={formik.handleChange}
                error={formik.touched.motherPassOutYear && Boolean(formik.errors.motherPassOutYear)}
                helperText={formik.touched.motherPassOutYear && formik.errors.motherPassOutYear}
                fullWidth
                size="small"
              />

              <PhoneInput
                name="motherOfficeNo"
                value={formik.values.motherOfficeNo}
                onChange={(value) => {
                  formik.setFieldValue('motherOfficeNo', value);
                }}
                placeholder="Enter Mother Office No."
                label="Mother Office No."
                error={formik.touched.motherOfficeNo && Boolean(formik.errors.motherOfficeNo)}
              />

              <TextField
                name="motherOfficeAddress"
                multiline
                rows={3}
                label="Mother Office Address"
                value={formik.values.motherOfficeAddress}
                onChange={formik.handleChange}
                error={
                  formik.touched.motherOfficeAddress && Boolean(formik.errors.motherOfficeAddress)
                }
                helperText={formik.touched.motherOfficeAddress && formik.errors.motherOfficeAddress}
                fullWidth
                size="small"
              />
              <TextField
                name="motherDesignation"
                label="Mother Designation"
                value={formik.values.motherDesignation}
                onChange={formik.handleChange}
                error={formik.touched.motherDesignation && Boolean(formik.errors.motherDesignation)}
                helperText={formik.touched.motherDesignation && formik.errors.motherDesignation}
                fullWidth
                size="small"
              />

              <TextField
                name="motherOrganization"
                label="Mother Organization"
                value={formik.values.motherOrganization}
                onChange={formik.handleChange}
                error={
                  formik.touched.motherOrganization && Boolean(formik.errors.motherOrganization)
                }
                helperText={formik.touched.motherOrganization && formik.errors.motherOrganization}
                fullWidth
                size="small"
              />

              <TextField
                name="motherAadharNo"
                label="Mother Aadhar No."
                value={formik.values.motherAadharNo}
                onChange={formik.handleChange}
                error={formik.touched.motherAadharNo && Boolean(formik.errors.motherAadharNo)}
                helperText={formik.touched.motherAadharNo && formik.errors.motherAadharNo}
                fullWidth
                size="small"
              />

              <TextField
                name="motherRemarks"
                label="Remarks"
                multiline
                rows={3}
                value={formik.values.motherRemarks}
                onChange={formik.handleChange}
                error={formik.touched.motherRemarks && Boolean(formik.errors.motherRemarks)}
                helperText={formik.touched.motherRemarks && formik.errors.motherRemarks}
                fullWidth
                size="small"
              />

              <TextField
                name="motherAddress"
                multiline
                rows={3}
                label="Mother Address"
                value={formik.values.motherAddress}
                onChange={formik.handleChange}
                error={formik.touched.motherAddress && Boolean(formik.errors.motherAddress)}
                helperText={formik.touched.motherAddress && formik.errors.motherAddress}
                fullWidth
                size="small"
              />
            </Stack>
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Guardian Details
            </Typography>
            <Stack spacing={2}>
              <TextField
                name="guardianName"
                label="Guardian Name"
                value={formik.values.guardianName}
                onChange={formik.handleChange}
                error={formik.touched.guardianName && Boolean(formik.errors.guardianName)}
                helperText={formik.touched.guardianName && formik.errors.guardianName}
                fullWidth
                size="small"
              />
              <DatePicker
                name="guardianDob"
                label="Guardian DOB"
                value={formik.values.guardianDob}
                onChange={(value) => {
                  formik.setFieldValue('guardianDob', value);
                }}
                slotProps={{
                  textField: {
                    error: formik.touched.guardianDob && Boolean(formik.errors.guardianDob),
                    helperText: formik.touched.guardianDob && formik.errors.guardianDob,
                    fullWidth: true,
                    size: 'small',
                  },
                }}
              />
              <TextField
                name="guardianOccupation"
                label="Guardian Occupation"
                value={formik.values.guardianOccupation}
                onChange={formik.handleChange}
                error={
                  formik.touched.guardianOccupation && Boolean(formik.errors.guardianOccupation)
                }
                helperText={formik.touched.guardianOccupation && formik.errors.guardianOccupation}
                fullWidth
                size="small"
              />
              <TextField
                name="guardianQualification"
                label="Guardian Qualification"
                value={formik.values.guardianQualification}
                onChange={formik.handleChange}
                error={
                  formik.touched.guardianQualification &&
                  Boolean(formik.errors.guardianQualification)
                }
                helperText={
                  formik.touched.guardianQualification && formik.errors.guardianQualification
                }
                fullWidth
                size="small"
              />
              <PhoneInput
                name="guardianContactNo"
                value={formik.values.guardianContactNo}
                onChange={(value) => {
                  formik.setFieldValue('guardianContactNo', value);
                }}
                label="Guardian Contact No."
                placeholder="Enter Spouse Contact No."
                error={formik.touched.guardianContactNo && Boolean(formik.errors.guardianContactNo)}
              />
              <TextField
                name="guardianEmail"
                label="Guardian Email"
                value={formik.values.guardianEmail}
                onChange={formik.handleChange}
                error={formik.touched.guardianEmail && Boolean(formik.errors.guardianEmail)}
                helperText={formik.touched.guardianEmail && formik.errors.guardianEmail}
                fullWidth
                size="small"
                inputProps={{
                  startAdornment: (
                    <>
                      <Iconify icon="mdi-light:email" />{' '}
                      <Divider orientation="vertical" sx={{ pl: '4px', height: '60%' }} />{' '}
                    </>
                  ),
                }}
              />

              <TextField
                name="guardianPassOutYear"
                label="Guardian Pass out Year"
                type="number"
                value={formik.values.guardianPassOutYear}
                onChange={formik.handleChange}
                error={
                  formik.touched.guardianPassOutYear && Boolean(formik.errors.guardianPassOutYear)
                }
                helperText={formik.touched.guardianPassOutYear && formik.errors.guardianPassOutYear}
                fullWidth
                size="small"
              />

              <PhoneInput
                name="guardianOfficeNo"
                value={formik.values.guardianOfficeNo}
                onChange={(value) => {
                  formik.setFieldValue('guardianOfficeNo', value);
                }}
                label="Guardian Office No."
                placeholder="Enter Guardian Office No."
                error={formik.touched.guardianOfficeNo && Boolean(formik.errors.guardianOfficeNo)}
              />

              <TextField
                name="guardianOfficeAddress"
                multiline
                rows={3}
                label="Guardian Office Address"
                value={formik.values.guardianOfficeAddress}
                onChange={formik.handleChange}
                error={
                  formik.touched.guardianOfficeAddress &&
                  Boolean(formik.errors.guardianOfficeAddress)
                }
                helperText={
                  formik.touched.guardianOfficeAddress && formik.errors.guardianOfficeAddress
                }
                fullWidth
                size="small"
              />
              <TextField
                name="guardianDesignation"
                label="Guardian Designation"
                value={formik.values.guardianDesignation}
                onChange={formik.handleChange}
                error={
                  formik.touched.guardianDesignation && Boolean(formik.errors.guardianDesignation)
                }
                helperText={formik.touched.guardianDesignation && formik.errors.guardianDesignation}
                fullWidth
                size="small"
              />

              <TextField
                name="guardianOrganization"
                label="Guardian Organization"
                value={formik.values.guardianOrganization}
                onChange={formik.handleChange}
                error={
                  formik.touched.guardianOrganization && Boolean(formik.errors.guardianOrganization)
                }
                helperText={
                  formik.touched.guardianOrganization && formik.errors.guardianOrganization
                }
                fullWidth
                size="small"
              />

              <TextField
                name="guardianAadharNo"
                label="Guardian Aadhar No."
                value={formik.values.guardianAadharNo}
                onChange={formik.handleChange}
                error={formik.touched.guardianAadharNo && Boolean(formik.errors.guardianAadharNo)}
                helperText={formik.touched.guardianAadharNo && formik.errors.guardianAadharNo}
                fullWidth
                size="small"
              />

              <TextField
                name="guardianRemarks"
                label="Remarks"
                multiline
                rows={3}
                value={formik.values.guardianRemarks}
                onChange={formik.handleChange}
                error={formik.touched.guardianRemarks && Boolean(formik.errors.guardianRemarks)}
                helperText={formik.touched.guardianRemarks && formik.errors.guardianRemarks}
                fullWidth
                size="small"
              />

              <TextField
                name="guardianAddress"
                multiline
                rows={3}
                label="Guardian Address"
                value={formik.values.guardianAddress}
                onChange={formik.handleChange}
                error={formik.touched.guardianAddress && Boolean(formik.errors.guardianAddress)}
                helperText={formik.touched.guardianAddress && formik.errors.guardianAddress}
                fullWidth
                size="small"
                disabled={formik.values.sameAsFatherAddressForSpouse}
              />
              {/* <FormControlLabel
                control={
                  <Checkbox
                    checked={formik.values.sameAsFatherAddressForSpouse}
                    onChange={(e) => {
                      formik.setFieldValue('sameAsFatherAddressForSpouse', e.target.checked);
                      if (e.target.checked) {
                        formik.setFieldValue('spouseAddress', formik.values.fatherAddress);
                      }
                    }}
                    name="sameAsFatherAddressForSpouse"
                  />
                }
                label="Same as Father Address"
              /> */}
            </Stack>
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Sibling Details
            </Typography>
            <Autocomplete
              loading={false}
              noOptionsText="No Student Found"
              fullWidth
              value={student}
              onChange={(e, value: any) => {
                setStudent(value);
              }}
              multiple
              options={[]}
              getOptionLabel={(option: any) => option?.firstName || ''}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  label="Student"
                  placeholder="Search  Student"
                  fullWidth
                />
              )}
              renderOption={(prop: any, option: any) => (
                <li {...prop} key={option.id}>
                  {option.firstName}
                </li>
              )}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export const allFields = [
  generalFormFields,
  documentFields,
  familyFields,
  communicationFields,
  additionalDetailsFields,
  medicalFields,
  previousSchoolFields,
  bankDetailsFields,
];
