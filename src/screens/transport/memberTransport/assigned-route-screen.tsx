'use client';

import React, { useMemo } from 'react';

import { Box, Tab, Card } from '@mui/material';

import { useSearchParam } from 'src/hooks/use-search-param';

import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import MemberTransportScreen from './member-transport-screen';
import TransportRequestScreen from './transport-request-screen';


const TABS = [
    {
        value: 'assignedRoute',
        label: 'Assigned Route',
        icon: <Iconify icon="lineicons:route-1" width={20} />,
        component: () => <MemberTransportScreen />,
    },
    {
        value: 'Request',
        label: 'Request',
        icon: <Iconify icon="carbon:request-quote" width={20} />,
        component: () => <TransportRequestScreen />,
    },
];

const AssignedRouteScreen = () => {
    const [searchParams, setSearchParams] = useSearchParam({ tab: 'assignedRoute' });

    const currentActiveComponent = useMemo(
        () => TABS.find((tab) => tab.value === searchParams?.tab),
        [searchParams.tab]
    );

    return (
        <Box>
            <CustomBreadcrumbs
                heading="Assigned Route"
                links={[
                    { name: 'Transport' },
                    { name: 'Assigned Route' },
                    {
                        name:
                            searchParams.tab === 'assignedRoute'
                                ? 'Assigned Route'
                                : 'Request',
                    },
                ]}
                sx={{ px: 1, mb: 2 }}
            />
            <Card>
                <CustomTabs
                    value={searchParams.tab}
                    onChange={(e, value) => setSearchParams({ tab: value })}
                    sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 } }}
                    role="tablist"
                >
                    {TABS.map((tab) => (
                        <Tab
                            sx={{ fontSize: '12px' }}
                            icon={tab.icon}
                            key={tab.value}
                            value={tab.value}
                            label={tab.label}
                        />
                    ))}
                </CustomTabs>
            </Card>
            <Box px={1} pt={2}>
                {currentActiveComponent?.component && (
                    <currentActiveComponent.component
                    // searchParams={searchParams}
                    // setSearchParams={setSearchParams}
                    />
                )}
            </Box>
        </Box>
    );
};

export default AssignedRouteScreen;
