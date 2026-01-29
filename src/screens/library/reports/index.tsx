'use client';

import React from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CommonReport from 'src/components/common-report';
import { Box, Chip, Button, IconButton } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// Book & Inventory Reports
import BookMasterReport from './components/BookMasterReport';
import UnpaidFineReport from './components/UnpaidFineReport';
import LibraryAuditReport from './components/LibraryAuditReport';
import OverdueBooksReport from './components/OverdueBooksReport';
import LibraryUsageReport from './components/LibraryUsageReport';
import NewBooksAddedReport from './components/NewBooksAddedReport';
// Circulation & Usage Reports
import DailyBookIssueReport from './components/DailyBookIssueReport';
// Financial Reports
import FineCollectionReport from './components/FineCollectionReport';
import DailyBookReturnReport from './components/DailyBookReturnReport';
import BookCirculationReport from './components/BookCirculationReport';
// Popular Books Reports
import MostIssuedBooksReport from './components/MostIssuedBooksReport';
// Reservation Reports
import BookReservationReport from './components/BookReservationReport';
import OldBooksWriteOffReport from './components/OldBooksWriteOffReport';
import LostDamagedBooksReport from './components/LostDamagedBooksReport';
import LeastIssuedBooksReport from './components/LeastIssuedBooksReport';
import MembershipExpiryReport from './components/MembershipExpiryReport';
import BookCategoryGenreReport from './components/BookCategoryGenreReport';
// Administrative Reports
import SystemActivityLogReport from './components/SystemActivityLogReport';
import VendorWisePurchaseReport from './components/VendorWisePurchaseReport';
import StaffWiseBookIssueReport from './components/StaffWiseBookIssueReport';
import LibraryStockSummaryReport from './components/LibraryStockSummaryReport';
import BookPurchaseRegisterReport from './components/BookPurchaseRegisterReport';
import StudentWiseBookIssueReport from './components/StudentWiseBookIssueReport';
import DamageLossFineSummaryReport from './components/DamageLossFineSummaryReport';
import BookAvailabilityStatusReport from './components/BookAvailabilityStatusReport';
import LibraryMemberListStaffReport from './components/LibraryMemberListStaffReport';
import PendingReservationListReport from './components/PendingReservationListReport';
import ClassWiseBookIssueSummaryReport from './components/ClassWiseBookIssueSummaryReport';
// Member Management Reports
import LibraryMemberListStudentsReport from './components/LibraryMemberListStudentsReport';
import BlacklistedBlockedMembersReport from './components/BlacklistedBlockedMembersReport';

const LibraryReportsScreen = () => {
  const openGenerateReport = useBoolean();

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Reports"
        description="Generate and filter library reports by book, member, circulation, and other criteria."
        links={[{ name: 'Library', href: '/library/dashboard/' }, { name: 'Reports' }]}
        isBack={openGenerateReport.value}
        onBack={openGenerateReport.onFalse}
        action={
          <Button
            variant="contained"
            size="small"
            onClick={openGenerateReport.onTrue}
            startIcon={<Iconify icon={GlobalIcons.report} />}
          >
            Generate Report
          </Button>
        }
      />
      {openGenerateReport.value ? (
        <CommonReport
          categories={[
            {
              name: 'Book & Inventory',
              id: 'Book-Inventory',
              icon: 'mdi:book-multiple',
            },
            {
              name: 'Circulation & Usage',
              id: 'Circulation-Usage',
              icon: 'mdi:book-sync',
            },
            {
              name: 'Popular Books',
              id: 'Popular-Books',
              icon: 'mdi:star',
            },
            {
              name: 'Member Management',
              id: 'Member-Management',
              icon: 'mdi:account-group',
            },
            {
              name: 'Reservations',
              id: 'Reservations',
              icon: 'mdi:book-clock',
            },
            {
              name: 'Financial',
              id: 'Financial',
              icon: 'mdi:currency-inr',
            },
            {
              name: 'Administrative',
              id: 'Administrative',
              icon: 'mdi:cog',
            },
          ]}
          subCategories={[
            // Book & Inventory Reports
            {
              name: 'Book Master Report',
              id: 'Book-Master-Report',
              icon: '',
              render: () => <BookMasterReport />,
              description:
                'View complete book details including category, author, publisher, and availability',
              categoryId: 'Book-Inventory',
            },
            {
              name: 'Book Category / Genre Report',
              id: 'Book-Category-Genre-Report',
              icon: '',
              render: () => <BookCategoryGenreReport />,
              description: 'View books grouped by category with popularity metrics',
              categoryId: 'Book-Inventory',
            },
            {
              name: 'Book Availability Status Report',
              id: 'Book-Availability-Status-Report',
              icon: '',
              render: () => <BookAvailabilityStatusReport />,
              description: 'View current availability status of books with copy details',
              categoryId: 'Book-Inventory',
            },
            {
              name: 'Library Stock Summary',
              id: 'Library-Stock-Summary-Report',
              icon: '',
              render: () => <LibraryStockSummaryReport />,
              description:
                'View comprehensive stock summary with issued, available, lost, and damaged counts',
              categoryId: 'Book-Inventory',
            },
            {
              name: 'New Books Added Report',
              id: 'New-Books-Added-Report',
              icon: '',
              render: () => <NewBooksAddedReport />,
              description: 'View newly added books with acquisition details',
              categoryId: 'Book-Inventory',
            },
            {
              name: 'Book Purchase Register',
              id: 'Book-Purchase-Register-Report',
              icon: '',
              render: () => <BookPurchaseRegisterReport />,
              description: 'View book purchase records with vendor and pricing information',
              categoryId: 'Book-Inventory',
            },
            {
              name: 'Vendor-wise Purchase Report',
              id: 'Vendor-Wise-Purchase-Report',
              icon: '',
              render: () => <VendorWisePurchaseReport />,
              description: 'View purchase summary grouped by vendor',
              categoryId: 'Book-Inventory',
            },
            {
              name: 'Old Books Write-off Report',
              id: 'Old-Books-Write-Off-Report',
              icon: '',
              render: () => <OldBooksWriteOffReport />,
              description: 'View books written off with reasons and approval details',
              categoryId: 'Book-Inventory',
            },
            {
              name: 'Library Audit Report',
              id: 'Library-Audit-Report',
              icon: '',
              render: () => <LibraryAuditReport />,
              description: 'View audit results with physical vs system count discrepancies',
              categoryId: 'Book-Inventory',
            },

            // Circulation & Usage Reports
            {
              name: 'Daily Book Issue Report',
              id: 'Daily-Book-Issue-Report',
              icon: '',
              render: () => <DailyBookIssueReport />,
              description: 'View books issued on a specific date with member details',
              categoryId: 'Circulation-Usage',
            },
            {
              name: 'Daily Book Return Report',
              id: 'Daily-Book-Return-Report',
              icon: '',
              render: () => <DailyBookReturnReport />,
              description: 'View books returned on a specific date with fine details',
              categoryId: 'Circulation-Usage',
            },
            {
              name: 'Student-wise Book Issue Report',
              id: 'Student-Wise-Book-Issue-Report',
              icon: '',
              render: () => <StudentWiseBookIssueReport />,
              description: 'View book issue history for specific students',
              categoryId: 'Circulation-Usage',
            },
            {
              name: 'Class-wise Book Issue Summary',
              id: 'Class-Wise-Book-Issue-Summary-Report',
              icon: '',
              render: () => <ClassWiseBookIssueSummaryReport />,
              description: 'View book issue statistics grouped by class',
              categoryId: 'Circulation-Usage',
            },
            {
              name: 'Staff-wise Book Issue Report',
              id: 'Staff-Wise-Book-Issue-Report',
              icon: '',
              render: () => <StaffWiseBookIssueReport />,
              description: 'View book issue history for staff members',
              categoryId: 'Circulation-Usage',
            },
            {
              name: 'Overdue Books Report',
              id: 'Overdue-Books-Report',
              icon: '',
              render: () => <OverdueBooksReport />,
              description: 'View overdue books with member contact details and fine amounts',
              categoryId: 'Circulation-Usage',
            },
            {
              name: 'Lost/Damaged Books Report',
              id: 'Lost-Damaged-Books-Report',
              icon: '',
              render: () => <LostDamagedBooksReport />,
              description: 'View lost or damaged books with responsible member and fine details',
              categoryId: 'Circulation-Usage',
            },
            {
              name: 'Book Circulation Report',
              id: 'Book-Circulation-Report',
              icon: '',
              render: () => <BookCirculationReport />,
              description: 'View circulation statistics with issue, return, and overdue counts',
              categoryId: 'Circulation-Usage',
            },

            // Popular Books Reports
            {
              name: 'Most Issued Books Report',
              id: 'Most-Issued-Books-Report',
              icon: '',
              render: () => <MostIssuedBooksReport />,
              description: 'View most popular books based on issue count',
              categoryId: 'Popular-Books',
            },
            {
              name: 'Least Issued Books Report',
              id: 'Least-Issued-Books-Report',
              icon: '',
              render: () => <LeastIssuedBooksReport />,
              description: 'View least popular books with last issue date',
              categoryId: 'Popular-Books',
            },

            // Member Management Reports
            {
              name: 'Library Member List (Students)',
              id: 'Library-Member-List-Students-Report',
              icon: '',
              render: () => <LibraryMemberListStudentsReport />,
              description: 'View student library members with membership details',
              categoryId: 'Member-Management',
            },
            {
              name: 'Library Member List (Staff)',
              id: 'Library-Member-List-Staff-Report',
              icon: '',
              render: () => <LibraryMemberListStaffReport />,
              description: 'View staff library members with membership details',
              categoryId: 'Member-Management',
            },
            {
              name: 'Membership Expiry Report',
              id: 'Membership-Expiry-Report',
              icon: '',
              render: () => <MembershipExpiryReport />,
              description: 'View members with expiring memberships',
              categoryId: 'Member-Management',
            },
            {
              name: 'Blacklisted / Blocked Members Report',
              id: 'Blacklisted-Blocked-Members-Report',
              icon: '',
              render: () => <BlacklistedBlockedMembersReport />,
              description: 'View blocked members with block reason and date',
              categoryId: 'Member-Management',
            },
            {
              name: 'Library Usage Report',
              id: 'Library-Usage-Report',
              icon: '',
              render: () => <LibraryUsageReport />,
              description: 'View library usage statistics by period (daily/monthly/yearly)',
              categoryId: 'Member-Management',
            },

            // Reservation Reports
            {
              name: 'Book Reservation Report',
              id: 'Book-Reservation-Report',
              icon: '',
              render: () => <BookReservationReport />,
              description: 'View book reservations with status and member details',
              categoryId: 'Reservations',
            },
            {
              name: 'Pending Reservation List',
              id: 'Pending-Reservation-List-Report',
              icon: '',
              render: () => <PendingReservationListReport />,
              description: 'View pending reservations with expected availability',
              categoryId: 'Reservations',
            },

            // Financial Reports
            {
              name: 'Fine Collection Report',
              id: 'Fine-Collection-Report',
              icon: '',
              render: () => <FineCollectionReport />,
              description: 'View fine collection details with reason and amount',
              categoryId: 'Financial',
            },
            {
              name: 'Unpaid Fine Report',
              id: 'Unpaid-Fine-Report',
              icon: '',
              render: () => <UnpaidFineReport />,
              description: 'View outstanding fines with member contact details',
              categoryId: 'Financial',
            },
            {
              name: 'Damage/Loss Fine Summary',
              id: 'Damage-Loss-Fine-Summary-Report',
              icon: '',
              render: () => <DamageLossFineSummaryReport />,
              description: 'View fines for damaged or lost books',
              categoryId: 'Financial',
            },

            // Administrative Reports
            {
              name: 'System Activity Log Report',
              id: 'System-Activity-Log-Report',
              icon: '',
              render: () => <SystemActivityLogReport />,
              description: 'View system activity logs with user actions and timestamps',
              categoryId: 'Administrative',
            },
          ]}
        />
      ) : (
        <CustomizableTable
          tableId="library-reports"
          columns={[
            {
              label: 'Name',
              id: 'reportName',
              minWidth: '15vw',
              align: 'left',
              sticky: true,
            },
            { label: 'Category', id: 'reportCategory', minWidth: '10vw', align: 'left' },
            {
              label: 'Description',
              id: 'reportDescription',
              minWidth: '12vw',
              align: 'left',
            },
            {
              label: 'Generate Report Date',
              id: 'generateReportDate',
              minWidth: '13vw',
              align: 'left',
            },
            {
              label: 'Applied Filters',
              id: 'appliedFilters',
              render(value, row) {
                return (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {row.appliedFilters.map((filter: any) => (
                      <Chip
                        size="small"
                        variant="soft"
                        key={filter.name}
                        label={`${filter.name}: ${filter.value}`}
                      />
                    ))}
                  </Box>
                );
              },
            },
            {
              label: 'Action',
              id: 'reportAction',
              minWidth: '5vw',
              align: 'left',
              isFilter: false,
              isSort: false,
              sticky: true,
              render(value, row) {
                return (
                  <IconButton size="small" onClick={() => {}}>
                    <Iconify icon={GlobalIcons.report} />
                  </IconButton>
                );
              },
            },
          ]}
          data={[
            {
              reportName: 'Book Master Report',
              reportCategory: 'Book & Inventory',
              reportSubCategory: 'Master',
              reportDescription:
                'View complete book details including category, author, publisher, and availability',
              generateReportDate: '2025-12-06',
              appliedFilters: [
                { name: 'Category', value: 'Fiction | Science' },
                { name: 'Status', value: 'Available' },
              ],
              reportAction: 'View',
            },
            {
              reportName: 'Daily Book Issue Report',
              reportCategory: 'Circulation & Usage',
              reportSubCategory: 'Issue',
              reportDescription: 'View books issued on a specific date with member details',
              generateReportDate: '2025-12-06',
              appliedFilters: [
                { name: 'Class', value: 'Class 10 | Class 11' },
                { name: 'Date', value: '2025-12-06' },
              ],
              reportAction: 'View',
            },
            {
              reportName: 'Most Issued Books Report',
              reportCategory: 'Popular Books',
              reportSubCategory: 'Popularity',
              reportDescription: 'View most popular books based on issue count',
              generateReportDate: '2025-12-05',
              appliedFilters: [
                { name: 'Category', value: 'All' },
                { name: 'Top N', value: '10' },
              ],
              reportAction: 'View',
            },
            {
              reportName: 'Fine Collection Report',
              reportCategory: 'Financial',
              reportSubCategory: 'Fines',
              reportDescription: 'View fine collection details with reason and amount',
              generateReportDate: '2025-12-04',
              appliedFilters: [
                { name: 'Fine Reason', value: 'Overdue | Lost Book' },
                { name: 'Date Range', value: '2025-11-01 to 2025-12-01' },
              ],
              reportAction: 'View',
            },
            {
              reportName: 'Library Member List (Students)',
              reportCategory: 'Member Management',
              reportSubCategory: 'Members',
              reportDescription: 'View student library members with membership details',
              generateReportDate: '2025-12-03',
              appliedFilters: [
                { name: 'Class', value: 'All Classes' },
                { name: 'Status', value: 'Active' },
              ],
              reportAction: 'View',
            },
          ]}
        />
      )}
    </Box>
  );
};

export default LibraryReportsScreen;
