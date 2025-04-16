/**
 * Props interface for the RoomCreationForm component
 * @property {boolean} dialogValue - Controls the visibility of the dialog
 * @property {any} data - Data of the room to be edited
 * @property {Function} onSave - Callback function to handle form submission
 * @property {Function} onClose - Callback function to close the dialog
 * @property {boolean} isEdit - Flag to determine if form is in edit mode
 * @property {any} allData - Array of all existing room data
 */

export interface IRoomCreationFormProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: (e: any, isSubmit: false) => void;
  isEdit: boolean;
  allData: any;
}

/**
 * Interface for form values used in Formik
 * @property {string} roomNumber - Room number/name identifier
 * @property {string} buildingName - Name of the building
 * @property {string} floor - Floor number where room is located
 * @property {string} capacity - Maximum capacity of the room
 */
export interface IRoomCreationFormikValue {
  roomNumber: string;
  buildingName: string;
  floor: string;
  capacity: string;
}
