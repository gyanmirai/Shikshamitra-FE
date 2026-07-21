import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import CustomDialog from 'src/components/customDialog';

interface TransportDriverDetailsDialogProps {
  driver: any;
  dialogValue: boolean;
  onClose: () => void;
}

const TransportDriverDetailsDialog: React.FC<TransportDriverDetailsDialogProps> = ({
  driver,
  dialogValue,
  onClose,
}) => {
  const data = {
    name: 'John Doe',
    emergencyContact: '9876543210',
    bloodGroup: 'B+',
    address: '123, Elm Street, Springfield',
    aadharCard: '1234-5678-9012',
    aadharLink: 'https://example.com/aadhar-card.pdf',
    licenseNumber: 'DL-4567-12345',
    licenseLink: 'https://example.com/license.pdf',
    route: 'Route 5: Downtown to School',
    vehicle: 'Bus #23',
  };

  return (
    <CustomDialog title="Driver Details" handleClose={onClose} open={dialogValue}>
      <Box
        sx={{
          padding: 2,
          backgroundColor: '#f9f9f9',
          borderRadius: 2,
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          gap={1}
          mb={2}
          sx={{
            borderBottom: '1px solid #ddd',
            paddingBottom: 2,
          }}
        >
          {/* Profile Image */}
          <Box
            width="120px"
            height="120px"
            sx={{
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid #1976d2',
            }}
          >
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSa_zNN4JlojDh9svX46uzOOTyJnBGXwxG0Gg&s"
              alt="Driver Profile"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Box>
          {/* Basic Info */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {data.name || 'Driver Name'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Blood Group: {data.bloodGroup || 'N/A'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Contact: {data.emergencyContact || 'N/A'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Emergency Contact: {data.emergencyContact || 'N/A'}
            </Typography>
          </Box>
        </Box>

        {/* Driver Details */}
        <Grid container spacing={2}>
          <Grid size={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Aadhar Card
            </Typography>
            <Typography
              variant="body2"
              color="primary"
              sx={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => window.open(data.aadharLink, '_blank')}
            >
              {data.aadharCard || 'View'}
            </Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              License Number
            </Typography>
            <Typography
              variant="body2"
              color="primary"
              sx={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => window.open(data.licenseLink, '_blank')}
            >
              {data.licenseNumber || 'View'}
            </Typography>
          </Grid>
          <Grid size={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Address
            </Typography>
            <Typography variant="body2">{data.address || 'N/A'}</Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Route Assigned
            </Typography>
            <Typography variant="body2">{data.route || 'No route assigned'}</Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Vehicle Assigned
            </Typography>
            <Typography variant="body2">{data.vehicle || 'No vehicle assigned'}</Typography>
          </Grid>
        </Grid>
      </Box>
    </CustomDialog>
  );
};

export default TransportDriverDetailsDialog;
