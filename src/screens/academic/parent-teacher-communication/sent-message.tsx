import React, { useState } from 'react';

import { Box, Card, Paper, Button, TextField, Typography, CardContent } from '@mui/material';

function SentMessage() {
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  const handleResend = (messageId: string) => {
    // Handle resend logic here
    console.log(`Resending message: ${messageId}`);
  };

  const handleForward = (messageId: string) => {
    // Handle forward logic here
    console.log(`Forwarding message: ${messageId}`);
  };

  return (
    <Box sx={{ display: 'flex', gap: 4, padding: 4 }}>
      {/* Sent Message List */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="h6" gutterBottom>
          Sent Message List
        </Typography>
        <TextField
          label="Search"
          variant="outlined"
          fullWidth
          sx={{ input: {}, marginBottom: 2 }}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1, 2, 3].map((messageId) => (
            <Card key={messageId} sx={{}}>
              <CardContent>
                <Typography variant="body1">Recipient Name - Subject - Date Sent</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 1 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleResend(`${messageId}`)}
                  >
                    Resend
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleForward(`${messageId}`)}
                  >
                    Forward
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Full Message View */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="h6" gutterBottom>
          Full Message View
        </Typography>
        <Paper sx={{ padding: 2 }}>
          <Typography variant="body1">Recipient Name</Typography>
          <Typography variant="body1">Subject</Typography>
          <Typography variant="body2" sx={{ marginTop: 2 }}>
            Message Body
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
            <Button variant="contained" color="primary">
              Resend
            </Button>
            <Button variant="contained" color="secondary">
              Forward
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Message Actions (Resend, Forward) */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="h6" gutterBottom>
          Resend Message
        </Typography>
        <TextField
          label="Recipient Name"
          variant="outlined"
          fullWidth
          sx={{ input: {}, marginBottom: 2 }}
        />
        <TextField
          label="Subject"
          variant="outlined"
          fullWidth
          sx={{ input: {}, marginBottom: 2 }}
        />
        <TextField
          label="Message Body"
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          sx={{ input: {}, marginBottom: 2 }}
        />
        <Button variant="contained" color="primary" fullWidth>
          Send
        </Button>
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography variant="h6" gutterBottom>
          Forward Message
        </Typography>
        <TextField
          label="Recipient Name"
          variant="outlined"
          fullWidth
          sx={{ input: {}, marginBottom: 2 }}
        />
        <TextField
          label="Subject"
          variant="outlined"
          fullWidth
          sx={{ input: {}, marginBottom: 2 }}
        />
        <TextField
          label="Message Body"
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          sx={{ input: {}, marginBottom: 2 }}
        />
        <Button variant="contained" color="secondary" fullWidth>
          Send
        </Button>
      </Box>
    </Box>
  );
}

export default SentMessage;
