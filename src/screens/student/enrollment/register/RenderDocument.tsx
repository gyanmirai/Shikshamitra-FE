import type { RootState } from 'src/redux/store';

import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import UploadButton from 'src/components/upload-button';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { DocumentStatusOptions } from 'src/enums/document-statusType';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { Box, Tooltip, Skeleton, IconButton, Typography } from '@mui/material';
import {
  useGetStudentDocumentsQuery,
  useDownloadStudentDocumentQuery,
  useUploadStudentDocumentsMutation,
  useLazyDownloadStudentDocumentQuery,
} from 'src/redux/student/registration/registration-api';

import { DocumentForm } from '../setting/document-type';

const formatAcceptedFormat = (format: unknown) => {
  if (typeof format === 'string' && format.trim()) {
    return format.trim();
  }

  if (typeof format === 'number') {
    return String(format);
  }

  if (format && typeof format === 'object') {
    const item = format as { label?: unknown; name?: unknown; value?: unknown };
    return formatAcceptedFormat(item.label ?? item.name ?? item.value);
  }

  return '';
};

const formatAcceptedFormats = (formats: unknown) => {
  if (Array.isArray(formats)) {
    return formats.map(formatAcceptedFormat).filter(Boolean).join(', ');
  }

  return typeof formats === 'string' && formats.trim() ? formats.trim() : '';
};

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
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

  // Dialog state for adding documents
  const addDocumentDialog = useBoolean();
  // Mutation hook for uploading new documents
  const [uploadDocument] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUploadStudentDocumentsMutation,
  });

  const [downloadDocument] = useLazyDownloadStudentDocumentQuery();

  // Query hook to fetch student's uploaded documents using student ID
  const { data: studentsDocuments, isLoading: isEmployeeDocLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentDocumentsQuery,
    params: { studentId: id },
    options: { skip: !id },
  });

  useEffect(() => {
    setDocId(null);
    setSelectedDocName('');
    setUploadingDocId(null);
    setUploadErrors({});
  }, [id]);

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
    <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <CustomizableTable
        isLoading={isEmployeeDocLoading}
        tableTitle="Documents"
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
              const uploadError = uploadErrors[row.documentTypeId];
              const statusIcon = uploadError
                ? 'mdi:alert-circle'
                : value
                  ? 'mdi:approve'
                  : 'mage:file-cross-fill';
              return (
                <Tooltip title={uploadError || (value ? 'Uploaded' : 'Not Uploaded')}>
                  <Iconify
                    icon={statusIcon}
                    height={20}
                    width={20}
                    sx={{
                      color: (theme) =>
                        uploadError
                          ? 'error.main'
                          : value
                            ? 'success.main'
                            : theme.vars.palette.grey[500],
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
              const uploadError = uploadErrors[row.documentTypeId];
              if (isUploading) {
                return <Skeleton variant="rounded" width={80} height={24} />;
              }
              return (
                <Box>
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
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploadingDocId(row.documentTypeId);
                      setUploadErrors((current) => {
                        const next = { ...current };
                        delete next[row.documentTypeId];
                        return next;
                      });
                      const formData = new FormData();
                      formData.append('documentTypeId', row.documentTypeId);
                      formData.append('file', file);

                      try {
                        await uploadDocument({ studentId: id, body: formData }).unwrap();
                        shikshaMitraToast.success({
                          message: `${row.documentTypeName} uploaded successfully`,
                        });
                      } catch (error: any) {
                        const errorData = error?.data?.error || error?.data;
                        const acceptedFormats = formatAcceptedFormats(
                          errorData?.data?.AcceptedFormats ?? errorData?.data?.acceptedFormats
                        );
                        const message =
                          errorData?.code === 'Document:InvalidFormat'
                            ? acceptedFormats
                              ? `Invalid format. Accepted formats: ${acceptedFormats}`
                              : 'Invalid document format.'
                            : errorData?.message || `Failed to upload ${row.documentTypeName}`;

                        setUploadErrors((current) => ({
                          ...current,
                          [row.documentTypeId]: message,
                        }));
                        shikshaMitraToast.error({ message });
                      } finally {
                        setUploadingDocId(null);
                        e.target.value = '';
                      }
                    }}
                  >
                    <Iconify icon="ci:file-upload" />
                  </UploadButton>
                  {uploadError && (
                    <Typography
                      variant="caption"
                      color="error.main"
                      sx={{
                        display: 'block',
                        maxWidth: 220,
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                      }}
                    >
                      {uploadError}
                    </Typography>
                  )}
                </Box>
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
                    try {
                      const blob = await downloadDocument({
                        studentId: id,
                        documentId: row.uploadedDocumentId,
                      }).unwrap();

                      const link = document.createElement('a');
                      const objectUrl = URL.createObjectURL(blob);
                      link.href = objectUrl;
                      link.download = row.fileName || `${row.documentTypeName}`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
                    } catch (err) {
                      shikshaMitraToast.error({ message: 'Failed to download document' });
                    }
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
        fullWidth={false}
      >
        <Box p={2} sx={{ display: 'flex', justifyContent: 'center' }}>
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
  const { data: documentBlob, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useDownloadStudentDocumentQuery,
    params: { studentId: id, documentId: docId },
    options: { skip: !id || !docId },
  });
  const documentUrl = useMemo(
    () => (documentBlob ? URL.createObjectURL(documentBlob) : ''),
    [documentBlob]
  );
  const isPdf = documentBlob?.type === 'application/pdf';

  useEffect(
    () => () => {
      if (documentUrl) {
        URL.revokeObjectURL(documentUrl);
      }
    },
    [documentUrl]
  );

  return (
    <Box
      sx={{
        height: '75vh',
        minWidth: { xs: '250px', sm: '350px' },
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {isLoading ? (
        <Skeleton variant="rectangular" height="100%" width="100%" />
      ) : isPdf ? (
        <Box
          component="iframe"
          src={documentUrl}
          sx={{
            width: '100%',
            minWidth: { sm: '600px', md: '800px' },
            height: '100%',
            border: 'none',
          }}
          title="Student Document"
        />
      ) : (
        <Box
          component="img"
          src={documentUrl}
          sx={{ height: '100%', maxWidth: '100%', border: 'none', objectFit: 'contain' }}
          title="Student Document"
        />
      )}
    </Box>
  );
};
