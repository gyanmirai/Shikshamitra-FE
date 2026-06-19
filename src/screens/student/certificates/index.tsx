'use client';

import { Box, Grid } from '@mui/material';
import React, { useState, useCallback } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

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
              alignItems: 'stretch',
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
    </Box>
  );
};

export default StudentCertificatesScreen;
