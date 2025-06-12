'use client';

import React, { useState } from 'react';

import { Box, Card, Switch } from '@mui/material';

import EditNotificationDialog from 'src/screens/student/studentNotification/edit-notification-dialog';

import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const HrEmployeeNotificationManagementScreen = () => {
  // const notificationData = [
  //     {
  //         id: 1,
  //         event: "Add New Leave Policy",
  //         triggerCondition: "When a new leave policy is added.",
  //         recipient: [
  //             {
  //                 name: "Admin",
  //                 message: "A new leave policy [Policy Name] has been added.",
  //                 communicationChannel: ["Email", "Dashboard Notification"],
  //                 placeHolder: ["[Policy Name]"],
  //                 placeHolderOptions: [
  //                     { value: "[Policy Name]", label: "Policy Name" }
  //                 ],
  //                 isEnable: true,
  //             },
  //             {
  //                 name: "HR",
  //                 message: "A new leave policy [Policy Name] has been added.",
  //                 communicationChannel: ["Email", "Dashboard Notification"],
  //                 placeHolder: ["[Policy Name]"],
  //                 placeHolderOptions: [{ value: "[Policy Name]", label: "Policy Name" }],
  //                 isEnable: true,
  //             },
  //             {
  //                 name: "Employee",
  //                 message:
  //                     "A new leave policy [Policy Name] is now in effect. Check the policy document for details.",
  //                 communicationChannel: ["Email", "Dashboard Notification"],
  //                 placeHolder: ["[Policy Name]"],
  //                 placeHolderOptions: [{ value: "[Policy Name]", label: "Policy Name" }],
  //                 isEnable: true,
  //             },
  //         ],
  //     },
  //     {
  //         id: 2,
  //         event: "Edit Leave Policy",
  //         triggerCondition: "When an existing leave policy is modified.",
  //         recipient: [
  //             {
  //                 name: "Admin",
  //                 message: "Leave policy [Policy Name] has been updated.",
  //                 communicationChannel: ["Email", "Dashboard Notification"],
  //                 placeHolder: ["[Policy Name]"],

  //                 placeHolderOptions: [{ value: "[Policy Name]", label: "Policy Name" }],
  //                 isEnable: true,
  //             },
  //             {
  //                 name: "HR",
  //                 message: "Leave policy [Policy Name] has been updated.",
  //                 communicationChannel: ["Email", "Dashboard Notification"],
  //                 placeHolder: ["[Policy Name]"],
  //                 placeHolderOptions: [{ value: "[Policy Name]", label: "Policy Name" }],
  //                 isEnable: true,
  //             },
  //             {
  //                 name: "Employee",
  //                 message:
  //                     "Leave policy [Policy Name] has been modified. Review the updated guidelines.",
  //                 communicationChannel: ["Email", "Dashboard Notification"],
  //                 placeHolder: ["[Policy Name]"],
  //                 placeHolderOptions: [{ value: "[Policy Name]", label: "Policy Name" }],
  //                 isEnable: true,
  //             },
  //         ],
  //     },
  //     {
  //         id: 3,
  //         event: "Delete Leave Policy",
  //         triggerCondition: "When a leave policy is deleted.",
  //         recipient: [
  //             {
  //                 name: "Admin",
  //                 message: "Leave policy [Policy Name] has been removed from the system.",
  //                 communicationChannel: ["Email", "Dashboard Notification"],
  //                 placeHolder: ["[Policy Name]"],
  //                 placeHolderOptions: [{ value: "[Policy Name]", label: "Policy Name" }],
  //                 isEnable: true,
  //             },
  //             {
  //                 name: "HR",
  //                 message: "Leave policy [Policy Name] has been removed from the system.",
  //                 communicationChannel: ["Email", "Dashboard Notification"],
  //                 placeHolder: ["[Policy Name]"],
  //                 placeHolderOptions: [{ value: "[Policy Name]", label: "Policy Name" }],
  //                 isEnable: true,
  //             },
  //             {
  //                 name: "Employee",
  //                 message: "The leave policy [Policy Name] has been discontinued.",
  //                 communicationChannel: ["Email", "Dashboard Notification"],
  //                 placeHolder: ["[Policy Name]"],
  //                 placeHolderOptions: [{ value: "[Policy Name]", label: "Policy Name" }],
  //                 isEnable: true,
  //             },
  //         ],
  //     },
  // ];

  const notificationData = [
    {
      id: 6,
      event: 'Add Employee',
      triggerCondition: 'When adding a new employee.',
      recipient: [
        {
          name: 'admin',
          message: 'A new employee [Employee Name] has been successfully added.',
          communicationChannel: ['Email'],
          placeHolder: ['[Employee Name]'],
          placeHolderOptions: [{ value: '[Employee Name]', label: 'Employee Name' }],
          isEnable: true,
        },

        {
          name: 'employee',
          message: 'Welcome [Employee Name], your profile has been created in the system.',
          communicationChannel: ['Email', 'WhatsApp'],
          placeHolder: ['[Employee Name]'],
          placeHolderOptions: [{ value: '[Employee Name]', label: 'Employee Name' }],
          isEnable: true,
        },
      ],
    },
    {
      id: 7,
      event: 'Edit Employee',
      triggerCondition: 'When modifying employee details.',
      recipient: [
        {
          name: 'admin',
          message: "Employee [Employee Name]'s details have been updated.",
          communicationChannel: ['Email'],
          placeHolder: ['[Employee Name]'],
          placeHolderOptions: [{ value: '[Employee Name]', label: 'Employee Name' }],
          isEnable: true,
        },

        {
          name: 'employee',
          message: 'Your profile details have been updated by the HR/Admin team.',
          communicationChannel: ['Email', 'WhatsApp', 'SMS'],
          placeHolder: [],
          placeHolderOptions: [],
          isEnable: true,
        },
      ],
    },
    {
      id: 8,
      event: 'Delete Employee',
      triggerCondition: 'When an employee is deleted.',
      recipient: [
        {
          name: 'admin',
          message: 'Employee [Employee Name] has been removed from the system.',
          communicationChannel: ['Email'],
          placeHolder: ['[Employee Name]'],
          placeHolderOptions: [{ value: '[Employee Name]', label: 'Employee Name' }],
          isEnable: true,
        },

        {
          name: 'employee',
          message: 'Your profile has been removed from the organization database.',
          communicationChannel: ['Email', 'WhatsApp', 'SMS'],
          placeHolder: [],
          placeHolderOptions: [],
          isEnable: true,
        },
      ],
    },
    {
      id: 9,
      event: 'Change Employee Status (Active/Inactive)',
      triggerCondition: 'When an employee’s status is changed.',
      recipient: [
        {
          name: 'admin',
          message: 'Employee [Employee Name] status has been changed to [Active/Inactive].',
          communicationChannel: ['Email'],
          placeHolder: ['[Employee Name]', '[Active/Inactive]'],
          placeHolderOptions: [
            { value: '[Employee Name]', label: 'Employee Name' },
            { value: '[Active/Inactive]', label: 'Active/Inactive Status' },
          ],
          isEnable: true,
        },

        {
          name: 'employee',
          message:
            'Your profile status has been changed to [Active/Inactive]. Contact HR for details.',
          communicationChannel: ['Email', 'WhatsApp'],
          placeHolder: ['[Active/Inactive]'],
          placeHolderOptions: [{ value: '[Active/Inactive]', label: 'Active/Inactive Status' }],
          isEnable: true,
        },
      ],
    },
  ];

  const [open, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [view, setView] = useState(false);

  const closeHandler = () => {
    setOpen(false);
    setSelectedData(null);
    setView(false);
  };

  return (
    <>
      {open ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <EditNotificationDialog data={selectedData} onClose={closeHandler} isFromView={view} />
        </Card>
      ) : (
        <CustomizableTable
          noDataText={<>No Event Notification Found </>}
          tableId="student-auto-notification-configuration"
          data={notificationData}
          columns={[
            {
              id: 'event',
              label: 'Event',
            },
            {
              id: 'triggerCondition',

              label: 'Trigger Condition',
            },
            {
              id: 'recipient',
              label: 'Recipient',
              render(value, row) {
                return row.recipient.map((recipient: any) => (
                  <Box key={recipient.name}>
                    <Box>{recipient.name.toUpperCase()}</Box>
                  </Box>
                ));
              },
            },

            {
              id: 'isActive',
              label: 'Active',
              isFilter: false,
              isSort: false,
              render(value, row) {
                return (
                  <Box>
                    <Switch
                      checked={row.isActive}
                      onChange={(event) => {
                        console.log(event.target.checked);
                      }}
                    />
                  </Box>
                );
              },
            },
            {
              id: 'action',
              label: 'Action',
              isFilter: false,
              isSort: false,
              sticky: true,

              render(value, row) {
                return (
                  <ThreeDotsActions
                    showThreeDots={false}
                    showEditIcon
                    handleEditClick={() => {
                      setSelectedData(row);
                      setOpen(true);
                      setView(false);
                    }}
                    showViewIcon
                    handleViewClick={() => {
                      setSelectedData(row);
                      setView(true);
                      setOpen(true);
                    }}
                  />
                );
              },
            },
          ]}
        />
      )}
    </>
  );
};
export default HrEmployeeNotificationManagementScreen;
