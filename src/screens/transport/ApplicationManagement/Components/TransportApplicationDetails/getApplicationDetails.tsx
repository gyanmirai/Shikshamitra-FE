import type { ITransportApplicationPayload } from '../../type';

export const getTransportApplicationInitialValues = (
  selectedApplication: ITransportApplicationPayload | null,
  routeData: any
) => {
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
    selectedRoute: routeData?.[0] && {
      routeId: routeData[0].routeId || '',
      routeName: routeData[0].routeName || '',
      startPoint: routeData[0].startPoint || '',
      endPoint: routeData[0].endPoint || '',
      capacity: routeData[0].capacity || '',
      status: routeData[0].status || '',
    },
    stops: routeData?.[0].stops || [],
    status: selectedApplication.status || '',
  };
};
