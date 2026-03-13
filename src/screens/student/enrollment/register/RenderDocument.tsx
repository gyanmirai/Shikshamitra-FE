import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import UploadButton from 'src/components/upload-button';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { convertBase64Format } from 'src/utils/base64Formate';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { DocumentStatusOptions } from 'src/enums/document-statusType';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { Box, Tooltip, Skeleton, IconButton, Typography } from '@mui/material';
import {
  useUploadDocumentsMutation,
  useGetStudentDocumentsQuery,
  useGetStudentDocumentByIdQuery,
} from 'src/redux/student/registration/registration-api';

import { DocumentForm } from '../setting/document-type';

export const RenderDocuments = (props: any) => {
  // Get the student ID from props
  const { id } = props;
  // Dialog state for viewing documents
  const viewDialog = useBoolean();
  // State to store the selected document ID
  const [docId, setDocId] = useState<null | string>(null);
  // State to store the selected document name for dialog title
  const [selectedDocName, setSelectedDocName] = useState<string>('');
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);

  // Dialog state for adding documents
  const addDocumentDialog = useBoolean();
  // Mutation hook for uploading new documents
  const [uploadDocument] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUploadDocumentsMutation,
  });

  // Query hook to fetch student's uploaded documents using student ID
  const { data: studentsDocuments, isLoading: isEmployeeDocLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentDocumentsQuery,
    params: { studentId: id },
  });

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
    <Box sx={{ height: '100%', minHeight: 0 }}>
      <CustomizableTable
        isLoading={isEmployeeDocLoading}
        tableId="documents"
        columns={[
          { id: 'documentTypeName', label: 'Name' },
          {
            id: 'isUploaded',
            label: 'Status',
            enumOptions: DocumentStatusOptions,
            filterType: 'enum',
            minWidth: '80px',
            isSort: false,
            align: 'left',
            render(value, row) {
              return (
                <Tooltip title={value ? 'Uploaded' : 'Not Uploaded'}>
                  <Iconify
                    icon={value ? 'mdi:approve' : 'mage:file-cross-fill'}
                    height={20}
                    width={20}
                    sx={{
                      color: (theme) => (value ? 'success.main' : theme.vars.palette.grey[500]),
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
            isFilter: false,
            minWidth: '80px',
            align: 'left',
            isSort: false,
            render(value, row) {
              const isUploading = uploadingDocId === row.documentTypeId;
              if (isUploading) {
                return <Skeleton variant="rounded" width={80} height={24} />;
              }
              return (
                <UploadButton
                  disableRipple
                  disableElevation
                  disableFocusRipple
                  disableTouchRipple
                  sx={{
                    textAlign: 'left',
                    marginLeft: '0px',
                    paddingLeft: '0px',
                    justifyContent: 'flex-start',
                    display: 'flex',
                    '&:hover': { backgroundColor: 'transparent' },
                  }}
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setUploadingDocId(row.documentTypeId);
                    // Convert file to base64
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                      const base64Content = reader.result as string;
                      // Remove the data URL prefix (e.g., "data:image/png;base64,")
                      const base64String = base64Content.split(',')[1];

                      const requestBody = {
                        documenttypeId: row.documentTypeId,
                        filename: file.name,
                        contenttype: file.type,
                        size: file.size,
                        content: base64String,
                      };

                      try {
                        await uploadDocument({ studentId: id, body: requestBody }).unwrap();
                        shikshaMitraToast.success({
                          message: `${row.documentTypeName} uploaded successfully`,
                        });
                      } catch (error: any) {
                        const errorData = error?.data?.error;
                        if (errorData?.code === 'Document:InvalidFormat') {
                          shikshaMitraToast.error({
                            message: `Invalid format. Accepted formats are: ${errorData?.data?.AcceptedFormats}`,
                          });
                        } else {
                          shikshaMitraToast.error({
                            message:
                              errorData?.message || `Failed to upload ${row.documentTypeName}`,
                          });
                        }
                      } finally {
                        setUploadingDocId(null);
                        e.target.value = '';
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                >
                  <Iconify icon="ci:file-upload" />
                </UploadButton>
              );
            },
          },
          {
            id: 'view',
            label: 'View',
            isFilter: false,
            isSort: false,
            align: 'left',
            minWidth: '80px',
            render(value, row) {
              return (
                <IconButton
                  style={{
                    textAlign: 'left',
                    marginLeft: '0px',
                    padding: '0px',
                    justifyContent: 'flex-start',
                    display: 'flex',
                  }}
                  disabled={!row.isUploaded}
                  onClick={() => {
                    setDocId(row.uploadedDocumentId);
                    setSelectedDocName(row.documentTypeName);
                    viewDialog.onTrue();
                  }}
                >
                  <Iconify icon="carbon:view-filled" />
                </IconButton>
              );
            },
          },
          {
            id: 'download',
            label: 'Download',
            isFilter: false,
            isSort: false,
            align: 'left',
            minWidth: '80px',
            render(value, row) {
              return (
                <IconButton
                  style={{
                    textAlign: 'left',
                    marginLeft: '0px',
                    padding: '0px',
                    justifyContent: 'flex-start',
                    display: 'flex',
                  }}
                  disabled={!row.isUploaded}
                  onClick={async () => {
                    // TODO: Implement download functionality
                    // Fetch document content using getStudentDocumentById
                    // Create download link with base64 content
                  }}
                >
                  <Iconify icon="material-symbols:download" width={20} height={20} />
                </IconButton>
              );
            },
          },
        ]}
        data={studentsDocuments || []}
      />
      <CustomDialog
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">{selectedDocName || 'Preview Document'}</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="This is a preview of the uploaded document."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
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
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Document</Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="This is the Document dialog, where you can add the required documents for registration along with their document types. By tapping the switch, you can mark a document as required or optional."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <DocumentForm handleClose={handleClose} editData={null} />
      </CustomDialog>
    </Box>
  );
};
export const ViewDocuments = ({ id, docId }: { id: string; docId: string | null }) => {
  // Fetch student document data using the provided student ID and document ID
  // Returns document content and loading state for rendering
  const { data: documents, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentDocumentByIdQuery,
    params: { studentId: id, documentId: docId },
  });

  return (
    <Box height="60vh" width="100%" sx={{ '& iframe img': { height: '100%' } }}>
      {isLoading ? (
        <Skeleton variant="rectangular" height={300} />
      ) : documents?.contentType === 'application/pdf' ? (
        <Box
          component="iframe"
          src={convertBase64Format(documents.content)}
          sx={{ width: '100%', height: '100%', border: 'none' }}
          title="Employee Document"
        />
      ) : (
        <Box
          component="img"
          src={convertBase64Format(documents.content)}
          sx={{ width: '100%', height: '100%', border: 'none', objectFit: 'contain' }}
          title="Employee Document"
        />
      )}
    </Box>
  );
};
