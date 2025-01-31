import type { SxProps } from '@mui/material';
import type { Theme } from '@mui/material/styles';

import { toast } from 'sonner';
import { useMemo, useState } from 'react';

import {
  Box,
  Grid,
  Stack,
  Select,
  Divider,
  Skeleton,
  MenuItem,
  Checkbox,
  TextField,
  IconButton,
  InputLabel,
  Typography,
  FormControl,
  FormHelperText,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { convertBase64Format } from 'src/utils/base64Formate';

import { DocumentType } from 'src/enums/documnet-type';
import { useGetRolesQuery } from 'src/redux/role/roleApi';
import { GenderType, GenderTypeArray } from 'src/enums/gender';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetDocumentsQuery } from 'src/redux/document/documentApi';
import { useGetOrganizationQuery } from 'src/redux/oraganization/oraganization';
import { EmployeeCastType, EmployeeCastTypeArray } from 'src/enums/employee-cast';
import { EmployeeGroupType, EmployeeGroupTypeArray } from 'src/enums/employee-group';
import { MaritalStatusType, MaritalStatusTypeArray } from 'src/enums/marriatal-status';
import { EmployeeStatusType, EmployeeStatusTypeArray } from 'src/enums/employee-status-type';
import {
  useUploadDocumentsMutation,
  useGetEmployeeDocumentsQuery,
  useGetEmployeeDocumentByIdQuery,
  useEmployeeUpdateDocumentMutation,
} from 'src/redux/employee/employeeApi';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import PhoneInput from 'src/components/phone-input';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import UploadButton from 'src/components/upload-button';
import CustomizableTable from 'src/components/customizabaleTable';

import WorkExperiences from './work-experiance';

const RenderRole = (props: any) => {
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRolesQuery,
  });
  const { formik, disabled } = props;

  return (
    <FormControl
      fullWidth
      disabled={!!disabled}
      error={!!formik.errors.role && formik.touched.role}
    >
      <InputLabel id="Roles-select-label" size="small">
        Roles
      </InputLabel>
      <Select
        labelId="Roles-select-label"
        id="Roles-select"
        value={formik.values.role}
        label="Roles"
        disabled={isLoading || !!disabled}
        name="role"
        size="small"
        onChange={formik.handleChange}
      >
        {isLoading ? (
          <MenuItem value="">
            <CircularProgress size={24} />
          </MenuItem>
        ) : data?.items?.length ? (
          data?.items?.map((org: any) => (
            <MenuItem key={org.id} value={org.id}>
              {org.name}
            </MenuItem>
          ))
        ) : (
          <MenuItem value="">
            <em>No Roles Found</em>
          </MenuItem>
        )}
      </Select>
      {formik.touched.role && formik.errors.role && (
        <FormHelperText>{formik.errors.role}</FormHelperText>
      )}
    </FormControl>
  );
};
const RenderOrganization = (props: any) => {
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetOrganizationQuery,
  });
  const { formik, disabled } = props;
  return (
    <FormControl
      fullWidth
      disabled={!!disabled}
      error={!!formik.errors.organization && formik.touched.organization}
    >
      <InputLabel id="Roles-select-label" size="small">
        Organization
      </InputLabel>
      <Select
        labelId="Roles-select-label"
        id="Roles-select"
        value={formik.values.organization}
        label="Roles"
        disabled={isLoading || !!disabled}
        name="organization"
        size="small"
        onChange={formik.handleChange}
      >
        {isLoading ? (
          <MenuItem value="">
            <CircularProgress size={24} />
          </MenuItem>
        ) : data?.items?.length ? (
          data?.items?.map((org: any) => (
            <MenuItem key={org.id} value={org.id}>
              {org.name}
            </MenuItem>
          ))
        ) : (
          <MenuItem value="">
            <em>No Organization Found</em>
          </MenuItem>
        )}
      </Select>
      {formik.touched.organization && formik.errors.organization && (
        <FormHelperText>{formik.errors.organization}</FormHelperText>
      )}
    </FormControl>
  );
};

export const RenderDocuments = (props: any) => {
  const { employeeId } = props;
  const viewDialog = useBoolean();
  const [docId, setDocId] = useState<null | string>(null);

  const [uploadDocument] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUploadDocumentsMutation,
  });

  const [updateDocument] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useEmployeeUpdateDocumentMutation,
  });

  const { data: documents, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetDocumentsQuery,
  });

  const { data: employeeDocuments, isLoading: isEmployeeDocLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeDocumentsQuery,
    params: employeeId,
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
                            employeeId,
                            body: formData,
                          })
                        : uploadDocument({ id: employeeId, body: formData }),
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
          <ViewDocuments employeeId={employeeId} docId={docId} />
        </Box>
      </CustomDialog>
    </>
  );
};

const ViewDocuments = ({ employeeId, docId }: { employeeId: string; docId: string | null }) => {
  const { data: documents, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeDocumentByIdQuery,
    params: { employeeId, documentId: docId },
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
const RenderPfRules = ({ disabled }: any) => (
  <CustomSelect
    options={[]}
    label="PF Rule"
    value=""
    onChange={() => {}}
    formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
    disabled={!!disabled}
  />
);

export interface FieldsType {
  type: string;
  label: string;
  name: string;
  placeholder?: string;
  sx?: SxProps<Theme>;
  otherProps?: Record<string, any>;
  renderComp?: (props: any) => React.ReactNode;
}

export const InformationFields: FieldsType[] = [
  {
    type: 'text',
    label: 'Last Name',
    name: 'lastName',
    placeholder: 'Enter Last Name',
  },
  {
    type: 'text',
    label: 'First Name',
    name: 'firstName',
    placeholder: 'Enter First Name',
  },
  {
    type: 'text',
    label: 'Middle Name',
    name: 'middleName',
    placeholder: 'Enter Middle Name',
  },
  {
    type: 'text',
    label: 'Short Name',
    name: 'shortName',
    placeholder: 'Enter Short Name',
  },
  {
    type: 'text',
    label: 'Status',
    name: 'employeeStatusType',
    placeholder: 'Enter Status',
    renderComp: (props) => (
      <FormControl fullWidth>
        <InputLabel id="dropdown-label" size="small" sx={{ fontSize: '12px' }}>
          Status
        </InputLabel>
        <Select
          labelId="dropdown-label"
          id="dropdown"
          value={props.formik.values.employeeStatusType}
          onChange={props.formik.handleChange}
          size="small"
          label="Status"
          name="employeeStatusType"
          sx={{ fontSize: '12px' }}
          disabled={!!props.disabled}
        >
          {EmployeeStatusTypeArray.map((i, index) => (
            <MenuItem key={i} value={index}>
              {EmployeeStatusType[index]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    ),
  },
  {
    type: 'text',
    label: 'Subject',
    name: 'subject',
    placeholder: 'Enter Subject',
    renderComp(props) {
      return (
        <CustomSelect
          options={[]}
          label="Subject"
          multiple
          onChange={(val) => props.formik.setFieldValue('subject', val)}
          value={props.formik.values.subject}
          disabled={!!props.disabled}
          formControlProps={{
            fullWidth: true,
            sx: {
              maxWidth: 'unset',
            },
          }}
        />
      );
    },
  },
  {
    type: 'date',
    label: 'DOB',
    name: 'dob',
    placeholder: 'Select Date of Birth',
  },
  {
    type: 'text',
    label: 'Family Cast',
    name: 'familyCast',
    placeholder: 'Enter Family Cast',
  },
  {
    type: 'text',
    label: 'Cast Category',
    name: 'castCategory',
    placeholder: 'Enter Cast Category',
    renderComp: (props) => (
      <FormControl
        fullWidth
        disabled={!!props.disabled}
        error={!!props.formik.errors.castType && props.formik.touched.castType}
      >
        <InputLabel id="dropdown-label" size="small" sx={{ fontSize: '12px' }}>
          Cast Category
        </InputLabel>
        <Select
          labelId="dropdown-label"
          id="dropdown"
          value={props.formik.values.castType}
          onChange={props.formik.handleChange}
          size="small"
          label="Cast Category"
          name="castType"
          sx={{ fontSize: '12px' }}
        >
          {EmployeeCastTypeArray.map((i, index) => (
            <MenuItem key={i} value={index}>
              {EmployeeCastType[index]}
            </MenuItem>
          ))}
        </Select>
        {props.formik.touched.castType && props.formik.errors.castType && (
          <FormHelperText>{props.formik.errors.castType}</FormHelperText>
        )}
      </FormControl>
    ),
  },
  {
    type: 'select',
    label: 'Gender',
    name: 'gender',
    placeholder: 'Select Gender',
    renderComp: (props) => (
      <FormControl
        fullWidth
        disabled={!!props.disabled}
        error={!!props.formik.errors.gender && props.formik.touched.gender}
      >
        <InputLabel id="dropdown-label" size="small" sx={{ fontSize: '12px' }}>
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
          sx={{ fontSize: '12px' }}
        >
          {GenderTypeArray.map((i, index) => (
            <MenuItem key={i} value={index}>
              {GenderType[index]}
            </MenuItem>
          ))}
        </Select>
        {props.formik.touched.gender && props.formik.errors.gender && (
          <FormHelperText>{props.formik.errors.gender}</FormHelperText>
        )}
      </FormControl>
    ),
  },
  {
    type: 'text',
    label: 'Religion',
    name: 'religion',
    placeholder: 'Enter Religion',
  },
  {
    type: 'text',
    label: 'Marital Status',
    name: 'maritalStatus',
    placeholder: 'Enter Marital Status',
    renderComp: (props) => (
      <FormControl
        fullWidth
        disabled={!!props.disabled}
        error={!!props.formik.errors.maritalStatus && props.formik.touched.maritalStatus}
      >
        <InputLabel id="dropdown-label" size="small" sx={{ fontSize: '12px' }}>
          Marital Status
        </InputLabel>
        <Select
          labelId="dropdown-label"
          id="dropdown"
          value={props.formik.values.maritalStatus}
          onChange={props.formik.handleChange}
          size="small"
          label="Marital Status"
          name="maritalStatus"
          sx={{ fontSize: '12px' }}
        >
          {MaritalStatusTypeArray.map((i, index) => (
            <MenuItem key={i} value={index}>
              {MaritalStatusType[index]}
            </MenuItem>
          ))}
        </Select>
        {props.formik.touched.maritalStatus && props.formik.errors.maritalStatus && (
          <FormHelperText>{props.formik.errors.maritalStatus}</FormHelperText>
        )}
      </FormControl>
    ),
  },
  {
    type: 'text',
    label: 'Blood Group',
    name: 'bloodGroup',
    placeholder: 'Enter Blood Group',
  },
  {
    type: 'text',
    label: 'Mobile No.',
    name: 'mobileNo',
    placeholder: 'Enter Mobile No.',
    renderComp(props) {
      const { formik } = props;

      return (
        <PhoneInput
          name="mobileNo"
          value={formik.values.mobileNo}
          onChange={(value) => {
            formik.setFieldValue('mobileNo', value);
          }}
          placeholder="Enter Mobile No."
          error={formik.touched.mobileNo && Boolean(formik.errors.mobileNo)}
          disabled={!!props.disabled}
          helperText={formik.touched.mobileNo && formik.errors.mobileNo}
        />
      );
    },
  },
  {
    type: 'text',
    label: 'Email',
    name: 'email',
    placeholder: 'Enter Email',
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
    type: 'text',
    label: 'Department',
    name: 'department',
    placeholder: 'Enter Department',
  },
  {
    type: 'text',
    label: 'Designation',
    name: 'designation',
    placeholder: 'Enter Designation',
  },
  {
    type: 'date',
    label: 'Date of Joining',
    name: 'dateOfJoining',
    placeholder: 'Select Date of Joining',
  },

  {
    type: 'select',
    label: 'Employee Group',
    name: 'employeeGroup',
    placeholder: 'Select Employee Group',
    renderComp: (props) => (
      <FormControl
        fullWidth
        sx={{ fontSize: '12px' }}
        disabled={!!props.disabled}
        error={!!props.formik.errors.employeeGroup && props.formik.touched.employeeGroup}
        size="small"
      >
        <InputLabel id="dropdown-label" size="small" sx={{ fontSize: '12px' }}>
          Employee Group
        </InputLabel>
        <Select
          labelId="dropdown-label"
          id="dropdown"
          value={props.formik.values.employeeGroup}
          label="Employee Group"
          name="employeeGroup"
          onChange={props.formik.handleChange}
          size="small"
          sx={{ fontSize: '12px' }}
        >
          {EmployeeGroupTypeArray.map((i, index) => (
            <MenuItem key={i} value={index}>
              {EmployeeGroupType[index]}
            </MenuItem>
          ))}
        </Select>
        {props.formik.touched.employeeGroup && props.formik.errors.employeeGroup && (
          <FormHelperText>{props.formik.errors.employeeGroup}</FormHelperText>
        )}
      </FormControl>
    ),
  },
  {
    type: 'text',
    label: 'Qualification',
    name: 'qualification',
    placeholder: 'Enter Qualification',
  },

  {
    type: 'text',
    label: 'Role',
    name: 'role',
    placeholder: 'Enter Role',
    renderComp: (props) => <RenderRole {...props} />,
  },
  {
    type: 'text',
    label: 'organization',
    name: 'organization',
    placeholder: 'Enter organization',
    renderComp: (props) => <RenderOrganization {...props} />,
  },
  {
    type: 'text',
    label: 'Identification Mark 1',
    name: 'identificationMark1',
    placeholder: 'Enter Identification Mark 1',
  },

  {
    type: 'text',
    label: 'State',
    name: 'state',
    placeholder: 'State',
  },
  {
    type: 'text',
    label: 'City',
    name: 'city',
    placeholder: 'Enter District',
  },
  {
    type: 'number',
    label: 'Pincode',
    name: 'pincode',
    placeholder: 'Enter Pincode',
  },

  {
    type: 'text',
    label: 'Address',
    name: 'address',
    placeholder: 'Enter Address',
    otherProps: {
      multiline: true,
      rows: 3,
    },
  },
];

export const FamilyFields = [
  {
    type: 'text',
    label: 'Father Name',
    name: 'fatherName',
    placeholder: 'Enter Father Name',
    renderComp(props: any) {
      return <RenderFamilyInformation {...props} />;
    },
  },
];
export const CertificateFields: FieldsType[] = [
  {
    type: 'text',
    label: 'Certificate Name',
    name: 'certificateName',
    placeholder: 'Enter Certificate Name',
    renderComp(props) {
      return <RenderDocuments employeeId={props.formik.values.employeeId} />;
    },
  },
];
export const WorkExperienceFields: FieldsType[] = [
  {
    type: '',
    label: 'Company Name',
    name: 'companyName',
    renderComp: (props) => <WorkExperiences {...props} />,
  },
];
export const PayrollFields: FieldsType[] = [
  {
    type: 'text',
    label: 'Bank Name',
    name: 'bankName',
    placeholder: 'Enter Bank Name',
  },
  {
    type: 'text',
    label: 'Branch Name',
    name: 'branchName',
    placeholder: 'Enter Branch Name',
  },
  {
    type: 'text',
    label: 'Account Holder Name',
    name: 'accountHolderName',
    placeholder: 'Enter Account Holder Name',
  },
  {
    type: 'text',
    label: 'Account Number',
    name: 'accountNumber',
    placeholder: 'Enter Account Number',
  },
  {
    type: 'text',
    label: 'IFSC Code',
    name: 'ifscCode',
    placeholder: 'Enter IFSC Code',
  },
  {
    type: 'dropdown',
    label: 'PF Type',
    name: 'pfType',
    placeholder: 'Select PF Type',
  },
  {
    type: 'dropdown',
    label: 'PF Rule',
    name: 'pfRule',
    placeholder: 'Select PF Rule',
    renderComp(props) {
      return <RenderPfRules props={props} />;
    },
  },
  {
    type: 'text',
    label: 'EPF Number',
    name: 'epfNumber',
    placeholder: 'Enter EPF Number',
  },
  {
    type: 'text',
    label: 'UAN Number',
    name: 'uanNumber',
    placeholder: 'Enter UAN Number',
  },
  {
    type: 'text',
    label: 'Basic Salary',
    name: 'basicSalary',
    placeholder: 'Enter Basic Salary',
  },
  {
    type: 'text',
    label: 'Punch Id',
    name: 'punchId',
    placeholder: 'Enter Punch Id',
  },
  {
    type: 'text',
    label: 'Shift Name',
    name: 'shiftName',
    placeholder: 'Enter Shift Name',
    renderComp(props) {
      return (
        <CustomSelect
          options={[]}
          label="Select Shift"
          onChange={() => {}}
          value=""
          disabled={!!props.disabled}
          formControlProps={{
            fullWidth: true,
            sx: {
              maxWidth: 'unset',
            },
          }}
        />
      );
    },
  },
  {
    type: 'text',
    label: 'TDS Percentage',
    name: 'tdsPercentage',
    placeholder: 'Enter TDS Percentage',
  },
  {
    type: 'text',
    label: 'TDS Amount',
    name: 'tdsAmount',
    placeholder: 'Enter TDS Amount',
  },
];

export const allFields: FieldsType[][] = [
  InformationFields,
  FamilyFields,
  CertificateFields,
  WorkExperienceFields,
  PayrollFields,
  // PerformanceAndDevelopmentFields,
];

function RenderFamilyInformation(props: any) {
  const { formik, disabled } = props;

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <Box>
            <Typography variant="subtitle1" gutterBottom mb={2}>
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
                disabled={!!disabled}
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
                disabled={!!disabled}
              />
              <PhoneInput
                name="fatherContactNo"
                value={formik.values.fatherContactNo}
                onChange={(value) => {
                  formik.setFieldValue('fatherContactNo', value);
                }}
                placeholder="Enter Father Contact No."
                error={formik.touched.fatherContactNo && Boolean(formik.errors.fatherContactNo)}
                disabled={!!disabled}
              />
              <TextField
                name="fatherState"
                label="State"
                value={formik.values.fatherState}
                onChange={formik.handleChange}
                error={formik.touched.fatherState && Boolean(formik.errors.fatherState)}
                helperText={formik.touched.fatherState && formik.errors.fatherState}
                fullWidth
                size="small"
                disabled={!!disabled}
              />
              <TextField
                name="fatherCity"
                label="City"
                value={formik.values.fatherCity}
                onChange={formik.handleChange}
                error={formik.touched.fatherCity && Boolean(formik.errors.fatherCity)}
                helperText={formik.touched.fatherCity && formik.errors.fatherCity}
                fullWidth
                size="small"
                disabled={!!disabled}
              />
              <TextField
                name="fatherPinCode"
                label="Pincode"
                value={formik.values.fatherPinCode}
                onChange={formik.handleChange}
                error={formik.touched.fatherPinCode && Boolean(formik.errors.fatherPinCode)}
                helperText={formik.touched.fatherPinCode && formik.errors.fatherPinCode}
                fullWidth
                size="small"
                disabled={!!disabled}
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
                disabled={!!disabled}
              />
            </Stack>
          </Box>
        </Grid>
        <Grid item xs={4}>
          <Box>
            <Typography variant="subtitle1" gutterBottom mb={2}>
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
                disabled={!!disabled}
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
                disabled={!!disabled}
              />
              <PhoneInput
                name="motherContactNo"
                value={formik.values.motherContactNo}
                onChange={(value) => {
                  formik.setFieldValue('motherContactNo', value);
                }}
                placeholder="Enter Mother Contact No."
                error={formik.touched.motherContactNo && Boolean(formik.errors.motherContactNo)}
                disabled={!!disabled}
              />
              <FormControlLabel
                disabled={!!disabled}
                control={
                  <Checkbox
                    checked={formik.values.sameAsFatherAddressForMother}
                    onChange={(e) => {
                      formik.setFieldValue('sameAsFatherAddressForMother', e.target.checked);
                      if (e.target.checked) {
                        formik.setFieldValue('motherAddress', formik.values.fatherAddress);
                        formik.setFieldValue('motherState', formik.values.fatherState);
                        formik.setFieldValue('motherCity', formik.values.fatherCity);
                        formik.setFieldValue('motherPincode', formik.values.fatherPincode);
                      }
                    }}
                    name="sameAsFatherAddressForMother"
                  />
                }
                label="Same as Father Address"
              />
              <TextField
                name="motherState"
                label="State"
                value={formik.values.motherState}
                onChange={formik.handleChange}
                error={formik.touched.motherState && Boolean(formik.errors.motherState)}
                helperText={formik.touched.motherState && formik.errors.motherState}
                fullWidth
                size="small"
                disabled={formik.values.sameAsFatherAddressForMother || !!disabled}
              />
              <TextField
                name="motherCity"
                label="City"
                value={formik.values.motherCity}
                onChange={formik.handleChange}
                error={formik.touched.motherCity && Boolean(formik.errors.motherCity)}
                helperText={formik.touched.motherCity && formik.errors.motherCity}
                fullWidth
                size="small"
                disabled={formik.values.sameAsFatherAddressForMother || !!disabled}
              />
              <TextField
                name="motherPinCode"
                label="PinCode"
                value={formik.values.motherPinCode}
                onChange={formik.handleChange}
                error={formik.touched.motherPinCode && Boolean(formik.errors.motherPinCode)}
                helperText={formik.touched.motherPinCode && formik.errors.motherPinCode}
                fullWidth
                size="small"
                disabled={formik.values.sameAsFatherAddressForMother || !!disabled}
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
                disabled={formik.values.sameAsFatherAddressForMother || !!disabled}
              />
            </Stack>
          </Box>
        </Grid>
        <Grid item xs={4}>
          <Box>
            <Typography variant="subtitle1" gutterBottom mb={2}>
              Spouse Details
            </Typography>
            <Stack spacing={2}>
              <TextField
                name="spouseName"
                label="Spouse Name"
                value={formik.values.spouseName}
                onChange={formik.handleChange}
                error={formik.touched.spouseName && Boolean(formik.errors.spouseName)}
                helperText={formik.touched.spouseName && formik.errors.spouseName}
                fullWidth
                size="small"
                disabled={!!disabled}
              />
              <TextField
                name="spouseOccupation"
                label="Spouse Occupation"
                value={formik.values.spouseOccupation}
                onChange={formik.handleChange}
                error={formik.touched.spouseOccupation && Boolean(formik.errors.spouseOccupation)}
                helperText={formik.touched.spouseOccupation && formik.errors.spouseOccupation}
                fullWidth
                size="small"
                disabled={!!disabled}
              />
              <PhoneInput
                name="spouseContactNo"
                value={formik.values.spouseContactNo}
                onChange={(value) => {
                  formik.setFieldValue('spouseContactNo', value);
                }}
                placeholder="Enter Spouse Contact No."
                error={formik.touched.spouseContactNo && Boolean(formik.errors.spouseContactNo)}
                disabled={!!disabled}
              />
              <FormControlLabel
                disabled={!!disabled}
                control={
                  <Checkbox
                    checked={formik.values.sameAsFatherAddressForSpouse}
                    onChange={(e) => {
                      formik.setFieldValue('sameAsFatherAddressForSpouse', e.target.checked);
                      if (e.target.checked) {
                        formik.setFieldValue('spouseAddress', formik.values.fatherAddress);
                        formik.setFieldValue('spouseState', formik.values.fatherState);
                        formik.setFieldValue('spouseCity', formik.values.fatherCity);
                        formik.setFieldValue('spousePincode', formik.values.fatherPincode);
                      }
                    }}
                    name="sameAsFatherAddressForSpouse"
                  />
                }
                label="Same as Father Address"
              />
              <TextField
                name="spouseState"
                label="State"
                value={formik.values.spouseState}
                onChange={formik.handleChange}
                error={formik.touched.spouseState && Boolean(formik.errors.spouseState)}
                helperText={formik.touched.spouseState && formik.errors.spouseState}
                fullWidth
                size="small"
                disabled={formik.values.sameAsFatherAddressForSpouse || !!disabled}
              />
              <TextField
                name="spouseCity"
                label="City"
                value={formik.values.spouseCity}
                onChange={formik.handleChange}
                error={formik.touched.spouseCity && Boolean(formik.errors.spouseCity)}
                helperText={formik.touched.spouseCity && formik.errors.spouseCity}
                fullWidth
                size="small"
                disabled={formik.values.sameAsFatherAddressForSpouse || !!disabled}
              />
              <TextField
                name="spousePinCode"
                label="Pincode"
                value={formik.values.spousePinCode}
                onChange={formik.handleChange}
                error={formik.touched.spousePinCode && Boolean(formik.errors.spousePinCode)}
                helperText={formik.touched.spousePinCode && formik.errors.spousePinCode}
                fullWidth
                size="small"
                disabled={formik.values.sameAsFatherAddressForSpouse || !!disabled}
              />

              <TextField
                name="spouseAddress"
                multiline
                rows={3}
                label="Spouse Address"
                value={formik.values.spouseAddress}
                onChange={formik.handleChange}
                error={formik.touched.spouseAddress && Boolean(formik.errors.spouseAddress)}
                helperText={formik.touched.spouseAddress && formik.errors.spouseAddress}
                fullWidth
                size="small"
                disabled={formik.values.sameAsFatherAddressForSpouse || !!disabled}
              />
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
