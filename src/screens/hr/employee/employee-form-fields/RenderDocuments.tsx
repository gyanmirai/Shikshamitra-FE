import type { LabelColor } from 'src/components/label';

import { useState, useEffect } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import UploadButton from 'src/components/upload-button';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useHrTableQuery } from 'src/screens/hr/hooks/use-hr-table-query';
import { useHrTableExport } from 'src/screens/hr/hooks/use-hr-table-export';
import { DocumentType, DocumentFileType, convertFileAcceptType } from 'src/enums/documnet-type';
import { DocumentStatusOptions, DocumentStatusTypeColors } from 'src/enums/document-statusType';
import { Box, Tooltip, Skeleton, IconButton, Typography, CircularProgress } from '@mui/material';
import {
  useUploadDocumentsMutation,
  useGetEmployeeDocumentByIdQuery,
  useEmployeeUpdateDocumentMutation,
  useLazyGetEmployeeDocumentByIdQuery,
  useGetEmployeeDocumentChecklistQuery,
} from 'src/redux/hr/employeeApi';

interface ViewDocumentsProps {
  employeeId: string;
  docId: string | null;
  fileName?: string;
}

const ViewDocuments = ({ employeeId, docId, fileName }: ViewDocumentsProps) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  // API now returns a Blob directly (responseHandler: blob)
  const { data: blob, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeDocumentByIdQuery,
    params: { employeeId, documentId: docId },
    options: { skip: !docId },
  });

  // Convert blob -> Object URL; revoke on cleanup to avoid memory leaks
  useEffect(() => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    setObjectUrl(url);
    // eslint-disable-next-line consistent-return
    return () => {
      URL.revokeObjectURL(url);
      setObjectUrl(null);
    };
  }, [blob]);

  const isPdf = blob?.type === 'application/pdf';

  return (
    <Box
      sx={{
        height: '75vh',
        minWidth: { xs: '250px', sm: '500px', md: '700px' },
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {isLoading ? (
        <Skeleton variant="rectangular" width="100%" height="100%" />
      ) : !objectUrl ? (
        <Typography color="text.secondary">Unable to load document</Typography>
      ) : isPdf ? (
        // PDF — render inside iframe
        <Box
          component="iframe"
          src={objectUrl}
          sx={{ width: '100%', height: '100%', border: 'none' }}
          title={fileName || 'Staff Document'}
        />
      ) : (
        // Image (jpeg, png, etc.) — render as <img>
        <Box
          component="img"
          src={objectUrl}
          alt={fileName || 'Staff Document'}
          sx={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
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
  const [viewFileName, setViewFileName] = useState<string>('');

  // Track which rows are currently uploading
  const [uploadingRows, setUploadingRows] = useState<Record<string, boolean>>({});
  // Track which rows are currently downloading
  const [downloadingRows, setDownloadingRows] = useState<Record<string, boolean>>({});

  // Lazy query — fires only when download button is clicked
  const [fetchDocument] = useLazyGetEmployeeDocumentByIdQuery();

  const [uploadDocument] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUploadDocumentsMutation,
    isThrowError: true,
    popupConfig: { error: false },
  });

  const [updateDocument] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useEmployeeUpdateDocumentMutation,
    isThrowError: true,
    popupConfig: { error: false },
  });

  const [tableQuery, setTableQuery] = useState({ page: 1, pageSize: 20, search: '' });
  useEffect(() => {
    setTableQuery((current) => ({ ...current, page: 1 }));
  }, [employeeId]);
  const {
    currentData: checklist,
    error: tableError,
    refetch: retryTable,
    isLoading,
    isFetching: isEmployeeDocLoading,
    tableProps: operationalTableProps,
  } = useHrTableQuery(
    {
      table: 'hr-employee-documents',
      query: { employeeId, ...tableQuery },
      page: tableQuery.page - 1,
      size: tableQuery.pageSize,
      resetPage: () => setTableQuery((current) => ({ ...current, page: 1 })),
      skip: !employeeId,
    },
    useGetEmployeeDocumentChecklistQuery({ employeeId, ...tableQuery }, { skip: !employeeId })
  );
  const tableData = checklist?.items || [];
  const exportDocuments = useHrTableExport('hr-employee-documents', { employeeId, ...tableQuery });

  const handleUpload = async (file: File, row: any) => {
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

    const formData = new FormData();
    formData.append('DocumentNameId', row.id);
    formData.append('FileName', file.name);
    formData.append('File', file);

    setUploadingRows((prev) => ({ ...prev, [row.id]: true }));

    try {
      if (row.uploadedDoc) {
        await updateDocument({
          documentId: row.uploadedDoc.documentId,
          employeeId,
          body: formData,
        }).unwrap();
      } else {
        await uploadDocument({ id: employeeId, body: formData }).unwrap();
      }
      shikshaMitraToast.success({
        message: `${row.title} uploaded successfully`,
      });
    } catch (error) {
      shikshaMitraToast.error({
        message: `Failed to upload ${row.title}`,
      });
    } finally {
      setUploadingRows((prev) => ({ ...prev, [row.id]: false }));
    }
  };

  return (
    <>
      <CustomizableTable
        variant="embedded"
        showColumns
        showExport
        showFullScreen
        exportScope="all"
        noDataText={<>No Document Found </>}
        isLoading={isLoading || isEmployeeDocLoading}
        tableId="hr-employee-documents"
        tableTitle="Staff documents"
        onExport={exportDocuments}
        error={tableError}
        onRetry={retryTable}
        serverSidePagination
        serverSideSearch
        page={tableQuery.page - 1}
        rowsPerPage={tableQuery.pageSize}
        searchTerm={tableQuery.search}
        totalCount={checklist?.totalCount || 0}
        onServerPagination={(page, pageSize) =>
          setTableQuery((current) => ({ ...current, page, pageSize }))
        }
        onServerSearch={(search) => setTableQuery((current) => ({ ...current, page: 1, search }))}
        columns={[
          { id: 'title', label: 'Document Name' },
          {
            id: 'docType',
            label: 'Format',
            isSort: false,
          },
          {
            id: 'statusVal',
            label: 'Status',
            minWidth: '100px',
            align: 'left',
            isFilter: false,
            enumOptions: DocumentStatusOptions,
            filterType: 'enum',
            render(value, row) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const color = DocumentStatusTypeColors[
                row.statusVal as keyof typeof DocumentStatusTypeColors
              ] as LabelColor;
              const isUploaded = row.statusVal === 'Uploaded';
              return (
                <Tooltip title={row.statusVal}>
                  <Iconify
                    icon={isUploaded ? 'mdi:check-circle' : 'mage:file-cross-fill'}
                    height={22}
                    width={22}
                    sx={{
                      color: (theme) =>
                        isUploaded ? 'success.main' : theme.vars.palette.grey[500],
                      cursor: 'default',
                      transition: 'color 0.3s ease',
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
            excludeFromExport: true,
            render(value, row) {
              const isUploading = uploadingRows[row.id];
              return (
                <Box display="flex" alignItems="center">
                  {isUploading ? (
                    <CircularProgress size={22} thickness={4} />
                  ) : (
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
                        p: 0,
                        minWidth: 0,
                      }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        await handleUpload(file, row);
                      }}
                      fileInputProps={{ accept: convertFileAcceptType(row.documentTypes) }}
                    >
                      <Iconify
                        icon={row.uploadedDoc ? 'ci:file-upload' : 'ci:file-upload'}
                        sx={{
                          color: row.uploadedDoc ? 'primary.main' : 'text.secondary',
                        }}
                      />
                    </UploadButton>
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
            minWidth: '6vw',
            align: 'left',
            excludeFromExport: true,
            render(value, row) {
              const isUploading = uploadingRows[row.id];
              const isDisabled = !row.uploadedDoc || isUploading;
              return (
                <Tooltip title={isDisabled ? 'Upload a document first' : 'View document'}>
                  <span>
                    <IconButton
                      style={{
                        textAlign: 'left',
                        marginLeft: '0px',
                        justifyContent: 'flex-start',
                        display: 'flex',
                      }}
                      disabled={isDisabled}
                      onClick={() => {
                        setDocId(row.uploadedDoc.documentId);
                        setViewFileName(row.uploadedDoc.fileName || row.title);
                        viewDialog.onTrue();
                      }}
                    >
                      <Iconify icon="carbon:view-filled" sx={{ transition: 'color 0.2s ease' }} />
                    </IconButton>
                  </span>
                </Tooltip>
              );
            },
          },
          {
            id: 'download',
            label: 'Download',
            isFilter: false,
            isSort: false,
            minWidth: '6vw',
            align: 'left',
            excludeFromExport: true,
            render(value, row) {
              const isUploading = uploadingRows[row.id];
              const isDownloading = downloadingRows[row.id];
              const isDisabled = !row.uploadedDoc || isUploading || isDownloading;
              return (
                <Tooltip title={isDisabled ? 'Upload a document first' : 'Download document'}>
                  <span>
                    <IconButton
                      style={{
                        textAlign: 'left',
                        marginLeft: '0px',
                        justifyContent: 'flex-start',
                        display: 'flex',
                      }}
                      disabled={isDisabled}
                      onClick={async () => {
                        const { documentId, fileName } = row.uploadedDoc;
                        setDownloadingRows((prev) => ({ ...prev, [row.id]: true }));
                        try {
                          const blob = await fetchDocument({
                            employeeId,
                            documentId,
                          }).unwrap();
                          // Create a temporary URL and trigger browser download
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = fileName || row.title || 'document';
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        } catch {
                          shikshaMitraToast.error({ message: 'Failed to download document' });
                        } finally {
                          setDownloadingRows((prev) => ({ ...prev, [row.id]: false }));
                        }
                      }}
                    >
                      {isDownloading ? (
                        <CircularProgress size={18} thickness={4} />
                      ) : (
                        <Iconify
                          icon={GlobalIcons.download}
                          sx={{ transition: 'color 0.2s ease' }}
                        />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
              );
            },
          },
        ]}
        data={tableData}
        {...operationalTableProps}
      />

      <CustomDialog
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">{viewFileName || 'Preview Document'}</Typography>
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
        fullWidth
      >
        <Box p={2} display="flex" justifyContent="center">
          <ViewDocuments employeeId={employeeId} docId={docId} fileName={viewFileName} />
        </Box>
      </CustomDialog>
    </>
  );
};
