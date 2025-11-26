import { useFormik } from 'formik';
import React, { useState } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import {
  Box,
  Table,
  Paper,
  Button,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  DialogActions,
  TableContainer,
} from '@mui/material';

interface TransportBulkRouteDialogProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
  isEdit: boolean;
  allData: any;
}

interface FormikValue {
  names: string[];
  grade: string;
  position: string;
  assignedRoute: string;
  pickupPoint: string;
  dropoffPoint: string;
}

const pickupPoints = ['School'];
const dropoffPoints = ['Dindoli', 'Godadara', 'Mini Bazar', 'Ved'];
const routes = ['R101', 'R102', 'R103', 'R104', 'R105'];
const nameOptions = [
  { label: 'John Doe', value: 'John Doe' },
  { label: 'Jane Smith', value: 'Jane Smith' },
  { label: 'Emily Davis', value: 'Emily Davis' },
  { label: 'Michael Johnson', value: 'Michael Johnson' },
  { label: 'David Wilson', value: 'David Wilson' },
];

const gradeOptions = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4 ' },
  { label: '5', value: '5' },
  { label: '6', value: '6' },
  { label: '7', value: '7' },
  { label: '8', value: '8' },
  { label: '9', value: '9' },
  { label: '10', value: '10' },
  { label: '11', value: '11' },
  { label: '11', value: '12' },
];

const positionOptions = [
  { label: 'Student', value: 'Student' },
  { label: 'Teacher', value: 'Teacher' },
  { label: 'Staff', value: 'Staff' },
];

const TransportBulkRouteDialog: React.FC<TransportBulkRouteDialogProps> = ({
  dialogValue,
  data,
  onSave,
  onClose,
  isEdit,
  allData,
}) => {
  const [selectedEntries, setSelectedEntries] = useState<any[]>([]); // Track selected entries for the table

  const formik = useFormik<FormikValue>({
    initialValues: {
      names: [],
      grade: '1',
      position: '',
      assignedRoute: '',
      pickupPoint: pickupPoints[0],
      dropoffPoint: dropoffPoints[0],
    },
    onSubmit: (values) => {},
  });

  React.useEffect(() => {
    const updatedEntries = formik.values.names.map((name) => ({
      name,
      grade: formik.values.grade,
      assignedRoute: formik.values.assignedRoute,
    }));
    setSelectedEntries(updatedEntries);
  }, [formik.values.names, formik.values.grade, formik.values.assignedRoute]);

  return (
    <CustomDialog title="Bulk Route Assign" open={dialogValue} handleClose={onClose}>
      {/* <Box px="20px">
                {showExistingEntryMessage ? (
                    <Typography component="span" fontSize="14" color="red">
                        This Entry Already Exists
                    </Typography>
                ) : (
                    <Box height="25px" />
                )}
            </Box> */}
      <Scrollbar>
        <Box px="15px">
          <form onSubmit={formik.handleSubmit}>
            <Box pt="10px" display="flex" flexDirection="column" gap={3}>
              <Box pt="10px" display="flex" flexDirection="row" gap={3}>
                <CustomSelect
                  label="Names"
                  options={nameOptions}
                  // @ts-ignore
                  value={formik.values.names as string}
                  onChange={(e: any) => formik.setFieldValue('names', e)}
                  multiple // Multi-select for names
                />
                <CustomSelect
                  label="Grade"
                  options={gradeOptions}
                  // @ts-ignore
                  value={formik.values.grade}
                  onChange={(e: any) => formik.setFieldValue('grade', e)}
                />
              </Box>

              <Box pt="10px" display="flex" flexDirection="row" gap={3}>
                <CustomSelect
                  label="Position"
                  options={positionOptions}
                  // @ts-ignore
                  value={formik.values.position}
                  onChange={(e: any) => formik.setFieldValue('position', e)}
                />
                <CustomSelect
                  label="Assigned Route"
                  options={routes.map((route) => ({ label: route, value: route }))}
                  value={formik.values.assignedRoute}
                  onChange={(e: any) => formik.setFieldValue('assignedRoute', e)}
                />
              </Box>

              <Box pt="10px" display="flex" flexDirection="row" gap={3}>
                <CustomSelect
                  label="Pickup Point"
                  options={pickupPoints.map((point) => ({ label: point, value: point }))}
                  value={formik.values.pickupPoint}
                  onChange={(e: any) => formik.setFieldValue('pickupPoint', e)}
                />
                <CustomSelect
                  label="Dropoff Point"
                  options={dropoffPoints.map((point) => ({ label: point, value: point }))}
                  value={formik.values.dropoffPoint}
                  onChange={(e: any) => formik.setFieldValue('dropoffPoint', e)}
                />
              </Box>
            </Box>

            {selectedEntries.length > 0 && (
              <Box mt={3}>
                <Typography variant="subtitle1" gutterBottom>
                  Preview Data
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Grade</TableCell>
                        <TableCell>Assigned Route</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedEntries.map((entry, index) => (
                        <TableRow key={index}>
                          <TableCell>{entry.name}</TableCell>
                          <TableCell>{entry.grade}</TableCell>
                          <TableCell>{entry.assignedRoute}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
            <DialogActions>
              <Button onClick={onClose} variant="contained" size="small">
                Cancel
              </Button>
              <Button type="submit" variant="contained" size="small">
                Upload
              </Button>
            </DialogActions>
          </form>
        </Box>
      </Scrollbar>
    </CustomDialog>
  );
};

export default TransportBulkRouteDialog;
