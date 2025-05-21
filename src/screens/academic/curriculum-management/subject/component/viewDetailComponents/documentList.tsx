// src/components/DocumentList.tsx

import {
  Box,
  List,
  Tooltip,
  ListItem,
  IconButton,
  Typography,
  ListItemIcon,
  ListItemText,
} from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';

import type { IDocType, IDocument } from '../type';

interface DocumentListProps {
  documents: IDocument[];
  onDownload?: (doc: IDocument) => void;
}

const DocumentList = ({ documents, onDownload }: DocumentListProps) => {
  const handleDownload = (doc: IDocument) => {
    if (onDownload) {
      onDownload(doc);
    } else {
      window.open(doc.url, '_blank');
    }
  };

  if (!documents || documents.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
        No documents available.
      </Typography>
    );
  }

  return (
    <Box>
      <Typography
        variant="subtitle1"
        color="text.secondary"
        sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
      >
        <Iconify icon="mdi:file-document-multiple" sx={{ mr: 1 }} />
        Documents:
      </Typography>
      <List sx={{ width: '100%', p: 0, borderRadius: 1 }}>
        {documents.map((doc) => (
          <ListItem
            key={doc.id}
            sx={{
              borderRadius: 1,
              '&:hover': { bgcolor: 'action.hover' },
            }}
            secondaryAction={
              <Tooltip title="Download">
                <IconButton edge="end" aria-label="download" onClick={() => handleDownload(doc)}>
                  <Iconify icon={GlobalIcons.download} />
                </IconButton>
              </Tooltip>
            }
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {getFileIconByType(doc.type ?? 'txt', 32)}
            </ListItemIcon>
            <ListItemText
              primary={doc.name}
              secondary={
                <Typography component="span" variant="body2" color="text.secondary">
                  {doc.size && ` • ${doc.size}`}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default DocumentList;

const docTypeIconMap: Record<IDocType, { icon: string; color: string }> = {
  pdf: { icon: 'mdi:file-pdf-box', color: '#e53935' },
  doc: { icon: 'mdi:file-word-box', color: '#1976d2' },
  docx: { icon: 'mdi:file-word-box', color: '#1976d2' },
  ppt: { icon: 'mdi:file-powerpoint-box', color: '#d84315' },
  pptx: { icon: 'mdi:file-powerpoint-box', color: '#d84315' },
  xls: { icon: 'mdi:file-excel-box', color: '#388e3c' },
  xlsx: { icon: 'mdi:file-excel-box', color: '#388e3c' },
  image: { icon: 'mdi:file-image', color: '#8e24aa' },
  video: { icon: 'mdi:file-video', color: '#0288d1' },
  audio: { icon: 'mdi:file-music', color: '#6d4c41' },
  zip: { icon: 'mdi:folder-zip', color: '#fbc02d' },
  csv: { icon: 'mdi:file-delimited', color: '#388e3c' },
  txt: { icon: 'mdi:file-document-outline', color: '#757575' },
};

const defaultIcon = { icon: 'mdi:file-document-outline', color: '#757575' };

export function getFileIconByType(type: IDocType | string, size = 24) {
  const { icon, color } = docTypeIconMap[type] || defaultIcon;
  return <Iconify icon={icon} color={color} width={size} height={size} />;
}
