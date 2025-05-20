import {
  Box,
  Card,
  Grid,
  Link,
  Paper,
  Tooltip,
  Typography,
  IconButton,
  CardContent,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';

// Documents panel content
const SubjectDocument = ({ subject }: { subject: any }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        {subject?.subjects?.[0]?.documents && subject?.subjects?.[0]?.documents.length > 0 ? (
          <Grid container spacing={2}>
            {subject.subjects[0].documents.map((doc: any, index: number) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
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
                        fontSize: 40,
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
                        <Iconify icon="mdi:eye" />
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
                          <Iconify icon="mdi:download" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ justifyItems: 'center' }}>
            <Iconify
              icon="mdi:file-document-off"
              sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }}
            />
            <Typography variant="subtitle1" color="text.secondary">
              No documents attached
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upload course materials, syllabi, or other relevant documents
            </Typography>
            <UploadBox
              onDrop={() => {}}
              placeholder={
                <Box
                  sx={{
                    gap: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    color: 'text.disabled',
                    flexDirection: 'column',
                    minHeight: 120,
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="eva:cloud-upload-fill" width={40} />
                  <Typography variant="body2">Upload Document</Typography>
                </Box>
              }
              sx={{
                height: '100%',
                width: '100%',
                borderRadius: 1.5,
                minHeight: 120,
                bgcolor: 'grey.50',
              }}
            />
          </Box>
        )}
      </Box>
    </CardContent>
  </Card>
);

export default SubjectDocument;
