import { Iconify } from 'src/components/iconify';
import React, { useId, useState, useEffect } from 'react';
import UploadButton from 'src/components/upload-button';
import { shikshaMitraToast } from 'src/components/toast';
import { GlobalIcons } from 'src/utils/icons';
import { FileThumbnail } from 'src/components/file-thumbnail';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetConcessionTypeByIdQuery } from 'src/redux/finance/concessionType';
import DocumentPreviewDialog from 'src/components/preview-document/DocumentPreviewDialog';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';
import { useUploadConcessionDocumentFileMutation } from 'src/redux/finance/ConcessionManagement/concessionManagementApi';
import {
  Box,
  Card,
  Stack,
  Tooltip,
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
              <Card
                component="section"
                aria-label={doc.documentName}
                aria-busy={uploadingDocId === docId}
                variant="outlined"
                key={docId}
                sx={{
                  p: 1.25,
                  borderRadius: 1.5,
                  boxShadow: 'none',
                  borderColor: 'divider',
                  '& .MuiIconButton-root': {
                    width: 32,
                    height: 32,
                    '@media (pointer: coarse)': { width: 44, height: 44 },
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) auto',
                    columnGap: 1,
                    rowGap: 0.75,
                    alignItems: 'center',
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                    sx={{ minWidth: 0, gridColumn: 1, gridRow: 1 }}
                  >
                    <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
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
                  <UploadButton
                    sx={{ gridColumn: 2, gridRow: 1, justifySelf: 'end' }}
                    size="small"
                    variant="outlined"
                    accept={getFileAccept(doc)}
                    onChange={(event) => handleFileChange(event, docId)}
                    startIcon={
                      isUploading && uploadingDocId === docId ? (
                        <CircularProgress size={14} aria-label={`Uploading ${doc.documentName}`} />
                      ) : (
                        <Iconify icon={GlobalIcons.upload} />
                      )
                    }
                    disabled={!canUpload || isUploading || Boolean(uploadingDocId)}
                    aria-label={`${submitted?.url ? 'Replace' : 'Upload'} ${doc.documentName}`}
                    aria-describedby={isMissingRequired ? errorId : undefined}
                    fileInputProps={{
                      'aria-label': `Choose ${doc.documentName} file`,
                      'aria-required': Boolean(doc.isRequired),
                      'aria-invalid': isMissingRequired,
                      'aria-describedby': isMissingRequired ? errorId : undefined,
                    }}
                  >
                    {uploadingDocId === docId
                      ? 'Uploading…'
                      : submitted?.url
                        ? 'Replace'
                        : 'Upload'}
                  </UploadButton>
                  {submitted?.url ? (
                    <Stack
                      direction="row"
                      alignItems="center"
                      gap={1}
                      sx={{ gridColumn: '1 / -1', minWidth: 0 }}
                    >
                      <FileThumbnail
                        file={submitted.fileName || doc.documentName}
                        sx={{ width: 24, height: 24 }}
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}
                      >
                        {submitted.fileName || 'Document attached'}
                      </Typography>
                      <Stack direction="row" gap={0.5} sx={{ flexShrink: 0 }}>
                        {canView && (
                          <Tooltip title={`Preview ${doc.documentName}`}>
                            <IconButton
                              size="small"
                              aria-label={`Preview ${doc.documentName}`}
                              onClick={() =>
                                setPreviewDoc({
                                  url: submitted.url,
                                  name: submitted.fileName || submitted.documentName,
                                })
                              }
                            >
                              <Iconify icon={GlobalIcons.eye} width={18} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {canUpload && (
                          <Tooltip title={`Remove ${doc.documentName}`}>
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                disabled={isUploading || Boolean(uploadingDocId)}
                                onClick={() => handleRemove(docId)}
                                aria-label={`Remove ${doc.documentName}`}
                              >
                                <Iconify icon={GlobalIcons.delete} width={18} />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                      </Stack>
                    </Stack>
                  ) : (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ gridColumn: '1 / -1' }}
                    >
                      Not uploaded
                    </Typography>
                  )}
                  {isMissingRequired && (
                    <FormHelperText error id={errorId} sx={{ mx: 0, gridColumn: '1 / -1' }}>
                      {doc.documentName} is required.{' '}
                      {canUpload ? 'Upload this document to continue.' : ''}
                    </FormHelperText>
                  )}
                </Box>
              </Card>
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
