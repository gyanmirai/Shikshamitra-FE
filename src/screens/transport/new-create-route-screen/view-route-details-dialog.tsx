import React from 'react';
import CustomDialog from 'src/components/custom-dialog';
import { Iconify } from 'src/components/iconify/iconify';
import { Scrollbar } from 'src/components/scrollbar/scrollbar';
import CustomizableTable from 'src/components/customizable-table';
import { Box, Accordion, Typography, AccordionSummary, AccordionDetails } from '@mui/material';

interface ViewRouteDetailsDialogProps {
  onClose: () => void;
  data: any;
  dialogValue: boolean;
}
const ViewRouteDetailsDialog: React.FC<ViewRouteDetailsDialogProps> = ({
  onClose,
  data,
  dialogValue,
}) => (
  // const [openStop, setOpenStop] = useState(null);

  <CustomDialog maxWidth="md" title="Route Details" handleClose={onClose} open={dialogValue}>
    <Scrollbar sx={{ bgcolor: 'background.neutral', overflow: 'auto', p: 3, height: '500px' }}>
      <Typography variant="h5" gutterBottom>
        {data.routeName}
      </Typography>
      <Typography variant="body1">
        <strong>Vehicle:</strong> {data.vehicle} | <strong>Driver:</strong> {data.driver} |{' '}
        <strong> Total Stops:</strong> {data.totalStops} | <strong>Total Riders:</strong>{' '}
        {data.totalRiders}
      </Typography>
      {/* <Typography variant="body2">
                    
                </Typography> */}

      <Box pb="50px" />
      {data.stops.map((stop: any, index: any) => (
        <Accordion key={index}>
          <AccordionSummary
            expandIcon={<Iconify icon="iconamoon:arrow-up-2-thin" />}
            aria-controls={`panel-${index}-content`}
            id={`panel-${index}-header`}
          >
            <Typography variant="subtitle1">{stop.stopName}</Typography>
            {/* <Typography variant="body2">
                                    {stop.pickUpTime} - {stop.dropOffTime}
                                </Typography> */}
          </AccordionSummary>
          <AccordionDetails>
            <CustomizableTable
              tableId="route-details-table"
              isShowedDense={false}
              isFilter={false}
              isPagination={false}
              isSearch={false}
              data={stop.students}
              columns={[
                { id: 'name', label: 'Name' },
                { id: 'grade', label: 'Standard' },
                { id: 'rollNumber', label: 'GR No / Employee No' },
                {
                  id: 'role',
                  label: 'Role',
                  render(value, row) {
                    return <Typography fontSize="12px">Student</Typography>;
                  },
                },
              ]}
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </Scrollbar>
  </CustomDialog>
);
export default ViewRouteDetailsDialog;
