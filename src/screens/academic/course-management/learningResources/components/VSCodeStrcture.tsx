// import React, { useCallback, useState } from 'react';
// import {
//   Box,
//   Typography,
//   IconButton,
//   Menu,
//   MenuItem,
//   Collapse,
//   Button,
//   TextField,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Grid,
//   Paper,
//   Divider,
//   Card,
//   CardContent,
//   MenuList,
// } from '@mui/material';
// import {
//   Folder,
//   FolderOpen,
//   InsertDriveFile,
//   MoreVert,
//   ExpandMore,
//   ExpandLess,
//   Add,
//   CreateNewFolder,
//   NoteAdd,
//   Close,
// } from '@mui/icons-material';
// import { Formik, Form } from 'formik';
// import * as Yup from 'yup';
// import { Scrollbar } from 'src/components/scrollbar';
// import { SingleFilePreview, Upload } from 'src/components/upload';
// import { FileThumbnail } from 'src/components/file-thumbnail';
// import ThreeDotsActions from 'src/components/three-dots-actions';
// import { Iconify } from 'src/components/iconify';
// import { GlobalIcons } from 'src/utils/icons';

// // Utility function to create file with path property
// const createFileWithPath = (originalFile: any, name: any, path: any) => {
//   if (!originalFile) return null;

//   // Create a new File object with the same content
//   const fileWithPath = new File([originalFile], name || originalFile.name, {
//     type: originalFile.type,
//     lastModified: originalFile.lastModified,
//   });

//   // Add path property for thumbnail generation
//   return Object.assign(fileWithPath, { path: path || name || originalFile.name });
// };

// // Utility function to get file path from tree structure
// const getFilePath = (
//   treeData: any[],
//   targetId: string,
//   currentPath: string = ''
// ): string | null => {
//   let result: string | null = null;

//   treeData.find((node) => {
//     const nodePath = [currentPath, node.name].filter(Boolean).join('/');

//     if (node.id === targetId) {
//       result = nodePath;
//       return true;
//     }

//     if (node.children) {
//       const childPath = getFilePath(node.children, targetId, nodePath);
//       if (childPath) {
//         result = childPath;
//         return true;
//       }
//     }

//     return false;
//   });
//   return result;
// };

// // Custom Dialog Component
// const CustomDialog = ({ open, handleClose, title, children }: any) => (
//   <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
//     <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//       {title}
//       <Divider />
//       <IconButton onClick={handleClose} size="small">
//         <Close />
//       </IconButton>
//     </DialogTitle>
//     {children}
//   </Dialog>
// );

// // Validation schemas
// const folderValidationSchema = Yup.object({
//   name: Yup.string()
//     .required('Folder name is required')
//     .trim()
//     .min(1, 'Folder name cannot be empty'),
// });

// const fileValidationSchema = Yup.object({
//   name: Yup.string().required('File name is required').trim().min(1, 'File name cannot be empty'),
//   file: Yup.mixed().when('isEdit', {
//     is: false,
//     then: (schema) => schema.required('Please select a file to upload'),
//     otherwise: (schema) => schema.nullable(),
//   }),
// });

// // Folder Form Component with Formik
// const FolderForm = ({ onClose, onSubmit, editData }: any) => {
//   const initialValues = {
//     name: editData?.name || '',
//   };

//   const handleSubmit = (values: any) => {
//     onSubmit({ name: values.name.trim(), type: 'folder' });
//     onClose();
//   };

//   return (
//     <Formik
//       initialValues={initialValues}
//       validationSchema={folderValidationSchema}
//       onSubmit={handleSubmit}
//       enableReinitialize
//     >
//       {({ values, errors, touched, handleChange, handleBlur, isValid, dirty }) => (
//         <Form>
//           <Box display="flex" flexDirection="column" gap={2} height="100%">
//             <Scrollbar sx={{ p: 2, height: '100%' }}>
//               <Grid container spacing={2}>
//                 <Grid item xs={12}>
//                   <TextField
//                     fullWidth
//                     name="name"
//                     label="Folder Name"
//                     value={values.name}
//                     onChange={handleChange}
//                     onBlur={handleBlur}
//                     placeholder="Enter folder name"
//                     autoFocus
//                     size="small"
//                     error={touched.name && Boolean(errors.name)}
//                     helperText={(touched.name && errors.name) as string}
//                   />
//                 </Grid>
//               </Grid>
//             </Scrollbar>
//           </Box>
//           <DialogActions>
//             <Button
//               onClick={onClose}
//               size="small"
//               variant="outlined"
//               startIcon={<Iconify icon={GlobalIcons.cancel} />}
//             >
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               variant="contained"
//               size="small"
//               // disabled={!isValid || !dirty}
//               startIcon={<Iconify icon={editData ? GlobalIcons.edit : GlobalIcons.submit} />}
//             >
//               {editData ? 'Update' : 'Submit'}
//             </Button>
//           </DialogActions>
//         </Form>
//       )}
//     </Formik>
//   );
// };

// // File Form Component with Formik
// const FileForm = ({ onClose, onSubmit, editData }: any) => {
//   const [selectedFile, setSelectedFile] = useState(null);

//   const initialValues = {
//     name: editData?.name || '',
//     file: null,
//     isEdit: Boolean(editData),
//   };

//   const handleSubmit = (values: any) => {
//     onSubmit({
//       name: values.name.trim(),
//       file: selectedFile,
//     });
//     onClose();
//   };

//   // Handler to remove a single file attachment
//   const handleRemoveFile = useCallback((setFieldValue: any) => {
//     setFieldValue('file', null);
//     setSelectedFile(null);
//   }, []);

//   // Handler to remove all file attachments
//   const handleRemoveAllFiles = useCallback((setFieldValue: any) => {
//     setFieldValue('file', null);
//     setSelectedFile(null);
//   }, []);

//   return (
//     <Formik
//       initialValues={initialValues}
//       validationSchema={fileValidationSchema}
//       onSubmit={handleSubmit}
//       enableReinitialize
//     >
//       {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isValid }) => (
//         <Form>
//           <Box display="flex" flexDirection="column" gap={2} height="100%">
//             <Scrollbar sx={{ p: 2, height: '100%' }}>
//               <Grid container spacing={2}>
//                 <Grid item xs={12}>
//                   <TextField
//                     fullWidth
//                     name="name"
//                     label="File Name"
//                     value={values.name}
//                     onChange={handleChange}
//                     onBlur={handleBlur}
//                     placeholder="Enter file name"
//                     autoFocus
//                     size="small"
//                     error={touched.name && Boolean(errors.name)}
//                     helperText={(touched.name && errors.name) as string}
//                   />
//                 </Grid>

//                 <Grid item xs={12}>
//                   <Upload
//                     thumbnail
//                     value={values.file}
//                     onDrop={(acceptedFiles) => {
//                       const file = acceptedFiles[0];
//                       if (!file) return;

//                       setFieldValue('file', file);
//                       setSelectedFile(file as any);
//                     }}
//                     multiple={false}
//                     onDelete={() => handleRemoveFile(setFieldValue)}
//                     onRemoveAll={() => handleRemoveAllFiles(setFieldValue)}
//                     error={!!(touched.file && errors.file) || false}
//                     helperText={(touched.file && errors.file) || ''}
//                   />
//                 </Grid>
//               </Grid>
//             </Scrollbar>
//           </Box>
//           <DialogActions>
//             <Button
//               onClick={onClose}
//               size="small"
//               variant="outlined"
//               startIcon={<Iconify icon={GlobalIcons.cancel} />}
//             >
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               variant="contained"
//               size="small"
//               // disabled={!isValid}
//               startIcon={<Iconify icon={editData ? GlobalIcons.edit : GlobalIcons.submit} />}
//             >
//               {editData ? 'Update' : 'Submit'}
//             </Button>
//           </DialogActions>
//         </Form>
//       )}
//     </Formik>
//   );
// };

// // File Viewer Component - Updated to handle file with path
// const FileViewer = ({ file }: any) => {
//   if (!file) {
//     return (
//       <Box
//         display="flex"
//         alignItems="center"
//         justifyContent="center"
//         height="100%"
//         sx={{ color: 'text.secondary' }}
//       >
//         <Typography variant="h6">Select a file to view</Typography>
//       </Box>
//     );
//   }

//   // Check if the selected item actually has a valid file
//   if (!file.file || !(file.file instanceof File)) {
//     return (
//       <Card sx={{ height: '100%', p: 2 }}>
//         <Box display="flex" alignItems="center" gap={2} mb={3}>
//           <FileThumbnail
//             file={file.file || { name: file.name, path: file.path }}
//             sx={{
//               width: 48,
//               height: 48,
//               '& .MuiSvgIcon-root': {
//                 fontSize: '2rem',
//               },
//             }}
//           />
//           <Box>
//             <Typography variant="h6">{file.name}</Typography>
//             <Typography variant="body2" color="text.secondary">
//               {file.path || 'File information'}
//             </Typography>
//           </Box>
//         </Box>

//         <Box
//           sx={{
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             height: 300,
//             backgroundColor: 'background.neutral',
//             borderRadius: 1,
//             border: '1px dashed',
//             borderColor: 'divider',
//           }}
//         >
//           <Box textAlign="center">
//             <FileThumbnail
//               file={file.file || { name: file.name, path: file.path }}
//               sx={{
//                 width: 64,
//                 height: 64,
//                 mb: 2,
//                 '& .MuiSvgIcon-root': {
//                   fontSize: '4rem',
//                 },
//               }}
//             />
//             <Typography variant="body1" color="text.secondary">
//               {file.name}
//             </Typography>
//             <Typography variant="body2" color="text.secondary">
//               Preview not available
//             </Typography>
//           </Box>
//         </Box>
//       </Card>
//     );
//   }

//   // Only pass valid File objects to SingleFilePreview
//   return (
//     <Card sx={{ height: '100%', position: 'relative' }}>
//       <SingleFilePreview file={file.file} />
//     </Card>
//   );
// };

// export default function VSCodeFolderTreeView() {
//   const [treeData, setTreeData] = useState([]);
//   const [expandedNodes, setExpandedNodes] = useState(new Set());
//   const [anchorElMap, setAnchorElMap] = useState({});
//   const [selectedFile, setSelectedFile] = useState(null);

//   // Separate dialog states for folder and file
//   const [folderDialogState, setFolderDialogState] = useState({
//     open: false,
//     parentId: null,
//     editData: null,
//     mode: 'create', // 'create' or 'edit'
//   });

//   const [fileDialogState, setFileDialogState] = useState({
//     open: false,
//     parentId: null,
//     editData: null,
//     mode: 'create', // 'create' or 'edit'
//   });

//   // Toggle expanded state of a node
//   const toggleExpanded = (id: any) => {
//     const newSet = new Set(expandedNodes);
//     if (newSet.has(id)) {
//       newSet.delete(id);
//     } else {
//       newSet.add(id);
//     }
//     setExpandedNodes(newSet);
//   };

//   // Utility functions for tree operations
//   const insertItem = (nodes: any, parentId: any, newItem: any) =>
//     nodes.map((node: any) => {
//       if (node.id === parentId) {
//         return {
//           ...node,
//           children: [...(node.children || []), newItem],
//         };
//       }
//       if (node.children) {
//         return {
//           ...node,
//           children: insertItem(node.children, parentId, newItem),
//         };
//       }
//       return node;
//     });

//   const updateItem = (nodes: any, id: any, updates: any) =>
//     nodes.map((node: any) => {
//       if (node.id === id) return { ...node, ...updates };
//       if (node.children) return { ...node, children: updateItem(node.children, id, updates) };
//       return node;
//     });

//   const deleteItem = (nodes: any, id: any) =>
//     nodes
//       .map((node: any) => {
//         if (node.id === id) return null;
//         if (node.children) return { ...node, children: deleteItem(node.children, id) };
//         return node;
//       })
//       .filter(Boolean);

//   // Dialog management functions
//   const openFolderDialog = (mode: any, parentId = null, editData = null) => {
//     setFolderDialogState({
//       open: true,
//       parentId,
//       editData,
//       mode,
//     });
//   };

//   const closeFolderDialog = () => {
//     setFolderDialogState({
//       open: false,
//       parentId: null,
//       editData: null,
//       mode: 'create',
//     });
//   };

//   const openFileDialog = (mode: any, parentId = null, editData = null) => {
//     setFileDialogState({
//       open: true,
//       parentId,
//       editData,
//       mode,
//     });
//   };

//   const closeFileDialog = () => {
//     setFileDialogState({
//       open: false,
//       parentId: null,
//       editData: null,
//       mode: 'create',
//     });
//   };

//   // Handle folder creation/editing
//   const handleFolderSubmit = ({ name, type }: any) => {
//     const id = Date.now().toString();
//     const newFolder = {
//       id,
//       name,
//       type: 'folder',
//       children: [],
//     };

//     if (folderDialogState.mode === 'edit' && folderDialogState.editData) {
//       // Update existing folder
//       setTreeData(updateItem(treeData, folderDialogState.editData?.id || '', { name }));
//     } else if (folderDialogState.parentId === null) {
//       // Add to root
//       setTreeData([...treeData, newFolder] as any);
//     } else {
//       // Add to parent folder
//       setTreeData(insertItem(treeData, folderDialogState.parentId, newFolder));
//       setExpandedNodes((prev) => new Set(prev).add(folderDialogState.parentId));
//     }
//   };

//   // Handle file creation/editing - Updated to include path
//   const handleFileSubmit = ({ name, file }: any) => {
//     const id = Date.now().toString();

//     // Generate the file path based on parent folder structure
//     let filePath = name;
//     if (fileDialogState.parentId) {
//       const parentPath = getFilePath(treeData, fileDialogState.parentId);
//       filePath = parentPath ? `${parentPath}/${name}` : name;
//     }

//     // Create file with path property
//     const fileWithPath = file ? createFileWithPath(file, name, filePath) : null;

//     const newFile = {
//       id,
//       name,
//       type: 'file',
//       path: filePath,
//       file: fileWithPath, // Store the File object with path
//       content: file ? `File: ${file.name}\nSize: ${file.size} bytes` : '',
//     };

//     if (fileDialogState.mode === 'edit' && fileDialogState.editData) {
//       // Update existing file
//       const updates = { name };
//       if (file) {
//         // Recalculate path for updated file
//         let updatedPath = name;
//         if (fileDialogState.editData?.path) {
//           const pathParts = fileDialogState.editData.path.split('/');
//           pathParts[pathParts.length - 1] = name;
//           updatedPath = pathParts.join('/');
//         }

//         updates.file = createFileWithPath(file, name, updatedPath);
//         updates.path = updatedPath;
//         updates.content = `File: ${file.name}\nSize: ${file.size} bytes`;
//       } else {
//         // If no new file, just update the path with new name
//         const currentPath = fileDialogState.editData.path;
//         if (currentPath) {
//           const pathParts = fileDialogState.editData.path.split('/');
//           pathParts[pathParts.length - 1] = name;
//           updates.path = pathParts.join('/');
//         }
//       }
//       setTreeData(updateItem(treeData, fileDialogState.editData.id, updates));
//     } else if (fileDialogState.parentId === null) {
//       // Add to root
//       setTreeData([...treeData, newFile] as any);
//     } else {
//       // Add to parent folder
//       setTreeData(insertItem(treeData, fileDialogState.parentId, newFile));
//       setExpandedNodes((prev) => new Set(prev).add(fileDialogState.parentId));
//     }
//   };

//   // Handle item deletion
//   const handleDelete = (id: any) => {
//     setTreeData(deleteItem(treeData, id));
//     if (selectedFile?.id === id) {
//       setSelectedFile(null);
//     }
//   };

//   // Tree Node Component
//   const TreeNode = ({ node, depth = 0 }: any) => {
//     const isExpanded = expandedNodes.has(node.id);
//     const anchorEl = anchorElMap[node.id] || null;
//     const isSelected = selectedFile?.id === node.id;

//     const openMenu = (e) => {
//       e.stopPropagation();
//       setAnchorElMap((prev) => ({ ...prev, [node.id]: e.currentTarget }));
//     };

//     const closeMenu = () => {
//       setAnchorElMap((prev) => ({ ...prev, [node.id]: null }));
//     };

//     const handleNodeClick = () => {
//       if (node.type === 'folder') {
//         toggleExpanded(node.id);
//       } else {
//         setSelectedFile(node);
//       }
//     };

//     const actions = useCallback(
//       ({ popover: pop, row }: any) => (
//         <MenuList>
//           {/* Only show these two if it's a folder */}
//           {row.type === 'folder' && (
//             <>
//               <MenuItem
//                 onClick={() => {
//                   openFolderDialog('create', row.id);
//                   pop.onClose();
//                 }}
//               >
//                 <CreateNewFolder sx={{ mr: 1 }} fontSize="small" />
//                 Create Folder
//               </MenuItem>
//               <MenuItem
//                 onClick={() => {
//                   openFileDialog('create', row.id);
//                   pop.onClose();
//                 }}
//               >
//                 <NoteAdd sx={{ mr: 1 }} fontSize="small" />
//                 Create File
//               </MenuItem>
//             </>
//           )}

//           {/* Rename for both file/folder */}
//           <MenuItem
//             onClick={() => {
//               if (row.type === 'folder') {
//                 openFolderDialog('edit', null, row);
//               } else {
//                 openFileDialog('edit', null, row);
//               }
//               pop.onClose();
//             }}
//           >
//             <Iconify icon={GlobalIcons.edit} />
//             Rename
//           </MenuItem>

//           {/* Delete for both */}
//           <MenuItem
//             onClick={() => {
//               handleDelete(row.id);
//               pop.onClose();
//             }}
//             sx={{ color: 'error.main' }}
//           >
//             <Iconify icon={GlobalIcons.delete} />
//             Delete
//           </MenuItem>
//         </MenuList>
//       ),
//       [openFolderDialog, openFileDialog, handleDelete]
//     );

//     return (
//       <Box>
//         <Box
//           display="flex"
//           alignItems="center"
//           justifyContent="space-between"
//           sx={{
//             pl: depth * 2,
//             py: 0.5,
//             cursor: 'pointer',
//             backgroundColor: isSelected ? 'action.selected' : 'transparent',
//             '&:hover': {
//               backgroundColor: 'action.hover',
//             },
//           }}
//           onClick={handleNodeClick}
//         >
//           <Box display="flex" alignItems="center">
//             {node.type === 'folder' ? (
//               <>
//                 {isExpanded ? <ExpandLess /> : <ExpandMore />}
//                 {isExpanded ? (
//                   <FolderOpen sx={{ mx: 0.5, color: 'warning.main' }} />
//                 ) : (
//                   <Folder sx={{ mx: 0.5, color: 'warning.main' }} />
//                 )}
//               </>
//             ) : (
//               <>
//                 <Box sx={{ ml: 3, mr: 1, display: 'flex', alignItems: 'center' }}>
//                   <FileThumbnail
//                     file={node.file || { name: node.name, path: node.path }}
//                     sx={{
//                       width: 18,
//                       height: 18,
//                       '& .MuiSvgIcon-root': {
//                         fontSize: '18px',
//                       },
//                     }}
//                   />
//                 </Box>
//               </>
//             )}
//             <Typography variant="body2" sx={{ userSelect: 'none' }}>
//               {node.name}
//             </Typography>
//           </Box>

//           <ThreeDotsActions
//             actions={(prop) => actions({ ...prop, row: node })}
//             placement="right-top"
//           />
//         </Box>

//         {node.type === 'folder' && (
//           <Collapse in={isExpanded}>
//             {node.children?.map((child) => (
//               <TreeNode key={child.id} node={child} depth={depth + 1} />
//             ))}
//           </Collapse>
//         )}
//       </Box>
//     );
//   };

//   return (
//     <Box sx={{ height: '100vh', display: 'flex', gap: 2 }}>
//       {/* Left Panel - Folder Tree */}
//       <Paper
//         sx={{
//           width: 300,
//           borderRadius: 2,
//           borderRight: 1,
//           borderColor: 'divider',
//           display: 'flex',
//           flexDirection: 'column',
//         }}
//       >
//         <Box
//           sx={{
//             p: 1,
//             display: 'flex',
//             borderBottom: 1,
//             borderColor: 'divider',
//             justifyContent: 'space-between',
//           }}
//         >
//           <Typography variant="h6">Explorer</Typography>
//           {treeData.length === 0 && (
//             <Button
//               variant="outlined"
//               startIcon={<CreateNewFolder />}
//               onClick={() => openFolderDialog('create')}
//               size="small"
//             >
//               Create Folder
//             </Button>
//           )}
//         </Box>

//         <Scrollbar sx={{ height: '500px' }}>
//           {treeData.map((node: any) => (
//             <TreeNode key={node?.id ?? ''} node={node} />
//           ))}
//         </Scrollbar>

//         {treeData.length > 0 && (
//           <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
//             <Box display="flex" gap={1}>
//               <Button
//                 size="small"
//                 startIcon={<CreateNewFolder />}
//                 onClick={() => openFolderDialog('create')}
//                 variant="outlined"
//                 sx={{ flex: 1 }}
//               >
//                 Folder
//               </Button>
//               <Button
//                 size="small"
//                 startIcon={<NoteAdd />}
//                 onClick={() => openFileDialog('create')}
//                 variant="outlined"
//                 sx={{ flex: 1 }}
//               >
//                 File
//               </Button>
//             </Box>
//           </Box>
//         )}
//       </Paper>

//       {/* Right Panel - File Viewer */}
//       <Box sx={{ flex: 1 }}>
//         <FileViewer file={selectedFile} />
//       </Box>

//       {/* Folder Dialog */}
//       <CustomDialog
//         open={folderDialogState.open}
//         handleClose={closeFolderDialog}
//         title={folderDialogState.mode === 'edit' ? 'Rename Folder' : 'Create Folder'}
//       >
//         <FolderForm
//           onClose={closeFolderDialog}
//           onSubmit={handleFolderSubmit}
//           editData={folderDialogState.editData}
//         />
//       </CustomDialog>

//       {/* File Dialog */}
//       <CustomDialog
//         open={fileDialogState.open}
//         handleClose={closeFileDialog}
//         title={fileDialogState.mode === 'edit' ? 'Rename File' : 'Create File'}
//       >
//         <FileForm
//           onClose={closeFileDialog}
//           onSubmit={handleFileSubmit}
//           editData={fileDialogState.editData}
//         />
//       </CustomDialog>
//     </Box>
//   );
// }
