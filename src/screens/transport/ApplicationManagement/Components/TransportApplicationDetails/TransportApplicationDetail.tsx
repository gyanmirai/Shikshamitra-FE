import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Button, DialogActions } from '@mui/material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useGetRouteStopDataQuery } from 'src/redux/transport/vehicle-management/routeStopApi';

import TransportMemberProfile from '../TransportMemberProfile';
import TransportApplicationRouteDetail from './TransportRouteDetails';
import { getTransportApplicationInitialValues } from './getApplicationDetails';

import type { ITransportApplicationPayload } from '../../type';

const TransportApplicationDetail = ({
  onClose,
  selectedApplication,
  onApprove,
  onReject,
  onHold,
}: {
  onClose?: (e: any, isSubmit: boolean) => void;
  selectedApplication: ITransportApplicationPayload | null;
  onApprove?: () => void;
  onReject?: () => void;
  onHold?: () => void;
}) => {
  const { data: routeData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRouteStopDataQuery,
  });
  const initialValues = getTransportApplicationInitialValues(selectedApplication, routeData);

  const formik = useFormik({
    initialValues,
    enableReinitialize: true, // important when selectedApplication changes
    validationSchema: Yup.object({
      selectedRoute: Yup.object({
        routeId: Yup.string().required('Route is required'),
      }),
      stops: Yup.array().of(
        Yup.object({
          stopName: Yup.string().required('Stop name required'),
          arrivalTime: Yup.string().required('Arrival time required'),
          departureTime: Yup.string().required('Departure time required'),
        })
      ),
    }),
    onSubmit: (values) => {
      console.log('🚍 Submitted values:', values);
      // 🔗 call API or emit event to parent
      if (onClose) onClose(values, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box display="flex" flexDirection="column" gap={2} height="100%">
        <Scrollbar sx={{ p: 2, height: '100%' }}>
          <TransportMemberProfile selectedMember={selectedApplication} fromViewScreen />
          <TransportApplicationRouteDetail
            onClose={() => {}}
            selectedApplication={selectedApplication}
            formik={formik}
          />
          {/* you can now render the route and stops form using formik.values */}
        </Scrollbar>
        <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
          <Button
            variant="soft"
            size="small"
            color="info"
            startIcon={<Iconify icon={GlobalIcons.archive} />}
            onClick={onHold}
          >
            Hold
          </Button>

          <Button
            variant="soft"
            size="small"
            color="error"
            startIcon={<Iconify icon={GlobalIcons.reject} />}
            onClick={onReject}
          >
            Reject
          </Button>

          <Button
            variant="soft"
            size="small"
            color="success"
            startIcon={<Iconify icon={GlobalIcons.tick} />}
            onClick={onApprove}
          >
            Approve
          </Button>
        </DialogActions>
      </Box>
    </BackPopUpChecked>
  );
};

export default TransportApplicationDetail;
