import React from 'react';

import { Box, Card, Typography } from '@mui/material'; // Assuming you're using Iconify


import { Iconify } from 'src/components/iconify';

interface SummaryCardProps {
    title: string,
    icon: string,
    colorChannel: any,
    total: any,
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, icon, colorChannel, total }) => (
    <Card
        sx={{
            py: 3,
            pl: 3,
            pr: 2.5,
            position: 'relative',
            overflow: 'hidden',
        }}
    >
        <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ typography: 'h3' }}>{total}</Box>
            <Typography
                noWrap
                variant="subtitle2"
                component="div"
                sx={{ color: 'text.secondary' }}
            >
                {title}
            </Typography>
        </Box>

        {/* Icon */}
        <Iconify
            icon={icon}
            sx={{
                top: '50%',
                right: 20,
                width: 36,
                height: 36,
                position: 'absolute',
                transform: 'translateY(-50%)',
                color: `rgba(${colorChannel}, 1)`,
            }}
        />

        {/* Background Decoration */}
        <Box
            sx={{
                top: -20,
                width: 160,
                zIndex: -1,
                height: 160,
                right: -60,
                opacity: 0.12,
                borderRadius: 3,
                position: 'absolute',
                transform: 'rotate(40deg)',
                background: `linear-gradient(to right, ${colorChannel}, 1) 0%, ${colorChannel}, 0) 100%)`,
            }}
        />
    </Card>
);

export default SummaryCard;
