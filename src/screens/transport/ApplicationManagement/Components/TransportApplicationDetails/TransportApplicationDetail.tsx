import type { RootState } from 'src/redux/store';

import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import { Box, Button, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useGetRouteStopDataQuery,
  usePostRouteStopDataMutation,
  useStatusRouteStopDataMutation,
} from 'src/redux/transport/vehicle-management/routeStopApi';

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
  const currentMedium = useSelector((state: RootState) => state.globalState.currentMedium);
  const { data: routeData } = useGetRouteStopDataQuery(
    { applicationId: selectedApplication?.id, academicMediumId: currentMedium?.id },
    { skip: !selectedApplication?.id || !currentMedium?.id }
  );

  const [postRouteStopData, { isLoading: isAssigning }] = usePostRouteStopDataMutation();

  const [statusRouteStopData, { isLoading: isApproving }] = useStatusRouteStopDataMutation();
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
    onSubmit: async (values) => {
      try {
        if (!selectedApplication?.id) {
          shikshaMitraToast.error({ message: 'Application ID is missing' });
          return;
        }

        if (!currentMedium?.id) {
          shikshaMitraToast.error({ message: 'Academic medium is required' });
          return;
        }

        if (!values.studentDetails?.assignedStop) {
          shikshaMitraToast.error({ message: 'Please assign a stop before approving' });
          return;
        }

        const payload = {
          routeId: values.selectedRoute.routeId,
          stopId: values.studentDetails.assignedStop,
        };

        // Step 1: Assign stop
        await postRouteStopData({
          applicationId: selectedApplication.id,
          academicMediumId: currentMedium.id,
          body: payload,
        }).unwrap();

        // Step 2: Approve application
        await statusRouteStopData({
          applicationId: selectedApplication.id,
          academicMediumId: currentMedium.id,
          body: { status: 1, remarks: 'Approved from Application Management' },
        }).unwrap();

        shikshaMitraToast.success({
          message: 'Application approved successfully',
        });

        if (onApprove) onApprove();
        if (onClose) onClose(values, true);
      } catch (error: any) {
        shikshaMitraToast.error({
          message: error?.data?.message || 'Failed to approve application',
        });
      }
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
            onClick={(e: any) => formik.handleSubmit(e)}
            disabled={isAssigning || isApproving}
          >
            {isAssigning || isApproving ? 'Approving...' : 'Approve'}
          </Button>
        </DialogActions>
      </Box>
    </BackPopUpChecked>
  );
};

export default TransportApplicationDetail;
