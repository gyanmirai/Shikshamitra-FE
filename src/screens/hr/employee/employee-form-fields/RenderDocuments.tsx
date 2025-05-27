import type { LabelColor } from 'src/components/label';

import { toast } from 'sonner';
import { useState } from 'react';

import { Box, Skeleton, IconButton } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { convertBase64Format } from 'src/utils/base64Formate';

import { DocumentType } from 'src/enums/documnet-type';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetDocumentsQuery } from 'src/redux/document/documentApi';
import { DocumentStatusOptions, DocumentStatusTypeColors } from 'src/enums/document-statusType';
import {
  useUploadDocumentsMutation,
  useGetEmployeeDocumentsQuery,
  useGetEmployeeDocumentByIdQuery,
  useEmployeeUpdateDocumentMutation,
} from 'src/redux/employee/employeeApi';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import UploadButton from 'src/components/upload-button';
import CustomizableTable from 'src/components/customizabaleTable';

interface ViewDocumentsProps {
  employeeId: string;
  docId: string | null;
}

const ViewDocuments = ({ employeeId, docId }: ViewDocumentsProps) => {
  const { data: documents, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeDocumentByIdQuery,
    params: { employeeId, documentId: docId },
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

interface RenderDocumentsProps {
  employeeId: string;
}

export const RenderDocuments = ({ employeeId }: RenderDocumentsProps) => {
  const viewDialog = useBoolean();
  const [docId, setDocId] = useState<null | string>(null);

  const [uploadDocument] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUploadDocumentsMutation,
  });

  const [updateDocument] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useEmployeeUpdateDocumentMutation,
  });

  const { data: documents, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetDocumentsQuery,
  });

  const { data: employeeDocuments, isLoading: isEmployeeDocLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeDocumentsQuery,
    params: employeeId,
  });

  const tableData =
    documents?.items?.map((item: any) => ({
      ...item,
      statusVal: employeeDocuments?.find((doc: any) => doc.fileName === item.documentName)
        ? 'Uploaded'
        : 'Not Uploaded',
      docType: item.documentTypes.map((ite: number) => DocumentType[ite]).join(', '),
      statusColor: employeeDocuments?.find((doc: any) => doc.fileName === item.documentName)
        ? 'success'
        : 'warning',
      uploadDocument: employeeDocuments?.find((doc: any) => doc.fileName === item.documentName),
    })) || [];

  return (
    <>
      <CustomizableTable
        noDataText={<>No Certificate Found </>}
        searchFieldProps={{
          placeholder: 'Search by Document Type, Name, Status..',
          label: 'Search by Document Type, Name, Status...',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
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
              const color = DocumentStatusTypeColors[
                row.statusVal as keyof typeof DocumentStatusTypeColors
              ] as LabelColor;
              return <Label color={color}>{value}</Label>;
            },
          },
          {
            id: 'upload',
            label: 'Upload',
            isFilter: false,
            isSort: false,
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
                            employeeId,
                            body: formData,
                          })
                        : uploadDocument({ id: employeeId, body: formData }),
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
            isFilter: false,
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
          <ViewDocuments employeeId={employeeId} docId={docId} />
        </Box>
      </CustomDialog>
    </>
  );
};
