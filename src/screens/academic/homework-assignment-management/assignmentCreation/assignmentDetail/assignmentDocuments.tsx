import { Iconify } from 'src/components/iconify';
import { Box, Grid, Typography } from '@mui/material';
import { getFileIconData } from 'src/enums/file-icons-map';
import DocumentCard from 'src/components/preview-document/DocumentCard';

import type { IAssignment } from '../type';

const mapAttachmentToDocumentCardFile = (attachment: any, index: number) => {
  if (typeof attachment === 'string') {
    const fileName = attachment.split('/').pop() || `Document ${index + 1}`;
    return {
      path: attachment,
      relativePath: attachment,
      name: fileName,
      size: '',
      uploadDate: '',
      type: fileName.split('.').pop() || 'file',
      url: attachment,
    };
  }

  return {
    path: attachment?.filePath || attachment?.url || '',
    relativePath: attachment?.filePath || attachment?.url || '',
    name: attachment?.fileName || attachment?.name || `Document ${index + 1}`,
    size: attachment?.fileSize ? `${(attachment.fileSize / (1024 * 1024)).toFixed(1)} MB` : '',
    uploadDate: attachment?.createdAt || '',
    type: attachment?.fileType || attachment?.type || 'file',
    url: attachment?.filePath || attachment?.url || '',
  };
};

const AssignmentDocuments = ({ assignment }: { assignment: IAssignment | null }) => {
  const attachments = [
    ...(((assignment as any)?.attachments || []) as any[]),
    ...((assignment as any)?.attachment ? [(assignment as any).attachment] : []),
  ];

  if (attachments.length === 0) {
    return (
      <Box p={3} display="flex" justifyContent="center" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          No documents attached.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={2}>
        {attachments.map((attachment: any, index: number) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={attachment?.id || index}>
            <DocumentCard file={mapAttachmentToDocumentCardFile(attachment, index)} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AssignmentDocuments;

export const FileIcon = ({ fileName }: { fileName: string }) => {
  const { icon, color } = getFileIconData(fileName);

  return (
    <Iconify
      icon={icon}
      sx={{
        height: 40,
        width: 40,
        color,
      }}
    />
  );
};
