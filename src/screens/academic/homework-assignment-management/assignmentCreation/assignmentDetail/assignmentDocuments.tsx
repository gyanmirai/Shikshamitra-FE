import { useState } from 'react';

import { Box, Grid, Card, Link, Tooltip, IconButton, Typography } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { getFileIconData } from 'src/enums/file-icons-map';
import subjectDocumentsData from 'src/json/academic/curriculum/subjectsDocuments.json';

import { Iconify } from 'src/components/iconify';

import type { IAssignment } from '../type';

const AssignmentDocuments = ({ assignment }: { assignment: IAssignment | null }) => {
  // State to manage subject documents data
  const [subjectDocuments, setSubjectDocuments] = useState(subjectDocumentsData);
  return (
    <Box>
      <Grid container spacing={2}>
        {subjectDocuments.documents?.map((doc: any, index: number) => (
          <Grid item xs={12} md={6} key={index}>
            <Card
              variant="outlined"
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                position: 'relative',
                '&:hover': {
                  boxShadow: 1,
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Iconify
                  icon={
                    doc.name?.endsWith('.pdf')
                      ? 'mdi:file-pdf-box'
                      : doc.name?.endsWith('.doc') || doc.name?.endsWith('.docx')
                        ? 'mdi:file-word-box'
                        : doc.name?.endsWith('.xls') || doc.name?.endsWith('.xlsx')
                          ? 'mdi:file-excel-box'
                          : doc.name?.endsWith('.ppt') || doc.name?.endsWith('.pptx')
                            ? 'mdi:file-powerpoint-box'
                            : 'mdi:file-outline'
                  }
                  sx={{
                    height: 30,
                    width: 30,
                    color: doc.name?.endsWith('.pdf')
                      ? '#f44336'
                      : doc.name?.endsWith('.doc') || doc.name?.endsWith('.docx')
                        ? '#2196f3'
                        : doc.name?.endsWith('.xls') || doc.name?.endsWith('.xlsx')
                          ? '#4caf50'
                          : doc.name?.endsWith('.ppt') || doc.name?.endsWith('.pptx')
                            ? '#ff9800'
                            : 'text.secondary',
                  }}
                />
                <Box sx={{ ml: 1.5, flex: 1 }}>
                  <Typography variant="subtitle2" noWrap title={doc.name}>
                    {doc.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {doc.size || 'Unknown size'} • {doc.uploadDate || 'Unknown date'}
                  </Typography>
                </Box>
                <Box
                  className="document-actions"
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  <Tooltip title="Preview">
                    <IconButton size="small">
                      <Iconify icon={GlobalIcons.eye} />
                    </IconButton>
                  </Tooltip>
                  {doc.url && (
                    <Tooltip title="Download">
                      <IconButton
                        component={Link}
                        href={doc.url}
                        target="_blank"
                        rel="noopener"
                        download
                        size="small"
                      >
                        <Iconify icon={GlobalIcons.download} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>
            </Card>
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
