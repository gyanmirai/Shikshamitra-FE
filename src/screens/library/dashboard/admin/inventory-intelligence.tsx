import type { RootState } from 'src/redux/store';
import type { LibraryDashboardOverview } from 'src/redux/library/library-adapters';

import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { RouterLink } from 'src/routes/components';
import { hasGrantedPermission } from 'src/utils/permissions';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Grid, Link, Stack, Typography } from '@mui/material';
import { libraryPaths, libraryPermissions } from 'src/constants/library-menus';

export function InventoryIntelligence({ overview }: { overview?: LibraryDashboardOverview }) {
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canViewBooks = hasGrantedPermission(permissions, libraryPermissions.allBooks);
  const books: { bookId: string; title: string; author: string; issueCount: number }[] =
    overview?.popularBooks || [];
  const inventory: {
    sectionId: string | null;
    sectionName: string;
    copyCount: number;
    utilizationRate: number;
  }[] = overview?.sectionInventory || [];
  const sections = inventory.filter(
    (section) => section.copyCount > 0 && section.utilizationRate <= 10
  );

  return (
    <FormSectionCard
      title="Inventory Intelligence"
      icon={GlobalIcons.usage}
      descriptionTooltip="Recorded borrowing demand and sections with low circulation in the selected academic year."
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            High Demand Books
          </Typography>
          <Stack spacing={1}>
            {books.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No circulation demand data yet.
              </Typography>
            )}
            {books.map((book) => (
              <Box
                key={book.bookId}
                sx={{ p: 1, border: 1, borderColor: 'divider', borderRadius: 1, minWidth: 0 }}
              >
                {canViewBooks ? (
                  <Link
                    component={RouterLink}
                    href={`${libraryPaths.allBooks}?search=${encodeURIComponent(book.title)}`}
                    variant="body2"
                  >
                    {book.title}
                  </Link>
                ) : (
                  <Typography variant="body2">{book.title}</Typography>
                )}
                <Typography variant="caption" color="text.secondary" display="block">
                  {book.author ? `${book.author} · ` : ''}
                  {book.issueCount} issues
                </Typography>
              </Box>
            ))}
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Low Utilization Sections
          </Typography>
          <Stack spacing={1}>
            {sections.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No low-utilization sections found.
              </Typography>
            )}
            {sections.map((section) => (
              <Box
                key={section.sectionId || section.sectionName}
                sx={{ p: 1, border: 1, borderColor: 'divider', borderRadius: 1 }}
              >
                <Typography variant="body2">{section.sectionName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {section.copyCount} copies · {Math.round(section.utilizationRate)}% utilization
                </Typography>
              </Box>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </FormSectionCard>
  );
}
