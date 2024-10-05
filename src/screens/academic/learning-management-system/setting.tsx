"use client"
import { Box, Card, Tab } from '@mui/material';
import React from 'react'
import { CustomTabs } from 'src/components/custom-tabs';
import { useTabs } from 'src/hooks/use-tabs';
import GeneralSettings from './settingScreen/general';
import CourseManagementSetting from './settingScreen/courseManagement';
import ContentManagementSetting from './settingScreen/contentManagement';
import NotificationSetting from './settingScreen/notification';
import Integrations from './settingScreen/integrations';

const TABS = [
    {
        value: 'generalSetting',
        label: 'General Settings',
        component: () => <GeneralSettings />,
    },
    {
        value: 'courseManagementSetting',
        label: 'Course Management Setting',
        component: () => <CourseManagementSetting />,
    },
    {
        value: 'contentManagamentSetting',
        label: 'Content Management Setting',
        component: () => <ContentManagementSetting />,
    },

    {
        value: 'notificationSetting',
        label: 'Notification Settings',
        component: () => <NotificationSetting />,
    },
    { value: 'integrations', label: 'Integrations', component: () => <Integrations /> },
];

const SettingScreen = () => {
    const tabs = useTabs('generalSetting');
    const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;

    return (
        <>
            <Card
                sx={{
                    '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
                }}
            >
                <CustomTabs
                    value={tabs.value}
                    onChange={tabs.onChange}
                    variant="fullWidth"
                    slotProps={{ tab: { px: 0 } }}
                >
                    {TABS.map((tab) => (
                        <Tab key={tab.value} value={tab.value} label={tab.label} />
                    ))}
                </CustomTabs>
            </Card>
            <Box px={1} pt={2}>
                {CurrentComponent?.()}
            </Box>
        </>

    )
}

export default SettingScreen