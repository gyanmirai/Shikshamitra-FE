import React, { useState } from 'react';

import { Box, Card, Avatar, Divider, Typography, CardHeader, CardContent } from '@mui/material';

import TemplateView from './templateView';

const Template1 = ({ isShowSettings }: { isShowSettings: boolean }) => {
  const [settings, setSettings] = useState<Record<string, any>>({
    name: { fontSize: 24, fontWeight: 'bold', textTransform: 'none', color: '#000000' },
    grNo: { fontSize: 16, fontWeight: 'normal', textTransform: 'none', color: '#000000' },
    stdDiv: { fontSize: 16, fontWeight: 'normal', textTransform: 'none', color: '#000000' },
    address: { fontSize: 16, fontWeight: 'normal', textTransform: 'none', color: '#000000' },
    phoneNo1: { fontSize: 16, fontWeight: 'normal', textTransform: 'none', color: '#000000' },
    phoneNo2: { fontSize: 16, fontWeight: 'normal', textTransform: 'none', color: '#000000' },
    cardHeader: {
      fontSize: 16,
      fontWeight: 'normal',
      textTransform: 'none',
      color: '#000000',
      backgroundColor: '#18c512',
    },
  });

  return (
    <TemplateView
      setSettings={setSettings}
      settings={settings}
      isShowSettings={isShowSettings}
      template={
        <Card
          sx={{
            width: 320,
            height: 480,
            borderRadius: 2,
            overflow: 'hidden',
            fontFamily: 'Arial, sans-serif',
            boxShadow: 3,
            position: 'relative',
            border: '1px solid #ddd',
            cursor: 'pointer',
          }}
        >
          <CardHeader
            sx={{
              backgroundColor: settings.cardHeader.backgroundColor,
              color: settings.cardHeader.color,
              textAlign: 'center',
              padding: 2,
            }}
            title={
              <Typography variant="h6" sx={{ margin: 0, fontSize: 20 }}>
                Deep Darshan Vidhya Sankul
              </Typography>
            }
            subheader={
              <Typography variant="subtitle2" sx={{ margin: 0, fontSize: 14 }}>
                Deladva Road Dindoli Surat
              </Typography>
            }
          />
          <Divider />
          <Box sx={{ textAlign: 'center', margin: '20px 0' }}>
            <Avatar
              src="student-photo.jpg"
              alt="Student Photo"
              sx={{
                width: 120,
                height: 150,
                border: 1,
                borderColor: '#ccc',
                borderRadius: 1,
                objectFit: 'cover',
                m: 'auto',
              }}
            />
          </Box>
          <CardContent sx={{ padding: '0 20px', textAlign: 'center' }}>
            <Typography variant="h5" sx={{ margin: 0, ...settings.name }}>
              John Doe
            </Typography>
            <Typography variant="body2" sx={{ margin: '10px 0', ...settings.grNo }}>
              <strong>Gr. No.:</strong> 3456
            </Typography>
            <Typography variant="body2" sx={{ margin: '10px 0', ...settings.stdDiv }}>
              <strong>Std / Div:</strong> 3/A
            </Typography>
            <Typography variant="body2" sx={{ margin: '10px 0', ...settings.address }}>
              <strong>Address:</strong> 128, Shantivan Banglows, Dindoli, Surat
            </Typography>
            <Typography variant="body2" sx={{ margin: '10px 0', ...settings.phoneNo1 }}>
              <strong>Phone No.1:</strong> 123-456-7890
            </Typography>
            <Typography variant="body2" sx={{ margin: '10px 0', ...settings.phoneNo2 }}>
              <strong>Phone No.2:</strong> 123-456-7890
            </Typography>
          </CardContent>
          <Box
            component="footer"
            sx={{
              backgroundColor: '#f0f0f0',
              padding: '10px 20px',
              position: 'absolute',
              bottom: 0,
              width: '100%',
              boxSizing: 'border-box',
              textAlign: 'center',
            }}
          >
            <img src="barcode.png" alt="Barcode" style={{ width: 180, height: 50 }} />
          </Box>
        </Card>
      }
      views={[
        { field: 'name', subField: 'Name' },
        { field: 'grNo', subField: 'Gr. No.' },
        { field: 'stdDiv', subField: 'Std / Div' },
        { field: 'address', subField: 'Address' },
        { field: 'phoneNo1', subField: 'Phone No.1' },
        { field: 'phoneNo2', subField: 'Phone No.2' },
      ]}
    />
  );
};

export default Template1;
