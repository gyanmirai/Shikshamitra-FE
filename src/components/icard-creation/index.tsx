import Draggable from 'react-draggable';
import { MuiColorInput } from 'mui-color-input';
import React, { useRef, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import { useReactToPrint } from 'react-to-print';
import { Add, Cancel } from '@mui/icons-material';
import { useBoolean } from 'src/hooks/use-boolean';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Grid,
  Input,
  Paper,
  Stack,
  Switch,
  Button,
  Select,
  Slider,
  Divider,
  MenuItem,
  Checkbox,
  TextField,
  Typography,
  IconButton,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { Scrollbar } from '../scrollbar';
import CustomDialog from '../customDialog';
import CustomSelect from '../custom-select';

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
        zIndex: 1,
        padding: '0px',
        cursor: 'move',
        ...field.style,
        ...(field.type === 'text' ? { backgroundColor: 'none' } : {}),
        '&:hover .field-actions': {
          display: isDrag ? 'flex' : 'none',
        },
      }}
    >
      {field.type === 'text' ? (
        <Box sx={{ width: `${field.fieldWidth}px` }}>
          {field.showFieldName && (
            <>
              <Typography
                component="span"
                fontWeight={field?.filedNameStyle?.fontWeight}
                fontSize={field?.filedNameStyle?.fontSize}
              >
                {icardFields.find((f) => f.key === field.name)?.name}
              </Typography>
              <Typography
                component="span"
                fontWeight={field?.filedNameStyle?.fontWeight}
                fontSize={field?.filedNameStyle?.fontSize}
              >
                {field.fieldSeparator}
              </Typography>
            </>
          )}
          <Typography
            component="span"
            fontWeight={field?.style?.fontWeight}
            fontSize={field?.style?.fontSize}
          >
            {' '}
            {children}
          </Typography>
        </Box>
      ) : field.type === 'box' ? (
        <Box
          sx={{
            width: field.dimensions.width,
            height: field.dimensions.height,
            backgroundColor: field.style.backgroundColor || '#ffffff',
            zIndex: 0,
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
        <IconButton size="small" onClick={() => onDelete(field?.otherFiledName || field.name)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  </Draggable>
);

const icardFields = [
  {
    name: 'Name',
    key: 'name',
  },
  {
    name: 'Roll No',
    key: 'rollNo',
  },
  {
    name: 'Class',
    key: 'class',
  },
  {
    name: 'Gr. No',
    key: 'grNo',
  },
  {
    name: 'Contact No',
    key: 'contactNo',
  },
  {
    name: 'Address',
    key: 'address',
  },
  {
    name: 'Academic Year',
    key: 'academicYear',
  },
  {
    name: 'Photo',
    key: 'photo',
  },
  {
    name: 'Other',
    key: 'other',
  },
];

const StudentIDCardCreator = () => {
  const isVisibleGrid = useBoolean(true);
  const [cardDimensions, setCardDimensions] = useState({
    width: 400,
    height: 300,
  });
  const [opacity, setOpacity] = useState(1);
  const [cardBackground, setCardBackground] = useState('');
  const [cardBackgroundColor, setCardBackgroundColor] = useState('#ffffff');
  const [fields, setFields] = useState<any>([]);
  const [openFieldDialog, setOpenFieldDialog] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);
  const [newField, setNewField] = useState<any>({
    name: '',
    type: 'text',
    dimensions: { width: 0, height: 0 },
    fieldSeparator: '',
    showFieldName: true,
    otherFiledName: '',
    dummyValue: '',
    fieldWidth: 200,
    style: {
      fontSize: 14,
      fontWeight: 'normal',
      color: '#000000',
      backgroundColor: '#ffffff',
    },
    filedNameStyle: {
      fontSize: 14,
      fontWeight: 'normal',
      color: '#000000',
      backgroundColor: '#ffffff',
    },
  });
  const [studentData, setStudentData] = useState({});
  const printRef = useRef<HTMLDivElement>(null);

  const handleAddField = () => {
    if (editingField) {
      setFields(
        fields.map((field: any) =>
          field?.otherFiledName
            ? field.otherFiledName === editingField.otherFiledName
              ? newField
              : field
            : field.name === editingField.name
              ? newField
              : field
        )
      );
      setEditingField(null);
    } else {
      setFields([...fields, { ...newField, position: { x: 0, y: 0 } }]);
    }
    setOpenFieldDialog(false);
    setNewField({
      name: '',
      type: 'text',
      fieldSeparator: '',
      dimensions: { width: 0, height: 0 },
      showFieldName: true,
      fieldWidth: 200,
      otherFiledName: '',
      dummyValue: '',
      style: {
        fontSize: 14,
        fontWeight: 'normal',
        color: '#000000',
        backgroundColor: '#ffffff',
      },
      filedNameStyle: {
        fontSize: 14,
        fontWeight: 'normal',
        color: '#000000',
        backgroundColor: '#ffffff',
      },
    });
  };

  const handleFieldDrag = (fieldName: any, newPosition: any) => {
    setFields(
      fields.map((field: any) =>
        field.name === fieldName ? { ...field, position: newPosition } : field
      )
    );
  };

  const handleEditField = (field: any) => {
    setEditingField(field);
    setNewField(field);
    setOpenFieldDialog(true);
  };

  const handleDeleteField = (fieldName: any) => {
    setFields(fields.filter((field: any) => (field.otherFiledName || field.name) !== fieldName));
  };

  const handleImageUpload = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        setNewField({ ...newField, dummyValue: e.target.result as any });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundImageUpload = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
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
    localStorage.setItem('idCardConfiguration', JSON.stringify(configuration));
    alert('Configuration saved successfully!');
  };

  // const handleLoadConfiguration = () => {
  //   const savedConfiguration = localStorage.getItem('idCardConfiguration');
  //   if (savedConfiguration) {
  //     const {
  //       cardDimensions: savedDimensions,
  //       fields: savedFields,
  //       cardBackground: savedBackground,
  //       cardBackgroundColor: savedColor,
  //     } = JSON.parse(savedConfiguration);
  //     setCardDimensions(savedDimensions);
  //     setFields(savedFields);
  //     setCardBackground(savedBackground);
  //     setCardBackgroundColor(savedColor);
  //     alert('Configuration loaded successfully!');
  //   } else {
  //     alert('No saved configuration found.');
  //   }
  // };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  // const handleStudentDataChange = (event:any) => {
  //   setStudentData({
  //     ...studentData,
  //     [event.target.name]: event.target.value,
  //   });
  // };

  // const handleStudentDataSubmit = () => {
  //   setOpenStudentDataDialog(false);
  // };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="flex-end" gap={2} alignItems="center" mb={2}>
        <Button startIcon={<Add />} variant="contained" onClick={() => setOpenFieldDialog(true)}>
          Add Field
        </Button>
        <Button variant="contained" color="primary" onClick={handleSaveConfiguration}>
          Save
        </Button>

        <Button color="warning" variant="contained" onClick={(e: any) => handlePrint(e)}>
          Print ID Card
        </Button>
      </Box>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              label="Card Width(Px)"
              type="number"
              size="small"
              fullWidth
              value={cardDimensions.width}
              onChange={(e) =>
                setCardDimensions({
                  ...cardDimensions,
                  width: Number(e.target.value),
                })
              }
            />
            <TextField
              label="Card Height(Px)"
              type="number"
              value={cardDimensions.height}
              size="small"
              fullWidth
              onChange={(e) =>
                setCardDimensions({
                  ...cardDimensions,
                  height: Number(e.target.value),
                })
              }
            />
            <MuiColorInput
              format="hex"
              value={cardBackgroundColor}
              onChange={(color) => setCardBackgroundColor(color)}
              fullWidth
              placeholder="Select background color"
              label="Background Color"
              size="small"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={isVisibleGrid.value}
                  onChange={() => {
                    isVisibleGrid.onToggle();
                  }}
                  name="showGridlines"
                />
              }
              label="Show Gridlines"
            />

            <Input
              type="file"
              onChange={handleBackgroundImageUpload}
              sx={{ mr: 2 }}
              inputProps={{ accept: 'image/*' }}
              fullWidth
            />
            <Box sx={{ width: '100%', mt: 2 }}>
              <Typography gutterBottom>Background Opacity</Typography>
              <Slider
                value={opacity}
                onChange={(_, newValue) => setOpacity(newValue as number)}
                min={0}
                max={1}
                step={0.05}
                valueLabelDisplay="auto"
                size="small"
              />
            </Box>

            <Button
              startIcon={<Cancel />}
              variant="outlined"
              onClick={() => setCardBackground('')}
              disabled={!cardBackground}
            >
              Remove Background Image
            </Button>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            ref={printRef}
            elevation={4}
            sx={{
              position: 'relative',
              ...cardDimensions,
              mt: 2,
              backgroundColor: cardBackgroundColor,

              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: '1px solid #ccc',
              overflow: 'hidden',
              '&::before': {
                content: "''",
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: cardBackground ? `url(${cardBackground})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity,
              },
            }}
          >
            {isVisibleGrid.value && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: 99,
                  backgroundImage: `
              linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px)
            `,
                  backgroundSize: '20px 20px',
                }}
              />
            )}
            {fields.map((field: any) => (
              <DraggableField
                key={field.name}
                field={field}
                onDrag={handleFieldDrag}
                onEdit={handleEditField}
                onDelete={handleDeleteField}
              >
                {field.dummyValue}
              </DraggableField>
            ))}
          </Paper>
        </Grid>
      </Grid>

      <CustomDialog
        title={editingField ? 'Edit Field' : 'Add New Field'}
        open={openFieldDialog}
        handleClose={() => {
          setOpenFieldDialog(false);
          setEditingField(null);
          setNewField({
            name: '',
            type: 'text',
            dimensions: { width: 0, height: 0 },
            fieldSeparator: '',
            dummyValue: '',
            otherFiledName: '',
            fieldWidth: 200,
            style: {
              fontSize: 14,
              fontWeight: 'normal',
              color: '#000000',
              backgroundColor: '#ffffff',
            },
            filedNameStyle: {
              fontSize: 14,
              fontWeight: 'normal',
              color: '#000000',
              backgroundColor: '#ffffff',
            },
          });
        }}
      >
        <Scrollbar sx={{ bgcolor: 'background.neutral', p: 2 }}>
          <Stack spacing={2}>
            <CustomSelect
              label="Field Name"
              options={icardFields}
              value={newField.name}
              labelKey="name"
              valueKey="key"
              onChange={(val) => setNewField({ ...newField, name: val as string })}
              formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={newField.showFieldName}
                  onChange={(e) => setNewField({ ...newField, showFieldName: e.target.checked })}
                  size="small"
                />
              }
              label="Show Field Name in Card"
            />

            {newField.name === 'other' && (
              <TextField
                label="Other Field Name"
                value={newField.otherFiledName}
                onChange={(e) => setNewField({ ...newField, otherFiledName: e.target.value })}
                fullWidth
                size="small"
              />
            )}
            <TextField
              label="Field width"
              type="number"
              value={newField.fieldWidth}
              onChange={(e) => setNewField({ ...newField, fieldWidth: e.target.value })}
              fullWidth
              size="small"
            />

            <CustomSelect
              label="Field Separator"
              options={[
                { name: 'none', key: '' },
                { name: '-', key: '-' },
                { name: ':-', key: ':-' },
                { name: 'Space', key: ' ' },
              ]}
              value={newField.fieldSeparator}
              labelKey="name"
              valueKey="key"
              onChange={(val) => setNewField({ ...newField, fieldSeparator: val as string })}
              formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
            />

            <Select
              value={newField.type}
              onChange={(e) => setNewField({ ...newField, type: e.target.value })}
              fullWidth
              size="small"
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
                size="small"
              />
            ) : (
              <Input type="file" onChange={handleImageUpload} fullWidth size="small" />
            )}
            {newField.type === 'image' && (
              <Box>
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
                  size="small"
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
                  size="small"
                />
              </Box>
            )}
            {newField.type === 'box' && (
              <Box>
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
                  size="small"
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
                  size="small"
                />
                <MuiColorInput
                  label="Box Background Color"
                  format="hex"
                  fullWidth
                  size="small"
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
            <Divider />
            <Typography variant="h6">Field value Style</Typography>
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
              size="small"
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
              size="small"
            >
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="bold">Bold</MenuItem>
            </Select>
            <MuiColorInput
              format="hex"
              size="small"
              value={newField.style.color}
              onChange={(color) => {
                setNewField({
                  ...newField,
                  style: { ...newField.style, color },
                });
              }}
            />
            <Divider />
            <Typography variant="h6" gutterBottom>
              Field name Style
            </Typography>
            <TextField
              label="Font Size"
              type="number"
              value={newField?.filedNameStyle?.fontSize}
              onChange={(e) =>
                setNewField({
                  ...newField,
                  filedNameStyle: { ...newField.filedNameStyle, fontSize: Number(e.target.value) },
                })
              }
              fullWidth
              margin="normal"
              size="small"
            />
            <Select
              value={newField?.filedNameStyle?.fontWeight}
              onChange={(e) =>
                setNewField({
                  ...newField,
                  filedNameStyle: { ...newField.filedNameStyle, fontWeight: e.target.value },
                })
              }
              fullWidth
              size="small"
            >
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="bold">Bold</MenuItem>
            </Select>
            <MuiColorInput
              format="hex"
              size="small"
              value={newField?.filedNameStyle?.color}
              onChange={(color) => {
                setNewField({
                  ...newField,
                  filedNameStyle: { ...newField.filedNameStyle, color },
                });
              }}
            />
          </Stack>
        </Scrollbar>
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
                fieldSeparator: '',
                showFieldName: true,
                fieldWidth: 200,
                dummyValue: '',
                style: {
                  fontSize: 14,
                  fontWeight: 'normal',
                  color: '#000000',
                  backgroundColor: '#ffffff',
                },
              });
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
};
export default StudentIDCardCreator;
