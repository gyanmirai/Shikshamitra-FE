import type { SxProps } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import type { LabelColor } from 'src/components/label';
import type { DocumentStatusType } from 'src/enums/document-statusType';

import { toast } from 'sonner';
import { capitalize } from 'lodash';
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
  Autocomplete,
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
import { DocumentStatusOptions, DocumentStatusTypeColors } from 'src/enums/document-statusType';
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
import UploadButton from 'src/components/upload-button';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import CityComponent from 'src/components/stardard-address/city-component';
import StateComponent from 'src/components/stardard-address/state-component';
import CountryComponent from 'src/components/stardard-address/country-component';

import WorkExperiences from './work-experiance';

const RenderRole = (props: any) => {
  // Fetch roles data using custom hook and get loading state
  // useQueryAndMutation is a wrapper around RTK Query hooks
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRolesQuery,
  });
  // Destructure formik and disabled props from component props
  const { formik, disabled } = props;

  return (
    <Autocomplete
      disabled={isLoading || !!disabled}
      options={data?.items || []}
      value={data?.items?.find((item: any) => item.id === formik.values.role) || undefined}
      getOptionLabel={(option: any) => option.name}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Roles"
          placeholder="Search Roles"
          size="small"
          fullWidth
          sx={{ width: '100%', minWidth: '200px' }}
          error={formik.touched.role && Boolean(formik.errors.role)}
          helperText={formik.touched.role && formik.errors.role}
        />
      )}
      onChange={(e, value) => {
        formik.setFieldValue('role', value?.id);
      }}
    />
  );
};
const RenderOrganization = (props: any) => {
  // Fetch organizations data using custom hook and get loading state
  // useQueryAndMutation is a wrapper around RTK Query hooks
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetOrganizationQuery,
  });
  // Destructure formik and disabled props from component props
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
  // Get employeeId from props
  const { employeeId } = props;
  // Boolean state for view dialog
  const viewDialog = useBoolean();
  // State to store document ID
  const [docId, setDocId] = useState<null | string>(null);

  // Mutation hook for uploading new documents
  const [uploadDocument] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUploadDocumentsMutation,
  });

  // Mutation hook for updating existing documents
  const [updateDocument] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useEmployeeUpdateDocumentMutation,
  });

  // Query hook to fetch all available document types
  const { data: documents, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetDocumentsQuery,
  });

  // Query hook to fetch documents specific to the employee
  const { data: employeeDocuments, isLoading: isEmployeeDocLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeDocumentsQuery,
    params: employeeId,
  });

  // Memoized table data that combines document types and employee documents
  // Maps through all documents and checks if employee has uploaded them
  const tableData = useMemo(
    () =>
      documents?.items?.map((item: any) => ({
        ...item,
        // Check if document is uploaded by comparing file names
        statusVal: employeeDocuments?.find((doc: any) => doc.fileName === item.documentName)
          ? 'Uploaded'
          : 'Not Uploaded',
        // Convert document types from enum to readable string
        docType: item.documentTypes.map((ite: number) => DocumentType[ite]).join(', '),
        // Set status color based on upload status
        statusColor: employeeDocuments?.find((doc: any) => doc.fileName === item.documentName)
          ? 'success'
          : 'warning',
        // Store the uploaded document reference if exists
        uploadDocument: employeeDocuments?.find((doc: any) => doc.fileName === item.documentName),
      })) || [],
    [documents?.items, employeeDocuments]
  );
  return (
    <>
      <CustomizableTable
        noDataText={<>No Certificate Found </>}
        searchFieldProps={{
          placeholder: 'Search by Document Type, Name, Status..',
          label: 'Search by Document Type, Name, Status...',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
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
            enumOptions: DocumentStatusOptions,
            filterType: 'enum',
            render(value, row) {
              const color = DocumentStatusTypeColors[
                row.statusVal as DocumentStatusType
              ] as LabelColor;
              return <Label color={color}>{value}</Label>;
            },
            // render(value, row) {
            //   return (
            //     <Label color={row.uploadDocument ? 'success' : 'warning'}>
            //       {row.uploadDocument ? 'Uploaded' : 'Pending'}
            //     </Label>
            //   );
            // },
          },
          {
            id: 'upload',
            label: 'Upload',
            isFilter: false,
            isSort: false,
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
            isFilter: false,
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
  // Fetch employee document by employeeId and documentId using RTK Query hook
  // Returns document data and loading state for displaying in the UI
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
  <Autocomplete
    options={[]}
    // getOptionLabel={(option) => option.name}
    renderInput={(params) => (
      <TextField
        {...params}
        label="PF Rule"
        placeholder="Search PF Rule"
        size="small"
        fullWidth
        sx={{ width: '100%', minWidth: 'unset' }}
      />
    )}
    onChange={(e, value) => {
      // formik.setFieldValue('examType', value?.id);
    }}
  />
);

export interface FieldsType {
  type: string;
  label: string;
  name: string;
  placeholder?: string;
  sx?: SxProps<Theme>;
  otherProps?: Record<string, any> | ((props: any) => Record<string, any>);
  renderComp?: (props: any) => React.ReactNode;
}

export const InformationFields: FieldsType[] = [
  {
    type: 'text',
    label: 'Last Name',
    name: 'lastName',
    placeholder: 'Enter Last Name',
    otherProps: ({ formik }: any) => ({
      onChange: (e: any) => {
        const newName = capitalize(e.target.value);
        formik.setFieldValue('lastName', newName);
      },
    }),
  },
  {
    type: 'text',
    label: 'First Name',
    name: 'firstName',
    placeholder: 'Enter First Name',
    otherProps: ({ formik }: any) => ({
      onChange: (e: any) => {
        const newName = capitalize(e.target.value);
        formik.setFieldValue('firstName', newName);
      },
    }),
  },
  {
    type: 'text',
    label: 'Middle Name',
    name: 'middleName',
    placeholder: 'Enter Middle Name',
    otherProps: ({ formik }: any) => ({
      onChange: (e: any) => {
        const newName = capitalize(e.target.value);
        formik.setFieldValue('middleName', newName);
      },
    }),
  },
  {
    type: 'text',
    label: 'Short Name',
    name: 'shortName',
    placeholder: 'Enter Short Name',
    otherProps: ({ formik }: any) => ({
      onChange: (e: any) => {
        const newName = capitalize(e.target.value);
        formik.setFieldValue('shortName', newName);
      },
    }),
  },
  {
    type: 'text',
    label: 'Status',
    name: 'employeeStatusType',
    placeholder: 'Enter Status',
    renderComp: (props) => (
      <Autocomplete
        options={EmployeeStatusTypeArray.map((item, index) => ({
          id: index,
          label: EmployeeStatusType[index],
        }))}
        value={
          EmployeeStatusTypeArray.map((_, index) => ({
            id: index,
            label: EmployeeStatusType[index],
          })).find((item) => item.id === props.formik.values.employeeStatusType) || null
        }
        getOptionLabel={(option) => option.label}
        onChange={(_, newValue) => {
          props.formik.setFieldValue('employeeStatusType', newValue?.id || '');
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Change Status"
            fullWidth
            size="small"
            sx={{ maxWidth: 'unset' }}
            error={
              props.formik.touched.employeeStatusType &&
              Boolean(props.formik.errors.employeeStatusType)
            }
            helperText={
              props.formik.touched.employeeStatusType && props.formik.errors.employeeStatusType
            }
            disabled={!!props.disabled}
          />
        )}
      />
    ),
  },
  {
    type: 'text',
    label: 'Subject',
    name: 'subject',
    placeholder: 'Enter Subject',
    renderComp(props) {
      return (
        <Autocomplete
          options={[]}
          multiple
          disabled={!!props.disabled}
          // getOptionLabel={(option) => option.name}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Subject"
              placeholder="Search Subject"
              size="small"
              fullWidth
              sx={{ width: '100%', minWidth: 'unset' }}
              error={props.formik.touched.subject && Boolean(props.formik.errors.subject)}
              helperText={props.formik.touched.subject && props.formik.errors.subject}
            />
          )}
          onChange={(e, value) => {
            props.formik.setFieldValue('subject', value);
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
    otherProps: ({ formik }: any) => ({
      onChange: (e: any) => {
        const newName = capitalize(e.target.value);
        formik.setFieldValue('familyCast', newName);
      },
    }),
  },
  {
    type: 'text',
    label: 'Cast Category',
    name: 'castType',
    placeholder: 'Enter Cast Category',
    renderComp: (props) => (
      <Autocomplete
        options={EmployeeCastTypeArray.map((item, index) => ({
          id: index,
          label: EmployeeCastType[index],
        }))}
        getOptionLabel={(option) => option.label}
        disabled={!!props.disabled}
        value={
          EmployeeCastTypeArray.map((_, index) => ({
            id: index,
            label: EmployeeCastType[index],
          })).find((item) => item.id === props.formik.values.castType) || null
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Cast Type"
            placeholder="Search Cast Type"
            size="small"
            fullWidth
            sx={{ width: '100%', minWidth: '200px' }}
            error={props.formik.touched.castType && Boolean(props.formik.errors.castType)}
            helperText={props.formik.touched.castType && props.formik.errors.castType}
          />
        )}
        onChange={(e, value) => {
          props.formik.setFieldValue('castType', value?.id);
        }}
      />
    ),
  },
  {
    type: 'select',
    label: 'Gender',
    name: 'gender',
    placeholder: 'Select Gender',
    renderComp: (props) => (
      <Autocomplete
        options={GenderTypeArray.map((item, index) => ({
          id: index,
          label: GenderType[index],
        }))}
        getOptionLabel={(option) => option.label}
        value={GenderTypeArray.map((_, index) => ({
          id: index,
          label: GenderType[index],
        })).find((item) => item.id === props.formik.values.gender)}
        disabled={!!props.disabled}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Gender"
            placeholder="Search Gender"
            size="small"
            fullWidth
            sx={{ width: '100%', minWidth: '200px' }}
            error={props.formik.touched.gender && Boolean(props.formik.errors.gender)}
            helperText={props.formik.touched.gender && props.formik.errors.gender}
          />
        )}
        onChange={(e, value) => {
          props.formik.setFieldValue('gender', value?.id);
        }}
      />
    ),
  },
  {
    type: 'text',
    label: 'Religion',
    name: 'religion',
    placeholder: 'Enter Religion',
    otherProps: ({ formik }: any) => ({
      onChange: (e: any) => {
        const newName = capitalize(e.target.value);
        formik.setFieldValue('religion', newName);
      },
    }),
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
    otherProps: ({ formik }: any) => ({
      onChange: (e: any) => {
        const newName = capitalize(e.target.value);
        formik.setFieldValue('department', newName);
      },
    }),
  },
  {
    type: 'text',
    label: 'Designation',
    name: 'designation',
    placeholder: 'Enter Designation',
    otherProps: ({ formik }: any) => ({
      onChange: (e: any) => {
        const newName = capitalize(e.target.value);
        formik.setFieldValue('designation', newName);
      },
    }),
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
      <Autocomplete
        options={EmployeeGroupTypeArray.map((item, index) => ({
          id: index,
          label: EmployeeGroupType[index],
        }))}
        getOptionLabel={(option) => option.label}
        disabled={!!props.disabled}
        value={
          EmployeeGroupTypeArray.map((_, index) => ({
            id: index,
            label: EmployeeGroupType[index],
          })).find((item) => item.id === props.formik.values.employeeGroup) || null
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Employee Group"
            placeholder="Search Employee Group"
            size="small"
            fullWidth
            sx={{ width: '100%', minWidth: '200px' }}
            error={props.formik.touched.employeeGroup && Boolean(props.formik.errors.employeeGroup)}
            helperText={props.formik.touched.employeeGroup && props.formik.errors.employeeGroup}
          />
        )}
        onChange={(e, value) => {
          props.formik.setFieldValue('employeeGroup', value?.id);
        }}
      />
    ),
  },
  {
    type: 'text',
    label: 'Qualification',
    name: 'qualification',
    placeholder: 'Enter Qualification',
    otherProps: ({ formik }: any) => ({
      onChange: (e: any) => {
        const newName = capitalize(e.target.value);
        formik.setFieldValue('qualification', newName);
      },
    }),
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
    name: 'country',
    label: 'Country',
    type: 'text',
    otherProps: {},
    renderComp(props: any) {
      const { formik } = props;
      return (
        <CountryComponent
          onChange={(_e: any, value: any) => {
            formik.setFieldValue('state', null);

            formik.setFieldValue('country', value);
          }}
          value={formik.values.country}
          disabled={!!props.disabled}
        />
      );
    },
  },
  {
    name: 'state',
    label: 'State',
    type: 'text',
    otherProps: {},
    renderComp(props: any) {
      const { formik } = props;
      return (
        <StateComponent
          onChange={(_e: any, value: any) => {
            formik.setFieldValue('state', value);
            formik.setFieldValue('city', null);
          }}
          value={formik.values.state}
          countryValue={formik.values.country}
          disabled={!!props.disabled}
        />
      );
    },
  },
  {
    name: 'city',
    label: 'City',
    type: 'text',
    otherProps: {},
    renderComp(props: any) {
      const { formik } = props;
      return (
        <CityComponent
          value={formik.values.city}
          onChange={(_e: any, value: any) => formik.setFieldValue('city', value)}
          stateValue={formik.values.state}
          disabled={!!props.disabled}
        />
      );
    },
  },
  {
    type: 'number',
    label: 'Pincode',
    name: 'pincode',
    placeholder: 'Enter Pincode',
  },
  {
    type: 'text',
    label: 'Address Line 1',
    name: 'addressLine1',
    placeholder: 'Address Line 1',
    otherProps: {
      multiline: true,
      rows: 3,
    },
  },
  {
    type: 'text',
    label: 'Address Line 2',
    name: 'addressLine2',
    placeholder: 'Address Line 2',
    otherProps: {
      multiline: true,
      rows: 3,
    },
  },
  {
    type: 'text',
    label: 'Address Line 3',
    name: 'addressLine3',
    placeholder: 'Address Line 3',
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
    type: 'number',
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
        <Autocomplete
          options={[]}
          disabled={!!props.disabled}
          // getOptionLabel={(option) => option.name}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Shift"
              placeholder="Search Select Shift"
              size="small"
              fullWidth
              sx={{ width: '100%', minWidth: 'unset' }}
            />
          )}
          onChange={(e, value) => {
            // formik.setFieldValue('examType', value?.id);
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

function FatherAddressComponent(props: any) {
  const { formik, disabled } = props;

  return (
    <Stack spacing={2}>
      <CountryComponent
        value={formik.values.fatherCountry}
        onChange={(_e: any, value: any) => {
          formik.setFieldValue('fatherState', null);
          formik.setFieldValue('fatherCountry', value);
        }}
        error={formik.touched.fatherCountry && Boolean(formik.errors.fatherCountry)}
        helperText={formik.touched.fatherCountry && formik.errors.fatherCountry}
      />
      {/* <RenderCountry
        onChange={(_e: any, value: any) => {
          formik.setFieldValue('fatherState', null);
          formik.setFieldValue('fatherCountry', value);
        }}
      /> */}
      <StateComponent
        value={formik.values.fatherState}
        countryValue={formik.values.fatherCountry}
        onChange={(_e: any, value: any) => {
          formik.setFieldValue('fatherState', value);
          formik.setFieldValue('fatherCity', null);
        }}
        error={formik.touched.fatherState && Boolean(formik.errors.fatherState)}
        helperText={formik.touched.fatherState && formik.errors.fatherState}
      />
      {/* <RenderState
        onChange={(_e: any, value: any) => {
          formik.setFieldValue('fatherState', value);
          formik.setFieldValue('fatherCity', null);
        }}
      />{' '} */}
      <CityComponent
        value={formik.values.fatherCity}
        onChange={(_e: any, value: any) => {
          formik.setFieldValue('fatherCity', value);
        }}
        stateValue={formik.values.fatherState}
        error={formik.touched.fatherCity && Boolean(formik.errors.fatherCity)}
        helperText={formik.touched.fatherCity && formik.errors.fatherCity}
      />

      <ShakingTextField
        error={formik.touched.fatherPinCode && Boolean(formik.errors.fatherPinCode)}
      >
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
      </ShakingTextField>
      <ShakingTextField
        error={formik.touched.fatherAddress1 && Boolean(formik.errors.fatherAddress1)}
      >
        <TextField
          name="fatherAddress1"
          multiline
          rows={3}
          label="Father Address 1"
          value={formik.values.fatherAddress1}
          onChange={formik.handleChange}
          error={formik.touched.fatherAddress1 && Boolean(formik.errors.fatherAddress1)}
          helperText={formik.touched.fatherAddress1 && formik.errors.fatherAddress1}
          fullWidth
          size="small"
          disabled={!!disabled}
        />
      </ShakingTextField>
      <ShakingTextField
        error={formik.touched.fatherAddress2 && Boolean(formik.errors.fatherAddress2)}
      >
        <TextField
          name="fatherAddress2"
          multiline
          rows={3}
          label="Father Address 2"
          value={formik.values.fatherAddress2}
          onChange={formik.handleChange}
          error={formik.touched.fatherAddress2 && Boolean(formik.errors.fatherAddress2)}
          helperText={formik.touched.fatherAddress2 && formik.errors.fatherAddress2}
          fullWidth
          size="small"
          disabled={!!disabled}
        />
      </ShakingTextField>
      <ShakingTextField
        error={formik.touched.fatherAddress3 && Boolean(formik.errors.fatherAddress3)}
      >
        <TextField
          name="fatherAddress3"
          multiline
          rows={3}
          label="Father Address 3"
          value={formik.values.fatherAddress3}
          onChange={formik.handleChange}
          error={formik.touched.fatherAddress3 && Boolean(formik.errors.fatherAddress3)}
          helperText={formik.touched.fatherAddress3 && formik.errors.fatherAddress3}
          fullWidth
          size="small"
          disabled={!!disabled}
        />
      </ShakingTextField>
    </Stack>
  );
}

function MotherAddressComponent(props: any) {
  const { formik, disabled } = props;

  return (
    <Stack spacing={2}>
      <FormControlLabel
        disabled={!!disabled}
        control={
          <Checkbox
            checked={formik.values.sameAsFatherAddressForMother}
            onChange={(e) => {
              formik.setFieldValue('sameAsFatherAddressForMother', e.target.checked);
              if (e.target.checked) {
                formik.setFieldValue('motherAddress1', formik.values.fatherAddress1);
                formik.setFieldValue('motherAddress2', formik.values.fatherAddress2);
                formik.setFieldValue('motherAddress3', formik.values.fatherAddress3);
                formik.setFieldValue('motherCountry', formik.values.fatherCountry);
                formik.setFieldValue('motherState', formik.values.fatherState);
                formik.setFieldValue('motherCity', formik.values.fatherCity);
                formik.setFieldValue('motherPinCode', formik.values.fatherPinCode);
              }
            }}
            name="sameAsFatherAddressForMother"
          />
        }
        label="Same as Father Address"
      />
      <CountryComponent
        value={formik.values.motherCountry}
        onChange={(_e: any, value: any) => {
          formik.setFieldValue('motherState', null);
          formik.setFieldValue('motherCountry', value);
        }}
        error={formik.touched.motherCountry && Boolean(formik.errors.motherCountry)}
        helperText={formik.touched.motherCountry && formik.errors.motherCountry}
      />
      {/* <RenderCountry
        // value={formik.values.motherCountry}
        onChange={(_e: any, value: any) => {
          formik.setFieldValue('motherState', null);
          formik.setFieldValue('motherCountry', value);
        }}
      /> */}

      <StateComponent
        onChange={(_e: any, value: any) => {
          formik.setFieldValue('motherState', value);
          formik.setFieldValue('motherCity', null);
        }}
        value={formik.values.motherState}
        countryValue={formik.values.motherCountry}
        error={formik.touched.motherState && Boolean(formik.errors.motherState)}
        helperText={formik.touched.motherState && formik.errors.motherState}
      />

      {/* <RenderState
        onChange={(_e: any, value: any) => {
          formik.setFieldValue('motherState', value);
          formik.setFieldValue('motherCity', null);
        }}

        
      /> */}
      <CityComponent
        onChange={(_e: any, value: any) => {
          formik.setFieldValue('motherCity', value);
        }}
        value={formik.values.motherCity}
        stateValue={formik.values.motherState}
        error={formik.touched.motherCity && Boolean(formik.errors.motherCity)}
        helperText={formik.touched.motherCity && formik.errors.motherCity}
      />
      <ShakingTextField
        error={formik.touched.motherPinCode && Boolean(formik.errors.motherPinCode)}
      >
        <TextField
          name="motherPinCode"
          label="Pincode"
          value={formik.values.motherPinCode}
          onChange={formik.handleChange}
          error={formik.touched.motherPinCode && Boolean(formik.errors.motherPinCode)}
          helperText={formik.touched.motherPinCode && formik.errors.motherPinCode}
          fullWidth
          size="small"
          disabled={!!disabled}
        />
      </ShakingTextField>
      <ShakingTextField
        error={formik.touched.motherAddress1 && Boolean(formik.errors.motherAddress1)}
      >
        <TextField
          name="motherAddress1"
          multiline
          rows={3}
          label="Mother Address 1"
          value={formik.values.motherAddress1}
          onChange={formik.handleChange}
          error={formik.touched.motherAddress1 && Boolean(formik.errors.motherAddress1)}
          helperText={formik.touched.motherAddress1 && formik.errors.motherAddress1}
          fullWidth
          size="small"
          disabled={!!disabled}
        />
      </ShakingTextField>
      <ShakingTextField
        error={formik.touched.motherAddress2 && Boolean(formik.errors.motherAddress2)}
      >
        <TextField
          name="motherAddress2"
          multiline
          rows={3}
          label="Mother Address 2"
          value={formik.values.motherAddress2}
          onChange={formik.handleChange}
          error={formik.touched.motherAddress2 && Boolean(formik.errors.motherAddress2)}
          helperText={formik.touched.motherAddress2 && formik.errors.motherAddress2}
          fullWidth
          size="small"
          disabled={!!disabled}
        />
      </ShakingTextField>
      <ShakingTextField
        error={formik.touched.motherAddress3 && Boolean(formik.errors.motherAddress3)}
      >
        <TextField
          name="motherAddress3"
          multiline
          rows={3}
          label="Mother Address 3"
          value={formik.values.motherAddress3}
          onChange={formik.handleChange}
          error={formik.touched.motherAddress3 && Boolean(formik.errors.motherAddress3)}
          helperText={formik.touched.motherAddress3 && formik.errors.motherAddress3}
          fullWidth
          size="small"
          disabled={!!disabled}
        />
      </ShakingTextField>
    </Stack>
  );
}

function SpouseAddressComponent(props: any) {
  const { formik, disabled } = props;

  return (
    <Stack spacing={2}>
      <FormControlLabel
        disabled={!!disabled}
        control={
          <Checkbox
            checked={formik.values.sameAsFatherAddressForSpouse}
            onChange={(e) => {
              formik.setFieldValue('sameAsFatherAddressForSpouse', e.target.checked);
              if (e.target.checked) {
                formik.setFieldValue('spouseAddress1', formik.values.fatherAddress1);
                formik.setFieldValue('spouseAddress2', formik.values.fatherAddress2);
                formik.setFieldValue('spouseAddress3', formik.values.fatherAddress3);
                formik.setFieldValue('spouseCountry', formik.values.fatherCountry);
                formik.setFieldValue('spouseState', formik.values.fatherState);
                formik.setFieldValue('spouseCity', formik.values.fatherCity);
                formik.setFieldValue('spousePinCode', formik.values.fatherPinCode);
              }
            }}
            name="sameAsFatherAddressForSpouse"
          />
        }
        label="Same as Father Address"
      />
      <CountryComponent
        value={formik.values.spouseCountry}
        onChange={(_e: any, value: any) => {
          formik.setFieldValue('spouseState', null);
          formik.setFieldValue('spouseCountry', value);
        }}
        error={formik.touched.spouseCountry && Boolean(formik.errors.spouseCountry)}
        helperText={formik.touched.spouseCountry && formik.errors.spouseCountry}
      />
      {/* <RenderCountry
        onChange={(_e: any, value: any) => {
          formik.setFieldValue('spouseState', null);
          formik.setFieldValue('spouseCountry', value);
        }}
      /> */}
      <StateComponent
        onChange={(_e: any, value: any) => {
          formik.setFieldValue('spouseState', value);
          formik.setFieldValue('spouseCity', null);
        }}
        value={formik.values.spouseState}
        countryValue={formik.values.spouseCountry}
        error={formik.touched.spouseState && Boolean(formik.errors.spouseState)}
        helperText={formik.touched.spouseState && formik.errors.spouseState}
      />
      {/* <RenderState
        onChange={(_e: any, value: any) => {
          formik.setFieldValue('spouseState', value);
          formik.setFieldValue('spouseCity', null);
        }}
      /> */}

      <CityComponent
        onChange={(_e: any, value: any) => {
          formik.setFieldValue('spouseCity', value);
        }}
        value={formik.values.spouseCity}
        stateValue={formik.values.spouseState}
        error={formik.touched.spouseCity && Boolean(formik.errors.spouseCity)}
        helperText={formik.touched.spouseCity && formik.errors.spouseCity}
      />
      <ShakingTextField
        error={formik.touched.spousePinCode && Boolean(formik.errors.spousePinCode)}
      >
        <TextField
          name="spousePinCode"
          label="Pincode"
          value={formik.values.spousePinCode}
          onChange={formik.handleChange}
          error={formik.touched.spousePinCode && Boolean(formik.errors.spousePinCode)}
          helperText={formik.touched.spousePinCode && formik.errors.spousePinCode}
          fullWidth
          size="small"
          disabled={!!disabled}
        />
      </ShakingTextField>
      <ShakingTextField
        error={formik.touched.spouseAddress1 && Boolean(formik.errors.spouseAddress1)}
      >
        <TextField
          name="spouseAddress1"
          multiline
          rows={3}
          label="Spouse Address 1"
          value={formik.values.spouseAddress1}
          onChange={formik.handleChange}
          error={formik.touched.spouseAddress1 && Boolean(formik.errors.spouseAddress1)}
          helperText={formik.touched.spouseAddress1 && formik.errors.spouseAddress1}
          fullWidth
          size="small"
          disabled={!!disabled}
        />
      </ShakingTextField>
      <ShakingTextField
        error={formik.touched.spouseAddress2 && Boolean(formik.errors.spouseAddress2)}
      >
        <TextField
          name="spouseAddress2"
          multiline
          rows={3}
          label="Spouse Address 2"
          value={formik.values.spouseAddress2}
          onChange={formik.handleChange}
          error={formik.touched.spouseAddress2 && Boolean(formik.errors.spouseAddress2)}
          helperText={formik.touched.spouseAddress2 && formik.errors.spouseAddress2}
          fullWidth
          size="small"
          disabled={!!disabled}
        />
      </ShakingTextField>
      <ShakingTextField
        error={formik.touched.spouseAddress3 && Boolean(formik.errors.spouseAddress3)}
      >
        <TextField
          name="spouseAddress3"
          multiline
          rows={3}
          label="Spouse Address 3"
          value={formik.values.spouseAddress3}
          onChange={formik.handleChange}
          error={formik.touched.spouseAddress3 && Boolean(formik.errors.spouseAddress3)}
          helperText={formik.touched.spouseAddress3 && formik.errors.spouseAddress3}
          fullWidth
          size="small"
          disabled={!!disabled}
        />
      </ShakingTextField>
    </Stack>
  );
}

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
              <ShakingTextField
                error={formik.touched.fatherName && Boolean(formik.errors.fatherName)}
              >
                <TextField
                  name="fatherName"
                  label="Father Name"
                  value={formik.values.fatherName}
                  onChange={(e) => {
                    const value = capitalize(e.target.value);
                    formik.setFieldValue('fatherName', value);
                  }}
                  error={formik.touched.fatherName && Boolean(formik.errors.fatherName)}
                  helperText={formik.touched.fatherName && formik.errors.fatherName}
                  fullWidth
                  size="small"
                  disabled={!!disabled}
                />
              </ShakingTextField>

              <TextField
                name="fatherOccupation"
                label="Father Occupation"
                value={formik.values.fatherOccupation}
                onChange={(e) => {
                  const value = capitalize(e.target.value);
                  formik.setFieldValue('fatherOccupation', value);
                }}
                error={formik.touched.fatherOccupation && Boolean(formik.errors.fatherOccupation)}
                helperText={formik.touched.fatherOccupation && formik.errors.fatherOccupation}
                fullWidth
                size="small"
                disabled={!!disabled}
              />
              <ShakingTextField
                error={formik.touched.fatherContactNo && Boolean(formik.errors.fatherContactNo)}
              >
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
              </ShakingTextField>

              <FatherAddressComponent formik={formik} disabled={disabled} />
            </Stack>
          </Box>
        </Grid>
        <Grid item xs={4}>
          <Box>
            <Typography variant="subtitle1" gutterBottom mb={2}>
              Mother Details
            </Typography>
            <Stack spacing={2}>
              <ShakingTextField
                error={formik.touched.motherName && Boolean(formik.errors.motherName)}
              >
                <TextField
                  name="motherName"
                  label="Mother Name"
                  value={formik.values.motherName}
                  onChange={(e) => {
                    const value = capitalize(e.target.value);
                    formik.setFieldValue('motherName', value);
                  }}
                  error={formik.touched.motherName && Boolean(formik.errors.motherName)}
                  helperText={formik.touched.motherName && formik.errors.motherName}
                  fullWidth
                  size="small"
                  disabled={!!disabled}
                />
              </ShakingTextField>
              <TextField
                name="motherOccupation"
                label="Mother Occupation"
                value={formik.values.motherOccupation}
                onChange={(e) => {
                  const value = capitalize(e.target.value);
                  formik.setFieldValue('motherOccupation', value);
                }}
                error={formik.touched.motherOccupation && Boolean(formik.errors.motherOccupation)}
                helperText={formik.touched.motherOccupation && formik.errors.motherOccupation}
                fullWidth
                size="small"
                disabled={!!disabled}
              />
              <ShakingTextField
                error={formik.touched.motherContactNo && Boolean(formik.errors.motherContactNo)}
              >
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
              </ShakingTextField>

              <MotherAddressComponent formik={formik} disabled={disabled} />
            </Stack>
          </Box>
        </Grid>
        <Grid item xs={4}>
          <Box>
            <Typography variant="subtitle1" gutterBottom mb={2}>
              Spouse Details
            </Typography>
            <Stack spacing={2}>
              <ShakingTextField
                error={formik.touched.spouseName && Boolean(formik.errors.spouseName)}
              >
                <TextField
                  name="spouseName"
                  label="Spouse Name"
                  value={formik.values.spouseName}
                  onChange={(e) => {
                    const value = capitalize(e.target.value);
                    formik.setFieldValue('spouseName', value);
                  }}
                  error={formik.touched.spouseName && Boolean(formik.errors.spouseName)}
                  helperText={formik.touched.spouseName && formik.errors.spouseName}
                  fullWidth
                  size="small"
                  disabled={!!disabled}
                />
              </ShakingTextField>
              <TextField
                name="spouseOccupation"
                label="Spouse Occupation"
                value={formik.values.spouseOccupation}
                onChange={(e) => {
                  const value = capitalize(e.target.value);
                  formik.setFieldValue('spouseOccupation', value);
                }}
                error={formik.touched.spouseOccupation && Boolean(formik.errors.spouseOccupation)}
                helperText={formik.touched.spouseOccupation && formik.errors.spouseOccupation}
                fullWidth
                size="small"
                disabled={!!disabled}
              />
              <ShakingTextField
                error={formik.touched.spouseContactNo && Boolean(formik.errors.spouseContactNo)}
              >
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
              </ShakingTextField>
              <SpouseAddressComponent formik={formik} disabled={disabled} />
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
