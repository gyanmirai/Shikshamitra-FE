import type { NodeProps } from 'src/components/organizational-chart';

import { Icon } from '@iconify/react';
import React, { useEffect } from 'react';
import { PDFViewer } from '@react-pdf/renderer';

import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { Box, Card, Stack, Button, IconButton, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { CertificateDocument } from 'src/templates/student-certificates/bonofied-certificate-1';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { FileThumbnail } from 'src/components/file-thumbnail';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { GroupNode } from 'src/components/organizational-chart/groupNode';
import { OrganizationalChart } from 'src/components/organizational-chart';

import { dummyData } from './treeData';
import { ORGANIZED_CLASS_TREES } from './transformClassData';

import type { IChapter, ISubject } from '../type';

// Dummy File object creation utility

const HierarchyTree: React.FC = () => {
  // Boolean state to control document deletion dialog visibility
  const deleteDocumentDialog = useBoolean();
  // State to track the currently selected class ID in the tree structure
  const [selectedClassId, setSelectedClassId] = React.useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = React.useState<File | null>(null);

  // Effect hook to set initial selected class ID
  // If no class is selected and dummy data exists, select the first class
  useEffect(() => {
    if (!selectedClassId && dummyData.length > 0) {
      setSelectedClassId(dummyData[0].id);
    }
  }, [selectedClassId]);

  // Renders document items in the tree structure
  // @param docs - Array of File objects to render
  // @param parentId - ID of the parent node to create unique keys
  const renderDocuments = (docs: File[], parentId: string) =>
    docs.map((doc, idx) => (
      <TreeItem
        key={`${parentId}-doc-${idx}`}
        itemId={`${parentId}-doc-${idx}`}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedDocument(doc);
        }}
        label={
          <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
            <Box display="flex" alignItems="center" gap={1}>
              <FileThumbnail file={doc} sx={{ height: '18px' }} />
              <Typography variant="body2">{doc.name}</Typography>
            </Box>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation(); // Prevent parent tree item selection
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
        }
      />
    ));

  const renderChapters = (chapters: IChapter[], parentId: string) =>
    chapters.map((chapter) => (
      <TreeItem
        key={chapter.id}
        itemId={`${parentId}-chapter-${chapter.id}`}
        label={
          <Box display="flex" alignItems="center" gap={1}>
            <Iconify icon="mdi:folder" width={18} sx={{ color: 'orange', cursor: 'pointer' }} />
            <Typography variant="body2">{chapter.name}</Typography>
          </Box>
        }
      >
        {renderDocuments(chapter.documents, `${parentId}-chapter-${chapter.id}`)}
      </TreeItem>
    ));

  const renderSubjects = (subjects: ISubject[], classId: string) =>
    subjects.map((subject) => (
      <TreeItem
        key={subject.id}
        itemId={`${classId}-subject-${subject.id}`}
        label={
          <Box display="flex" alignItems="center" gap={1}>
            <Iconify icon="mdi:folder" width={18} sx={{ color: 'orange', cursor: 'pointer' }} />
            <Typography variant="body2">{subject.name}</Typography>
          </Box>
        }
      >
        {subject.chapters && renderChapters(subject.chapters, `${classId}-subject-${subject.id}`)}
        {subject.documents &&
          renderDocuments(subject.documents, `${classId}-subject-${subject.id}`)}
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
            defaultExpandedItems={[dummyData[0].id]}
            onItemClick={(event, itemId) => {
              // Only update if it's a top-level class node
              if (dummyData.some((cls) => cls.id === itemId)) {
                setSelectedClassId(itemId);
                setSelectedDocument(null);
              }
            }}
            slots={{
              collapseIcon: () => <Icon icon="mdi:chevron-down" width={20} />,
              expandIcon: () => <Icon icon="mdi:chevron-right" width={20} />,
            }}
            sx={{ p: 2 }}
          >
            {dummyData.map((classItem) => (
              <TreeItem
                key={classItem.id}
                itemId={classItem.id}
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Iconify
                      icon="mdi:folder"
                      width={18}
                      sx={{ color: 'orange', cursor: 'pointer' }}
                    />
                    <Typography variant="subtitle1">{classItem.name}</Typography>
                  </Box>
                }
              >
                {renderSubjects(classItem.subjects, classItem.id)}
              </TreeItem>
            ))}
          </SimpleTreeView>
        </Scrollbar>
      </Card>

      {/* Right Content Card */}
      <Card sx={{ width: '70%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Scrollbar sx={{ flex: 1, p: 2 }}>
          {selectedDocument ? (
            <Box height="100%">
              <PDFViewer width="100%" height="100%">
                <CertificateDocument />
              </PDFViewer>
            </Box>
          ) : (
            <Stack spacing={5}>
              {ORGANIZED_CLASS_TREES.filter(
                (tree) => tree.name === dummyData.find((cls) => cls.id === selectedClassId)?.name
              ).map((tree, idx) => (
                <OrganizationalChart
                  key={idx}
                  lineHeight="56px"
                  data={tree}
                  nodeItem={(props: NodeProps) => (
                    <GroupNode {...props} type={props.type as 'class' | 'subject'} />
                  )}
                />
              ))}
            </Stack>
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
            onClick={() => {}}
          >
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default HierarchyTree;
