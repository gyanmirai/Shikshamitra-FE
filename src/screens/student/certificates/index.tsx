'use client';

import { Box, Grid } from '@mui/material';
import { pdf } from '@react-pdf/renderer';
import React, { useState, useCallback } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import BonofiedCertificateTemplate1, {
  CertificateDocument,
} from 'src/templates/student-certificates/bonofied-certificate-1';

import DashboardMetrics from './components/DashboardMetrics';
import CertificateDrawer from './components/CertificateDrawer';
import StudentSearchPanel from './components/StudentSearchPanel';
import StudentSummaryPanel from './components/StudentSummaryPanel';
import CertificateActionsPanel from './components/CertificateActionsPanel';

import type { CertType } from './components/CertificateActionsPanel';
import type { SelectedStudent } from './components/StudentSearchPanel';

// ── Main Screen ────────────────────────────────────────────────────────────────

const StudentCertificatesScreen = () => {
  const [selectedStudent, setSelectedStudent] = useState<SelectedStudent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeCertType, setActiveCertType] = useState<CertType | null>(null);

  // View Dialog State
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingCert, setViewingCert] = useState<any>(null);

  const handleSelectStudent = useCallback((student: SelectedStudent) => {
    setSelectedStudent(student);
  }, []);

  const handleGenerate = useCallback((certType: CertType) => {
    setActiveCertType(certType);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const handleDownload = async (row: any) => {
    try {
      shikshaMitraToast.info({ message: `Generating PDF for ${row.certNo}...` });
      const blob = await pdf(<CertificateDocument />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${row.certNo}_${row.type}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      shikshaMitraToast.success({ message: 'Downloaded successfully!' });
    } catch (error) {
      shikshaMitraToast.error({ message: 'Failed to generate PDF' });
      console.error(error);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Breadcrumbs */}
      <CustomBreadcrumbs
        heading="Certificates"
        links={[
          { name: 'Student', href: '/student/dashboard/' },
          { name: 'Student Records', href: '/student/dashboard/' },
          { name: 'Certificates' },
        ]}
        description="Search a student and generate certificates in seconds — student details are pre-filled automatically."
      />

      <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minHeight: '100%' }}>
          {/* Dashboard Metrics */}
          <DashboardMetrics />

          {/* 3-Panel Layout */}
          <Grid
            container
            spacing={1}
            sx={{
              flex: 1,
              alignItems: { xs: 'flex-start', lg: 'stretch' },
              alignContent: { xs: 'flex-start', lg: 'stretch' },
            }}
          >
            {/* ── Left Panel: Student Search ──────────────────────────────── */}
            <Grid
              size={{ xs: 12, md: 3, lg: 2.5 }}
              sx={{ display: 'flex', flexDirection: 'column' }}
            >
              <StudentSearchPanel
                selectedStudent={selectedStudent}
                onSelectStudent={handleSelectStudent}
              />
            </Grid>

            {/* ── Center Panel: Student Summary ───────────────────────────── */}
            <Grid
              size={{ xs: 12, md: 6, lg: 6.5 }}
              sx={{ display: 'flex', flexDirection: 'column' }}
            >
              <StudentSummaryPanel
                selectedStudent={selectedStudent}
                onDuplicate={(row) => {
                  // Map history row type to certType and open drawer for duplicate
                  const typeMap: Record<string, CertType> = {
                    Bonafide: 'bonafide',
                    Character: 'character',
                    Leaving: 'leaving',
                    'First Trial': 'firstTrial',
                  };
                  const certType = typeMap[row.type];
                  if (certType) handleGenerate(certType);
                }}
                onView={(row) => {
                  setViewingCert(row);
                  setViewDialogOpen(true);
                }}
                onDownload={handleDownload}
                onPrint={(row) =>
                  shikshaMitraToast.info({
                    message: `Printing ${row.type} certificate: ${row.certNo}`,
                  })
                }
              />
            </Grid>

            {/* ── Right Panel: Certificate Actions ────────────────────────── */}
            <Grid size={{ xs: 12, md: 3, lg: 3 }} sx={{ display: 'flex', flexDirection: 'column' }}>
              <CertificateActionsPanel
                selectedStudent={selectedStudent}
                onGenerate={handleGenerate}
              />
            </Grid>
          </Grid>
        </Box>
      </Scrollbar>

      {/* Certificate Drawer */}
      <CertificateDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        certType={activeCertType}
        student={selectedStudent}
      />

      {/* View PDF Dialog */}
      <CustomDialog
        open={viewDialogOpen}
        handleClose={() => setViewDialogOpen(false)}
        title={
          viewingCert
            ? `View ${viewingCert.type} Certificate (${viewingCert.certNo})`
            : 'View Certificate'
        }
        maxWidth="lg"
      >
        <Box sx={{ width: '100%', height: 600 }}>
          <BonofiedCertificateTemplate1 />
        </Box>
      </CustomDialog>
    </Box>
  );
};

export default StudentCertificatesScreen;
