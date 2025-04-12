import { Box, Chip, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { DetailRow } from './detailRow';

const AnnouncementDetails = ({ announcement }: any) => (
  <Box>
    <Scrollbar sx={{ height: '400px' }}>
      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Iconify icon="mdi:bullhorn-outline" className="text-gray-500 w-6 h-6" />
        <Typography variant="h6" className="font-semibold">
          {announcement?.title}
        </Typography>
      </Box>

      <hr className="my-6 border-gray-200" />

      <DetailRow
        label="Description"
        icon="mdi:text-box-outline"
        value={
          <Typography variant="body2" className="text-gray-700">
            {announcement?.description}
          </Typography>
        }
      />

      <DetailRow
        label="Class"
        icon="mdi:school-outline"
        value={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {announcement?.className?.map((data: any) => (
              <Chip key={data} label={`Class ${data}`} size="small" variant="outlined" />
            ))}
          </Box>
        }
      />

      <DetailRow
        label="Division"
        icon="mdi:account-group-outline"
        value={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {announcement?.division?.map((div: any) => (
              <Chip key={div} label={`Division ${div}`} size="small" variant="outlined" />
            ))}
          </Box>
        }
      />

      <DetailRow
        label="Target Audience"
        icon="mdi:account-group-outline"
        value={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {announcement?.audience?.map((aud: any) => (
              <Chip key={aud} label={aud} size="small" variant="outlined" />
            ))}
          </Box>
        }
      />

      <DetailRow
        label="Notification Preferences"
        icon="mdi:bell-outline"
        value={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {announcement?.notification_preferences?.map((pref: any) => (
              <Chip key={pref} label={pref} size="small" variant="outlined" />
            ))}
          </Box>
        }
      />

      <Box className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <DetailRow
          label="Publish Date"
          icon="mdi:calendar-outline"
          value={
            <Typography variant="body2" className="text-gray-700">
              {new Date(announcement?.publishDate).toLocaleString()}
            </Typography>
          }
        />

        <DetailRow
          label="Expiry Date"
          icon="mdi:calendar-clock-outline"
          value={
            <Typography variant="body2" className="text-gray-700">
              {new Date(announcement?.expiryDate).toLocaleString()}
            </Typography>
          }
        />

        <DetailRow
          label="Category"
          icon="mdi:folder-outline"
          value={
            <Typography
              component="span"
              variant="body2"
              className="px-3 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-200"
            >
              {announcement?.category}
            </Typography>
          }
        />

        <DetailRow
          label="Importance Level"
          icon="mdi:flag-outline"
          value={
            <Typography
              component="span"
              variant="body2"
              className={`px-3 py-1 rounded-full ${
                announcement?.importance_level === 'High'
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-yellow-50 text-yellow-600 border border-yellow-200'
              }`}
            >
              {announcement?.importance_level}
            </Typography>
          }
        />

        <DetailRow
          label="Status"
          icon="mdi:information-outline"
          value={
            <Typography
              component="span"
              variant="body2"
              className={`px-3 py-1 rounded-full ${
                announcement?.status === 'Published'
                  ? 'bg-green-50 text-green-600 border border-green-200'
                  : 'bg-yellow-50 text-yellow-600 border border-yellow-200'
              }`}
            >
              {announcement?.status}
            </Typography>
          }
        />
      </Box>

      {announcement?.link && (
        <DetailRow
          label="External Link"
          icon="mdi:link-variant"
          value={
            <Typography
              component="a"
              variant="body2"
              href={announcement.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {announcement.link}
            </Typography>
          }
        />
      )}
    </Scrollbar>
  </Box>
);
export default AnnouncementDetails;
