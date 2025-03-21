import { Box, Card, Avatar, Typography } from '@mui/material';

const StudentIDCard = ({ student }: any) => (
  <Card
    sx={{
      width: 400,
      minHeight: 250,
      borderRadius: 2,
      boxShadow: 3,
      display: 'flex',
      flexDirection: 'column',
      //   background: 'linear-gradient(to right, #1976d2, #42a5f5)',
      //   color: 'white',
      padding: 2,
    }}
  >
    {/* Header with Logo and Institute Name */}
    <Box display="flex" justifyContent="space-between" alignItems="center" px={2} mb={1}>
      <img src={student.instituteLogo} alt="Institute Logo" width={50} height={50} />
      <Typography variant="h6" fontWeight="bold" textAlign="center" flex={1}>
        {student.instituteName}
      </Typography>
    </Box>

    {/* Body Section */}
    <Box display="flex" alignItems="center" px={2}>
      {/* Left - Student Picture and Academic Year */}
      <Box display="flex" flexDirection="column" alignItems="center" mr={2}>
        <Avatar
          src={student.profilePicture}
          alt={student.name}
          sx={{ width: 80, height: 80, borderRadius: 0, border: '2px solid white' }}
        />
        <Typography variant="body2" mt={1}>
          {student.academicYear}
        </Typography>
      </Box>

      {/* Right - Student Information */}
      <Box flex={1}>
        <Typography variant="h6" fontWeight="bold">
          {student.name}
        </Typography>
        <Typography variant="body2">Class: {student.class}</Typography>
        {/* <Typography variant="body2">GR No: {student.grNo}</Typography> */}
        <Typography variant="body2">Roll No: {student.rollNo}</Typography>
        <Typography variant="body2">DOB: {student.dob}</Typography>
        {/* <Typography variant="body2">Gender: {student.gender}</Typography> */}
        {/* <Typography variant="body2">Blood Group: {student.bloodGroup}</Typography> */}
        <Typography variant="body2">Contact: {student.contactNo}</Typography>
        <Typography variant="body2">Address: {student.address}</Typography>
      </Box>
    </Box>
  </Card>
);

export default StudentIDCard;
