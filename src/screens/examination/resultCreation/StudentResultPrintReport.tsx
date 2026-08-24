import React from 'react';
import {
  Box,
  Stack,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
} from '@mui/material';

export const STUDENT_RESULT_PRINT_PAGE_STYLE = `
  @page {
    size: A4 portrait;
    margin: 12mm;
  }

  @media print {
    html, body {
      background: #ffffff !important;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
  }
`;

interface StudentResultSubject {
  subjectName?: string | null;
  maxMarks?: string | number | null;
  marksObtained?: string | number | null;
  grade?: string | null;
  remarks?: string | null;
  isPassed?: boolean | null;
}

interface StudentResultPrintReportProps {
  schoolName?: string;
  examName?: string;
  studentName?: string;
  grNo?: string | number;
  rollNo?: string | number;
  className?: string;
  divisionName?: string;
  dateOfBirth?: string;
  obtainedMarks?: string | number;
  totalMarks?: string | number;
  percentage?: string | number;
  attendancePercentage?: string | number;
  grade?: string;
  status?: string;
  rank?: string | number;
  totalStudentsInClass?: string | number;
  subjects: StudentResultSubject[];
}

const valueOrDash = (value: unknown) =>
  value === null || value === undefined || value === '' ? '—' : String(value);

const getSubjectResult = (subject: StudentResultSubject): string => {
  const marks = String(subject.marksObtained ?? '')
    .trim()
    .toLowerCase();
  if (marks === 'ab' || marks === 'absent') return 'Absent';

  const passed = subject.isPassed ?? subject.grade?.toUpperCase() !== 'F';
  return passed ? 'Pass' : 'Fail';
};

const Detail = ({ label, value }: { label: string; value: unknown }) => (
  <Box>
    <Typography variant="caption" sx={{ color: 'grey.700', fontWeight: 600 }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ color: 'common.black', fontWeight: 700 }}>
      {valueOrDash(value)}
    </Typography>
  </Box>
);

const StudentResultPrintReport = React.forwardRef<HTMLDivElement, StudentResultPrintReportProps>(
  (
    {
      schoolName,
      examName,
      studentName,
      grNo,
      rollNo,
      className,
      divisionName,
      dateOfBirth,
      obtainedMarks,
      totalMarks,
      percentage,
      attendancePercentage,
      grade,
      status,
      rank,
      totalStudentsInClass,
      subjects,
    },
    ref
  ) => (
    <Box
      ref={ref}
      sx={{
        width: '100%',
        boxSizing: 'border-box',
        bgcolor: 'common.white',
        color: 'common.black',
        p: 0.5,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <Box
        sx={{
          textAlign: 'center',
          pb: 2,
          mb: 2,
          borderBottom: '2px solid',
          borderColor: 'grey.800',
        }}
      >
        {schoolName && (
          <Typography variant="h5" sx={{ color: 'common.black', fontWeight: 800 }}>
            {schoolName}
          </Typography>
        )}
        <Typography variant="h6" sx={{ color: 'common.black', fontWeight: 800 }}>
          Student Result
        </Typography>
        <Typography variant="body2" sx={{ color: 'grey.700', fontWeight: 600 }}>
          {valueOrDash(examName)}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1.5,
          p: 1.5,
          mb: 2,
          border: '1px solid',
          borderColor: 'grey.400',
          borderRadius: 1,
          breakInside: 'avoid',
          pageBreakInside: 'avoid',
        }}
      >
        <Box sx={{ gridColumn: 'span 2' }}>
          <Detail label="Student Name" value={studentName} />
        </Box>
        <Detail label="GR No." value={grNo} />
        <Detail label="Roll No." value={rollNo} />
        <Box sx={{ gridColumn: 'span 2' }}>
          <Detail
            label="Class & Division"
            value={[className, divisionName].filter(Boolean).join(' - ')}
          />
        </Box>
        <Detail label="Date of Birth" value={dateOfBirth} />
        <Detail label="Attendance" value={attendancePercentage} />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 1,
          p: 1.5,
          mb: 2.5,
          bgcolor: 'grey.100',
          border: '1px solid',
          borderColor: 'grey.400',
          borderRadius: 1,
          breakInside: 'avoid',
          pageBreakInside: 'avoid',
        }}
      >
        <Detail label="Obtained" value={obtainedMarks} />
        <Detail label="Maximum" value={totalMarks} />
        <Detail label="Percentage" value={percentage} />
        <Detail label="Grade" value={grade} />
        <Detail label="Result" value={status} />
        <Detail
          label="Class Rank"
          value={rank ? `${rank} of ${valueOrDash(totalStudentsInClass)}` : '—'}
        />
      </Box>

      <Typography variant="subtitle1" sx={{ color: 'common.black', fontWeight: 800, mb: 1 }}>
        Subject-wise Marks
      </Typography>

      <Table
        size="small"
        aria-label="Subject-wise student result"
        sx={{
          borderCollapse: 'collapse',
          '& th, & td': {
            color: 'common.black',
            border: '1px solid',
            borderColor: 'grey.400',
            px: 1,
            py: 0.75,
            fontSize: '0.75rem',
          },
          '& thead': { display: 'table-header-group' },
          '& tr': { breakInside: 'avoid', pageBreakInside: 'avoid' },
        }}
      >
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.200' }}>
            <TableCell sx={{ fontWeight: 800 }}>Subject</TableCell>
            <TableCell align="right" sx={{ fontWeight: 800 }}>
              Max Marks
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 800 }}>
              Obtained
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 800 }}>
              Grade
            </TableCell>
            <TableCell sx={{ fontWeight: 800 }}>Remarks</TableCell>
            <TableCell align="center" sx={{ fontWeight: 800 }}>
              Result
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {subjects.map((subject, index) => (
            <TableRow key={`${subject.subjectName ?? 'subject'}-${index}`}>
              <TableCell>{valueOrDash(subject.subjectName)}</TableCell>
              <TableCell align="right">{valueOrDash(subject.maxMarks)}</TableCell>
              <TableCell align="right">{valueOrDash(subject.marksObtained)}</TableCell>
              <TableCell align="center">{valueOrDash(subject.grade)}</TableCell>
              <TableCell>{valueOrDash(subject.remarks)}</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                {getSubjectResult(subject)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Stack direction="row" justifyContent="space-between" sx={{ mt: 5, pt: 1 }}>
        <Typography variant="caption" sx={{ color: 'grey.700' }}>
          Class Teacher
        </Typography>
        <Typography variant="caption" sx={{ color: 'grey.700' }}>
          Principal / Authorized Signatory
        </Typography>
      </Stack>
    </Box>
  )
);

StudentResultPrintReport.displayName = 'StudentResultPrintReport';

export default StudentResultPrintReport;
