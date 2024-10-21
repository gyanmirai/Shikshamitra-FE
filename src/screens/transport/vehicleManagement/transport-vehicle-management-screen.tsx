'use client'

import * as yup from 'yup';
import React, { useState, useEffect } from 'react'
import { label } from 'yet-another-react-lightbox';

import { Box, Button, MenuItem, MenuList, Paper, Switch, TextField, Tooltip, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';

import TransportVehicleDetailView from './component/transport-vehicle-detail-view';

interface Vehicle {
  vehicleNumber: string;
  capacity: number;
  model: string;
  assignedRoutes: string;
  driver: string;
}


const vehiclesOverview: Vehicle[] = [
  {
    vehicleNumber: "V001",
    capacity: 15,
    model: "Ford Transit",
    assignedRoutes: "R102",
    driver: "John Doe"
  },
  {
    vehicleNumber: "V002",
    capacity: 30,
    model: "Mercedes Sprinter",
    assignedRoutes: "R104",
    driver: "Jane Smith"
  },
  {
    vehicleNumber: "V003",
    capacity: 25,
    model: "Chevrolet Express",
    assignedRoutes: "R105",
    driver: "Emily Davis"
  },
  {
    vehicleNumber: "V004",
    capacity: 20,
    model: "Ram ProMaster",
    assignedRoutes: "R106",
    driver: "Michael Johnson"
  },
  {
    vehicleNumber: "V005",
    capacity: 10,
    model: "Nissan NV200",
    assignedRoutes: "R107",
    driver: "David Wilson"
  }
];




const TransportVehicleManagementScreen = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null)
  const handleOnClick = (vehicleData: any) =>{
    console.log("vehicleData", vehicleData);
    
    setSelectedVehicle(vehicleData);

    
    
    }
    const columnTable = [
      {
        id: "vehicleNumber", label: "Vehicle Number", render(value: any, row: any) {
          return (
    
            <React.Fragment key={row.vehicleNumber}>
              <Box display="flex" alignItems="center" gap={1}>
                <Paper onClick={() => handleOnClick(row)} elevation={4} sx={{ p: 2 }}>
                  {row.vehicleNumber}
    
    
                </Paper>
              </Box>
            </React.Fragment>
          );
        }
      },
      { id: "capacity", label: "Capacity" },
      { id: "model", label: "Model" },
      { id: "assignedRoutes", label: "Assigned Routes" },
      { id: "driver", label: "Driver" },
    ]
  return (
    <>
      <Box gap={3} display="flex" flexDirection="row" justifyContent="flex-end">
        <Button variant="contained" size="small">
          Add new vehicle
        </Button>
      </Box>
      <Box>
        <Typography component="span" variant="h6" gutterBottom>
          Vehicle Overview
        </Typography>
      </Box>
      <CustomizableTable data={vehiclesOverview} columns={columnTable} />
      <Box>
        <Typography sx={{pt:"15px", pb:"15px"}} component="span" variant="h6" gutterBottom>
        Vehicle Details Modal
        </Typography>
      </Box>
   {selectedVehicle   && <TransportVehicleDetailView vehicleNumber={selectedVehicle}/>}   
      
      </>

  )
}

export default TransportVehicleManagementScreen