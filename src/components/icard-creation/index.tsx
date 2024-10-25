// @ts-nocheck
import Draggable from 'react-draggable';
import { MuiColorInput } from 'mui-color-input';
import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

import { Add } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Grid,
  Input,
  Paper,
  Button,
  Select,
  Dialog,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

export const DraggableField = ({
  field,
  onDrag,
  onEdit,
  onDelete,
  children,
  isDrag = true,
}: any) => (
  <Draggable bounds="parent" onDrag={(e, data) => onDrag(field.name, { x: data.x, y: data.y })}>
    <Box
      position="absolute"
      sx={{
        // border: "1px dashed gray",
        padding: '0px',
        cursor: 'move',
        ...field.style,
        '&:hover .field-actions': {
          display: isDrag ? 'flex' : 'none',
        },
      }}
    >
      {field.type === 'text' ? (
        <>
          <Typography
            component="span"
            fontWeight={field?.style?.fontWeight}
            fontSize={field?.style?.fontSize}
          >
            {field.name}
          </Typography>
          <Typography
            component="span"
            fontWeight={field?.style?.fontWeight}
            fontSize={field?.style?.fontSize}
          >
            {' '}
            {children}
          </Typography>
        </>
      ) : field.type === 'box' ? (
        <Box
          sx={{
            width: field.dimensions.width,
            height: field.dimensions.height,
            backgroundColor: field.style.backgroundColor || '#ffffff',
            // border: '1px solid #000',
          }}
        />
      ) : (
        <img
          src={field.dummyValue}
          alt={field.name}
          draggable={false}
          style={{
            width: field.dimensions.width,
            height: field.dimensions.height,
            border: '1px dashed gray',
          }}
        />
      )}
      <Box
        className="field-actions"
        sx={{
          display: 'none',
          position: 'absolute',
          top: 0,
          right: 0,
          background: 'rgba(255, 255, 255, 0.8)',
        }}
      >
        <IconButton size="small" onClick={() => onEdit(field)}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => onDelete(field.name)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  </Draggable>
);

const StudentIDCardCreator = () => {
  const [cardDimensions, setCardDimensions] = useState({
    width: 300,
    height: 200,
  });
  const [cardBackground, setCardBackground] = useState('');
  const [cardBackgroundColor, setCardBackgroundColor] = useState('#ffffff');
  const [fields, setFields] = useState([]);
  const [openFieldDialog, setOpenFieldDialog] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [newField, setNewField] = useState({
    name: '',
    type: 'text',
    dimensions: { width: 0, height: 0 },
    dummyValue: '',
    style: {
      fontSize: 14,
      fontWeight: 'normal',
      color: '#000000',
    },
  });
  const [studentData, setStudentData] = useState({});
  const [openStudentDataDialog, setOpenStudentDataDialog] = useState(false);
  const printRef = useRef();

  const handleAddField = () => {
    if (editingField) {
      setFields(fields.map((field) => (field.name === editingField.name ? newField : field)));
      setEditingField(null);
    } else {
      setFields([...fields, { ...newField, position: { x: 0, y: 0 } }]);
    }
    setOpenFieldDialog(false);
    setNewField({
      name: '',
      type: 'text',
      dimensions: { width: 0, height: 0 },
      dummyValue: '',
      style: {
        fontSize: 14,
        fontWeight: 'normal',
        color: '#000000',
      },
    });
  };

  const handleFieldDrag = (fieldName, newPosition) => {
    setFields(
      fields.map((field) =>
        field.name === fieldName ? { ...field, position: newPosition } : field
      )
    );
  };

  const handleEditField = (field) => {
    setEditingField(field);
    setNewField(field);
    setOpenFieldDialog(true);
  };

  const handleDeleteField = (fieldName) => {
    setFields(fields.filter((field) => field.name !== fieldName));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewField({ ...newField, dummyValue: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCardBackground(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveConfiguration = () => {
    const configuration = {
      cardDimensions,
      fields,
      cardBackground,
      cardBackgroundColor,
    };
    console.log(configuration, 'configuration');
    localStorage.setItem('idCardConfiguration', JSON.stringify(configuration));
    alert('Configuration saved successfully!');
  };

  const handleLoadConfiguration = () => {
    const savedConfiguration = localStorage.getItem('idCardConfiguration');
    if (savedConfiguration) {
      const {
        cardDimensions: savedDimensions,
        fields: savedFields,
        cardBackground: savedBackground,
        cardBackgroundColor: savedColor,
      } = JSON.parse(savedConfiguration);
      setCardDimensions(savedDimensions);
      setFields(savedFields);
      setCardBackground(savedBackground);
      setCardBackgroundColor(savedColor);
      alert('Configuration loaded successfully!');
    } else {
      alert('No saved configuration found.');
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const handleAddStudentData = () => {
    setOpenStudentDataDialog(true);
  };

  const handleStudentDataChange = (event) => {
    setStudentData({
      ...studentData,
      [event.target.name]: event.target.value,
    });
  };

  const handleStudentDataSubmit = () => {
    setOpenStudentDataDialog(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              label="Card Width"
              type="number"
              size="small"
              value={cardDimensions.width}
              onChange={(e) =>
                setCardDimensions({
                  ...cardDimensions,
                  width: Number(e.target.value),
                })
              }
              sx={{ mr: 2 }}
            />
            <TextField
              label="Card Height"
              type="number"
              value={cardDimensions.height}
              size="small"
              onChange={(e) =>
                setCardDimensions({
                  ...cardDimensions,
                  height: Number(e.target.value),
                })
              }
            />
            <Input
              type="file"
              onChange={handleBackgroundImageUpload}
              sx={{ mr: 2 }}
              inputProps={{ accept: 'image/*' }}
            />
            <Button variant="contained" onClick={() => setCardBackground(null)}>
              Remove BackRound
            </Button>
            <MuiColorInput
              format="hex"
              value={cardBackgroundColor}
              onChange={(color) => setCardBackgroundColor(color)}
            />
            <Button
              startIcon={<Add />}
              variant="contained"
              onClick={() => setOpenFieldDialog(true)}
            >
              Add Field
            </Button>
            <Button variant="contained" color="primary" onClick={handleSaveConfiguration}>
              Save
            </Button>
            {/* <Button variant="contained" onClick={handleLoadConfiguration} sx={{ mr: 2 }}>
          Load Configuration
        </Button>
        <Button variant="contained" onClick={handleAddStudentData} sx={{ mr: 2 }}>
          Add Student Data
        </Button> */}
            <Button color="warning" variant="contained" onClick={handlePrint}>
              Print ID Card
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Paper
            ref={printRef}
            elevation={4}
            sx={{
              position: 'relative',
              ...cardDimensions,
              mt: 2,
              backgroundColor: cardBackgroundColor,
              backgroundImage: cardBackground ? `url(${cardBackground})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {fields.map((field) => (
              <DraggableField
                key={field.name}
                field={field}
                onDrag={handleFieldDrag}
                onEdit={handleEditField}
                onDelete={handleDeleteField}
              >
                {studentData[field.name] || field.dummyValue}
              </DraggableField>
            ))}
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={openFieldDialog}
        onClose={() => {
          setOpenFieldDialog(false);
          setEditingField(null);
          setNewField({
            name: '',
            type: 'text',
            dimensions: { width: 0, height: 0 },
            dummyValue: '',
            style: {
              fontSize: 14,
              fontWeight: 'normal',
              color: '#000000',
            },
          });
        }}
      >
        <DialogTitle>{editingField ? 'Edit Field' : 'Add New Field'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Field Name"
            value={newField.name}
            onChange={(e) => setNewField({ ...newField, name: e.target.value })}
            fullWidth
            margin="normal"
          />
          <Select
            value={newField.type}
            onChange={(e) => setNewField({ ...newField, type: e.target.value })}
            fullWidth
            margin="normal"
          >
            <MenuItem value="text">Text</MenuItem>
            <MenuItem value="image">Image</MenuItem>
            <MenuItem value="box">Box</MenuItem>
          </Select>
          {newField.type === 'text' ? (
            <TextField
              label="Dummy Text"
              value={newField.dummyValue}
              onChange={(e) => setNewField({ ...newField, dummyValue: e.target.value })}
              fullWidth
              margin="normal"
            />
          ) : (
            <Input type="file" onChange={handleImageUpload} fullWidth margin="normal" />
          )}
          {newField.type === 'image' && (
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Image Width"
                type="number"
                value={newField.dimensions.width}
                onChange={(e) =>
                  setNewField({
                    ...newField,
                    dimensions: {
                      ...newField.dimensions,
                      width: Number(e.target.value),
                    },
                  })
                }
                fullWidth
                margin="normal"
              />
              <TextField
                label="Image Height"
                type="number"
                value={newField.dimensions.height}
                onChange={(e) =>
                  setNewField({
                    ...newField,
                    dimensions: {
                      ...newField.dimensions,
                      height: Number(e.target.value),
                    },
                  })
                }
                fullWidth
                margin="normal"
              />
            </Box>
          )}
          {newField.type === 'box' && (
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Box Width"
                type="number"
                value={newField.dimensions.width}
                onChange={(e) =>
                  setNewField({
                    ...newField,
                    dimensions: {
                      ...newField.dimensions,
                      width: Number(e.target.value),
                    },
                  })
                }
                fullWidth
                margin="normal"
              />
              <TextField
                label="Box Height"
                type="number"
                value={newField.dimensions.height}
                onChange={(e) =>
                  setNewField({
                    ...newField,
                    dimensions: {
                      ...newField.dimensions,
                      height: Number(e.target.value),
                    },
                  })
                }
                fullWidth
                margin="normal"
              />
              <MuiColorInput
                label="Box Background Color"
                format="hex"
                value={newField.style.backgroundColor || '#ffffff'}
                onChange={(color) => {
                  setNewField({
                    ...newField,
                    style: { ...newField.style, backgroundColor: color },
                  });
                }}
              />
            </Box>
          )}
          <Typography variant="h6" gutterBottom>
            Field Style
          </Typography>
          <TextField
            label="Font Size"
            type="number"
            value={newField.style.fontSize}
            onChange={(e) =>
              setNewField({
                ...newField,
                style: { ...newField.style, fontSize: Number(e.target.value) },
              })
            }
            fullWidth
            margin="normal"
          />
          <Select
            value={newField.style.fontWeight}
            onChange={(e) =>
              setNewField({
                ...newField,
                style: { ...newField.style, fontWeight: e.target.value },
              })
            }
            fullWidth
            margin="normal"
          >
            <MenuItem value="normal">Normal</MenuItem>
            <MenuItem value="bold">Bold</MenuItem>
          </Select>
          <MuiColorInput
            format="hex"
            value={newField.style.color}
            onChange={(color) => {
              setNewField({
                ...newField,
                style: { ...newField.style, color },
              });
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddField}>{editingField ? 'Update' : 'Add'}</Button>
          <Button
            onClick={() => {
              setOpenFieldDialog(false);
              setEditingField(null);
              setNewField({
                name: '',
                type: 'text',
                dimensions: { width: 0, height: 0 },
                dummyValue: '',
                style: {
                  fontSize: 14,
                  fontWeight: 'normal',
                  color: '#000000',
                },
              });
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openStudentDataDialog} onClose={() => setOpenStudentDataDialog(false)}>
        <DialogTitle>Add Student Data</DialogTitle>
        <DialogContent>
          {fields.map((field) => (
            <TextField
              key={field.name}
              label={field.name}
              name={field.name}
              value={studentData[field.name] || ''}
              onChange={handleStudentDataChange}
              fullWidth
              margin="normal"
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStudentDataSubmit}>Submit</Button>
          <Button onClick={() => setOpenStudentDataDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default StudentIDCardCreator;
