import { CONFIG } from 'src/config-global';
import React, { useRef, useState } from 'react';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import {
  Box,
  List,
  Button,
  Dialog,
  ListItem,
  Collapse,
  TextField,
  IconButton,
  DialogTitle,
  ListItemIcon,
  ListItemText,
  DialogContent,
} from '@mui/material';

import { Iconify } from '../iconify';

interface FileSystemItem {
  name: string;
  type: 'file' | 'folder';
  children?: FileSystemItem[];
  content?: string;
}

interface FileTreeProps {
  treeData: FileSystemItem[];
  setTreeData: React.Dispatch<React.SetStateAction<FileSystemItem[]>>;
}

const FileTreeItem: React.FC<{
  item: FileSystemItem;
  level: number;
  onAddItem: (parentItem: FileSystemItem, newItem: FileSystemItem) => void;
  onAddFiles: (parentItem: FileSystemItem, files: File[]) => void;
  onRenameItem: (item: FileSystemItem, newName: string) => void;
  onDeleteItem: (item: FileSystemItem) => void;
  onPreviewFile: (item: FileSystemItem) => void;
  isFirstFolder: boolean;
  activeFile: FileSystemItem | null;
}> = ({
  item,
  level,
  onAddItem,
  onAddFiles,
  onRenameItem,
  onDeleteItem,
  onPreviewFile,
  isFirstFolder,
  activeFile,
}) => {
  const [open, setOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToggle = () => {
    setOpen(!open);
  };

  const handleAddClick = () => {
    setIsAdding(true);
  };

  const handleAddSubmit = () => {
    if (newItemName) {
      onAddItem(item, { name: newItemName, type: 'folder' });
      setNewItemName('');
      setIsAdding(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (files && files.length > 0) {
      onAddFiles(item, Array.from(files));
    }
  };

  const handleRenameClick = () => {
    setIsRenaming(true);
    setNewItemName(item.name);
  };

  const handleRenameSubmit = () => {
    if (newItemName && newItemName !== item.name) {
      onRenameItem(item, newItemName);
      setIsRenaming(false);
    }
  };

  const handleDeleteClick = () => {
    onDeleteItem(item);
  };

  const handleFileClick = () => {
    if (item.type === 'file') {
      onPreviewFile(item);
    }
  };

  return (
    <>
      <ListItem
        sx={{
          pl: level * 2,
          bgcolor: activeFile === item ? 'action.selected' : 'inherit',
        }}
      >
        {item.type === 'folder' && (
          <IconButton edge="end" size="small" onClick={handleToggle}>
            {open ? <ExpandMoreIcon /> : <ChevronRightIcon />}
          </IconButton>
        )}
        <ListItemIcon>
          {item.type === 'folder' ? (
            <Box
              component="img"
              src={`${CONFIG.site.basePath}/assets/icons/files/ic-folder.svg`}
              sx={{ width: '24px', height: '24px' }}
            />
          ) : (
            <FileIcon />
          )}
        </ListItemIcon>
        {isRenaming ? (
          <TextField
            size="small"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyPress={(e) => e.key === 'Enter' && handleRenameSubmit()}
            autoFocus
          />
        ) : (
          <ListItemText
            primary={item.name}
            onClick={handleFileClick}
            sx={{ cursor: 'pointer', flex: '0 0 auto' }}
          />
        )}
        {item.type === 'folder' && (
          <>
            <IconButton edge="end" size="small" onClick={handleAddClick}>
              <AddIcon />
            </IconButton>
            <IconButton edge="end" size="small" onClick={() => fileInputRef.current?.click()}>
              <Iconify icon="material-symbols:upload-file-sharp" />
            </IconButton>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              multiple
            />
          </>
        )}
        <IconButton edge="end" size="small" onClick={handleRenameClick}>
          <Iconify icon="fluent:edit-12-filled" />
        </IconButton>
        {!isFirstFolder && (
          <IconButton edge="end" size="small" onClick={handleDeleteClick}>
            <DeleteIcon sx={{ color: 'error.main' }} />
          </IconButton>
        )}
      </ListItem>
      {item.type === 'folder' && isAdding && (
        <ListItem sx={{ pl: (level + 1) * 2 }}>
          <TextField
            size="small"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Enter folder name"
          />
          <Button onClick={handleAddSubmit}>Add Folder</Button>
        </ListItem>
      )}
      {item.type === 'folder' && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children?.map((child, index) => (
              <FileTreeItem
                key={index}
                item={child}
                level={level + 1}
                onAddItem={onAddItem}
                onAddFiles={onAddFiles}
                onRenameItem={onRenameItem}
                onDeleteItem={onDeleteItem}
                onPreviewFile={onPreviewFile}
                isFirstFolder={false}
                activeFile={activeFile}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

const CustomFileFolder: React.FC<FileTreeProps> = ({ treeData, setTreeData }) => {
  const [activeFile, setActiveFile] = useState<FileSystemItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleAddItem = (parentItem: FileSystemItem, newItem: FileSystemItem) => {
    const updateTree = (items: FileSystemItem[]): FileSystemItem[] =>
      items.map((item) => {
        if (item === parentItem) {
          return {
            ...item,
            children: [...(item.children || []), newItem],
          };
        }
        if (item.children) {
          return {
            ...item,
            children: updateTree(item.children),
          };
        }
        return item;
      });

    setTreeData(updateTree(treeData));
  };

  const handleAddFiles = (parentItem: FileSystemItem, files: File[]) => {
    const newItems: FileSystemItem[] = files.map((file) => ({
      name: file.name,
      type: 'file',
      content: URL.createObjectURL(file),
    }));
    const updateTree = (items: FileSystemItem[]): FileSystemItem[] =>
      items.map((item) => {
        if (item === parentItem) {
          return {
            ...item,
            children: [...(item.children || []), ...newItems],
          };
        }
        if (item.children) {
          return {
            ...item,
            children: updateTree(item.children),
          };
        }
        return item;
      });

    setTreeData(updateTree(treeData));
  };

  const handleRenameItem = (itemToRename: FileSystemItem, newName: string) => {
    const updateTree = (items: FileSystemItem[]): FileSystemItem[] =>
      items.map((item) => {
        if (item === itemToRename) {
          return { ...item, name: newName };
        }
        if (item.children) {
          return {
            ...item,
            children: updateTree(item.children),
          };
        }
        return item;
      });

    setTreeData(updateTree(treeData));
  };

  const handleDeleteItem = (itemToDelete: FileSystemItem) => {
    const updateTree = (items: FileSystemItem[]): FileSystemItem[] =>
      items.filter((item) => {
        if (item === itemToDelete) {
          return false;
        }
        if (item.children) {
          return {
            ...item,
            children: updateTree(item.children),
          };
        }
        return true;
      });

    setTreeData(updateTree(treeData));
  };

  const handlePreviewFile = (item: FileSystemItem) => {
    setActiveFile(item);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
  };

  return (
    <>
      <List>
        {treeData.map((item, index) => (
          <FileTreeItem
            key={index}
            item={item}
            level={0}
            onAddItem={handleAddItem}
            onAddFiles={handleAddFiles}
            onRenameItem={handleRenameItem}
            onDeleteItem={handleDeleteItem}
            onPreviewFile={handlePreviewFile}
            isFirstFolder={index === 0 && item.type === 'folder'}
            activeFile={activeFile}
          />
        ))}
      </List>
      <Dialog open={previewOpen} onClose={handleClosePreview} maxWidth="md" fullWidth>
        <DialogTitle>{activeFile?.name}</DialogTitle>
        <DialogContent>
          {activeFile?.type === 'file' && activeFile.content && (
            <Box
              component="img"
              src={activeFile.content}
              sx={{ maxWidth: '100%', maxHeight: '80vh' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomFileFolder;
