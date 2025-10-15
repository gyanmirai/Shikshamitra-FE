'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Box, Card, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import RouteTable from './Components/RouteTable';
import NewRouteForm from './RouteFormComponent/RouteForm';
import RouteDetailsCard from './RouteViewDetails/RouteDetailsCard';

const RouteManagement = ({ showBreadCumb = true }: { showBreadCumb?: boolean }) => {
  // State to control route form visibility
  const [open, setOpen] = useState(false);

  // State to store currently selected route for editing
  const [selectedRoute, setSelectedRoute] = useState<any | null>(null);

  // State for view route details
  const [viewRoute, setViewRoute] = useState<any | null>(null);

  // Redux selector to track unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // Redux dispatch hook for state management
  const dispatch = useDispatch();

  // Boolean hook to control detail view dialog
  const viewDialog = useBoolean();

  // Mock data based on the screenshot
  const routeData = [
    {
      id: 'RT001',
      routeName: 'Route A-1',
      startPoint: 'School Gate',
      endPoint: 'Kamrej',
      distance: '10 KM',
      stops: '08',
      capacity: 50,
      students: 50,
      status: 'Active',
    },
    {
      id: 'RT002',
      routeName: 'Route A-2',
      startPoint: 'School Gate',
      endPoint: 'Kapodara',
      distance: '10.5 KM',
      stops: '06',
      capacity: 55,
      students: 50,
      status: 'Inactive',
    },
    {
      id: 'RT003',
      routeName: 'Route A-3',
      startPoint: 'School Gate',
      endPoint: 'Simadi',
      distance: '11 KM',
      stops: '12',
      capacity: 40,
      students: 40,
      status: 'Inactive',
    },
    {
      id: 'RT004',
      routeName: 'Route A-4',
      startPoint: 'School Gate',
      endPoint: 'Adajan',
      distance: '12 KM',
      stops: '03',
      capacity: 40,
      students: 38,
      status: 'Active',
    },
    {
      id: 'RT005',
      routeName: 'Route A-5',
      startPoint: 'School Gate',
      endPoint: 'Godadara',
      distance: '10 KM',
      stops: '07',
      capacity: 45,
      students: 43,
      status: 'Active',
    },
  ];

  /**
   * Handles closing the route form with confirmation if there are unsaved changes
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      setOpen(false);
      dispatch(setIsChanges(false));
      setSelectedRoute(null);
    } else if (!isChanges) {
      setOpen(false);
      setSelectedRoute(null);
    }
  };

  /**
   * Handles closing the view dialog
   */
  const handleViewClose = () => {
    viewDialog.onFalse();
    setViewRoute(null);
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      {showBreadCumb &&
        (open ? (
          <CustomBreadcrumbs
            heading={selectedRoute ? 'Update Route' : 'Add Route'}
            description={
              selectedRoute
                ? 'Update existing route details including name, points, distance, and capacity.'
                : 'Add a new route by entering route details, stops, and capacity information.'
            }
            isBack
            onBack={() => handleClose(null, false)}
            links={[
              { name: 'Transport', href: '/transport/dashboard' },
              {
                name: 'Route Management',
                href: '/transport/routeManagement',
                onClick: () => {
                  setOpen(false);
                  setSelectedRoute(null);
                },
              },
              {
                name: selectedRoute ? 'Update Route' : 'Add Route',
                href: '/transport/routeManagement',
              },
            ]}
            sx={{ px: 1, mb: 2 }}
          />
        ) : viewDialog.value ? (
          <CustomBreadcrumbs
            heading="Route Details"
            description="This screen displays the complete details of a selected route, including its stops, capacity, and student assignments. It helps in quickly reviewing and managing route information."
            isBack
            onBack={handleViewClose}
            links={[
              { name: 'Transport', href: '/transport/dashboard' },
              {
                name: 'Route Management',
                href: '/transport/routeManagement',
                onClick: handleViewClose,
              },
              {
                name: 'Route Details',
                href: '/transport/routeManagement',
              },
            ]}
            sx={{ px: 1, mb: 2 }}
          />
        ) : (
          <CustomBreadcrumbs
            heading="Route Management"
            description="This screen displays all created transport routes with options to create new ones. It helps in organizing and managing student transportation efficiently across different locations."
            links={[
              { name: 'Transport', href: '/transport/dashboard' },
              { name: 'Route Management' },
            ]}
            sx={{ px: 1, mb: 2 }}
            action={
              <Button
                startIcon={<Add />}
                variant="contained"
                size="small"
                onClick={() => setOpen(true)}
              >
                Route
              </Button>
            }
          />
        ))}

      {open ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)', mt: 2 }}>
          <NewRouteForm selectedRoute={selectedRoute} onClose={handleClose} />
        </Card>
      ) : viewDialog.value ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <RouteDetailsCard />
        </Card>
      ) : (
        <RouteTable
          setOpenDialog={setOpen}
          setEditData={setSelectedRoute}
          data={routeData}
          onViewDetail={(data) => {
            viewDialog.onTrue();
            setViewRoute(data);
          }}
        />
      )}
    </Box>
  );
};

export default RouteManagement;
