import { LoadingButton } from '@mui/lab';
import { varAlpha } from 'src/theme/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { CheckCircle } from '@mui/icons-material';
import React, { useState, useEffect } from 'react';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetConcessionTypeByIdQuery } from 'src/redux/finance/concessionType';
import { useUploadDocumentsMutation } from 'src/redux/finance/ConcessionManagement/concessionManagementApi';
import {
  Box,
  Stack,
  Button,
  IconButton,
  Typography,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { useUploadCurriculumFileMutation } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

export interface IConcessionSubmittedDocument {
  documentId: string;
  documentName: string;
  url: string;
  uploadedAt?: string;
  status?: number;
}

interface IDocumentDialogProps {
  open: boolean;
  concessionId: string;
  concessionName: string;
  studentConcessionRequestId?: string;
  submittedDocuments: IConcessionSubmittedDocument[];
  onClose: () => void;
  onRefresh?: () => void;
  onSave?: (documents: IConcessionSubmittedDocument[]) => void;
}

const DocumentDialog: React.FC<IDocumentDialogProps> = ({
  open,
  concessionId,
  concessionName,
  studentConcessionRequestId,
  submittedDocuments,
  onClose,
  onRefresh,
  onSave,
}) => {
  const { data: concessionDetails, isLoading } = useGetConcessionTypeByIdQuery(
    { concessionTypeId: concessionId },
    { skip: !open || !concessionId }
  );

  const [uploadCurriculumFile, { isLoading: isUploading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUploadCurriculumFileMutation,
  });

  const [saveDocuments, { isLoading: isSaving }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUploadDocumentsMutation,
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [localDocs, setLocalDocs] = useState<IConcessionSubmittedDocument[]>([]);

  useEffect(() => {
    if (open) {
      setLocalDocs(submittedDocuments || []);
    }
  }, [open, submittedDocuments]);

  const handleUploadClick = (docId: string) => {
    setUploadingDocId(docId);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !uploadingDocId) return;

    const formData = new FormData();
    formData.append('FileName', file.name);
    formData.append('File', file);

    try {
      const response = await uploadCurriculumFile(formData).unwrap();
      const uploadedUrl = response.data;

      setLocalDocs((prev) => {
        const existing = prev.find((d) => d.documentId === uploadingDocId);
        if (existing) {
          return prev.map((d) =>
            d.documentId === uploadingDocId ? { ...d, url: uploadedUrl, status: 1 } : d
          );
        }
        const docInfo = concessionDetails?.documents?.find(
          (d: any) => (d.id || d.documentId) === uploadingDocId
        );
        return [
          ...prev,
          {
            documentId: uploadingDocId,
            url: uploadedUrl,
            status: 1,
            documentName: docInfo?.documentName || '',
          },
        ];
      });

      shikshaMitraToast.success({ message: 'File uploaded locally. Click Submit to save.' });
    } catch (error) {
      console.error('Upload failed:', error);
      shikshaMitraToast.error({ message: 'Upload failed' });
    } finally {
      setUploadingDocId(null);
    }
  };

  const handleSubmit = async () => {
    try {
      const payloadDocs = (concessionDetails?.documents || []).map((d: any) => {
        const docId = d.id || d.documentId;
        const local = localDocs.find((ld) => ld.documentId === docId);
        return {
          documentId: docId,
          url: local?.url || '',
          status: local?.url ? (typeof local.status === 'number' ? local.status : 1) : 0,
        };
      });

      if (studentConcessionRequestId) {
        await saveDocuments({
          concessionRequestId: studentConcessionRequestId,
          concessionTypeDocuments: [
            {
              concessionTypeId: concessionId,
              documents: payloadDocs,
            },
          ],
        }).unwrap();
        shikshaMitraToast.success({ message: 'Documents submitted successfully' });
      }

      if (onSave) {
        // Prepare IConcessionSubmittedDocument[] for Formik
        const nextSubmittedDocs = (concessionDetails?.documents || []).map((d: any) => {
          const docId = d.id || d.documentId;
          const local = localDocs.find((ld) => ld.documentId === docId);
          return {
            documentId: docId,
            documentName: d.documentName,
            url: local?.url || '',
            status: local?.url ? 1 : 0,
          } as IConcessionSubmittedDocument;
        });
        onSave(nextSubmittedDocs);
      }

      if (onRefresh) onRefresh();
      onClose();
    } catch (error) {
      console.error('Submit failed:', error);
      shikshaMitraToast.error({ message: 'Failed to submit documents' });
    }
  };

  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      title={`Documents - ${concessionName}`}
      maxWidth="sm"
    >
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept="image/*,.pdf"
      />
      <Box sx={{ p: 2, minHeight: 150 }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {(concessionDetails?.documents || []).map((doc: any) => {
              const docId = doc.id || doc.documentId;
              const submitted = localDocs.find((d) => d.documentId === docId);
              return (
                <Box
                  key={docId}
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: (theme) => varAlpha(theme.palette.grey['500Channel'], 0.04),
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {doc.documentName}
                      </Typography>
                      {submitted?.url ? (
                        <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                          <CheckCircle sx={{ fontSize: 14, color: 'success.main' }} />
                          <Typography variant="caption" color="success.main" fontWeight={600}>
                            Uploaded
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Not uploaded
                        </Typography>
                      )}
                    </Box>
                    <Box display="flex" gap={1}>
                      {submitted?.url && (
                        <IconButton
                          style={{
                            textAlign: 'left',
                            marginLeft: '0px',
                            // paddingLeft: '0px',
                            justifyContent: 'flex-start',
                            display: 'flex',
                          }}
                          disabled={!submitted?.url}
                          onClick={() => {
                            window.open(
                              `${process.env.NEXT_PUBLIC_API_URL}${submitted.url}`,
                              '_blank'
                            );
                          }}
                        >
                          <Iconify icon="carbon:view-filled" />
                        </IconButton>
                      )}
                      <LoadingButton
                        size="small"
                        variant="outlined"
                        loading={isUploading && uploadingDocId === docId}
                        onClick={() => handleUploadClick(docId)}
                        startIcon={<Iconify icon="eva:cloud-upload-outline" />}
                      >
                        {submitted?.url ? 'Replace' : 'Upload'}
                      </LoadingButton>
                    </Box>
                  </Box>
                </Box>
              );
            })}
            {(!concessionDetails?.documents || concessionDetails.documents.length === 0) && (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                No documents required for this concession.
              </Typography>
            )}
          </Stack>
        )}
      </Box>
      <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button
          variant="outlined"
          size="small"
          onClick={onClose}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          size="small"
          loading={isSaving}
          onClick={handleSubmit}
          startIcon={<Iconify icon={GlobalIcons.submit} />}
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
};

export default DocumentDialog;
