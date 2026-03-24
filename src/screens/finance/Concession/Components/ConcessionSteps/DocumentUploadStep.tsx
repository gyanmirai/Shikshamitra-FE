import React, { useState, useEffect } from 'react';
import { Box, Stack, Typography } from '@mui/material';

import ConcessionDocumentList from '../ConcessionDocumentList';

interface DocumentUploadStepProps {
  formik: any;
  concessionTypes: any[];
}

const DocumentUploadStep: React.FC<DocumentUploadStepProps> = ({ formik, concessionTypes }) => {
  const { values, setFieldValue } = formik;
  const [selectedConcessions, setSelectedConcessions] = useState<any[]>([]);

  useEffect(() => {
    if (values.concessionTypeIds && concessionTypes.length > 0) {
      const selected = concessionTypes.filter((ct: any) =>
        values.concessionTypeIds.includes(ct.id)
      );
      setSelectedConcessions(selected);
    }
  }, [values.concessionTypeIds, concessionTypes]);

  const getSubmittedDocs = (concessionId: string) => {
    const block = values.concessionTypeDocuments?.find(
      (d: any) => d.concessionTypeId === concessionId
    );
    return (block?.documents || []).map((d: any) => ({
      documentId: d.documentId,
      url: d.url,
      status: d.status,
    }));
  };

  const handleSaveDocs = React.useCallback(
    (concessionId: string, newDocs: any[]) => {
      setFieldValue('concessionTypeDocuments', (prev: any[]) => {
        const currentPayload = [...(prev || [])];
        const typeIndex = currentPayload.findIndex((d: any) => d.concessionTypeId === concessionId);

        const formattedDocs = newDocs.map((d) => ({
          documentId: d.documentId,
          url: d.url,
          status: d.status,
        }));

        if (typeIndex === -1) {
          currentPayload.push({
            concessionTypeId: concessionId,
            documents: formattedDocs,
          });
        } else {
          currentPayload[typeIndex] = {
            ...currentPayload[typeIndex],
            documents: formattedDocs,
          };
        }
        return currentPayload;
      });
    },
    [setFieldValue]
  );

  return (
    <Box sx={{ p: 1 }}>
      <Stack spacing={2}>
        {selectedConcessions.map((concession) => (
          <ConcessionDocumentList
            key={concession.id}
            concessionId={concession.id}
            concessionName={concession.concessionName || concession.name}
            submittedDocuments={getSubmittedDocs(concession.id)}
            onSave={(newDocs) => handleSaveDocs(concession.id, newDocs)}
          />
        ))}

        {selectedConcessions.length === 0 && (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
            No concession types selected. Please go back to select concession types.
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

export default DocumentUploadStep;
