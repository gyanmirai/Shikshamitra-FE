'use client';

import 'leaflet/dist/leaflet.css';

import React from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/custom-dialog';
import CustomizableTable from 'src/components/customizable-table';

interface ViewStopDetailDialogProps {
  dialogValue: boolean;
  onClose: () => void;
}
const ViewStopDetailDialog: React.FC<ViewStopDetailDialogProps> = ({ dialogValue, onClose }) => (
  // const [_charges, setCharges] = useState('');
  // const handleChargesChange = (formattedValue: string, numericValue: number) => {
  //   setCharges(formattedValue);
  // };
  <CustomDialog
    maxWidth="md"
    title="View Details For Stop Madhuram Circle"
    handleClose={onClose}
    open={dialogValue}
  >
    <Scrollbar sx={{ p: 3, height: '500px' }}>
      <CustomizableTable
        tableId="view-stop-detail-table"
        isShowedDense={false}
        isFilter={false}
        data={[
          {
            name: 'Jay Desai',
            standard: '10',
            id: '890',
            role: 'Student',
          },
          {
            name: 'Ramesh Desai',
            standard: '-',
            id: '990',
            role: 'Teacher',
          },
        ]}
        columns={[
          { id: 'id', label: 'Gr No/ Employee No' },
          { id: 'name', label: 'Name' },
          { id: 'standard', label: 'Standard' },

          { id: 'role', label: 'Role' },
        ]}
      />
    </Scrollbar>
    {/* <DialogActions>
                <Button variant="contained" type="submit">
                    Save
                </Button>
            </DialogActions> */}
  </CustomDialog>
);
export default ViewStopDetailDialog;
