import type { RootState } from 'src/redux/store';

import { toast } from 'sonner';
import { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Box, Tooltip, Skeleton, IconButton, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { convertBase64Format } from 'src/utils/base64Formate';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { DocumentStatusOptions } from 'src/enums/document-statusType';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { DocumentType, DocumentFileType } from 'src/enums/documnet-type';
import { useGetStudentDocumentTypeQuery } from 'src/redux/student/document-type/document-type-api';
import {
  useUploadDocumentsMutation,
  useGetStudentDocumentsQuery,
  useGetStudentDocumentByIdQuery,
  useStudentUpdateDocumentMutation,
} from 'src/redux/student/registration/registration-api';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import UploadButton from 'src/components/upload-button';
import { shikshaMitraToast } from 'src/components/toast';
import CustomizableTable from 'src/components/customizabaleTable';

import { DocumentForm } from '../setting/document-type';

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
      {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
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
      </Box> */}
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
            enumOptions: DocumentStatusOptions,
            filterType: 'enum',
            render(value, row) {
              return (
                <Tooltip title={row.statusVal}>
                  <Iconify
                    icon={row.statusVal === 'Uploaded' ? 'mdi:approve' : 'mage:file-cross-fill'}
                    height={20}
                    width={20}
                    sx={{
                      color: (theme) =>
                        row.statusVal === 'Uploaded' ? 'success.main' : theme.palette.grey[500],
                      cursor: 'pointer',
                    }}
                  />
                </Tooltip>
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
                    if (!file) return;
                    const acceptableFileFormats: string[] = [];

                    row.documentTypes.forEach((item: number) => {
                      acceptableFileFormats.push(
                        DocumentFileType[DocumentType[item] as keyof typeof DocumentFileType]
                      );
                    });
                    if (!acceptableFileFormats.includes(file?.type)) {
                      shikshaMitraToast.error({
                        message: `Please upload ${row.docType} file`,
                      });
                      return;
                    }
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
                        closeButton: true,
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
    <Box
      height="60vh"
      width="100%"
      sx={{
        '& iframe img': {
          height: '100%',
        },
      }}
    >
      {isLoading ? (
        <Skeleton variant="rectangular" height={300} />
      ) : (
        <Box
          component="iframe"
          src={convertBase64Format(documents.content)}
          sx={{
            width: '100%',
            height: '100%',
            border: 'none',
            objectFit: 'contain',
            '& img': {
              height: '100%',
            },
          }}
          title="Employee Document"
        />
      )}
    </Box>
  );
};
