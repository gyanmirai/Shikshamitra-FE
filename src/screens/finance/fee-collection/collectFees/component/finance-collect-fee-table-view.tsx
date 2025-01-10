import { Form, Formik } from 'formik';
import React, { useState } from 'react';

import {
  Box,
  Table,
  Button,
  Checkbox,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Typography,
} from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';

// Define the types
interface Fee {
  id: number;
  feeHead: string;
  month: string;
  amount: number;
}

interface FormValues {
  selectedFees: number[]; // Array of fee IDs
}

// Example pending fees
const pendingFees: Fee[] = [
  { id: 1, feeHead: 'Library', month: 'Month-1', amount: 5100 },
  { id: 2, feeHead: 'Tuition', month: 'Month-2', amount: 5200 },
  { id: 3, feeHead: 'Library', month: 'Month-3', amount: 5300 },
  { id: 4, feeHead: 'Tuition', month: 'Month-4', amount: 5400 },
  { id: 5, feeHead: 'Library', month: 'Month-5', amount: 5500 },
  { id: 6, feeHead: 'Tuition', month: 'Month-6', amount: 5600 },
  { id: 7, feeHead: 'Library', month: 'Month-7', amount: 5700 },
  { id: 8, feeHead: 'Tuition', month: 'Month-8', amount: 5800 },
  { id: 9, feeHead: 'Library', month: 'Month-9', amount: 5900 },
  { id: 10, feeHead: 'Tuition', month: 'Month-10', amount: 6000 },
  { id: 11, feeHead: 'Library', month: 'Month-11', amount: 6100 },
  { id: 12, feeHead: 'Tuition', month: 'Month-12', amount: 6200 },
  { id: 13, feeHead: 'Library', month: 'Month-13', amount: 6300 },
  { id: 14, feeHead: 'Tuition', month: 'Month-14', amount: 6400 },
  { id: 15, feeHead: 'Library', month: 'Month-15', amount: 6500 },
  { id: 16, feeHead: 'Tuition', month: 'Month-16', amount: 6600 },
  { id: 17, feeHead: 'Library', month: 'Month-17', amount: 6700 },
  { id: 18, feeHead: 'Tuition', month: 'Month-18', amount: 6800 },
  { id: 19, feeHead: 'Library', month: 'Month-19', amount: 6900 },
  { id: 20, feeHead: 'Tuition', month: 'Month-20', amount: 7000 },
  { id: 21, feeHead: 'Library', month: 'Month-21', amount: 7100 },
  { id: 22, feeHead: 'Tuition', month: 'Month-22', amount: 7200 },
  { id: 23, feeHead: 'Library', month: 'Month-23', amount: 7300 },
  { id: 24, feeHead: 'Tuition', month: 'Month-24', amount: 7400 },
  { id: 25, feeHead: 'Library', month: 'Month-25', amount: 7500 },
  { id: 26, feeHead: 'Tuition', month: 'Month-26', amount: 7600 },
  { id: 27, feeHead: 'Library', month: 'Month-27', amount: 7700 },
  { id: 28, feeHead: 'Tuition', month: 'Month-28', amount: 7800 },
  { id: 29, feeHead: 'Library', month: 'Month-29', amount: 7900 },
  { id: 30, feeHead: 'Tuition', month: 'Month-30', amount: 8000 },
];

interface FeeCollectionFormProps {
  dialogValue: boolean;
  onClose: () => void;
}

const FeeCollectionForm: React.FC<FeeCollectionFormProps> = ({ dialogValue, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Handle search functionality
  const filteredFees = pendingFees.filter(
    (fee) =>
      fee.feeHead.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fee.month.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const cellStyle = {
    alignItems: 'center',
    fontSize: '12px',
    position: 'static',
    left: 0,
    zIndex: 2,
    backgroundColor: 'transparent',
    boxShadow: 'none',
  };

  return (
    <CustomDialog fullScreen title="Fee Collection" open={dialogValue} handleClose={onClose}>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '500px' }}>
        <Formik<FormValues>
          initialValues={{ selectedFees: [] }}
          onSubmit={(values) => {
            console.log('Selected Fees:', values.selectedFees);
          }}
        >
          {({ values, setFieldValue }) => {
            // Handle checkbox changes
            const handleCheckboxChange = (feeId: number) => {
              const updatedFees = values.selectedFees.includes(feeId)
                ? values.selectedFees.filter((id) => id !== feeId)
                : [...values.selectedFees, feeId];
              setFieldValue('selectedFees', updatedFees);
            };

            // Calculate total amount
            const calculateTotal = () =>
              pendingFees
                .filter((fee) => values.selectedFees.includes(fee.id))
                .reduce((sum, fee) => sum + fee.amount, 0);

            return (
              <Form>
                {/* <CustomizableTable
                                    isScrollbar
                                    isPagination={false}
                                    columns={[
                                        {
                                            id: "id", label: "Select", render(value, row) {
                                                return <CheckBox />
                                            },
                                        },
                                        { id: "feeHead", label: "Fee Head", },


                                        { id: "month", label: "Pending For" },
                                        { id: "amount", label: "Amount" },

                                    ]} data={pendingFees} /> */}

                <Box>
                  {/* <TextField
                                        variant="outlined"
                                        label="Search Fees"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        fullWidth
                                    /> */}
                  <Scrollbar sx={{ p: 2, bgcolor: 'white', maxHeight: '400px' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Select</TableCell>
                          <TableCell>Fee Head</TableCell>
                          <TableCell>Month</TableCell>
                          <TableCell>Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredFees.map((fee) => (
                          <TableRow key={fee.id}>
                            <TableCell>
                              <Checkbox
                                checked={values.selectedFees.includes(fee.id)}
                                onChange={() => handleCheckboxChange(fee.id)}
                              />
                            </TableCell>
                            <TableCell sx={cellStyle}>{fee.feeHead}</TableCell>
                            <TableCell sx={cellStyle}>{fee.month}</TableCell>
                            <TableCell sx={cellStyle}>{fee.amount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Scrollbar>
                  <Typography variant="body1" sx={{ marginTop: 2 }}>
                    <strong>Total Amount Due: </strong> {calculateTotal()}
                  </Typography>
                  <Button type="submit" variant="contained" color="primary" sx={{ marginTop: 2 }}>
                    Submit
                  </Button>
                </Box>
              </Form>
            );
          }}
        </Formik>
      </Scrollbar>
    </CustomDialog>
  );
};

export default FeeCollectionForm;
