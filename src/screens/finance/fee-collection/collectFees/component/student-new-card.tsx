
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { varAlpha } from 'src/theme/styles';
import { AvatarShape } from 'src/assets/illustrations';

import { Image } from 'src/components/image';

export type IUserCard = {
    id: string;
    name: string;
    role: string;
    coverUrl: string;
    avatarUrl: string;
    totalPosts: number;
    totalFollowers: number;
    totalFollowing: number;
};

type Props = {
    user: IUserCard;
};
const StudentNewCard = ({ user }: Props) => (
    <Card sx={{ textAlign: 'center' }}>
        <Box sx={{ position: 'relative' }}>
            <AvatarShape
                sx={{
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    mx: 'auto',
                    bottom: -26,
                    position: 'absolute',
                }}
            />

            <Avatar
                alt={user.name}
                src={user.avatarUrl}
                sx={{
                    width: 64,
                    height: 64,
                    zIndex: 11,
                    left: 0,
                    right: 0,
                    bottom: -32,
                    mx: 'auto',
                    position: 'absolute',
                }}
            />

            <Image
                src={user.coverUrl}
                alt={user.coverUrl}
                ratio="16/9"
                sx={{ height: 150 }}
                slotProps={{
                    overlay: {
                        background: (theme) => varAlpha(theme.vars.palette.grey['900Channel'], 0.48),
                    },
                }}
            />
        </Box>

        <ListItemText
            sx={{ mt: 7, mb: 1 }}
            primary="Vishal Makwana"
            // secondary={user.role}
            primaryTypographyProps={{ typography: 'subtitle1' }}
        // secondaryTypographyProps={{ component: 'span', mt: 0.5 }}
        />
        {/* <Box  pb="15px" display="flex" justifyContent="center" alignItems="center">
            <Button
                variant="contained"
                size="small"
            //   onClick={() => {
            //     setSelectedStudent(students[0])
            //     setIsEdit(true);
            //     dialog.onTrue();
            //   }}
            >
                Collect Fees
            </Button>
        </Box> */}
        {/* <Stack direction="row" alignItems="center" justifyContent="center" sx={{ mb: 2.5 }}>
        {_socials.map((social) => (
          <IconButton key={social.name}>
            <SocialIcon icon={social.name} />
          </IconButton>
        ))}
      </Stack> */}

        <Divider sx={{ borderStyle: 'dashed' }} />
        <Box
            display="grid"
            gridTemplateColumns="repeat(3, 1fr)"
            sx={{ py: 2, typography: 'subtitle1', width: '100%' }}
        >
            {['Class', 'Parents Contact', 'Charges'].map((label, index) => (
                <Box key={label} sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" component="div" sx={{ mb: 0.5, color: 'text.secondary' }}>
                        {label}
                    </Typography>
                    {index === 0 ? 10 : index === 1 ? '9876542347' : '₹ 2,000'}
                </Box>
            ))}
        </Box>
        <Box
          display="grid"
          gridTemplateColumns="repeat(3, 1fr)"
          sx={{ typography: 'subtitle1', width: '100%', mb: 2 }}
        >
          {['Paid Fees', 'Pending Fees', 'Overdue Fees'].map((label, index) => (
            <Box key={label} sx={{ textAlign: 'center' }}>
              <Typography variant="caption" component="div" sx={{ mb: 0.5, color: 'text.secondary' }}>
                {label}
              </Typography>
              {index === 0 ? '10,000' : index === 1 ? '20,000' : '30,000'}
            </Box>
          ))}
        </Box>

        {/* <Box
        display="grid"
        gridTemplateColumns="repeat(3, 1fr)"
        sx={{ py: 3, typography: 'subtitle1' }}
      >
        <div>
          <Typography variant="caption" component="div" sx={{ mb: 0.5, color: 'text.secondary' }}>
            Follower
          </Typography>
          {fShortenNumber(user.totalFollowers)}
        </div>

        <div>
          <Typography variant="caption" component="div" sx={{ mb: 0.5, color: 'text.secondary' }}>
            Following
          </Typography>

          {fShortenNumber(user.totalFollowing)}
        </div>

        <div>
          <Typography variant="caption" component="div" sx={{ mb: 0.5, color: 'text.secondary' }}>
            Total post
          </Typography>
          {fShortenNumber(user.totalPosts)}
        </div>
      </Box> */}
    </Card>
)

export default StudentNewCard