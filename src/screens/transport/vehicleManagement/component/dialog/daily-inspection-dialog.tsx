import { useFormik } from 'formik';
import React, { useState } from 'react';

import {
  Box,
  Radio,
  Table,
  Button,
  TableRow,
  TextField,
  TableCell,
  TableBody,
  TableHead,
  Typography,
  RadioGroup,
  FormControl,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';

const inspectionItems = [
  {
    id: 1,
    name: 'Fluids',
    details: ['Radiator', 'Oil', 'Transmission', 'Brake', 'Steering', 'Wiper'],
    isCheck: false,
    actionRequired: '',
  },
  {
    id: 2,
    name: 'Lights',
    details: ['Headlight', 'Driving', 'Tail', 'Signal', 'Hazard'],
    isCheck: false,
    actionRequired: '',
  },
  {
    id: 3,
    name: 'Tires',
    details: ['Pressure', 'Tread', 'Wheel Nuts', 'Spare'],
    isCheck: false,
    actionRequired: '',
  },
  {
    id: 4,
    name: 'Brakes',
    details: ['Function', 'Emergency', 'Warnings'],
    isCheck: false,
    actionRequired: '',
  },
  {
    id: 5,
    name: 'Electrical',
    details: ['Battery', 'Gauges', 'Warnings'],
    isCheck: false,
    actionRequired: '',
  },
  {
    id: 6,
    name: 'Defrost/Heater',
    details: ['Functioning', 'Windows Clear'],
    isCheck: false,
    actionRequired: '',
  },
  {
    id: 7,
    name: 'Exhausts',
    details: ['Noise', 'Secure', 'Leaks'],
    isCheck: false,
    actionRequired: '',
  },
  {
    id: 8,
    name: 'Safety',
    details: ['Seatbelts', 'First Aid Kit', 'Fire Extinguisher'],
    isCheck: false,
    actionRequired: 'Check inspection date',
  },
  {
    id: 9,
    name: 'Accessories',
    details: ['Wipers', 'Horn', 'Mirrors', 'Cab Clean'],
    isCheck: false,
    actionRequired: '',
  },
  {
    id: 10,
    name: 'Windshield',
    details: ['Clean', 'No Chips or Cracks'],
    isCheck: false,
    actionRequired: '',
  },
  {
    id: 11,
    name: 'PPE',
    details: ['Hardhat', 'Safety Glasses', 'Gloves', 'Footwear'],
    isCheck: false,
    actionRequired: '',
  },
  {
    id: 12,
    name: 'Tools',
    details: ['Condition', 'Inspected'],
    isCheck: false,
    actionRequired: '',
  },
  {
    id: 13,
    name: 'Emergency Items',
    details: ['Bucket Evac', 'Beacon', 'Signs', 'Cones', 'Other'],
    isCheck: false,
    actionRequired: '',
  },
];

interface TransportDailyVehicleDialogProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
  isEdit: boolean;
  allData: any;
}

interface FormikValue {
  division: string;
  fleet: string;
  vehicleNumber: string;
  vehicleDriver: string;
  vehicleCrew: string;
  vehiclePlateNumber: string;
  mileage: string;
  vehicleMakeAndModel: string;
  firstName: string;
  lastName: string;
  firstNameOfDivisionManager: string;
  lastNameOfDivisionManager: string;
  mviDate: Date | null;
  dateInspected: Date | null;
  insuranceRenewalDate: Date | null;
  lastDateOilChanged: Date | null;
  registrationRenewalDate: Date | null;
  id: number;
}

const TransportDailyVehicleDialog: React.FC<TransportDailyVehicleDialogProps> = ({
  dialogValue,
  data,
  onSave,
  onClose,
  isEdit,
  allData,
}) => {
  const [showExistingEntryMessage, setShowExistingEntryMessage] = useState(false);
  console.log('data', allData);
  console.log('seldata', data);

  const formik = useFormik<FormikValue>({
    initialValues: {
      division: isEdit ? (data.division ?? '') : '',
      fleet: isEdit ? (data.fleet ?? '') : '',
      vehicleNumber: isEdit ? (data.vehicleNumber ?? '') : '',
      vehicleDriver: isEdit ? (data.vehicleDriver ?? '') : '',
      vehicleCrew: isEdit ? (data.vehicleCrew ?? '') : '',
      vehiclePlateNumber: isEdit ? (data.vehiclePlateNumber ?? '') : '',
      mileage: isEdit ? (data.mileage ?? '') : '',
      vehicleMakeAndModel: isEdit ? (data.vehicleMakeAndModel ?? '') : '',
      firstName: isEdit ? (data.firstName ?? '') : '',
      lastName: isEdit ? (data.lastName ?? '') : '',
      firstNameOfDivisionManager: isEdit ? (data.firstName ?? '') : '',
      lastNameOfDivisionManager: isEdit ? (data.lastName ?? '') : '',
      mviDate: isEdit ? (data.mviDate ?? null) : null,
      dateInspected: isEdit ? (data.dateInspected ?? null) : null,
      insuranceRenewalDate: isEdit ? (data.insuranceRenewalDate ?? null) : null,
      lastDateOilChanged: isEdit ? (data.lastDateOilChanged ?? null) : null,
      registrationRenewalDate: isEdit ? (data.registrationRenewalDate ?? null) : null,
      id: isEdit
        ? (data.id ?? Math.floor(Math.random() * 1000000000))
        : Math.floor(Math.random() * 1000000000),
    },
    onSubmit: (values) => {
      // Handle form submission
    },
  });

  return (
    <CustomDialog maxWidth="lg" title="Daily Inspection" open={dialogValue} handleClose={onClose}>

      <Scrollbar>
        <Box px="15px">
          <form onSubmit={formik.handleSubmit}>



            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item Name</TableCell>
                  <TableCell>Is Check</TableCell>
                  <TableCell>Is Not Check</TableCell>
                  <TableCell>N/A</TableCell>
                  <TableCell>Action Required</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inspectionItems.map((item) => (
                  <TableRow key={item.id}>
                    {/* Item Name */}
                    <TableCell>{`${item.name} - ${item.details.join(', ')}`}</TableCell>

                    {/* Is Check Radio Button */}
                    <TableCell>
                      <FormControl>
                        <RadioGroup
                          row
                          name={`isCheck-${item.id}`}
                          value={item.isCheck ? 'checked' : ''}
                          onChange={() => {
                            item.isCheck = true;
                            item.actionRequired = ''; // reset action required if checked
                          }}
                        >
                          <FormControlLabel value="checked" control={<Radio />} label="" />
                        </RadioGroup>
                      </FormControl>
                    </TableCell>

                    {/* Is Not Check Radio Button */}
                    <TableCell>
                      <FormControl>
                        <RadioGroup
                          row
                          name={`isNotCheck-${item.id}`}
                          value={item.isCheck === false ? 'unchecked' : ''}
                          onChange={() => {
                            item.isCheck = false;
                            item.actionRequired = ''; // reset action required if unchecked
                          }}
                        >
                          <FormControlLabel
                            value="unchecked"
                            control={<Radio />}
                            label=""
                          />
                        </RadioGroup>
                      </FormControl>
                    </TableCell>

                    {/* N/A Radio Button */}
                    <TableCell>
                      <FormControl>
                        <RadioGroup
                          row
                          name={`na-${item.id}`}
                          value={item.isCheck === null ? 'na' : ''}
                          onChange={() => {
                            item.isCheck = false;
                            item.actionRequired = '';
                          }}
                        >
                          <FormControlLabel value="na" control={<Radio />} label="N/A" />
                        </RadioGroup>
                      </FormControl>
                    </TableCell>

                    {/* Action Required Input Field */}
                    <TableCell>
                      <TextField
                        label="Action Required"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={item.actionRequired}
                        onChange={(e) => {
                          item.actionRequired = e.target.value;
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Typography sx={{ pt: '15px', pb: '12px' }} variant="h6">
              Notes
            </Typography>
            <TextField
              multiline
              rows={4}
              label="Type here...."
              variant="outlined"
              size="small"
              fullWidth
              value=""
              onChange={(e) => { }}
            />


          </form>
        </Box>
      </Scrollbar>
      <DialogActions>

        <Button type="submit" variant="contained" size="small">
          Save
        </Button>
      </DialogActions>
    </CustomDialog>
  );
};

export default TransportDailyVehicleDialog;
