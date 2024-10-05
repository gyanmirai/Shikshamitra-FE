"use client"
import { Box, Button, Card, CardContent, Grid, List, ListItem, ListItemText, Switch, Typography } from '@mui/material'
import React from 'react'
import CustomSelect from 'src/components/custom-select'
import { Scrollbar } from 'src/components/scrollbar'

const CourseManagementSetting = () => {
    return (
        <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h4">
                Course Templates
            </Typography>

            <Card sx={{ maxWidth: '500px', width: '100%', borderRadius: '8px' }}>
                <Scrollbar style={{ maxHeight: '150px' }}>
                    <CardContent sx={{padding : '8px'}}>
                        <List sx={{ '& .MuiListItem-root': { py: 0.5 } }}>
                            {['Template 1', 'Template 2', 'Template 3', 'Template 4', 'Template 5', 'Template 6'].map((template, index) => (
                                <ListItem key={index}>
                                    <ListItemText primary={template} />
                                </ListItem>
                            ))}
                        </List>
                    </CardContent>
                </Scrollbar>
            </Card>

            <Box
                sx={{ display: 'flex', gap: 2, marginLeft: 25 }}
            >
                <Button
                    color="secondary"
                    variant="contained"
                >
                    New Template
                </Button>
                <Button color="primary" variant="contained">
                    Edit
                </Button>

                <Button
                    color="error"
                    variant="contained"
                >
                    Delete
                </Button>
            </Box>
            <Box sx={{ display: 'flex' }}>
                <Switch
                    inputProps={{ 'aria-label': 'Toggle view' }}
                />
                <Typography sx={{ ml: 1, mt: 1 }}>Course Visibility</Typography>
            </Box>
            <CustomSelect
                options={[]}
                value=""
                label="Course Visibility"
                onChange={() => { }}
                formControlProps={{ sx: { maxWidth: '300px', width: '100%', marginTop: '5px' } }} />
            <Button
                color="secondary"
                variant="contained"
                sx={{ maxWidth: '250px', width: '100%', marginLeft: '20%' }}
            >
                Manage Archieved Courses
            </Button>
        </Box >
    )
}

export default CourseManagementSetting