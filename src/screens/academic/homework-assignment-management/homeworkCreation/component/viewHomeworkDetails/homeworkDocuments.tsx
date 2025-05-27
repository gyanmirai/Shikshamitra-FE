import { useState } from 'react';

import { Box, Grid, Card, Link, Tooltip, IconButton, Typography, CardContent } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { getFileIconData } from 'src/enums/file-icons-map';
import subjectDocumentsData from 'src/json/academic/curriculum/subjectsDocuments.json';

import { Iconify } from 'src/components/iconify';

import type { IHomework } from '../../type';

const HomeworkDocuments = ({ homework }: { homework: IHomework | null }) => {
  // State to manage subject documents data
  const [subjectDocuments, setSubjectDocuments] = useState(subjectDocumentsData);
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
                    <FileIcon fileName={doc.name} />

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

export default HomeworkDocuments;

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
