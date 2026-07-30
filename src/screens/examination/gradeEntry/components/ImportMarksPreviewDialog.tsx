import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import CancelButton from 'src/components/cancel-button';
import SubmitButton from 'src/components/submit-button';
import { GlobalIcons } from 'src/utils/icons';
import React, { useRef, useMemo, useState } from 'react';
import {
  Box,
  Tab,
  Chip,
  Tabs,
  Table,
  Paper,
  Stack,
  Alert,
  Button,
  Dialog,
  TableRow,
  TextField,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
} from '@mui/material';

interface ImportMarksPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  studentList: Array<{ studentId: string; studentName: string; rollNo: string; totalMarks: number }>;
  onImport: (data: Array<{ studentId: string; attendanceStatus: number; obtainedMarks: number | null; feedback: string }>) => void;
  isLoading?: boolean;
}

interface ParsedRow {
  rollNo: string;
  name: string;
  attendance: string;
  obtainedMarks: number | null;
  feedback: string;
  matchedStudentId?: string;
  matchedStudentName?: string;
  error?: string;
  status: 'matched' | 'unmatched' | 'invalid';
}

export const ImportMarksPreviewDialog: React.FC<ImportMarksPreviewDialogProps> = ({
  open,
  onClose,
  studentList,
  onImport,
  isLoading = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tabValue, setTabValue] = useState(0);
  const [pastedText, setPastedText] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [errorText, setErrorText] = useState<string | null>(null);

  const studentLookup = useMemo(() => {
    const rollDict: Record<string, typeof studentList[0]> = {};
    const nameDict: Record<string, typeof studentList[0]> = {};
    studentList.forEach((s) => {
      if (s.rollNo) rollDict[s.rollNo.toString().trim().toLowerCase()] = s;
      if (s.studentName) nameDict[s.studentName.trim().toLowerCase()] = s;
    });
    return { rollDict, nameDict };
  }, [studentList]);

  const handleParseText = () => {
    if (!pastedText.trim()) {
      setErrorText('Please paste some data first.');
      return;
    }

    try {
      const rows = pastedText.split(/\r?\n/);
      const tempParsed: ParsedRow[] = [];

      rows.forEach((rowStr) => {
        if (!rowStr.trim()) return;

        // Support both Tab-separated (Excel paste) and Comma-separated (CSV)
        const cols = rowStr.includes('\t') ? rowStr.split('\t') : rowStr.split(',');

        if (cols.length < 2) return; // Need at least roll/name and marks

        // Expected format: Roll Number (or Name), Obtained Marks, [Attendance], [Remarks]
        const col0 = cols[0]?.trim() || ''; // Roll or Name
        const col1 = cols[1]?.trim() || ''; // Marks
        const col2 = cols[2]?.trim() || 'Present'; // Attendance
        const col3 = cols[3]?.trim() || ''; // Remarks

        let rollNo = '';
        let name = '';
        let matchedId = '';
        let matchedName = '';
        let status: ParsedRow['status'] = 'unmatched';
        let error = '';

        // Match student by Roll or Name
        const lookRoll = studentLookup.rollDict[col0.toLowerCase()];
        const lookName = studentLookup.nameDict[col0.toLowerCase()];

        if (lookRoll) {
          ({ rollNo, studentId: matchedId } = lookRoll);
          name = lookRoll.studentName;
          matchedName = lookRoll.studentName;
          status = 'matched';
        } else if (lookName) {
          ({ rollNo, studentId: matchedId } = lookName);
          name = lookName.studentName;
          matchedName = lookName.studentName;
          status = 'matched';
        } else {
          // Attempt fuzzy match by name substring or numeric roll
          rollNo = col0;
          status = 'unmatched';
          error = 'No student matched by Roll No or Name';
        }

        // Validate Obtained Marks
        let marksNum: number | null = null;
        const isPresent = col2.toLowerCase() === 'present' || col2 === '0';

        if (isPresent) {
          if (col1 === '' || Number.isNaN(Number(col1))) {
            status = 'invalid';
            error = error ? `${error}, Invalid marks value` : 'Invalid marks value';
          } else {
            marksNum = Number(col1);
            if (lookRoll && marksNum > lookRoll.totalMarks) {
              status = 'invalid';
              error = error ? `${error}, Marks exceed total` : 'Marks exceed total';
            }
          }
        }

        tempParsed.push({
          rollNo,
          name: name || col0,
          attendance: col2,
          obtainedMarks: marksNum,
          feedback: col3,
          matchedStudentId: matchedId,
          matchedStudentName: matchedName,
          error: error || undefined,
          status,
        });
      });

      setParsedData(tempParsed);
      setErrorText(null);
    } catch (e) {
      setErrorText('Failed to parse text. Please ensure valid columns format.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setPastedText(text);
    };
    reader.readAsText(file);
  };

  const handleImportClick = () => {
    const validRows = parsedData.filter((r) => r.status === 'matched' && r.matchedStudentId);
    if (validRows.length === 0) {
      setErrorText('No valid matched rows found to import.');
      return;
    }

    const payload = validRows.map((r) => {
      const attStatus = r.attendance.toLowerCase() === 'absent' ? 1
        : r.attendance.toLowerCase() === 'medicalleave' ? 2
          : r.attendance.toLowerCase() === 'exempted' ? 3
            : 0; // Default present
      return {
        studentId: r.matchedStudentId!,
        attendanceStatus: attStatus,
        obtainedMarks: r.obtainedMarks,
        feedback: r.feedback,
      };
    });

    onImport(payload);
    setPastedText('');
    setParsedData([]);
    setCsvFile(null);
  };

  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      title={
        <Box display="flex" flexDirection="row" gap={1} alignItems="center" component="span" sx={{ fontWeight: 'normal' }}>
          <Iconify icon="solar:file-send-bold" width={24} sx={{ color: 'primary.main' }} />
          <Box component="span" sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
            Import Marks from Spreadsheet
          </Box>
          <CustomTooltip
            arrow
            placement="right"
            title="Import marks by copying and pasting spreadsheet rows or uploading a CSV file."
          >
            <Iconify icon={GlobalIcons.info} sx={{ cursor: 'pointer' }} color="info.main" width={16} height={16} />
          </CustomTooltip>
        </Box>
      }
      maxWidth="md"
      hasForm={false}
    >
      <DialogScrollContent>
        <Tabs value={tabValue} onChange={(_e, val) => setTabValue(val)} sx={{ mb: 2 }}>
          <Tab label="Copy & Paste Cells" />
          <Tab label="Upload CSV File" />
        </Tabs>

        {tabValue === 0 ? (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Copy columns directly from your Excel spreadsheet (e.g. <b>Roll No</b>, <b>Obtained Marks</b>, <b>Attendance</b>, <b>Remarks</b>) and paste them below:
            </Typography>
            <TextField
              multiline
              rows={6}
              fullWidth
              variant="outlined"
              placeholder="e.g.
1   45   Present   Excellent work
2   0    Absent
3   38   Present   Good progress"
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              sx={{ fontFamily: 'monospace' }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              p: 3,
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              textAlign: 'center',
              mb: 2,
              bgcolor: (theme) => `rgba(${theme.palette.grey['500Channel']} / 0.03)`,
            }}
          >
            <input
              type="file"
              accept=".csv,.txt"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <Button
              variant="contained"
              onClick={() => fileInputRef.current?.click()}
              startIcon={<Iconify icon="solar:upload-bold" />}
            >
              Choose CSV File
            </Button>
            {csvFile && (
              <Typography variant="subtitle2" sx={{ mt: 1.5 }}>
                Selected: {csvFile.name}
              </Typography>
            )}
          </Box>
        )}

        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button variant="outlined" color="primary" onClick={handleParseText} size="small">
            Parse & Validate Records
          </Button>
          {parsedData.length > 0 && (
            <Button variant="text" color="inherit" onClick={() => setParsedData([])} size="small">
              Clear Preview
            </Button>
          )}
        </Stack>

        {errorText && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorText}
          </Alert>
        )}

        {parsedData.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="overline" display="block" sx={{ mb: 1, color: 'text.secondary' }}>
              Import Validation Preview
            </Typography>
            <TableContainer component={Paper} sx={{ maxHeight: 280, border: (theme) => `1px solid ${theme.palette.divider}` }}>
              <Scrollbar>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Excel Key</TableCell>
                      <TableCell>Matched Student</TableCell>
                      <TableCell>Marks</TableCell>
                      <TableCell>Attendance</TableCell>
                      <TableCell>Validation</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {parsedData.map((row, idx) => (
                      <TableRow key={idx} hover sx={{ bgcolor: row.status === 'invalid' ? 'rgba(255, 0, 0, 0.04)' : row.status === 'unmatched' ? 'rgba(255, 165, 0, 0.04)' : 'inherit' }}>
                        <TableCell>
                          <Typography variant="body2">{row.rollNo}</Typography>
                        </TableCell>
                        <TableCell>
                          {row.matchedStudentName ? (
                            <Box>
                              <Typography variant="body2">{row.matchedStudentName}</Typography>
                              <Typography variant="caption" color="text.secondary">Roll: {row.rollNo}</Typography>
                            </Box>
                          ) : (
                            <Typography color="text.disabled">—</Typography>
                          )}
                        </TableCell>
                        <TableCell>{row.obtainedMarks ?? '—'}</TableCell>
                        <TableCell>{row.attendance}</TableCell>
                        <TableCell>
                          {row.status === 'matched' ? (
                            <Chip label="Ready" size="small" color="success" variant="soft" />
                          ) : (
                            <Chip label={row.error || 'Error'} size="small" color="error" variant="soft" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>
          </Box>
        )}
      </DialogScrollContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <CancelButton onClick={onClose} />
        <SubmitButton
          buttonText={`Apply Valid Rows (${parsedData.filter((r) => r.status === 'matched').length})`}
          onClick={handleImportClick}
          loading={isLoading}
          disabled={parsedData.filter((r) => r.status === 'matched').length === 0}
        />
      </DialogActions>
    </CustomDialog>
  );
};
