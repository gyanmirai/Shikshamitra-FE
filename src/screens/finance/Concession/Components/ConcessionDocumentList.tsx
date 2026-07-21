import { LoadingButton } from '@mui/lab';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { CheckCircle } from '@mui/icons-material';
import React, { useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetConcessionTypeByIdQuery } from 'src/redux/finance/concessionType';
import DocumentPreviewDialog from 'src/components/preview-document/DocumentPreviewDialog';
import { useUploadCurriculumFileMutation } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import {
  Box,
  Card,
  Stack,
  Divider,
  IconButton,
  Typography,
  CardHeader,
  CardContent,
  CircularProgress,
} from '@mui/material';

import type { IConcessionSubmittedDocument } from './DocumentDialog';

interface IConcessionDocumentListProps {
  concessionId: string;
  concessionName: string;
  submittedDocuments: IConcessionSubmittedDocument[];
  onSave: (documents: IConcessionSubmittedDocument[]) => void;
}

const ConcessionDocumentList: React.FC<IConcessionDocumentListProps> = ({
  concessionId,
  concessionName,
  submittedDocuments,
  onSave,
}) => {
  const { data: concessionData, isLoading: isLoadingDetails } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetConcessionTypeByIdQuery,
    params: { concessionTypeId: concessionId },
    options: { skip: !concessionId },
  }) as { data: any; isLoading: boolean };

  const [uploadCurriculumFile, { isLoading: isUploading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUploadCurriculumFileMutation,
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [localDocs, setLocalDocs] = useState<IConcessionSubmittedDocument[]>([]);
  const [previewDoc, setPreviewDoc] = useState<{ url: string; name: string } | null>(null);

  const documents = React.useMemo(() => concessionData?.data?.documents || [], [concessionData]);

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
          url: existing?.url || '',
          status: existing?.url ? (existing.status ?? 1) : 0,
        };
      });

      // Only update if there's a difference or if localDocs is empty
      const isDifferent = JSON.stringify(mergedDocs) !== JSON.stringify(localDocs);
      if (isDifferent) {
        setLocalDocs(mergedDocs);
        // Only pass uploaded documents (with URLs) to parent
        const uploadedDocs = mergedDocs.filter(
          (doc: IConcessionSubmittedDocument) => doc.url && doc.url.trim() !== ''
        );
        if (uploadedDocs.length > 0) {
          onSave(uploadedDocs);
        }
      }
    } else if (!isLoadingDetails && documents.length === 0) {
      setLocalDocs([]);
    }
  }, [submittedDocuments, documents, isLoadingDetails, onSave, localDocs]);

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
      const uploadedUrl = response.data || null;

      const updatedDocs = [...localDocs];
      const existingIndex = updatedDocs.findIndex((d) => d.documentId === uploadingDocId);

      const docInfo = documents?.find((d: any) => (d.id || d.documentId) === uploadingDocId);

      const newDoc: IConcessionSubmittedDocument = {
        documentId: uploadingDocId,
        url: uploadedUrl,
        status: 1,
        documentName: docInfo?.documentName || '',
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
    }
  };

  return (
    <Card variant="outlined">
      <CardHeader
        title={
          <Typography
            variant="subtitle2"
            sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}
          >
            <Iconify icon="eva:file-text-outline" />
            {concessionName}
          </Typography>
        }
        sx={{ p: 2 }}
      />
      <Divider />
      <CardContent sx={{ p: 2 }}>
        {isLoadingDetails ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
              accept="image/*,.pdf"
            />
            <Stack spacing={1.5}>
              {(documents || []).map((doc: any) => {
                const docId = doc.id || doc.documentId;
                const submitted = localDocs.find(
                  (d: IConcessionSubmittedDocument) => d.documentId === docId
                );
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
                        <Typography variant="body2" fontWeight={600}>
                          {doc.documentName}
                        </Typography>
                        {submitted?.url ? (
                          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
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
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewDoc({ url: submitted.url, name: submitted.documentName });
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
              {(!documents || documents.length === 0) && (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 1 }}>
                  No documents required for this concession.
                </Typography>
              )}
            </Stack>
          </>
        )}
      </CardContent>

      <DocumentPreviewDialog
        open={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        url={previewDoc?.url || ''}
        documentName={previewDoc?.name}
      />
    </Card>
  );
};

export default ConcessionDocumentList;
