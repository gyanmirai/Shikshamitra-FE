import type { Board } from 'src/types/school';
import type { RootState } from 'src/redux/store';
import type { SxProps, GridProps } from '@mui/material';

import dayjs from 'dayjs';
import { toast } from 'sonner';
import { capitalize } from 'lodash';
import { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Stack,
  Select,
  Button,
  Divider,
  Tooltip,
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
  FormHelperText,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';
import calculateAge from 'src/utils/calculate-age';
import { convertBase64Format } from 'src/utils/base64Formate';

import { YesNoArray } from 'src/enums/yes-no';
import { DocumentType } from 'src/enums/documnet-type';
import { useGetYearQuery } from 'src/redux/year/yearApi';
import { useGetAllStudentsQuery } from 'src/redux/student';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import { GenderType, GenderTypeArray } from 'src/enums/gender';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Category, CategoryArray } from 'src/enums/studnet-category';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetClassByOrganizationIdQuery } from 'src/redux/class/classApi';
import { EmployeeCastType, EmployeeCastTypeArray } from 'src/enums/employee-cast';
import { useGetStudentDocumentTypeQuery } from 'src/redux/student/document-type/document-type-api';
import { useGetInquiryPreferenceQuery } from 'src/redux/student/inquiry-preference/inquiry-preference-api';
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
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import CityComponent from 'src/components/stardard-address/city-component';
import StateComponent from 'src/components/stardard-address/state-component';
import CountryComponent from 'src/components/stardard-address/country-component';

import { DocumentForm } from '../setting/document-type';
import { InquiryPreferenceForm } from '../setting/inquiryPreference';

import type { IInquiryData } from '../Inquiry';

export interface FieldsType {
  type: string;
  label: string;
  name: string;
  placeholder?: string;
  sx?: SxProps;
  otherProps?: Record<string, any> | ((props: any) => Record<string, any>);
  renderComp?: (props: any) => React.ReactNode;
  gridProps?: GridProps;
}
export const RenderDocuments = (props: any) => {
  // Get the student ID from props
  const { id } = props;
  // Dialog state for viewing documents
  const viewDialog = useBoolean();
  // State to store the selected document ID
  const [docId, setDocId] = useState<null | string>(null);

  // Dialog state for adding documents
  const addDocumentDialog = useBoolean();
  // Mutation hook for uploading new documents
  const [uploadDocument] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUploadDocumentsMutation,
  });

  // Mutation hook for updating existing documents
  const [updateDocument] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useStudentUpdateDocumentMutation,
  });

  // Query hook to fetch all document types
  const { data: documents, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentDocumentTypeQuery,
  });

  // Query hook to fetch student's uploaded documents using student ID
  const { data: employeeDocuments, isLoading: isEmployeeDocLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentDocumentsQuery,
    params: id,
  });

  // Memoized table data that combines document types with uploaded documents status
  const tableData = useMemo(
    () =>
      documents?.items?.map((item: any) => ({
        ...item,
        // Check if document is uploaded by comparing file names
        statusVal: employeeDocuments?.find((doc: any) => doc.fileName === item.documentName)
          ? 'Uploaded'
          : 'Not Uploaded',
        // Convert document type enum to readable string
        docType: item.documentTypes.map((ite: number) => DocumentType[ite]).join(', '),
        // Set status color based on document upload status
        statusColor: employeeDocuments?.find((doc: any) => doc.fileName === item.documentName)
          ? 'success'
          : 'warning',
        // Store the uploaded document details if found
        uploadDocument: employeeDocuments?.find((doc: any) => doc.fileName === item.documentName),
      })) || [],
    [documents?.items, employeeDocuments]
  );

  // Get the isChanges state from the Redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // Get the dispatch function from the Redux store
  const dispatch = useDispatch();

  // Reset form and close dialog
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      addDocumentDialog.onFalse();
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      addDocumentDialog.onFalse();
    }
  };
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Button
          size="small"
          variant="contained"
          startIcon={<Iconify icon={GlobalIcons.addIcon} />}
          onClick={() => {
            addDocumentDialog.onTrue();
          }}
        >
          Add Document
        </Button>
      </Box>
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

      <CustomDialog
        open={addDocumentDialog.value}
        handleClose={addDocumentDialog.onFalse}
        title={
          <Box display="flex" flexDirection="row" gap={2} alignItems="center">
            <Typography variant="h5">Document</Typography>
            <Tooltip
              arrow
              placement="right"
              title="This is the Document dialog, where you can add the required documents for registration along with their document types. By tapping the switch, you can mark a document as required or optional."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </Tooltip>
          </Box>
        }
      >
        <DocumentForm handleClose={handleClose} editData={null} />
      </CustomDialog>
    </>
  );
};

const ViewDocuments = ({ id, docId }: { id: string; docId: string | null }) => {
  // Fetch student document data using the provided student ID and document ID
  // Returns document content and loading state for rendering
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
  // Destructure formik and isEdit from props
  const { formik, isEdit } = props;
  // Destructure form handling values and methods from formik
  const { values, setFieldValue, touched, errors } = formik;
  // Fetch academic year data using custom hook, returns data and loading state
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
      disabled={!isEdit}
      onChange={(value) => setFieldValue('academicYear', value)}
      error={!!(touched.academicYear && errors.academicYear) || false}
      helperText={(touched.academicYear && errors.academicYear) || ''}
      formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
    />
  );
};

const RenderBoard = (props: any) => {
  // Destructure formik from props
  const { formik } = props;
  // Destructure form handling values and methods from formik
  const { values, setFieldValue, touched, errors } = formik;
  // Fetch board data using custom hook, returns data and loading state
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
  // Destructure formik from props
  const { formik } = props;
  // Destructure form handling values and methods from formik
  const { values, setFieldValue, touched, errors } = formik;
  // Fetch board data using custom hook, returns data and loading state
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

const RenderLocalAddressFields = (props: any) => {
  const { formik, isEdit } = props;

  return (
    <Box>
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
            <TextField
              name="localAddressLine1"
              label="Address Line 1"
              disabled={!isEdit}
              value={formik.values.localAddressLine1}
              onChange={formik.handleChange}
              error={formik.touched.localAddressLine1 && Boolean(formik.errors.localAddressLine1)}
              helperText={formik.touched.localAddressLine1 && formik.errors.localAddressLine1}
              fullWidth
              placeholder="Address Line 1"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              disabled={!isEdit}
              name="localAddressLine2"
              label="Address Line 2"
              value={formik.values.localAddressLine2}
              onChange={formik.handleChange}
              error={formik.touched.localAddressLine2 && Boolean(formik.errors.localAddressLine2)}
              helperText={formik.touched.localAddressLine2 && formik.errors.localAddressLine2}
              fullWidth
              placeholder="Address Line 2"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              disabled={!isEdit}
              name="localAddressLine3"
              label="Address Line 3"
              value={formik.values.localAddressLine3}
              onChange={formik.handleChange}
              error={formik.touched.localAddressLine3 && Boolean(formik.errors.localAddressLine3)}
              helperText={formik.touched.localAddressLine3 && formik.errors.localAddressLine3}
              fullWidth
              placeholder="Address Line 3"
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <CountryComponent
              value={formik.values.localCountry}
              onChange={(_e, value) => {
                formik.setFieldValue('localState', null);
                formik.setFieldValue('localCountry', value);
              }}
              // error={formik.touched.localCountry && Boolean(formik.errors.localCountry)}
              // helperText={formik.touched.localCountry && formik.errors.localCountry}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StateComponent
              value={formik.values.localState}
              onChange={(_e, value) => {
                formik.setFieldValue('localCity', null);
                formik.setFieldValue('localState', value);
              }}
              // error={formik.touched.localState && Boolean(formik.errors.localState)}
              // helperText={formik.touched.localState && formik.errors.localState}
              countryValue={formik.values.localCountry}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CityComponent
              value={formik.values.localCity}
              onChange={(_e, value) => formik.setFieldValue('localCity', value)}
              // error={formik.touched.localCity && Boolean(formik.errors.localCity)}
              // helperText={formik.touched.localCity && formik.errors.localCity}
              stateValue={formik.values.localState}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              disabled={!isEdit}
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
    </Box>
  );
};

const RenderPermanentAddressFields = (props: any) => {
  const { formik, isEdit } = props;
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
          disabled={!isEdit}
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
            <TextField
              disabled={!isEdit}
              name="permanentAddressLine1"
              label="Address Line 1"
              value={formik.values.permanentAddressLine1}
              onChange={formik.handleChange}
              error={
                formik.touched.permanentAddressLine1 && Boolean(formik.errors.permanentAddressLine1)
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
            <TextField
              disabled={!isEdit}
              name="permanentAddressLine2"
              label="Address Line 2"
              value={formik.values.permanentAddressLine2}
              onChange={formik.handleChange}
              error={
                formik.touched.permanentAddressLine2 && Boolean(formik.errors.permanentAddressLine2)
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
            <TextField
              disabled={!isEdit}
              name="permanentAddressLine3"
              label="Address Line 3"
              value={formik.values.permanentAddressLine3}
              onChange={formik.handleChange}
              error={
                formik.touched.permanentAddressLine3 && Boolean(formik.errors.permanentAddressLine3)
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
            <CountryComponent
              value={formik.values.permanentCountry}
              onChange={(_e, value) => {
                formik.setFieldValue('permanentState', null);
                formik.setFieldValue('permanentCountry', value);
              }}
              error={formik.touched.permanentCountry && Boolean(formik.errors.permanentCountry)}
              helperText={formik.touched.permanentCountry && formik.errors.permanentCountry}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StateComponent
              value={formik.values.permanentState}
              onChange={(_e, value) => {
                formik.setFieldValue('permanentCity', null);
                formik.setFieldValue('permanentState', value);
              }}
              error={formik.touched.permanentState && Boolean(formik.errors.permanentState)}
              helperText={formik.touched.permanentState && formik.errors.permanentState}
              countryValue={formik.values.permanentCountry}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CityComponent
              value={formik.values.permanentCity}
              onChange={(_e, value) => formik.setFieldValue('permanentCity', value)}
              error={formik.touched.permanentCity && Boolean(formik.errors.permanentCity)}
              helperText={formik.touched.permanentCity && formik.errors.permanentCity}
              stateValue={formik.values.permanentState}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="permanentPincode"
              disabled={!isEdit}
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
};

const RenderEmergencyAddressFields = (props: any) => {
  const { formik, isEdit } = props;

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
          disabled={!isEdit}
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
            <TextField
              disabled={!isEdit}
              name="emergencyAddressLine1"
              label="Address Line 1"
              value={formik.values.emergencyAddressLine1}
              onChange={formik.handleChange}
              error={
                formik.touched.emergencyAddressLine1 && Boolean(formik.errors.emergencyAddressLine1)
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
            <TextField
              disabled={!isEdit}
              name="emergencyAddressLine2"
              label="Address Line 2"
              value={formik.values.emergencyAddressLine2}
              onChange={formik.handleChange}
              error={
                formik.touched.emergencyAddressLine2 && Boolean(formik.errors.emergencyAddressLine2)
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
            <TextField
              disabled={!isEdit}
              name="emergencyAddressLine3"
              label="Address Line 3"
              value={formik.values.emergencyAddressLine3}
              onChange={formik.handleChange}
              error={
                formik.touched.emergencyAddressLine3 && Boolean(formik.errors.emergencyAddressLine3)
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
            <CountryComponent
              value={formik.values.emergencyCountry}
              onChange={(_e, value) => {
                formik.setFieldValue('emergencyState', null);
                formik.setFieldValue('emergencyCountry', value);
              }}
              error={formik.touched.emergencyCountry && Boolean(formik.errors.emergencyCountry)}
              helperText={formik.touched.emergencyCountry && formik.errors.emergencyCountry}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StateComponent
              value={formik.values.emergencyState}
              onChange={(_e, value) => {
                formik.setFieldValue('emergencyCity', null);
                formik.setFieldValue('emergencyState', value);
              }}
              error={formik.touched.emergencyState && Boolean(formik.errors.emergencyState)}
              helperText={formik.touched.emergencyState && formik.errors.emergencyState}
              countryValue={formik.values.emergencyCountry}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CityComponent
              value={formik.values.emergencyCity}
              onChange={(_e, value) => formik.setFieldValue('emergencyCity', value)}
              error={formik.touched.emergencyCity && Boolean(formik.errors.emergencyCity)}
              helperText={formik.touched.emergencyCity && formik.errors.emergencyCity}
              stateValue={formik.values.emergencyState}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="emergencyPincode"
              disabled={!isEdit}
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
};

const RenderInquiryPrefrance = ({ formik, ...props }: { formik: any } & any) => {
  const { data: inquiryPreference, isLoading: inquiryPrefrenceLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetInquiryPreferenceQuery,
  });
  const dialog = useBoolean();

  return (
    <>
      <CustomSelect
        label="Inquiry Type"
        name="inquiryPreference"
        isLoading={inquiryPrefrenceLoading}
        options={inquiryPreference?.items || []}
        value={formik.values.inquiryPreference}
        labelKey="preferenceName"
        valueKey="id"
        onChange={(value) => formik.setFieldValue('inquiryPreference', value)}
        formControlProps={{
          fullWidth: true,
          sx: {
            maxWidth: 'unset',
          },
        }}
      />
      <Typography
        variant="body2"
        fontWeight={500}
        textAlign="right"
        color="primary.main"
        fontSize={12}
        sx={{ cursor: 'pointer' }}
        onClick={() => {
          dialog.onTrue();
        }}
      >
        Add Inquiry Type
      </Typography>
      <CustomDialog open={dialog.value} handleClose={dialog.onFalse} title="Inquiry Preference">
        <InquiryPreferenceForm handleClose={dialog.onFalse} editData={null} />
      </CustomDialog>
    </>
  );
};

const RenderStudent = ({ formik, ...props }: any) => {
  const { data: students } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAllStudentsQuery,
  });
  console.log(students);
  return (
    <Autocomplete
      disabled={!props.isEdit}
      // loading={isLoading}
      noOptionsText="No Student Found"
      fullWidth
      value={formik.values.sponsorStudent}
      onChange={(e, value: any) => {
        formik.setFieldValue('sponsorStudent', value);
      }}
      options={students?.items || []}
      getOptionLabel={(option: any) => `${option.firstName || ''} ${option.lastName || ''}`}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          label="Student Referrer"
          placeholder="Search Student Referrer"
          fullWidth
        />
      )}
      renderOption={(prop: any, option: any) => (
        <li {...prop} key={option.id}>
          {option.firstName || ''} {option.lastName || ''}
        </li>
      )}
    />
  );
};
export const generalFormFields: FieldsType[] = [
  {
    name: 'inquiryNo',
    label: 'Inquiry No',
    type: 'text',
    otherProps: { disabled: true, autoFocus: true },
  },
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
  {
    name: 'firstName',
    label: 'First Name',
    type: 'text',
    otherProps: ({ formik }: any) => ({
      onChange: (e: any) => {
        const newName = capitalize(e.target.value);
        formik.setFieldValue('firstName', newName);
      },
    }),
  },
  {
    name: 'lastName',
    label: 'last Name',
    type: 'text',
    otherProps: ({ formik }: any) => ({
      onChange: (e: any) => {
        const newName = capitalize(e.target.value);
        formik.setFieldValue('lastName', newName);
      },
    }),
  },
  {
    name: 'middleName',
    label: 'Middle Name',
    type: 'text',
    otherProps: ({ formik }: any) => ({
      onChange: (e: any) => {
        const newName = capitalize(e.target.value);
        formik.setFieldValue('middleName', newName);
      },
    }),
  },
  {
    name: 'mobileNo',
    label: 'Contact Number',
    type: 'text',
    renderComp(props) {
      const { formik, isEdit } = props;
      return (
        <PhoneInput
          name="mobileNo"
          disabled={!isEdit}
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
      const { formik, isEdit } = props;
      return (
        <PhoneInput
          name="alternativeContactNumber"
          value={formik.values.alternativeContactNumber}
          disabled={!isEdit}
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
        disabled={!props.isEdit}
        format="DD/MM/YYYY"
        slotProps={{
          textField: {
            placeholder: 'Date of Birth',
            fullWidth: true,
            size: 'small',
            error: props.formik.touched.dob && Boolean(props.formik.errors.dob),
            helperText: props.formik.touched.dob && props.formik.errors.dob,
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
      <FormControl
        fullWidth
        error={props.formik.touched.gender && Boolean(props.formik.errors.gender)}
        disabled={!props.isEdit}
      >
        <InputLabel
          id="dropdown-label"
          size="small"
          error={props.formik.touched.gender && Boolean(props.formik.errors.gender)}
        >
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
          error={props.formik.touched.gender && Boolean(props.formik.errors.gender)}
        >
          {GenderTypeArray.map((i, index) => (
            <MenuItem key={i} value={index}>
              {GenderType[index]}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>{props.formik.touched.gender && props.formik.errors.gender}</FormHelperText>
      </FormControl>
    ),
  },
  { name: 'adharNo', label: 'Aadhar No', type: 'number', otherProps: {} },
  { name: 'panNo', label: 'Pan No', type: 'text', otherProps: {} },
  { name: 'apparId', label: 'ApparId', type: 'text', otherProps: {} },
  {
    name: 'inquryPrefrence',
    label: 'Inquiry Prefrence',
    type: 'text',
    otherProps: {},
    renderComp(props) {
      return <RenderInquiryPrefrance {...props} />;
    },
  },
  {
    name: 'religion',
    label: 'Religion',
    type: 'text',
    otherProps: ({ formik }: any) => ({
      onChange: (e: any) => {
        const newName = capitalize(e.target.value);
        formik.setFieldValue('religion', newName);
      },
    }),
  },
  {
    name: 'familyCast',
    label: 'Family Cast',
    type: 'text',
    otherProps: ({ formik }: any) => ({
      onChange: (e: any) => {
        const newName = capitalize(e.target.value);
        formik.setFieldValue('familyCast', newName);
      },
    }),
  },
  {
    name: 'castCategory',
    label: 'Cast Category',
    type: 'text',
    otherProps: {},
    renderComp: (props) => (
      <FormControl
        fullWidth
        error={props.formik.touched.castCategory && Boolean(props.formik.errors.castCategory)}
        disabled={!props.isEdit}
      >
        <InputLabel
          id="dropdown-label"
          size="small"
          error={props.formik.touched.castCategory && Boolean(props.formik.errors.castCategory)}
        >
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
          error={props.formik.touched.castCategory && Boolean(props.formik.errors.castCategory)}
        >
          {EmployeeCastTypeArray.map((i, index) => (
            <MenuItem key={i} value={index}>
              {EmployeeCastType[index]}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>
          {props.formik.touched.castCategory && props.formik.errors.castCategory}
        </FormHelperText>
      </FormControl>
    ),
  },
  {
    name: 'motherTongue',
    label: 'Mother Tongue',
    type: 'text',
    otherProps: ({ formik }: any) => ({
      onChange: (e: any) => {
        const newName = capitalize(e.target.value);
        formik.setFieldValue('motherTongue', newName);
      },
    }),
  },
  {
    name: 'nationality',
    label: 'Nationality',
    type: 'text',
    otherProps: ({ formik }: any) => ({
      onChange: (e: any) => {
        const newName = capitalize(e.target.value);
        formik.setFieldValue('nationality', newName);
      },
    }),
  },
  {
    name: 'birthPlace',
    label: 'Birth Place',
    type: 'text',
    otherProps: ({ formik }: any) => ({
      onChange: (e: any) => {
        const newName = capitalize(e.target.value);
        formik.setFieldValue('birthPlace', newName);
      },
    }),
  },
  { name: 'temporaryGr', label: 'Temporary GR', type: 'text', otherProps: {} },
  { name: 'addressLine1', label: 'Address Line 1', type: 'text', otherProps: {} },
  { name: 'addressLine2', label: 'Address Line 2', type: 'text', otherProps: {} },
  { name: 'addressLine3', label: 'Address Line 3', type: 'text', otherProps: {} },
  {
    name: 'country',
    label: 'Country',
    type: 'text',
    otherProps: {},
    renderComp(props) {
      return (
        <CountryComponent
          value={props.formik.values.country}
          onChange={(e, value) => {
            props.formik.setFieldValue('country', value);
          }}
        />
      );
    },
  },
  {
    name: 'state',
    label: 'State',
    type: 'text',
    otherProps: {},
    renderComp(props) {
      return (
        <StateComponent
          value={props.formik.values.state}
          onChange={(e, value) => {
            props.formik.setFieldValue('state', value);
          }}
          countryValue={props.formik.values.country}
        />
      );
    },
  },
  {
    name: 'city',
    label: 'City',
    type: 'text',
    otherProps: {},
    renderComp(props) {
      return (
        <CityComponent
          value={props.formik.values.city}
          onChange={(e, value) => {
            props.formik.setFieldValue('city', value);
          }}
          stateValue={props.formik.values.state}
        />
      );
    },
  },
  { name: 'village', label: 'Town/District', type: 'text', otherProps: {} },
  {
    name: 'pinCode',
    label: 'Pincode',
    type: 'number',
    otherProps: {},
  },
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
      const { formik, isEdit } = props;
      return (
        <PhoneInput
          disabled={!isEdit}
          name="primaryContactNumber"
          value={formik.values.primaryContactNumber}
          onChange={(value) => {
            formik.setFieldValue('primaryContactNumber', value);
          }}
          autoFocus
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
      const { formik, isEdit } = props;

      return (
        <PhoneInput
          name="parentContactNumber"
          disabled={!isEdit}
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
      const { formik, isEdit } = props;

      return (
        <PhoneInput
          disabled={!isEdit}
          name="studentContactNo"
          value={formik.values.studentContactNo}
          onChange={(value) => {
            formik.setFieldValue('studentContactNo', value);
          }}
          label="Student Contact Number"
          placeholder="Student Contact Number"
          error={formik.touched.studentContactNo && Boolean(formik.errors.studentContactNo)}
          helperText={formik.touched.studentContactNo && formik.errors.studentContactNo}
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
      const { formik, isEdit } = props;

      return (
        <PhoneInput
          disabled={!isEdit}
          name="whatsAppContactNo"
          value={formik.values.whatsAppContactNo}
          onChange={(value) => {
            formik.setFieldValue('whatsAppContactNo', value);
          }}
          label="Whatsapp Number"
          placeholder="Whatsapp Number"
          error={formik.touched.whatsAppContactNo && Boolean(formik.errors.whatsAppContactNo)}
          helperText={formik.touched.whatsAppContactNo && formik.errors.whatsAppContactNo}
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
    renderComp: RenderLocalAddressFields,
  },
  {
    name: 'permanentAddress',
    label: 'Permanent Address',
    type: 'text',
    otherProps: { multiline: true, rows: 4 },
    gridProps: { xs: 12, md: 12 },
    renderComp: RenderPermanentAddressFields,
  },
  {
    name: 'emergencyAddress',
    label: 'Emergency Address',
    type: 'text',
    otherProps: { multiline: true, rows: 4 },
    gridProps: { xs: 12, md: 12 },
    renderComp: RenderEmergencyAddressFields,
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
          disabled={!props.isEdit}
          label="Category"
          value={props.formik.values.category}
          onChange={(value) => {
            props.formik.setFieldValue('category', value);
          }}
          autoFocus
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
          error={props.formik.touched.category && Boolean(props.formik.errors.category)}
          helperText={props.formik.touched.category && props.formik.errors.category}
        />
      );
    },
  },
  // {
  //   name: 'RTE',
  //   label: 'Right to Education',
  //   type: 'text',
  //   otherProps: {},
  //   renderComp(props: any) {
  //     return (
  //       <CustomSelect
  //         disabled={!props.isEdit}
  //         options={YesNoArray as any}
  //         label="Right to Education"
  //         value={props.formik.values.RTE}
  //         onChange={(value) => {
  //           props.formik.setFieldValue('RTE', value);
  //         }}
  //         formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
  //         error={props.formik.touched.RTE && Boolean(props.formik.errors.RTE)}
  //         helperText={props.formik.touched.RTE && props.formik.errors.RTE}
  //       />
  //     );
  //   },
  // },
  {
    name: 'bplStudent',
    label: 'BPL Student',
    type: 'text',
    otherProps: {},
    renderComp(props: any) {
      return (
        <CustomSelect
          disabled={!props.isEdit}
          options={YesNoArray as any}
          label="BPL Student"
          value={props.formik.values.bplStudent}
          onChange={(value) => {
            props.formik.setFieldValue('bplStudent', value);
          }}
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
          error={props.formik.touched.bplStudent && Boolean(props.formik.errors.bplStudent)}
          helperText={props.formik.touched.bplStudent && props.formik.errors.bplStudent}
        />
      );
    },
  },
  {
    name: 'bplCardNo',
    label: 'BPL Card No',
    type: 'text',
    otherProps: ({ formik }: any) => ({
      disabled: !formik.values.bplStudent,
    }),
  },
  {
    name: 'personWithDisability',
    label: 'Person With Disability',
    type: 'text',
    otherProps: {},
    renderComp(props: any) {
      return (
        <CustomSelect
          disabled={!props.isEdit}
          options={YesNoArray as any}
          label="Person With Disability"
          value={props.formik.values.personWithDisability}
          onChange={(value) => {
            props.formik.setFieldValue('personWithDisability', value);
          }}
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
          error={
            props.formik.touched.personWithDisability &&
            Boolean(props.formik.errors.personWithDisability)
          }
          helperText={
            props.formik.touched.personWithDisability && props.formik.errors.personWithDisability
          }
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
    renderComp(props) {
      const { formik, isEdit } = props;
      return (
        <PhoneInput
          disabled={!isEdit}
          name="emergencyContactNo"
          value={formik.values.emergencyContactNo}
          onChange={(value) => {
            formik.setFieldValue('emergencyContactNo', value);
          }}
          placeholder="Emergency Contact No."
          label="Emergency Contact No"
          error={formik.touched.emergencyContactNo && Boolean(formik.errors.emergencyContactNo)}
        />
      );
    },
  },
  {
    name: 'singleParentChild',
    label: 'Single Parent Child',
    type: 'text',
    otherProps: {},
    renderComp(props: any) {
      return (
        <CustomSelect
          disabled={!props.isEdit}
          options={YesNoArray as any}
          label="Single Parent Child"
          value={props.formik.values.singleParentChild}
          onChange={(value) => {
            props.formik.setFieldValue('singleParentChild', value);
          }}
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
          error={
            props.formik.touched.singleParentChild && Boolean(props.formik.errors.singleParentChild)
          }
          helperText={
            props.formik.touched.singleParentChild && props.formik.errors.singleParentChild
          }
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
          disabled={!props.isEdit}
          options={YesNoArray as any}
          label="Single Child"
          value={props.formik.values.singleChild}
          onChange={(value) => {
            props.formik.setFieldValue('singleChild', value);
          }}
          formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
          error={props.formik.touched.singleChild && Boolean(props.formik.errors.singleChild)}
          helperText={props.formik.touched.singleChild && props.formik.errors.singleChild}
        />
      );
    },
  },
  {
    name: 'sponsorStudent',
    label: 'Student Referrer',
    type: 'text',
    otherProps: {},
    renderComp: (props) => <RenderStudent {...props} />,
  },
  // {
  //   name: 'sponsorName ',
  //   label: 'Sponsor Name',
  //   type: 'text',
  //   otherProps: {},
  // },
];

export const medicalFields: FieldsType[] = [
  {
    name: 'weight',
    label: 'Weight (kg)',
    type: 'number',
    otherProps: { autoFocus: true },
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
    otherProps: ({ formik }: any) => ({
      onChange: (e: any) => {
        const newName = capitalize(e.target.value);
        formik.setFieldValue('schoolName', newName);
      },
      autoFocus: true,
    }),
  },
  {
    name: 'schoolAddress',
    label: 'Previous School Address',
    type: 'text',
    otherProps: ({ formik }: any) => ({
      onChange: (e: any) => {
        const newName = capitalize(e.target.value);
        formik.setFieldValue('schoolAddress', newName);
      },
    }),
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
    otherProps: ({ formik }: any) => ({
      onChange: (e: any) => {
        const newName = capitalize(e.target.value);
        formik.setFieldValue('schoolMedium', newName);
      },
    }),
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
    type: 'number',
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
    otherProps: { autoFocus: true },
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
  adharNo: editData?.aadhaarNo || '',
  religion: editData?.religion || '',
  familyCast: editData ? editData?.familyCast : '',
  castCategory: editData ? editData?.castType : null,
  motherTongue: editData?.motherTongue || '',
  nationality: editData?.nationality || '',
  birthPlace: editData?.birthPlace || '',
  temporaryGr: editData?.temporaryGr || '',
  remarks: editData?.remarks || '',
  mobileNo: editData?.parentContactNumber || '',
  alternativeContactNumber: editData?.alternativeContactNumber || '',
  email: editData?.email || '',
  userId: editData?.userId || null,
  id: editData?.id || null,
  medium: editData?.educationMediumId || '',
  board: editData?.educationBoardId || '',
  academicYear: editData?.academicYearId || '',
  class: editData?.standardId || '',
  previousSchool: editData?.previousSchoolName || '',
  photo: editData?.profilePicture || '',
  city: editData?.city ? { name: editData?.city } : { name: '' },
  state: editData?.state
    ? { name: editData?.state?.name, isoCode: editData?.state?.isoCode }
    : { name: '' },
  country: editData?.country
    ? { name: editData?.country?.name, isoCode: editData?.country?.isoCode }
    : { name: '' },
  addressLine1: editData?.addressLine1 || '',

  addressLine2: editData?.addressLine2 || '',
  addressLine3: editData?.addressLine3 || '',
  pinCode: editData?.pinCode || '',
  village: editData?.village || '',
  inquiryPreference: editData?.inquiryPreferencesId || [],
  apparId: editData?.apparId || '',
  panNo: editData?.panNo || '',
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

  localCountry: {
    name: editData?.studentCommunicationDetails?.localCountry?.name || '',
    isoCode: editData?.studentCommunicationDetails?.localCountry?.isoCode || '',
  },
  localState: {
    name: editData?.studentCommunicationDetails?.localState?.name || '',
    isoCode: editData?.studentCommunicationDetails?.localState?.isoCode || '',
  },
  localCity: {
    name: editData?.studentCommunicationDetails?.localCity?.name || '',
  },
  localPincode: editData?.studentCommunicationDetails?.localPinCode || '',
  localAddressLine1: editData?.studentCommunicationDetails?.localAddressLine1 || '',
  localAddressLine2: editData?.studentCommunicationDetails?.localAddressLine2 || '',
  localAddressLine3: editData?.studentCommunicationDetails?.localAddressLine3 || '',
  isOpenLocalAddress: true,

  emergencyCountry: {
    name: editData?.studentCommunicationDetails?.emergencyCountry?.name || '',
    isoCode: editData?.studentCommunicationDetails?.emergencyCountry?.isoCode || '',
  },
  emergencyState: {
    name: editData?.studentCommunicationDetails?.emergencyState?.name || '',
    isoCode: editData?.studentCommunicationDetails?.emergencyState?.isoCode || '',
  },
  emergencyCity: { name: editData?.studentCommunicationDetails?.emergencyCity?.name || '' },
  emergencyPincode: editData?.studentCommunicationDetails?.emergencyPinCode || '',
  emergencyAddressLine1: editData?.studentCommunicationDetails?.emergencyAddressLine1 || '',
  emergencyAddressLine2: editData?.studentCommunicationDetails?.emergencyAddressLine2 || '',
  emergencyAddressLine3: editData?.studentCommunicationDetails?.emergencyAddressLine3 || '',
  emergencySameAsLocal: false,
  isOpenEmergencyAddress: true,

  permanentAddress: editData?.studentCommunicationDetails?.permanentAddressLine1 || '',
  permanentAddressLine2: editData?.studentCommunicationDetails?.permanentAddressLine2 || '',
  permanentAddressLine3: editData?.studentCommunicationDetails?.permanentAddressLine3 || '',
  permanentCountry: {
    name: editData?.studentCommunicationDetails?.permanentCountry?.name || '',
    isoCode: editData?.studentCommunicationDetails?.permanentCountry?.isoCode || '',
  },
  permanentState: {
    name: editData?.studentCommunicationDetails?.permanentState?.name || '',
    isoCode: editData?.studentCommunicationDetails?.permanentState?.isoCode || '',
  },
  permanentCity: { name: editData?.studentCommunicationDetails?.permanentCity?.name || '' },
  permanentPincode: editData?.studentCommunicationDetails?.permanentPinCode || '',
  sameAsLocalForPermanent: false,
  isOpenPermanentAddress: true,

  remarks: editData?.studentCommunicationDetails?.remarks || '',
});

export const additionalDetailsInitialValues = (editData?: IInquiryData | null) => ({
  category: editData?.studentAdditionalDetails?.category || Category.General,
  RTE: editData?.studentAdditionalDetails?.category !== Category.General,
  bplStudent: editData?.studentAdditionalDetails?.bplStudent || false,
  bplCardNo: editData?.studentAdditionalDetails?.bplCardNo || '',
  personWithDisability: editData?.studentAdditionalDetails?.personWithDisability || false,
  secondLanguage: editData?.studentAdditionalDetails?.secondLanguage || '',
  emergencyContactNo: editData?.studentAdditionalDetails?.emergencyContactNo || '',
  singleParentChild: editData?.studentAdditionalDetails?.singleParentChild || false,
  singleChild: editData?.studentAdditionalDetails?.singleChild || false,
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
  const { formik, isEdit } = props;
  const [student, setStudent] = useState([]);

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={3}>
        <Grid item xs={3}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Father Details
            </Typography>
            <Stack spacing={3}>
              <ShakingTextField
                error={formik.touched.fatherName && Boolean(formik.errors.fatherName)}
              >
                <TextField
                  name="fatherName"
                  label=" Father full name"
                  value={formik.values.fatherName}
                  autoFocus
                  onChange={(e) => {
                    const value = capitalize(e.target.value);
                    formik.setFieldValue('fatherName', value);
                  }}
                  error={formik.touched.fatherName && Boolean(formik.errors.fatherName)}
                  helperText={formik.touched.fatherName && formik.errors.fatherName}
                  fullWidth
                  size="small"
                  disabled={!isEdit}
                />
              </ShakingTextField>
              <ShakingTextField
                error={formik.touched.fatherDob && Boolean(formik.errors.fatherDob)}
              >
                <DatePicker
                  name="fatherDob"
                  label="Father DOB"
                  value={formik.values.fatherDob}
                  onChange={(value) => {
                    formik.setFieldValue('fatherDob', value);
                  }}
                  disableFuture
                  disabled={!isEdit}
                  slotProps={{
                    textField: {
                      error: formik.touched.fatherDob && Boolean(formik.errors.fatherDob),
                      helperText: formik.touched.fatherDob && formik.errors.fatherDob,
                      fullWidth: true,
                      size: 'small',
                    },
                  }}
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
                disabled={!isEdit}
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
                disabled={!isEdit}
                InputProps={{
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
                label="Father's Year of Passing"
                type="number"
                value={formik.values.fatherPassOutYear}
                onChange={formik.handleChange}
                error={formik.touched.fatherPassOutYear && Boolean(formik.errors.fatherPassOutYear)}
                helperText={formik.touched.fatherPassOutYear && formik.errors.fatherPassOutYear}
                fullWidth
                size="small"
                disabled={!isEdit}
              />
              <TextField
                name="fatherQualification"
                label="Father Qualification"
                value={formik.values.fatherQualification}
                onChange={(e) => {
                  const value = capitalize(e.target.value);
                  formik.setFieldValue('fatherQualification', value);
                }}
                error={
                  formik.touched.fatherQualification && Boolean(formik.errors.fatherQualification)
                }
                helperText={formik.touched.fatherQualification && formik.errors.fatherQualification}
                fullWidth
                size="small"
                disabled={!isEdit}
              />
              <PhoneInput
                name="fatherContactNo"
                value={formik.values.fatherContactNo}
                onChange={(value) => {
                  formik.setFieldValue('fatherContactNo', value);
                }}
                placeholder="Enter Father Contact No."
                label="Father Contact No."
                disabled={!isEdit}
                error={formik.touched.fatherContactNo && Boolean(formik.errors.fatherContactNo)}
                helperText={formik.touched.fatherContactNo && formik.errors.fatherContactNo}
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
                disabled={!isEdit}
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
                disabled={!isEdit}
              />
              <TextField
                name="fatherDesignation"
                label="Father Designation"
                value={formik.values.fatherDesignation}
                onChange={(e) => {
                  const value = capitalize(e.target.value);
                  formik.setFieldValue('fatherDesignation', value);
                }}
                error={formik.touched.fatherDesignation && Boolean(formik.errors.fatherDesignation)}
                helperText={formik.touched.fatherDesignation && formik.errors.fatherDesignation}
                fullWidth
                size="small"
                disabled={!isEdit}
              />

              <TextField
                name="fatherOrganization"
                label="Father Organization"
                disabled={!isEdit}
                value={formik.values.fatherOrganization}
                onChange={(e) => {
                  const value = capitalize(e.target.value);
                  formik.setFieldValue('fatherOrganization', value);
                }}
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
                type="number"
                disabled={!isEdit}
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
                disabled={!isEdit}
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
                disabled={!isEdit}
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
            <Stack spacing={3}>
              <ShakingTextField
                error={formik.touched.motherName && Boolean(formik.errors.motherName)}
              >
                <TextField
                  name="motherName"
                  label="Mother full name"
                  disabled={!isEdit}
                  value={formik.values.motherName}
                  onChange={(e) => {
                    const value = capitalize(e.target.value);
                    formik.setFieldValue('motherName', value);
                  }}
                  error={formik.touched.motherName && Boolean(formik.errors.motherName)}
                  helperText={formik.touched.motherName && formik.errors.motherName}
                  fullWidth
                  size="small"
                />
              </ShakingTextField>
              <ShakingTextField
                error={formik.touched.motherDob && Boolean(formik.errors.motherDob)}
              >
                <DatePicker
                  name="motherDob"
                  label="Mother DOB"
                  disabled={!isEdit}
                  value={formik.values.motherDob}
                  onChange={(value) => {
                    formik.setFieldValue('motherDob', value);
                  }}
                  disableFuture
                  slotProps={{
                    textField: {
                      error: formik.touched.motherDob && Boolean(formik.errors.motherDob),
                      helperText: formik.touched.motherDob && formik.errors.motherDob,
                      fullWidth: true,
                      size: 'small',
                    },
                  }}
                />
              </ShakingTextField>
              <TextField
                name="motherOccupation"
                label="Mother Occupation"
                disabled={!isEdit}
                value={formik.values.motherOccupation}
                onChange={(e) => {
                  const value = capitalize(e.target.value);
                  formik.setFieldValue('motherOccupation', value);
                }}
                error={formik.touched.motherOccupation && Boolean(formik.errors.motherOccupation)}
                helperText={formik.touched.motherOccupation && formik.errors.motherOccupation}
                fullWidth
                size="small"
              />

              <TextField
                name="motherEmail"
                label="Mother Email"
                disabled={!isEdit}
                value={formik.values.motherEmail}
                onChange={formik.handleChange}
                error={formik.touched.motherEmail && Boolean(formik.errors.motherEmail)}
                helperText={formik.touched.motherEmail && formik.errors.motherEmail}
                fullWidth
                size="small"
                InputProps={{
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
                label="Mother's Year of Passing"
                type="number"
                disabled={!isEdit}
                value={formik.values.motherPassOutYear}
                onChange={formik.handleChange}
                error={formik.touched.motherPassOutYear && Boolean(formik.errors.motherPassOutYear)}
                helperText={formik.touched.motherPassOutYear && formik.errors.motherPassOutYear}
                fullWidth
                size="small"
              />
              <TextField
                name="motherQualification"
                label="Mother Qualification"
                disabled={!isEdit}
                value={formik.values.motherQualification}
                onChange={(e) => {
                  const value = capitalize(e.target.value);
                  formik.setFieldValue('motherQualification', value);
                }}
                error={
                  formik.touched.motherQualification && Boolean(formik.errors.motherQualification)
                }
                helperText={formik.touched.motherQualification && formik.errors.motherQualification}
                fullWidth
                size="small"
              />
              <PhoneInput
                name="motherContactNo"
                disabled={!isEdit}
                value={formik.values.motherContactNo}
                onChange={(value) => {
                  formik.setFieldValue('motherContactNo', value);
                }}
                label="Mother Contact No."
                placeholder="Enter Mother Contact No."
                error={formik.touched.motherContactNo && Boolean(formik.errors.motherContactNo)}
                helperText={formik.touched.motherContactNo && formik.errors.motherContactNo}
              />
              <PhoneInput
                name="motherOfficeNo"
                disabled={!isEdit}
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
                disabled={!isEdit}
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
                disabled={!isEdit}
                value={formik.values.motherDesignation}
                onChange={(e) => {
                  const value = capitalize(e.target.value);
                  formik.setFieldValue('motherDesignation', value);
                }}
                error={formik.touched.motherDesignation && Boolean(formik.errors.motherDesignation)}
                helperText={formik.touched.motherDesignation && formik.errors.motherDesignation}
                fullWidth
                size="small"
              />

              <TextField
                name="motherOrganization"
                label="Mother Organization"
                disabled={!isEdit}
                value={formik.values.motherOrganization}
                onChange={(e) => {
                  const value = capitalize(e.target.value);
                  formik.setFieldValue('motherOrganization', value);
                }}
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
                type="number"
                disabled={!isEdit}
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
                disabled={!isEdit}
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
                disabled={!isEdit}
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
            <Stack spacing={3}>
              <ShakingTextField
                error={formik.touched.guardianName && Boolean(formik.errors.guardianName)}
              >
                <TextField
                  name="guardianName"
                  label="Guardian Full Name"
                  disabled={!isEdit}
                  value={formik.values.guardianName}
                  onChange={(e) => {
                    const value = capitalize(e.target.value);
                    formik.setFieldValue('guardianName', value);
                  }}
                  error={formik.touched.guardianName && Boolean(formik.errors.guardianName)}
                  helperText={formik.touched.guardianName && formik.errors.guardianName}
                  fullWidth
                  size="small"
                />
              </ShakingTextField>
              <ShakingTextField
                error={formik.touched.guardianDob && Boolean(formik.errors.guardianDob)}
              >
                <DatePicker
                  name="guardianDob"
                  label="Guardian DOB"
                  disabled={!isEdit}
                  value={formik.values.guardianDob}
                  onChange={(value) => {
                    formik.setFieldValue('guardianDob', value);
                  }}
                  disableFuture
                  slotProps={{
                    textField: {
                      error: formik.touched.guardianDob && Boolean(formik.errors.guardianDob),
                      helperText: formik.touched.guardianDob && formik.errors.guardianDob,
                      fullWidth: true,
                      size: 'small',
                    },
                  }}
                />
              </ShakingTextField>
              <TextField
                name="guardianOccupation"
                label="Guardian Occupation"
                disabled={!isEdit}
                value={formik.values.guardianOccupation}
                onChange={(e) => {
                  const value = capitalize(e.target.value);
                  formik.setFieldValue('guardianOccupation', value);
                }}
                error={
                  formik.touched.guardianOccupation && Boolean(formik.errors.guardianOccupation)
                }
                helperText={formik.touched.guardianOccupation && formik.errors.guardianOccupation}
                fullWidth
                size="small"
              />

              <TextField
                name="guardianEmail"
                label="Guardian Email"
                disabled={!isEdit}
                value={formik.values.guardianEmail}
                onChange={formik.handleChange}
                error={formik.touched.guardianEmail && Boolean(formik.errors.guardianEmail)}
                helperText={formik.touched.guardianEmail && formik.errors.guardianEmail}
                fullWidth
                size="small"
                InputProps={{
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
                label="Guardian's Year of Passing"
                type="number"
                disabled={!isEdit}
                value={formik.values.guardianPassOutYear}
                onChange={formik.handleChange}
                error={
                  formik.touched.guardianPassOutYear && Boolean(formik.errors.guardianPassOutYear)
                }
                helperText={formik.touched.guardianPassOutYear && formik.errors.guardianPassOutYear}
                fullWidth
                size="small"
              />

              <TextField
                name="guardianQualification"
                label="Guardian Qualification"
                disabled={!isEdit}
                value={formik.values.guardianQualification}
                onChange={(e) => {
                  const value = capitalize(e.target.value);
                  formik.setFieldValue('guardianQualification', value);
                }}
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
                disabled={!isEdit}
                value={formik.values.guardianContactNo}
                onChange={(value) => {
                  formik.setFieldValue('guardianContactNo', value);
                }}
                label="Guardian Contact No."
                placeholder="Enter Guardian Contact No."
                error={formik.touched.guardianContactNo && Boolean(formik.errors.guardianContactNo)}
                helperText={formik.touched.guardianContactNo && formik.errors.guardianContactNo}
              />

              <PhoneInput
                name="guardianOfficeNo"
                disabled={!isEdit}
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
                disabled={!isEdit}
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
                disabled={!isEdit}
                value={formik.values.guardianDesignation}
                onChange={(e) => {
                  const value = capitalize(e.target.value);
                  formik.setFieldValue('guardianDesignation', value);
                }}
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
                disabled={!isEdit}
                value={formik.values.guardianOrganization}
                onChange={(e) => {
                  const value = capitalize(e.target.value);
                  formik.setFieldValue('guardianOrganization', value);
                }}
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
                type="number"
                disabled={!isEdit}
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
                disabled={!isEdit}
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
                disabled={!isEdit || formik.values.sameAsFatherAddressForSpouse}
                value={formik.values.guardianAddress}
                onChange={formik.handleChange}
                error={formik.touched.guardianAddress && Boolean(formik.errors.guardianAddress)}
                helperText={formik.touched.guardianAddress && formik.errors.guardianAddress}
                fullWidth
                size="small"
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
              disabled={!isEdit}
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

// Array containing all form field groups for student registration
// Each element represents a different section of the registration form:
// - generalFormFields: Basic student information
// - documentFields: Required document uploads
// - familyFields: Parent/guardian information
// - communicationFields: Contact details
// - additionalDetailsFields: Extra student information
// - medicalFields: Health and medical information
// - previousSchoolFields: Prior education details
// - bankDetailsFields: Banking information
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
