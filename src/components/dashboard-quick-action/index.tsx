import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, Paper, Button } from '@mui/material';

import { Iconify } from '../iconify';
import CustomTooltip from '../custom-tooltip';

interface DashboardQuickActionProps {
  actions: {
    icon: string;
    label: string;
    href: string;
    onClick?: () => void;
    color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  }[];
}

const DashBoardQuickAction = ({ actions }: DashboardQuickActionProps) => {
  const router = useRouter();
  return (
    <CustomTooltip
      arrow
      placement="left-start"
      title={
        <Card
          sx={{
            p: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            alignItems: 'center',
            boxShadow: 'none',
          }}
        >
          {actions.map((action) => (
            <Button
              key={action.label}
              startIcon={<Iconify icon={action.icon} sx={{ width: 16, height: 16 }} />}
              variant="soft"
              size="small"
              sx={{ width: '100%' }}
              color={action.color || 'primary'}
              onClick={() => {
                if (action.href) {
                  router.push(action.href);
                }
                action?.onClick?.();
              }}
            >
              {action.label}
            </Button>
          ))}
        </Card>
      }
    >
      <Paper
        sx={{
          height: 50,
          width: 50,
          position: 'fixed',
          // top: '50%',
          // transform: 'translateY(-50%)',
          bottom: 10,
          right: 10,
          zIndex: 999,
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          bgcolor: 'primary.main',
        }}
        elevation={12}
      >
        <Iconify icon="mdi:interaction-double-tap" color="white" />
      </Paper>
    </CustomTooltip>
  );
};

export default DashBoardQuickAction;
