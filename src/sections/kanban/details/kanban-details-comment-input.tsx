import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import { today } from 'src/utils/format-time';
import InputBase from '@mui/material/InputBase';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';

// ----------------------------------------------------------------------

export function KanbanDetailsCommentInput() {
  const user = {
    id: '8864c717-587d-472a-929a-8e5f298024da-0',
    role: 'admin',
    email: 'admin@example.com',
    address: '123 Main St, Anytown, USA',
    displayName: 'John Doe',
    name: 'John Doe',
    lastActivity: today(),
    photoURL: 'https://minimal-assets-api.vercel.app/assets/images/avatars/avatar_1.jpg',
    phoneNumber: '123-456-7890',
    status: 'online' as 'online' | 'offline' | 'alway' | 'busy',
  };

  return (
    <Stack direction="row" spacing={2} sx={{ py: 3, px: 2.5 }}>
      <Avatar src={user?.photoURL} alt={user?.displayName}>
        {user?.displayName?.charAt(0).toUpperCase()}
      </Avatar>

      <Paper variant="outlined" sx={{ p: 1, flexGrow: 1, bgcolor: 'transparent' }}>
        <InputBase fullWidth multiline rows={2} placeholder="Type a message" sx={{ px: 1 }} />

        <Stack direction="row" alignItems="center">
          <Stack direction="row" flexGrow={1}>
            <IconButton>
              <Iconify icon="solar:gallery-add-bold" />
            </IconButton>

            <IconButton>
              <Iconify icon="eva:attach-2-fill" />
            </IconButton>
          </Stack>

          <Button variant="contained">Comment</Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
