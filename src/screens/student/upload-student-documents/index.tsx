'use client';

import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Upload } from 'src/components/upload';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import { useGetClassQuery } from 'src/redux/class/classApi';
import { useGetStudentsByDivisionQuery } from 'src/redux/student';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useGetStudentDocumentsQuery,
  useUploadStudentDocumentsMutation,
} from 'src/redux/student/records/student-record-profile-api';
import {
  Box,
  Grid,
  Alert,
  Select,
  Button,
  Divider,
  MenuItem,
  InputLabel,
  IconButton,
  FormControl,
} from '@mui/material';

const UploadStudentDocumentsScreen = () => {
  const { data: classes, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  const dialog = useBoolean();
  const [divisions, setDivisions] = useState([]);
  const [classValue, setClassValue] = React.useState('');
  const [division, setDivision] = React.useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [tableParams, setTableParams] = useState({ page: 1, rowsPerPage: 10, searchTerm: '' });
  const {
    data: students,
    isLoading: studentsLoading,
    isError,
  } = useGetStudentsByDivisionQuery(
    {
      divisionId: division,
      skipCount: (tableParams.page - 1) * tableParams.rowsPerPage,
      maxResultCount: tableParams.rowsPerPage,
      searchTerm: tableParams.searchTerm,
    },
    { skip: !division }
  );

  const tableData =
    students?.items?.map((student: any) => {
      const uploadedCount = student.uploadedDocumentsCount;
      const requiredCount = student.requiredDocumentsCount;

      return {
        ...student,
        id: student.studentId,
        fullName:
          student.studentName ||
          [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' '),
        upload:
          uploadedCount !== undefined && requiredCount !== undefined
            ? `${uploadedCount}/${requiredCount} uploaded`
            : 'Document status unavailable',
      };
    }) || [];

  const handleClassChange = (event: any) => {
    setClassValue(event.target.value);
    setDivision('');
    setDivisions(
      classes?.items?.find((item: any) => item.id === event.target.value)?.divisions || []
    );
  };

  const handleDivisionChange = (event: any) => {
    setDivision(event.target.value);
    setTableParams({ page: 1, rowsPerPage: 10, searchTerm: '' });
  };

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Upload Student Documents"
        links={[
          { name: 'Student' },
          { name: 'Student Record' },
          { name: 'Upload Student Documents' },
        ]}
      />
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        <Grid size={4}>
          <FormControl fullWidth>
            <InputLabel id="class-select-label" size="small">
              Class
            </InputLabel>
            <Select
              labelId="class-select-label"
              id="class-select"
              value={classValue}
              label="Class"
              onChange={handleClassChange}
              size="small"
            >
              {isLoading ? (
                <MenuItem disabled>Loading...</MenuItem>
              ) : classes?.items.length > 0 ? (
                classes.items.map((classItem: any) => (
                  <MenuItem key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No class available</MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={4}>
          <FormControl fullWidth>
            <InputLabel id="division-select-label" size="small">
              Division
            </InputLabel>
            <Select
              labelId="division-select-label"
              id="division-select"
              value={division}
              label="Division"
              onChange={handleDivisionChange}
              size="small"
              disabled={!classValue}
              sx={{ cursor: !classValue ? 'no-drop !important' : 'default' }}
            >
              {divisions && divisions.length > 0 ? (
                divisions.map((divisionItem: any) => (
                  <MenuItem key={divisionItem.id} value={divisionItem.id}>
                    {divisionItem.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No division available</MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {division && (
        <>
          {isError && (
            <Alert severity="error" sx={{ my: 2 }}>
              Unable to load students for the selected division.
            </Alert>
          )}
          <CustomizableTable
            tableId="upload-student-documents"
            columns={[
              { id: 'fullName', label: 'Full Name' },
              { id: 'upload', label: 'Document Status' },
              {
                id: 'action',
                label: 'Upload Documents',
                isFilter: false,
                render(value, row) {
                  return (
                    <IconButton
                      onClick={() => {
                        setSelectedStudent(row);
                        dialog.onTrue();
                      }}
                    >
                      <Iconify icon="heroicons-outline:upload" />
                    </IconButton>
                  );
                },
              },
            ]}
            data={tableData}
            isLoading={studentsLoading}
            serverSidePagination
            serverSideSearch
            totalCount={students?.totalCount || 0}
            onServerPagination={(page, rowsPerPage) =>
              setTableParams((prev) => ({ ...prev, page, rowsPerPage }))
            }
            onServerSearch={(searchTerm) =>
              setTableParams((prev) => ({ ...prev, page: 1, searchTerm }))
            }
            noDataText={<>No students found for the selected division.</>}
          />
        </>
      )}

      <CustomDialog
        open={dialog.value}
        handleClose={() => {
          dialog.onFalse();
          setSelectedStudent(null);
        }}
        title={`Upload Documents${selectedStudent?.fullName ? ` - ${selectedStudent.fullName}` : ''}`}
      >
        {selectedStudent && (
          <UploadDocumentsFlow
            student={selectedStudent}
            onClose={() => {
              dialog.onFalse();
              setSelectedStudent(null);
            }}
          />
        )}
      </CustomDialog>
    </Box>
  );
};

export default UploadStudentDocumentsScreen;

const UploadDocumentsFlow = ({ student, onClose }: { student: any; onClose: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [documentTypeId, setDocumentTypeId] = useState('');
  const { data: documents, isLoading } = useGetStudentDocumentsQuery({
    studentId: student.studentId,
  });
  const [uploadDocument, { isLoading: isUploading }] = useUploadStudentDocumentsMutation();
  const documentOptions = Array.isArray(documents?.data)
    ? documents.data
    : Array.isArray(documents)
      ? documents
      : [];

  const handleSave = async () => {
    if (!file || !documentTypeId) return;
    const formData = new FormData();
    formData.append('documentTypeId', documentTypeId);
    formData.append('file', file);
    try {
      await uploadDocument({ studentId: student.studentId, body: formData }).unwrap();
      shikshaMitraToast.success({ message: 'Student document uploaded successfully.' });
      onClose();
    } catch {
      shikshaMitraToast.error({ message: 'Unable to upload student document. Please try again.' });
    }
  };

  return (
    <Box p={2}>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="document-type-label" size="small">
          Document Type
        </InputLabel>
        <Select
          labelId="document-type-label"
          value={documentTypeId}
          label="Document Type"
          size="small"
          disabled={isLoading}
          onChange={(event) => setDocumentTypeId(event.target.value)}
        >
          {documentOptions.length > 0 ? (
            documentOptions.map((item: any) => (
              <MenuItem key={item.documentTypeId} value={item.documentTypeId}>
                {item.documentTypeName}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>No document types available</MenuItem>
          )}
        </Select>
      </FormControl>
      <Upload
        value={file}
        onDrop={(acceptedFiles: File[]) => setFile(acceptedFiles[0] || null)}
        onDelete={() => setFile(null)}
      />
      <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          loading={isUploading}
          disabled={!file || !documentTypeId}
          onClick={handleSave}
        >
          Save
        </LoadingButton>
      </Box>
    </Box>
  );
};
