import type { LabelColor } from 'src/components/label';

import { toast } from 'sonner';
import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import UploadButton from 'src/components/upload-button';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { convertBase64Format } from 'src/utils/base64Formate';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetDocumentsQuery } from 'src/redux/document/documentApi';
import { Box, Tooltip, Skeleton, IconButton, Typography } from '@mui/material';
import { DocumentType, DocumentFileType, convertFileAcceptType } from 'src/enums/documnet-type';
import { DocumentStatusOptions, DocumentStatusTypeColors } from 'src/enums/document-statusType';
import {
  useUploadDocumentsMutation,
  useGetEmployeeDocumentsQuery,
  useGetEmployeeDocumentByIdQuery,
  useEmployeeUpdateDocumentMutation,
} from 'src/redux/employee/employeeApi';

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
    <Box height="60vh" width="100%" sx={{ '& iframe img': { height: '100%' } }}>
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
            '& img': { height: '100%' },
          }}
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
  const downloadDialog = useBoolean();
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
        isLoading={isLoading || isEmployeeDocLoading}
        tableId="documents"
        columns={[
          { id: 'documentName', label: 'Name' },
          // {
          //   id: 'docType',
          //   label: 'Document Format',
          //   isSort: false,
          // },
          {
            id: 'statusVal',
            label: 'Status',
            minWidth: '80px',
            align: 'left',
            isFilter: false,
            enumOptions: DocumentStatusOptions,
            filterType: 'enum',
            render(value, row) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const color = DocumentStatusTypeColors[
                row.statusVal as keyof typeof DocumentStatusTypeColors
              ] as LabelColor;
              return (
                <Tooltip title={row.statusVal}>
                  <Iconify
                    icon={row.statusVal === 'Uploaded' ? 'mdi:approve' : 'mage:file-cross-fill'}
                    height={20}
                    width={20}
                    sx={{
                      color: (theme) =>
                        row.statusVal === 'Uploaded'
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
              return (
                <UploadButton
                  disableRipple
                  disableElevation
                  disableFocusRipple
                  disableTouchRipple
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'transparent',
                    transition: 'background-color 0.2s ease',
                    '&:hover': { backgroundColor: '#e0e0e0' },
                    p: 0, // no extra padding
                    minWidth: 0, // prevent MUI buttons from stretching
                  }}
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
                      shikshaMitraToast.error({ message: `Please upload ${row.docType} file` });
                      return;
                    }
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
                        success: () => `${row.documentName} Uploaded Successfully.`,
                        error: 'Error',
                        closeButton: true,
                      }
                    );
                  }}
                  fileInputProps={{ accept: convertFileAcceptType(row.documentTypes) }}
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
            minWidth: '6vw',
            align: 'left',
            render(value, row) {
              return (
                <IconButton
                  style={{
                    textAlign: 'left',
                    marginLeft: '0px',
                    // paddingLeft: '0px',
                    justifyContent: 'flex-start',
                    display: 'flex',
                  }}
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
          {
            id: 'dowload',
            label: 'Download',
            isFilter: false,
            isSort: false,
            minWidth: '6vw',
            align: 'left',
            render(value, row) {
              return (
                <IconButton
                  style={{
                    textAlign: 'left',
                    marginLeft: '0px',
                    // paddingLeft: '0px',
                    justifyContent: 'flex-start',
                    display: 'flex',
                  }}
                  disabled={!row.uploadDocument}
                  onClick={() => {
                    setDocId(row.uploadDocument.id);
                    downloadDialog.onTrue();
                  }}
                >
                  <Iconify icon={GlobalIcons.download} />
                </IconButton>
              );
            },
          },
        ]}
        data={tableData}
      />

      <CustomDialog
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Preview Document</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="View and examine the uploaded document in detail"
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
          <ViewDocuments employeeId={employeeId} docId={docId} />
        </Box>
      </CustomDialog>
    </>
  );
};
