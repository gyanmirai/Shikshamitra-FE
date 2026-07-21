import type { LearningResourceDto } from 'src/redux/academicAPI/CurriculumManagementApi/LearningResourcesApi/learning-resources-api';

import React from 'react';
import { Icon } from '@iconify/react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { Box, Card, Chip, Stack, Button, IconButton, Typography } from '@mui/material';

interface HierarchyTreeProps {
  resources: LearningResourceDto[];
  isLoading?: boolean;
  onEdit: (resource: LearningResourceDto) => void;
  onArchive: (resource: LearningResourceDto) => void;
  onPublish: (resource: LearningResourceDto) => void;
}

type ResourceGroup = Record<string, Record<string, Record<string, LearningResourceDto[]>>>;

const statusLabel: Record<number, string> = {
  0: 'Draft',
  1: 'Submitted',
  2: 'Published',
  3: 'Rejected',
  4: 'Archived',
};

const HierarchyTree: React.FC<HierarchyTreeProps> = ({
  resources,
  isLoading,
  onEdit,
  onArchive,
  onPublish,
}) => {
  const deleteDocumentDialog = useBoolean();
  const [pendingArchive, setPendingArchive] = React.useState<LearningResourceDto | null>(null);
  const [selectedResource, setSelectedResource] = React.useState<LearningResourceDto | null>(null);

  const groupedResources = resources.reduce<ResourceGroup>((acc, resource) => {
    const standard = resource.standardName || 'Class';
    const subject = resource.subjectName || 'Subject';
    const chapter = resource.chapterName || 'General';
    acc[standard] ??= {};
    acc[standard][subject] ??= {};
    acc[standard][subject][chapter] ??= [];
    acc[standard][subject][chapter].push(resource);
    return acc;
  }, {});

  const renderDocuments = (docs: LearningResourceDto[], parentId: string) =>
    docs.map((doc) => (
      <TreeItem
        key={doc.id}
        itemId={`${parentId}-doc-${doc.id}`}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedResource(doc);
        }}
        label={
          <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
            <Box display="flex" alignItems="center" gap={1}>
              <Iconify icon="solar:document-text-bold" width={18} />
              <Typography variant="body2">{doc.resourceTitle}</Typography>
            </Box>
            <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
              {doc.status !== 2 && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPublish(doc);
                  }}
                >
                  <Iconify icon="solar:upload-square-bold" width={18} />
                </IconButton>
              )}
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(doc);
                }}
              >
                <Iconify icon={GlobalIcons.edit} width={18} sx={{ cursor: 'pointer' }} />
              </IconButton>

              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setPendingArchive(doc);
                  deleteDocumentDialog.onTrue();
                }}
              >
                <Iconify
                  icon={GlobalIcons.delete}
                  width={18}
                  sx={{ color: 'red', cursor: 'pointer' }}
                />
              </IconButton>
            </Box>
          </Box>
        }
      />
    ));

  const renderChapters = (chapters: Record<string, LearningResourceDto[]>, parentId: string) =>
    Object.entries(chapters).map(([chapterName, docs]) => (
      <TreeItem
        key={chapterName}
        itemId={`${parentId}-chapter-${chapterName}`}
        label={
          <Box display="flex" alignItems="center" gap={1}>
            <Iconify icon="mdi:folder" width={18} sx={{ color: 'orange', cursor: 'pointer' }} />
            <Typography variant="body2">{chapterName}</Typography>
          </Box>
        }
      >
        {renderDocuments(docs, `${parentId}-chapter-${chapterName}`)}
      </TreeItem>
    ));

  const renderSubjects = (
    subjects: Record<string, Record<string, LearningResourceDto[]>>,
    className: string
  ) =>
    Object.entries(subjects).map(([subjectName, chapters]) => (
      <TreeItem
        key={subjectName}
        itemId={`${className}-subject-${subjectName}`}
        label={
          <Box display="flex" alignItems="center" gap={1}>
            <Iconify icon="mdi:folder" width={18} sx={{ color: 'orange', cursor: 'pointer' }} />
            <Typography variant="body2">{subjectName}</Typography>
          </Box>
        }
        onClick={() => setSelectedResource(null)}
      >
        {renderChapters(chapters, `${className}-subject-${subjectName}`)}
      </TreeItem>
    ));

  return (
    <Box sx={{ display: 'flex', height: '100%', gap: 1 }}>
      {/* Left Tree Card */}
      <Card
        sx={{
          width: '30%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '3px',
        }}
      >
        <Scrollbar sx={{ flex: 1 }}>
          <SimpleTreeView
            defaultExpandedItems={Object.keys(groupedResources).slice(0, 1)}
            onItemClick={() => setSelectedResource(null)}
            slots={{
              collapseIcon: () => <Icon icon="mdi:chevron-down" width={20} />,
              expandIcon: () => <Icon icon="mdi:chevron-right" width={20} />,
            }}
            sx={{ p: 2 }}
          >
            {Object.entries(groupedResources).map(([className, subjects]) => (
              <TreeItem
                key={className}
                itemId={className}
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Iconify
                      icon="mdi:folder"
                      width={18}
                      sx={{ color: 'orange', cursor: 'pointer' }}
                    />
                    <Typography variant="subtitle1">{className}</Typography>
                  </Box>
                }
              >
                {renderSubjects(subjects, className)}
              </TreeItem>
            ))}
            {!isLoading && resources.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                No learning resources found.
              </Typography>
            )}
          </SimpleTreeView>
        </Scrollbar>
      </Card>

      {/* Right Content Card */}
      <Card sx={{ width: '70%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Scrollbar sx={{ flex: 1, p: 2 }}>
          {selectedResource ? (
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6">{selectedResource.resourceTitle}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedResource.standardName} / {selectedResource.subjectName} /{' '}
                    {selectedResource.chapterName}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={statusLabel[selectedResource.status] || 'Unknown'}
                  color={selectedResource.status === 2 ? 'success' : 'default'}
                />
              </Stack>
              <Card variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>File:</strong> {selectedResource.fileName}
                </Typography>
                <Typography variant="body2">
                  <strong>Type:</strong> {selectedResource.resourceType}
                </Typography>
                <Typography variant="body2">
                  <strong>Visibility:</strong> {selectedResource.visibility}
                </Typography>
                {selectedResource.topic && (
                  <Typography variant="body2">
                    <strong>Topic:</strong> {selectedResource.topic}
                  </Typography>
                )}
              </Card>
            </Stack>
          ) : (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              height="100%"
              sx={{
                backgroundColor: (theme) => theme.vars.palette.background.neutral,
                borderRadius: 1,
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  color: (theme) => theme.vars.palette.text.secondary,
                  fontWeight: 'light',
                  textAlign: 'center',
                  opacity: 0.6,
                }}
              >
                Select a resource to view details
              </Typography>
            </Box>
          )}
        </Scrollbar>
      </Card>
      <ConfirmDialog
        open={deleteDocumentDialog.value}
        onClose={() => {
          deleteDocumentDialog.onFalse();
        }}
        title="Delete"
        content="Are you sure you want to Delete Resource ?"
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.delete} />}
            color="error"
            onClick={() => {
              if (pendingArchive) {
                onArchive(pendingArchive);
              }
              setPendingArchive(null);
              deleteDocumentDialog.onFalse();
            }}
          >
            Archive
          </Button>
        }
      />
    </Box>
  );
};

export default HierarchyTree;
