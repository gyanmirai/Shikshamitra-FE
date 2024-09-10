import React, { useState } from 'react';

import { Box, Card, Avatar, Typography } from '@mui/material';

import TemplateView from './templateView';

const Template2 = ({ isShowSettings }: { isShowSettings: boolean }) => {
  const [settings, setSettings] = useState<Record<string, any>>({
    name: { fontSize: 12, fontWeight: 'bold', textTransform: 'none', color: '#000000' },
    grNo: { fontSize: 12, fontWeight: 'normal', textTransform: 'none', color: '#000000' },
    stdDiv: { fontSize: 12, fontWeight: 'normal', textTransform: 'none', color: '#000000' },
    address: { fontSize: 12, fontWeight: 'normal', textTransform: 'none', color: '#000000' },
    phoneNo1: { fontSize: 12, fontWeight: 'normal', textTransform: 'none', color: '#000000' },
    phoneNo2: { fontSize: 12, fontWeight: 'normal', textTransform: 'none', color: '#000000' },
    cardHeader: {
      fontSize: 16,
      fontWeight: 'normal',
      textTransform: 'none',
      color: '#000000',
      backgroundColor: '#18c512',
    },
    year: { fontSize: 12, fontWeight: 'normal', textTransform: 'none', color: '#000000' },
    cardFooter: {
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
            width: 382,
            height: 252,
            border: '1px solid #ccc',
            borderRadius: 2,
            padding: '15px',

            backgroundColor: '#fff',
            fontFamily: 'Arial, sans-serif',
            boxShadow: 3,
            position: 'relative',
            cursor: 'pointer',
          }}
        >
          <Box
            sx={{
              backgroundColor: settings.cardHeader.backgroundColor,
              color: settings.cardHeader.color,
              textAlign: 'center',
              padding: 2,
            }}
          >
            <Typography variant="h6" component="h3">
              Deep Darshan Vidhya Sankul
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
              <Avatar
                src="student-photo.jpg"
                alt="Student Photo"
                sx={{
                  width: 100,
                  height: 100,
                  border: '1px solid #ccc',
                  borderRadius: 1,
                }}
              />
              <Box>
                <Typography variant="body2" sx={{ ...settings.year }}>
                  <strong>2024-2025</strong>
                </Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontSize: '12px', ...settings.name }}>
                <strong>Name:</strong> Jane Smith
              </Typography>
              <Typography variant="body2" sx={{ ...settings.grNo }}>
                <strong>Gr. No.:</strong> 3456
              </Typography>
              <Typography variant="body2" sx={{ ...settings.stdDiv }}>
                <strong>Std / Div:</strong> 3/A
              </Typography>
              <Typography variant="body2" sx={{ ...settings.address }}>
                <strong>Address:</strong> 128, Shantivan Banglows, Dindoli, Surat
              </Typography>
              <Typography variant="body2" sx={{ ...settings.phoneNo1 }}>
                <strong>Phone No.1:</strong> 1234567890
              </Typography>
              <Typography variant="body2" sx={{ ...settings.phoneNo2 }}>
                <strong>Phone No.2:</strong> 1234567890
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              backgroundColor: settings.cardFooter.backgroundColor,
              color: settings.cardFooter.color,
              textAlign: 'center',
              padding: 1,
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: settings.cardFooter.fontSize,
                fontWeight: settings.cardFooter.fontWeight,
                textTransform: settings.cardFooter.textTransform,
              }}
            >
              Deladva Road Dindoli Surat - 394210
            </Typography>
          </Box>
        </Card>
      }
      views={[
        { field: 'name', subField: 'Name' },
        { field: 'grNo', subField: 'Gr. No.' },
        { field: 'year', subField: 'Year' },
        { field: 'stdDiv', subField: 'Std / Div' },
        { field: 'address', subField: 'Address' },
        { field: 'phoneNo1', subField: 'Phone No.1' },
        { field: 'phoneNo2', subField: 'Phone No.2' },
        { field: 'cardFooter', subField: 'Footer' },
      ]}
    />
  );
};

export default Template2;
