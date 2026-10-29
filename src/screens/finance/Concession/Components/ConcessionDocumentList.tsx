import { Iconify } from 'src/components/iconify';
import CheckCircle from '@mui/icons-material/CheckCircle';
import React, { useId, useState, useEffect } from 'react';
import UploadButton from 'src/components/upload-button';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetConcessionTypeByIdQuery } from 'src/redux/finance/concessionType';
import DocumentPreviewDialog from 'src/components/preview-document/DocumentPreviewDialog';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';
import { useUploadConcessionDocumentFileMutation } from 'src/redux/finance/ConcessionManagement/concessionManagementApi';
import {
  Box,
  Stack,
  IconButton,
  Typography,
  FormHelperText,
  CircularProgress,
} from '@mui/material';

import {
  getFileAccept,
  getDocumentConstraintText,
  validateConcessionDocumentFile,
} from './concessionDocumentUpload';

import type { IConcessionSubmittedDocument } from './DocumentDialog';

interface IConcessionDocumentListProps {
  concessionId: string;
  concessionName: string;
  submittedDocuments: IConcessionSubmittedDocument[];
  onSave: (documents: IConcessionSubmittedDocument[]) => void;
  requirements?: any[];
  canUpload?: boolean;
  canView?: boolean;
}

const ConcessionDocumentList: React.FC<IConcessionDocumentListProps> = ({
  concessionId,
  concessionName,
  submittedDocuments,
  onSave,
  requirements,
  canUpload = true,
  canView = false,
}) => {
  const helperId = useId();
  const { data: concessionData, isLoading: isLoadingDetails } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetConcessionTypeByIdQuery,
    params: { concessionTypeId: concessionId },
    options: { skip: !concessionId || requirements !== undefined },
  }) as { data: any; isLoading: boolean };

  const [uploadConcessionDocumentFile, { isLoading: isUploading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUploadConcessionDocumentFileMutation,
  });

  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [localDocs, setLocalDocs] = useState<IConcessionSubmittedDocument[]>([]);
  const [previewDoc, setPreviewDoc] = useState<{ url: string; name: string } | null>(null);

  const documents = React.useMemo(
    () => requirements ?? concessionData?.data?.documents ?? [],
    [concessionData, requirements]
  );

  useEffect(() => {
    if (!isLoadingDetails && documents.length > 0) {
      const mergedDocs = documents.map((doc: any) => {
        const docId = doc.id || doc.documentId;
        const existing = (submittedDocuments || []).find(
          (d: IConcessionSubmittedDocument) => d.documentId === docId
        );
        return {
          documentId: docId,
          documentName: doc.documentName,
          fileName: existing?.fileName,
          url: existing?.url || '',
          status: existing?.url ? (existing.status ?? 1) : 0,
        };
      });

      // Only update if there's a difference or if localDocs is empty
      setLocalDocs((current) =>
        JSON.stringify(mergedDocs) === JSON.stringify(current) ? current : mergedDocs
      );
    } else if (!isLoadingDetails && documents.length === 0) {
      setLocalDocs([]);
    }
  }, [submittedDocuments, documents, isLoadingDetails]);

  const handleRemove = (docId: string) => {
    const updatedDocs = localDocs.map((doc) =>
      doc.documentId === docId ? { ...doc, url: '', fileName: undefined, status: 0 } : doc
    );
    setLocalDocs(updatedDocs);
    onSave(updatedDocs.filter((doc) => doc.url && doc.url.trim() !== ''));
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    documentId: string
  ) => {
    const inputElement = event.currentTarget;
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingDocId(documentId);

    const document = documents.find((item: any) => (item.id || item.documentId) === documentId);
    const validationError = validateConcessionDocumentFile(file, document);
    if (validationError) {
      shikshaMitraToast.error({ message: validationError });
      setUploadingDocId(null);
      inputElement.value = '';
      return;
    }

    try {
      const response = await uploadConcessionDocumentFile({
        concessionTypeId: concessionId,
        documentId,
        file,
      }).unwrap();
      const uploadedUrl = response?.url || null;

      const updatedDocs = [...localDocs];
      const existingIndex = updatedDocs.findIndex((d) => d.documentId === documentId);

      const docInfo = documents?.find((d: any) => (d.id || d.documentId) === documentId);

      const newDoc: IConcessionSubmittedDocument = {
        documentId,
        url: uploadedUrl,
        status: 1,
        documentName: docInfo?.documentName || '',
        fileName: file.name,
      };

      if (existingIndex !== -1) {
        updatedDocs[existingIndex] = newDoc;
      } else {
        updatedDocs.push(newDoc);
      }

      setLocalDocs(updatedDocs);
      // Only pass uploaded documents (with URLs) to parent
      const uploadedDocs = updatedDocs.filter(
        (doc: IConcessionSubmittedDocument) => doc.url && doc.url.trim() !== ''
      );
      onSave(uploadedDocs);
      shikshaMitraToast.success({
        message: `Document "${newDoc.documentName}" uploaded successfully.`,
      });
    } catch (error) {
      console.error('Upload failed:', error);
      shikshaMitraToast.error({ message: 'Upload failed' });
    } finally {
      setUploadingDocId(null);
      inputElement.value = '';
    }
  };

  return (
    <Box aria-label={`${concessionName} supporting documents`}>
      {isLoadingDetails ? (
        <Box display="flex" justifyContent="center" py={3}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <Stack spacing={1}>
          {(documents || []).map((doc: any) => {
            const docId = doc.id || doc.documentId;
            const submitted = localDocs.find(
              (d: IConcessionSubmittedDocument) => d.documentId === docId
            );
            const isMissingRequired = Boolean(doc.isRequired && !submitted?.url);
            const errorId = `${helperId}-${docId}-error`;
            return (
              <Box
                key={docId}
                sx={{
                  py: 1,
                  '& + &': { borderTop: 1 },
                  borderColor: 'divider',
                }}
              >
                <Stack spacing={0.75}>
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
                      {doc.documentName}{' '}
                      {doc.isRequired && (
                        <Box component="span" color="error.main">
                          *
                        </Box>
                      )}
                    </Typography>
                    <InfoTooltipIcon
                      title={getDocumentConstraintText(doc)}
                      label={`${doc.documentName} requirements`}
                    />
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                    {submitted?.url ? (
                      <Box
                        display="flex"
                        alignItems="center"
                        gap={0.5}
                        sx={{ minWidth: 0, maxWidth: '100%' }}
                      >
                        <CheckCircle sx={{ fontSize: 14, color: 'success.main' }} />
                        <Typography
                          variant="caption"
                          color="success.main"
                          fontWeight={600}
                          sx={{ overflowWrap: 'anywhere' }}
                        >
                          Uploaded{submitted.fileName ? ` · ${submitted.fileName}` : ''}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Not uploaded
                      </Typography>
                    )}
                    <Box display="flex" gap={0.5} alignItems="center">
                      {submitted?.url && (
                        <>
                          {canView && (
                            <IconButton
                              size="small"
                              aria-label={`Preview ${doc.documentName}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewDoc({
                                  url: submitted.url,
                                  name: submitted.documentName,
                                });
                              }}
                            >
                              <Iconify icon="carbon:view-filled" />
                            </IconButton>
                          )}
                          {canUpload && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemove(docId)}
                              aria-label={`Remove ${doc.documentName}`}
                            >
                              <Iconify icon="solar:trash-bin-trash-bold" />
                            </IconButton>
                          )}
                        </>
                      )}
                      <UploadButton
                        size="small"
                        variant="outlined"
                        accept={getFileAccept(doc)}
                        onChange={(event) => handleFileChange(event, docId)}
                        startIcon={
                          isUploading && uploadingDocId === docId ? (
                            <CircularProgress size={14} />
                          ) : (
                            <Iconify icon="eva:cloud-upload-outline" />
                          )
                        }
                        disabled={!canUpload || isUploading}
                        aria-label={`${submitted?.url ? 'Replace' : 'Upload'} ${doc.documentName}`}
                        aria-describedby={isMissingRequired ? errorId : undefined}
                        fileInputProps={{
                          'aria-label': `Choose ${doc.documentName} file`,
                          'aria-required': Boolean(doc.isRequired),
                          'aria-invalid': isMissingRequired,
                          'aria-describedby': isMissingRequired ? errorId : undefined,
                        }}
                      >
                        {submitted?.url ? 'Replace' : 'Upload'}
                      </UploadButton>
                    </Box>
                  </Stack>
                  {isMissingRequired && (
                    <FormHelperText error id={errorId} sx={{ mx: 0 }}>
                      {doc.documentName} is required.{' '}
                      {canUpload ? 'Upload this document to continue.' : ''}
                    </FormHelperText>
                  )}
                </Stack>
              </Box>
            );
          })}
          {(!documents || documents.length === 0) && (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 1 }}>
              No documents required for this concession.
            </Typography>
          )}
        </Stack>
      )}

      <DocumentPreviewDialog
        open={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        url={previewDoc?.url || ''}
        documentName={previewDoc?.name}
        directUrl
      />
    </Box>
  );
};

export default ConcessionDocumentList;
