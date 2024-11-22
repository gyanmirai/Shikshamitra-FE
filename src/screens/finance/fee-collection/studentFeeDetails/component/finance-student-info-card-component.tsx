import React from 'react';

import { Box, Card, Avatar, Typography } from '@mui/material';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';

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
const { assetURL } = CONFIG.site;
const FinanceStudentInfoCardComponent = ({ user }: Props) => {
  const data = [];
  return (
    <Card sx={{ display: 'flex', flexDirection: 'row', width: '100%', p: 2,background: 'linear-gradient(to right, #fbe8d3, #e0f7fa)', boxShadow: 3, borderRadius: 2 }}>
      {/* Left Section: Student Name and Avatar */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '20%', textAlign: 'center', mr: 2 }}>
        <Avatar alt={user.name} src={`${assetURL}/assets/images/avatar/avatar-${0 + 1}.webp`} sx={{ width: 80, height: 80, mb: 1 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>{user.name}</Typography>
      </Box>

      {/* Right Section: Student Information */}
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '80%' }}>
        {/* Header */}
        {/* <Box sx={{ p: 1, backgroundColor: '#e3f2fd', textAlign: 'center' }}>
          <Typography variant="subtitle1">Student Information</Typography>
        </Box> */}

        {/* Information Grid: Class, Contact, Charges */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mt: 2 }}>
          {[
            { label: 'Standard', icon: "fa:mortar-board", value: "10-A" },
            { label: 'Parents Contact', icon: "material-symbols-light:call-outline", value: '9876542347' },
            { label: 'Total Fees', icon: "arcticons:mymoney-pro", value: '₹ 60,000' },
            { label: 'Total Charges', icon: "arcticons:mymoney-pro", value: '₹ 0' },
          ].map(({ label, icon, value }) => (
            <Box key={label} sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ mb: 0.5, color: 'text.secondary' }}>{label}</Typography>
              <Box display="flex" alignItems="center" justifyContent="center">
                <Iconify icon={icon} width={20} height={20} sx={{ mr: 1 }} />
                {value}
              </Box>
            </Box>
          ))}
        </Box>

        {/* Fees Information */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mt: 2 }}>
          {['Paid Fees', 'Pending Fees', 'Overdue Fees', 'Total Refund'].map((label, index) => (
            <Box key={label} sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ mb: 0.5, color: 'text.secondary' }}>{label}</Typography>
              <Typography 
              // sx={{ color: index === 0 ? 'success.main' : index === 1 ? 'warning.main' : 'error.main' }}
              >
                {index === 0 ? '₹ 10,000' : index === 1 ? '₹ 20,000'  :  index === 2 ?'₹ 30,000' : "₹ 0"}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Card>
    // <Card sx={{ display: 'flex', width: '100%', p: 2 }}>
    //   {/* Left Section: Avatar and Name */}
    //   <Box
    //     display="flex"
    //     flexDirection="column"
    //     alignItems="center"
    //     justifyContent="center"
    //     sx={{ width: '30%', textAlign: 'center' }}
    //   >
    //     <Typography variant="subtitle1" component="div" sx={{ mb: 1 }}>
    //       {user.name}
    //     </Typography>
    //     <Avatar
    //       alt={user.name}
    //       src={user.avatarUrl}
    //       sx={{
    //         width: 80,
    //         height: 80,
    //       }}
    //     />
    //   </Box>

    //   {/* Right Section: Fee Information and Buttons */}
    //   <Box
    //     sx={{
    //       width: '70%',
    //       pl: 3,
    //       display: 'flex',
    //       flexDirection: 'column',
    //       justifyContent: 'space-between',
    //     }}
    //   >
    //     {/* Fee Information */}
    //     <Box
    //       display="grid"
    //       gridTemplateColumns="repeat(3, 1fr)"
    //       sx={{ typography: 'subtitle1', width: '100%', mb: 2 }}
    //     >
    //       {['Paid Fees', 'Pending Fees', 'Overdue Fees'].map((label, index) => (
    //         <Box key={label} sx={{ textAlign: 'center' }}>
    //           <Typography
    //             variant="caption"
    //             component="div"
    //             sx={{ mb: 0.5, color: 'text.secondary' }}
    //           >
    //             {label}
    //           </Typography>
    //           {index === 0 ? '10,000' : index === 1 ? '20,000' : '30,000'}
    //         </Box>
    //       ))}
    //     </Box>

    //     {/* Bottom-Left Buttons */}
    //     <Box display="flex" justifyContent="flex-end" gap={2}>
    //       <Button size="small" variant="contained">
    //         Send Reminder
    //       </Button>
    //       <Button size="small" variant="contained">
    //         Generate Report
    //       </Button>
    //     </Box>
    //   </Box>
    // </Card>
  );
};

export default FinanceStudentInfoCardComponent;
