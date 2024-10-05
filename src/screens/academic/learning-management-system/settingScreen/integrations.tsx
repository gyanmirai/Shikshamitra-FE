"use client"
import { Box, Button, Switch, Typography } from '@mui/material'
import React from 'react'

const Integrations = () => {
  return (
    <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h4">
        Integrations
      </Typography>
      <Box sx={{ display: 'flex' }}>
        <Switch
          inputProps={{ 'aria-label': 'Toggle view' }}
        />
        <Typography sx={{ ml: 1, mt: 1 }}>Assignment Deadlines</Typography>
      </Box>
      <Box sx={{ display: 'flex' }}>
        <Switch
          inputProps={{ 'aria-label': 'Toggle view' }}
        />
        <Typography sx={{ ml: 1, mt: 1 }}>Assignment Deadlines</Typography>
      </Box>
        <Button
          color="secondary"
          variant="contained"
          sx={{maxWidth: '250px', width: '100%'}}
        >
          Add Integration
        </Button>
    </Box>
  )
}

export default Integrations