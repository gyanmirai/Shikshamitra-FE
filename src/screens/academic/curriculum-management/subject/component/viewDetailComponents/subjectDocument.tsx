import { useState } from 'react';

import { Box, Card, Grid, Link, Tooltip, Typography, IconButton, CardContent } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import subjectDocumentsData from 'src/json/academic/curriculum/subjectsDocuments.json';

import { Iconify } from 'src/components/iconify';

import type { ISubject } from '../type';

// Documents panel content
const SubjectDocument = ({ subject }: { subject: ISubject | null }) => {
  const [subjectDocuments, setSubjectDocuments] = useState(subjectDocumentsData);
  console.log('subjectDocuments--', subjectDocuments);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2}>
            {subjectDocuments.documents?.map((doc: any, index: number) => (
              <Grid item xs={12} key={index}>
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
                      '& .document-actions': {
                        opacity: 1,
                      },
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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
                        height: 40,
                        width: 40,
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
                    <Box sx={{ ml: 2, flex: 1 }}>
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
                        mt: 'auto',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        opacity: 0.4,
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
      </CardContent>
    </Card>
  );
};

export default SubjectDocument;
