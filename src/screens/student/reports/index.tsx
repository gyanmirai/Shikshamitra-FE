'use client';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import CommonReport from 'src/components/common-report';
import { studentPaths } from 'src/constants/student-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import StudentReportHistory from './components/StudentReportHistory';
import { studentReportCatalog, studentReportCategories } from './student-report-catalog';
import { StudentRecordsAiReportButton } from './components/StudentRecordsAiReportButton';

export default function StudentReportsScreen() {
  const openGenerateReport = useBoolean();
  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <CustomBreadcrumbs
        heading="Reports"
        description="Choose a student report or review your generated Records and Compliance files. Each request retains its own academic scope."
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Student Records', href: studentPaths.records.root },
          { name: 'Reports' },
        ]}
        isBack={openGenerateReport.value}
        onBack={openGenerateReport.onFalse}
        action={
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <StudentRecordsAiReportButton />
            <Button
              variant="contained"
              color="inherit"
              size="small"
              onClick={openGenerateReport.onTrue}
              startIcon={<Iconify icon={GlobalIcons.report} />}
            >
              Generate report
            </Button>
          </Stack>
        }
      />
      {openGenerateReport.value ? (
        <CommonReport
          categories={studentReportCategories}
          subCategories={studentReportCatalog(openGenerateReport.onFalse)}
        />
      ) : (
        <StudentReportHistory />
      )}
    </Box>
  );
}
