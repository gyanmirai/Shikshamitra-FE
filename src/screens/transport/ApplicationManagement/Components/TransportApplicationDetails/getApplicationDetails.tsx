import type { ITransportApplicationPayload } from '../../type';

export const getTransportApplicationInitialValues = (
  selectedApplication: ITransportApplicationPayload | null,
  routeData: any
) => {
  const application = routeData || selectedApplication;

  if (!selectedApplication)
    return {
      studentDetails: {
        name: '',
        class: '',
        rollNo: '',
        grNo: '',
        contactNo: '',
        role: '',
        stopName: '',
        landmark: '',
        isExistingStop: false,
      },
      selectedRoute: {
        routeId: '',
        routeName: '',
        startPoint: '',
        endPoint: '',
        capacity: '',
        status: '',
      },
      stops: [],
      status: '',
    };

  return {
    studentDetails: {
      name: selectedApplication.name || '',
      class: selectedApplication.class || '',
      rollNo: selectedApplication.rollNo || '',
      grNo: selectedApplication.grNo || '',
      contactNo: selectedApplication.contactNo || '',
      role: selectedApplication.role || '',
      stopName: selectedApplication.searchStop || '',
      assignedStop: selectedApplication.assignedStop || '',
      assignedRoute: selectedApplication.assignedRoute || '',
      landmark: selectedApplication.landmark || '',
      isExistingStop: selectedApplication.isStopExist || false,
    },
    selectedRoute: application?.assignedRouteId && {
      routeId: application.assignedRouteId || '',
      routeName: application.assignedRouteName || '',
      startPoint: '',
      endPoint: '',
      capacity: '',
      status: '',
    },
    stops: [],
    status: selectedApplication.status || '',
  };
};
