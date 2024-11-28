import React from 'react'

import { MenuItem, MenuList } from '@mui/material';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const LibraryReservationManagement = () => {
    const dummyData = [
        {
            bookId: 'B101',
            title: 'Introduction to Mathematics',
            memberName: 'John Doe',
            requestedDate: '12-11-23',
            status: 'Collected',
        },
        {
            bookId: 'B102',
            title: 'Physics Fundamentals',
            memberName: 'Jane Smith',
            requestedDate: '14-11-23',
            status: 'Pending',
        },
        {
            bookId: 'B103',
            title: 'Chemistry Basics',
            memberName: 'Sam Wilson',
            requestedDate: '18-11-23',
            status: 'Ready',
        },
        {
            bookId: 'B104',
            title: 'World History Overview',
            memberName: 'Chris Evans',
            requestedDate: '20-11-23',
            status: 'Collected',
        },
        {
            bookId: 'B105',
            title: 'Programming in Python',
            memberName: 'Natasha Romanoff',
            requestedDate: '22-11-23',
            status: 'Pending',
        },
    ];

    const renderTableActions = (row: any) => (
        <ThreeDotsActions
            placement="right-top"
            actions={({ popover }: any) => (
                <MenuList>
                    <MenuItem
                        onClick={() => {
                            //   openDialog(addNewBookDialog, row, true);
                        }}
                    >
                        <Iconify icon="mdi-light:check" />
                        Mark as Ready
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            //   openDialog(issueBookDialog, row);
                        }}
                    >
                        <Iconify icon="line-md:bell" />
                        Notify Member
                    </MenuItem>
                </MenuList>


            )}
        />
    );
    return (
        <CustomizableTable
            columns={[
                { id: 'bookId', label: 'Book Id' },
                { id: 'title', label: 'Title' },
                { id: 'memberName', label: 'Member Name' },
                { id: 'requestedDate', label: 'Requested Date' },
                {
                    id: 'status', label: 'Status', render(value, row) {
                        return <Label
                            variant="soft"
                            color={
                                value === "Collected"
                                    ? 'success'
                                    : value === "Ready" ? 'secondary' :
                                        'warning'

                            }
                        >
                            {value}
                        </Label>
                    },
                },

                { id: 'action', label: 'Action', render: (_, row) => renderTableActions(row) },
            ]}
            data={dummyData}
        />
    )
}

export default LibraryReservationManagement