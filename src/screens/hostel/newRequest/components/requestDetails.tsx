import { Box, Typography } from '@mui/material';

import { DetailRow } from 'src/screens/communication/announcement/components/detailRow';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

const RequestDetails = ({ hostelRequest }: any) => (
  <Box>
    <Scrollbar sx={{ height: '400px' }}>
      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Iconify icon="mdi:home-city-outline" className="text-gray-500 w-6 h-6" />
        <Typography variant="h6" className="font-semibold">
          Hostel Request Details
        </Typography>
      </Box>
      <hr className="my-6 border-gray-200" />
      <DetailRow label="Name" icon="mdi:account" value={hostelRequest?.name} />
      <DetailRow label="Email" icon="mdi:email-outline" value={hostelRequest?.email} />
      <DetailRow label="Gender" icon="mdi:gender-male-female" value={hostelRequest?.gender} />
      <DetailRow
        label="Date of Birth"
        icon="mdi:cake"
        value={new Date(hostelRequest?.dateOfBirth).toLocaleDateString()}
      />
      <DetailRow label="Class" icon="mdi:school" value={hostelRequest?.className} />
      <DetailRow label="Division" icon="mdi:account-group" value={hostelRequest?.division} />
      <DetailRow label="Hostel Name" icon="mdi:home-outline" value={hostelRequest?.hostelName} />
      <DetailRow
        label="Hostel Type"
        icon="mdi:home-city-outline"
        value={hostelRequest?.hostelType}
      />
      <DetailRow
        label="Room Type"
        icon="mdi:package-variant-closed"
        value={hostelRequest?.roomType}
      />
      <DetailRow
        label="Total Amount"
        icon="mdi:currency-inr"
        value={`₹${hostelRequest?.totalAmount}`}
      />
      <DetailRow
        label="Fees Frequency"
        icon="mdi:calendar-repeat"
        value={hostelRequest?.feesFrequency}
      />
      <DetailRow
        label="Interaction Cost"
        icon="mdi:handshake"
        value={`₹${hostelRequest?.interationCost}`}
      />
      <DetailRow
        label="Schedule Date"
        icon="mdi:calendar"
        value={
          hostelRequest?.scheduleDate
            ? new Date(hostelRequest.scheduleDate).toLocaleDateString()
            : 'N/A'
        }
      />
      <DetailRow
        label="Join Date"
        icon="mdi:calendar-check"
        value={
          hostelRequest?.joinDate ? new Date(hostelRequest.joinDate).toLocaleDateString() : 'N/A'
        }
      />
      <DetailRow
        label="Parent's Contact"
        icon="mdi:phone-outline"
        value={hostelRequest?.parentsContactNo}
      />
      <DetailRow
        label="Alternate Contact"
        icon="mdi:phone-classic"
        value={hostelRequest?.alternateContactDetails}
      />
      <DetailRow
        label="Building No./Flat/House No."
        icon="mdi:map-marker"
        value={hostelRequest?.addressLine1}
      />
      <DetailRow
        label="Area/Locality/Road Name"
        icon="mdi:map-marker"
        value={hostelRequest?.addressLine2}
      />
      <DetailRow label="Landmark" icon="mdi:map-marker" value={hostelRequest?.addressLine3} />
      <DetailRow label="Village" icon="mdi:home-group" value={hostelRequest?.village} />
      <DetailRow label="City" icon="mdi:city" value={hostelRequest?.city} />
      <DetailRow label="State" icon="mdi:map" value={hostelRequest?.state?.name} />
      <DetailRow label="Country" icon="mdi:earth" value={hostelRequest?.country?.name} />
      <DetailRow label="Pin Code" icon="mdi:numeric" value={hostelRequest?.pinCode} />
    </Scrollbar>
  </Box>
);
export default RequestDetails;
