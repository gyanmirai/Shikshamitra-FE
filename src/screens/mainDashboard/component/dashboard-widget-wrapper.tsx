'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, Divider, CardHeader, CardContent } from '@mui/material';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  subheader?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  sx?: any;
};

export function DashboardWidgetWrapper({
  title,
  subheader,
  children,
  action,
  sx,
  ...other
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          border: '1px solid rgba(145, 158, 171, 0.12)',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
          },
          ...sx,
        }}
        {...other}
      >
        {title && (
          <CardHeader title={title} subheader={subheader} action={action || null} sx={{ p: 2 }} />
        )}

        {title && <Divider sx={{ borderStyle: 'dashed' }} />}

        <CardContent sx={{ flexGrow: 1, position: 'relative', p: 3 }}>{children}</CardContent>
      </Card>
    </motion.div>
  );
}
