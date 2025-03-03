'use client';

import React, { useState } from 'react';

import { Box, Button, MenuItem, MenuList } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import StudentAutoNotificationConfigurationDialog from './component/studentAutoNotificationDialog';

interface HeaderSectionProps {
  heading: string;
  onButtonClick: () => void;
  buttonText: string;
  buttonIcon: string;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({
  heading,
  onButtonClick,
  buttonText,
  buttonIcon,
}) => (
  <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
    <CustomBreadcrumbs
      heading={heading}
      links={[{ name: 'Student' }, { name: 'Auto Notification Configuration' }]}
      sx={{ px: 1, mb: 2 }}
    />
    <Box
      sx={{ mr: '15px', mb: '20px' }}
      gap={3}
      display="flex"
      flexDirection="row"
      justifyContent="flex-end"
    >
      <Button
        startIcon={<Iconify icon={buttonIcon} />}
        onClick={onButtonClick}
        variant="contained"
        size="small"
      >
        {buttonText}
      </Button>
    </Box>
  </Box>
);

const StudentNotificationScreen = () => {
  const [open, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [sendManual, setSendManual] = useState<any>(false);

  const closeHandler = () => {
    setOpen(false);
    setSendManual(false);
  };

  const openHandler = () => {
    setSelectedData({});
    setOpen(true);
  };
  const notificationsData = [
    {
      id: '1',
      category: 'studentRecord',
      subCategory: 'inquiry',
      typeOfNotification: 'event',
      generateTime: '-',
      nameOfTheNotification: 'inquirySubmitted',
      occurance: '-',
      role: ['Teacher', 'Student'],
      teacherRecipient: ['All'],
      studentRecipient: ['All'],
      isActive: true,
      communicationTypeForTeacher: ['WhatsApp', 'sms'],
      communicationTypeForStudent: ['WhatsApp', 'sms'],
      selectedTemplateName: 'generalInquirySubmittedTemplate',
      selectedTemplateContentForTeacher:
        'Dear {teacher_name}, a new inquiry has been submitted by {student_name}. Please review the details and respond at your earliest convenience. Inquiry ID: {inquiry_id}. Thank you!',
      selectedTemplateContentForStudent:
        'Dear {student_name}, your inquiry has been received and is being reviewed. We will get back to you as soon as possible. Inquiry ID: {inquiry_id}. Thank you!',
    },
    {
      id: '2',
      category: 'studentRecord',
      subCategory: 'attendance',
      typeOfNotification: 'rule',
      generateTime: '5:30 PM',
      nameOfTheNotification: 'below 80% Attendance Alert',
      occurance: '7',
      role: ['Teacher', 'Student'],
      teacherRecipient: ['All'],
      studentRecipient: ['All'],
      isActive: true,
      communicationTypeForTeacher: ['WhatsApp', 'sms'],
      communicationTypeForStudent: ['WhatsApp', 'sms'],
      selectedTemplateName: 'generalTemplateForBelow80%Attendance',
      selectedTemplateContentForTeacher:
        'Dear {teacher_name}, {student_name} has an attendance of {attendance_percentage}%. Kindly take necessary action if required. Thank you!',
      selectedTemplateContentForStudent:
        'Dear {student_name}, your current attendance is {attendance_percentage}%. Please ensure you maintain the required attendance to avoid any issues. Thank you!',
      conditionRule: 'Attendance < 80 %',
    },
    // {
    //     id: "2",
    //     category: "",
    //     subCategory: "",
    //     typeOfNotification: "Time Based",
    //     generateTime: "11:00 AM",
    //     nameOfTheNotification: "Class Schedule Update",
    //     occurance: "7",
    //     role: ["Student"],
    //     teacherRecipient: [],
    //     studentRecipient: [10],
    //     isActive: false,
    //     communicationTypeForTeacher: ["Whatsapp", "SMS"],
    //     communicationTypeForStudent: ["Whatsapp", "SMS"],
    // },
    // {
    //     id: "3",
    //     category: "",
    //     subCategory: "",
    //     typeOfNotification: "Event Based",
    //     generateTime: "Instant",
    //     nameOfTheNotification: "Inquiry Submitted",
    //     occurance: "",
    //     role: ["Student"],
    //     teacherRecipient: ["All"],
    //     studentRecipient: ["All"],
    //     isActive: true,
    //     communicationTypeForTeacher: ["Whatsapp", "SMS"],
    //     communicationTypeForStudent: ["Whatsapp", "SMS"],
    // },
  ];

  return (
    <>
      {open ? (
        <>
          <HeaderSection
            heading="Notification"
            onButtonClick={closeHandler}
            buttonText="Back"
            buttonIcon="eva:arrow-back-fill"
          />
          <StudentAutoNotificationConfigurationDialog
            data={selectedData}
            onClose={closeHandler}
            fromSendManual={sendManual}
          />
        </>
      ) : (
        <>
          <HeaderSection
            heading="Notification"
            onButtonClick={openHandler}
            buttonText="Auto Notification Configuration"
            buttonIcon="ic:outline-plus"
          />
          <CustomizableTable
            tableId="student-auto-notification-configuration"
            data={notificationsData}
            columns={[
              {
                id: 'generateTime',
                label: 'Generate Time',
              },
              {
                id: 'nameOfTheNotification',
                label: 'Notification Name',
              },
              {
                id: 'occurance',
                label: 'Occurance',
                render(value, row) {
                  return row.occurance === '-' ? (
                    '--'
                  ) : (
                    <Box display="flex" flexDirection="row" gap={1}>
                      <Box>{`Repeat After ${row.occurance}`}</Box>
                      <Box>days</Box>
                    </Box>
                  );
                },
              },

              // {
              //     id: "communicationTypeForStudent",
              //     label: "Communication Type For Student",
              //     render(value, row) {
              //         return (
              //             row.communicationTypeForStudent.length > 0 ? (<Box display="flex" flexWrap="wrap" gap={1}>
              //                 {row.communicationTypeForStudent.length === 1
              //                     ? row.communicationTypeForStudent[0]
              //                     : row.communicationTypeForStudent.join(", ")
              //                 }
              //             </Box>) : (<Box p="2px"  >
              //                 ----
              //             </Box>)
              //         );
              //     },
              // },
              // {
              //     id: "communicationTypeForTeacher",
              //     label: "Communication Type For Teacher",
              //     render(value, row) {
              //         return (
              //             row.communicationTypeForTeacher.length > 0 ? (<Box display="flex" flexWrap="wrap" gap={1}>
              //                 {row.communicationTypeForTeacher.length === 1
              //                     ? row.communicationTypeForTeacher[0]
              //                     : row.communicationTypeForTeacher.join(", ")
              //                 }
              //             </Box>) : (<Box p="2px"  >
              //                 ----
              //             </Box>)
              //         );
              //     },
              // },
              {
                id: 'teacherRecipient',
                label: 'Teacher Recipient',
                render(value, row) {
                  return row.teacherRecipient.length > 0 ? (
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {row.teacherRecipient.length === 1
                        ? row.teacherRecipient[0]
                        : row.teacherRecipient.join(', ')}
                    </Box>
                  ) : (
                    <Box p="2px">----</Box>
                  );
                },
              },
              {
                id: 'studentRecipient',
                label: 'Student Recipient',
                render(value, row) {
                  return row.studentRecipient.length > 0 ? (
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {row.studentRecipient.length === 1
                        ? row.studentRecipient[0]
                        : row.studentRecipient.join(', ')}
                    </Box>
                  ) : (
                    <Box p="2px">----</Box>
                  );
                },
              },
              // {
              //     id: "isActive",
              //     label: "Active",
              //     render(value, row) {
              //         return (
              //             <Box display="flex" flexDirection="row" gap={1}>
              //                 <Box>
              //                     <Switch
              //                         checked={row.isActive}
              //                         onChange={(event) => {
              //                             console.log(event.target.checked);
              //                         }}
              //                     />
              //                 </Box>
              //                 <Box>
              //                     {row.isActive ? "Active" : "Inactive"}
              //                 </Box>
              //             </Box>
              //         );
              //     },
              // },
              {
                id: 'action',
                label: 'Action',
                render(value, row) {
                  return (
                    <ThreeDotsActions
                      actions={({ popover }) => (
                        <MenuList>
                          <MenuItem
                            onClick={() => {
                              setSendManual(true);
                              setOpen(true);
                              setSelectedData(row);
                            }}
                          >
                            <Iconify icon="mynaui:send" sx={{ mr: 2 }} />
                            Send Manual
                          </MenuItem>
                        </MenuList>
                      )}
                    />
                  );
                },
              },
            ]}
          />
        </>
      )}
    </>
  );
};

export default StudentNotificationScreen;
