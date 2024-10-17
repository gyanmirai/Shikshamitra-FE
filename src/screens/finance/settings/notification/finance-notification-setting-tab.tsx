import React from 'react';

import Grid2 from '@mui/material/Unstable_Grid2';
import { Box, Card, Switch, TextField, Typography, FormControlLabel } from '@mui/material';

import { Editor } from 'src/components/editor';

import FinanceNotificationCardComponent from './component/finance-notification-card-component';

const FinanceNotificationSettingTab = () => {
    const cardData = [
        {
            cardTitle: 'Overdue Fee Payments',
            switchLabel: 'Enable Overdue Alerts',
            textFieldLabel: '7 days overdue',
            showOptionalSwitch: false,
        },
        {
            cardTitle: 'Low Department Budgets',
            switchLabel: 'Enable alerts for low budget',
            textFieldLabel: 'Alert when utilization reaches 80%',
            showOptionalSwitch: false,
        },
        {
            cardTitle: 'Unpaid Salary Alerts',
            switchLabel: 'Enable Unpaid Salary Alerts',
            textFieldLabel: '2 Days after salary unpaid',
            showOptionalSwitch: false,
        },
        {
            cardTitle: 'Fee Reminders',
            switchLabel: 'Enable Fee Reminders',
            textFieldLabel: 'Send reminder X days before due date',
            showOptionalSwitch: false,
        },
        {
            cardTitle: 'Overdue Alerts',
            switchLabel: 'Enable Overdue Alerts',
            textFieldLabel: 'Send overdue alert after X days',
            showOptionalSwitch: false,
        },
        {
            cardTitle: 'Upcoming Expenses',
            switchLabel: 'Activate or deactivate notifications for upcoming expenses',
            textFieldLabel: 'To enter specific dates or conditions',
            showOptionalSwitch: true,
        },
        {
            cardTitle: 'Pending Income',
            switchLabel: 'Activate or deactivate notifications for pending income',
            textFieldLabel: 'To enter specific dates or conditions',
            showOptionalSwitch: true,
        },
    ];

    const groupIntoPairs = (arr: any) => {
        const pairs = [];
        for (let i = 0; i < arr.length; i += 2) {
            pairs.push(arr.slice(i, i + 2));
        }
        return pairs;
    };

    const cardRows = groupIntoPairs(cardData);

    return (
        <>
            {/* Render the first two cards in the first row */}
            <Box width="100%" >
                <Grid2 container spacing={2}>
                    {cardRows[0].map((card: any, cardIndex: any) => (
                        <Grid2 key={cardIndex} lg={6} md={6} xs={12}>
                            <FinanceNotificationCardComponent
                                cardTitle={card.cardTitle}
                                switchLabel={card.switchLabel}
                                textFieldLabel={card.textFieldLabel}
                                showOptionalSwitch={card.showOptionalSwitch}
                                onSwitchChange={(e) => console.log('Main switch:', e.target.checked)}
                                onOptionalSwitchChange={(e) => console.log('Optional switch:', e.target.checked)}
                                onInputChange={(e) => console.log('Input value:', e.target.value)}
                                onSave={() => console.log('Save button clicked')}
                            />
                        </Grid2>
                    ))}
                </Grid2>
            </Box>

            {/* Render the next two cards in the second row */}
            <Box width="100%">
                <Grid2 container spacing={2}>
                    {cardRows[1].map((card: any, cardIndex: any) => (
                        <Grid2 key={cardIndex} md={12} lg={6}>
                            <FinanceNotificationCardComponent
                                cardTitle={card.cardTitle}
                                switchLabel={card.switchLabel}
                                textFieldLabel={card.textFieldLabel}
                                showOptionalSwitch={card.showOptionalSwitch}
                                onSwitchChange={(e) => console.log('Main switch:', e.target.checked)}
                                onOptionalSwitchChange={(e) => console.log('Optional switch:', e.target.checked)}
                                onInputChange={(e) => console.log('Input value:', e.target.value)}
                                onSave={() => console.log('Save button clicked')}
                            />
                        </Grid2>
                    ))}
                </Grid2>
            </Box>

            {/* Fee Collection Notification Card */}
            <Box display="flex" justifyContent="center" mb={3}>
                <Card sx={{ pl: 3, pr: 3, pt: 3, pb: 4, width: '100%' }}>
                    <Typography variant="h6">Fee Collection Notification</Typography>
                    <Box display="flex" flexDirection="row" gap={2}>
                        <Grid2 lg={3}>
                            <FormControlLabel
                                label="Reminders for pending fees"
                                control={<Switch name="dense" checked onChange={() => { }} />}
                            />
                            <TextField
                                name="Frequency"
                                label="Frequency"
                                value=""
                                onChange={() => { }}
                                size="small"
                            />
                        </Grid2>

                        <Grid2 lg={3} display="flex" flexDirection="column" alignItems="center">
                            <Typography variant="h6" textAlign="center">SMS</Typography>
                            <Editor
                                onChange={(value) => {
                                    // Handle onChange event
                                }}
                                placeholder="Enter your SMS content here..."
                                sx={{ width: '100%', marginTop: '10px' }}
                            />
                        </Grid2>
                        <Grid2 lg={3} display="flex" flexDirection="column" alignItems="center">
                            <Typography variant="h6" textAlign="center">Email</Typography>
                            <Editor
                                onChange={(value) => {
                                    // Handle onChange event
                                }}
                                placeholder="Enter your Email content here..."
                                sx={{ width: '100%', marginTop: '10px' }}
                            />
                        </Grid2>
                    </Box>
                </Card>
            </Box>

            {/* Render the fifth and sixth cards in a new row */}
            <Box width="100%">
                <Grid2 container spacing={2}>
                    {cardRows[2].slice(0, 2).map((card: any, cardIndex: any) => (
                        <Grid2 key={cardIndex} md={12} lg={6}>
                            <FinanceNotificationCardComponent
                                cardTitle={card.cardTitle}
                                switchLabel={card.switchLabel}
                                textFieldLabel={card.textFieldLabel}
                                showOptionalSwitch={card.showOptionalSwitch}
                                onSwitchChange={(e) => console.log('Main switch:', e.target.checked)}
                                onOptionalSwitchChange={(e) => console.log('Optional switch:', e.target.checked)}
                                onInputChange={(e) => console.log('Input value:', e.target.value)}
                                onSave={() => console.log('Save button clicked')}
                            />
                        </Grid2>
                    ))}
                </Grid2>
            </Box>

            {/* Render the last card in the last row */}
            <Box width="100%">
                <Grid2 container spacing={2}>
                    {cardRows[2].length > 2 && (

                        <Grid2 md={12} lg={6}>
                            <FinanceNotificationCardComponent
                                cardTitle={cardRows[2][2].cardTitle}
                                switchLabel={cardRows[2][2].switchLabel}
                                textFieldLabel={cardRows[2][2].textFieldLabel}
                                showOptionalSwitch={cardRows[2][2].showOptionalSwitch}
                                onSwitchChange={(e) => console.log('Main switch:', e.target.checked)}
                                onOptionalSwitchChange={(e) => console.log('Optional switch:', e.target.checked)}
                                onInputChange={(e) => console.log('Input value:', e.target.value)}
                                onSave={() => console.log('Save button clicked')}
                            />
                        </Grid2>
                    )}
                </Grid2>
            </Box>
            {/* Handle the case where the last row has only one card */}
            <Box width="100%">
                <Grid2 container spacing={2}>
                    {cardRows[2].length === 2 && (
                        <Grid2 md={12} lg={6} >
                            <FinanceNotificationCardComponent
                                cardTitle={cardData[cardData.length - 1].cardTitle}
                                switchLabel={cardData[cardData.length - 1].switchLabel}
                                textFieldLabel={cardData[cardData.length - 1].textFieldLabel}
                                showOptionalSwitch={cardData[cardData.length - 1].showOptionalSwitch}
                                onSwitchChange={(e) => console.log('Main switch:', e.target.checked)}
                                onOptionalSwitchChange={(e) => console.log('Optional switch:', e.target.checked)}
                                onInputChange={(e) => console.log('Input value:', e.target.value)}
                                onSave={() => console.log('Save button clicked')}
                            />
                        </Grid2>
                    )}
                </Grid2>
            </Box>

            <Box pb="20px" />
        </>
    );
};

export default FinanceNotificationSettingTab;
