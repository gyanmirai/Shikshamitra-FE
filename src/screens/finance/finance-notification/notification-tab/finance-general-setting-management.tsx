'use client';

import React, { useState } from 'react';

import { Box, Card, Switch } from '@mui/material';

import EditNotificationDialog from 'src/screens/student/studentNotification/edit-notification-dialog';

import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const notificationData = [
  {
    id: '17',
    event: 'Manage Fee Heads',
    triggerCondition: 'When a fee head is added',
    recipient: [
      {
        name: 'admin',
        message: 'A new fee head has been added: [Fee Head Name].',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Fee Head Name]'],
        placeHolderOptions: [{ value: '[Fee Head Name]', label: 'Fee Head Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '18',
    event: 'Manage Fee Heads',
    triggerCondition: 'When a fee head is edited.',
    recipient: [
      {
        name: 'admin',
        message: 'The fee head [Fee Head Name] has been modified.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Fee Head Name]'],
        placeHolderOptions: [{ value: '[Fee Head Name]', label: 'Fee Head Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '19',
    event: 'Manage Fee Heads',
    triggerCondition: 'When a fee head is deleted.',
    recipient: [
      {
        name: 'admin',
        message: 'The fee head [Fee Head Name] has been removed.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Fee Head Name]'],
        placeHolderOptions: [{ value: '[Fee Head Name]', label: 'Fee Head Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '20',
    event: 'Manage Payment Statuses',
    triggerCondition: 'When a payment status is added.',
    recipient: [
      {
        name: 'admin',
        message: 'A new payment status has been added: [Status Name].',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Status Name]'],
        placeHolderOptions: [{ value: '[Status Name]', label: 'Status Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '21',
    event: 'Manage Payment Statuses',
    triggerCondition: 'When a payment status is updated.',
    recipient: [
      {
        name: 'admin',
        message: 'Payment status [Status Name] has been updated.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Status Name]'],
        placeHolderOptions: [{ value: '[Status Name]', label: 'Status Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '22',
    event: 'Manage Payment Statuses',
    triggerCondition: 'When a payment status is deleted.',
    recipient: [
      {
        name: 'admin',
        message: 'Payment status [Status Name] has been deleted.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Status Name]'],
        placeHolderOptions: [{ value: '[Status Name]', label: 'Status Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '23',
    event: 'Set Income & Expense Categories',
    triggerCondition: 'When a new category is added.',
    recipient: [
      {
        name: 'admin',
        message: 'A new income/expense category has been created: [Category Name].',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Category Name]'],
        placeHolderOptions: [{ value: '[Category Name]', label: 'Category Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '24',
    event: 'Set Income & Expense Categories',
    triggerCondition: 'When a category is updated.',
    recipient: [
      {
        name: 'admin',
        message: 'Category [Category Name] has been updated.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Category Name]'],
        placeHolderOptions: [{ value: '[Category Name]', label: 'Category Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '25',
    event: 'Set Income & Expense Categories',
    triggerCondition: 'When a category is deleted.',
    recipient: [
      {
        name: 'admin',
        message: 'Category [Category Name] has been removed.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Category Name]'],
        placeHolderOptions: [{ value: '[Category Name]', label: 'Category Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '26',
    event: 'Set Budget Categories',
    triggerCondition: 'When a new budget category is added.',
    recipient: [
      {
        name: 'finance_manager',
        message: 'A new budget category has been added: [Category Name].',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Category Name]'],
        placeHolderOptions: [{ value: '[Category Name]', label: 'Category Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '27',
    event: 'Set Budget Categories',
    triggerCondition: 'When a budget category is updated.',
    recipient: [
      {
        name: 'finance_manager',
        message: 'Budget category [Category Name] has been updated.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Category Name]'],
        placeHolderOptions: [{ value: '[Category Name]', label: 'Category Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '28',
    event: 'Set Budget Categories',
    triggerCondition: 'When a budget category is deleted.',
    recipient: [
      {
        name: 'finance_manager',
        message: 'Budget category [Category Name] has been removed.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Category Name]'],
        placeHolderOptions: [{ value: '[Category Name]', label: 'Category Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '29',
    event: 'Manage Receipt Books',
    triggerCondition: 'When a new receipt book is added.',
    recipient: [
      {
        name: 'admin',
        message: 'A new receipt book [Receipt Book Name] has been created.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Receipt Book Name]'],
        placeHolderOptions: [{ value: '[Receipt Book Name]', label: 'Receipt Book Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '30',
    event: 'Manage Receipt Books',
    triggerCondition: 'When a receipt book is edited.',
    recipient: [
      {
        name: 'admin',
        message: 'Receipt book [Receipt Book Name] has been modified.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Receipt Book Name]'],
        placeHolderOptions: [{ value: '[Receipt Book Name]', label: 'Receipt Book Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '31',
    event: 'Manage Receipt Books',
    triggerCondition: 'When a receipt book is activated.',
    recipient: [
      {
        name: 'admin',
        message: 'Receipt book [Receipt Book Name] is now active.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Receipt Book Name]'],
        placeHolderOptions: [{ value: '[Receipt Book Name]', label: 'Receipt Book Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '32',
    event: 'Manage Receipt Books',
    triggerCondition: 'When a receipt book is deactivated.',
    recipient: [
      {
        name: 'admin',
        message: 'Receipt book [Receipt Book Name] has been deactivated.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Receipt Book Name]'],
        placeHolderOptions: [{ value: '[Receipt Book Name]', label: 'Receipt Book Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '33',
    event: 'Manage Receipt Books',
    triggerCondition: 'When a receipt book is deleted.',
    recipient: [
      {
        name: 'admin',
        message: 'Receipt book [Receipt Book Name] has been removed.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Receipt Book Name]'],
        placeHolderOptions: [{ value: '[Receipt Book Name]', label: 'Receipt Book Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '34',
    event: 'Manage Fee Structures',
    triggerCondition: 'When a fee structure is added.',
    recipient: [
      {
        name: 'admin',
        message: 'A new fee structure [Structure Name] has been added.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Structure Name]'],
        placeHolderOptions: [{ value: '[Structure Name]', label: 'Structure Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '35',
    event: 'Manage Fee Structures',
    triggerCondition: 'When a fee structure is edited.',
    recipient: [
      {
        name: 'admin',
        message: 'Fee structure [Structure Name] has been updated.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Structure Name]'],
        placeHolderOptions: [{ value: '[Structure Name]', label: 'Structure Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '36',
    event: 'Manage Fee Structures',
    triggerCondition: 'When a fee structure is activated.',
    recipient: [
      {
        name: 'admin',
        message: 'Fee structure [Structure Name] is now active.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Structure Name]'],
        placeHolderOptions: [{ value: '[Structure Name]', label: 'Structure Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '37',
    event: 'Manage Fee Structures',
    triggerCondition: 'When a fee structure is deactivated.',
    recipient: [
      {
        name: 'admin',
        message: 'Fee structure [Structure Name] has been deactivated.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Structure Name]'],
        placeHolderOptions: [{ value: '[Structure Name]', label: 'Structure Name' }],
        isEnable: true,
      },
    ],
  },
  {
    id: '38',
    event: 'Manage Fee Structures',
    triggerCondition: 'When a fee structure is deleted.',
    recipient: [
      {
        name: 'admin',
        message: 'Fee structure [Structure Name] has been removed.',
        communicationChannel: ['WhatsApp', 'Email'],
        placeHolder: ['[Structure Name]'],
        placeHolderOptions: [{ value: '[Structure Name]', label: 'Structure Name' }],
        isEnable: true,
      },
    ],
  },
];

const FinanceGeneralSettingtNotificationManagement = () => {
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

export default FinanceGeneralSettingtNotificationManagement;
