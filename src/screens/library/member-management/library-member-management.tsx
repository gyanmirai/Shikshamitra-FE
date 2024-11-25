'use client'

import React, { useState, useEffect } from 'react'

import { MenuItem, MenuList } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import AddNewMemberDialog from './component/add-new-member-dialog';
import CommonCtaComponent from '../component/common-cta-component';
import IssueBookDialog from '../book-management/component/issue-book-dialog';
import ReturnBookDialog from '../book-management/component/return-book-dialog';
import AddNewBookDialog from '../book-management/component/add-new-book-dialog';

const LibraryMemberManagementScreen = () => {
    const [selectedEntry, setSelectedEntry] = useState<any>(null);
    const [isEdit, setIsEdit] = useState(false);
    const [isRenewMembership, setIsRenewMembership] = useState(false);

    // Dialog state handlers
    const addMemberDialog = useBoolean();
    const addNewBookDialog = useBoolean();
    const issueBookDialog = useBoolean();
    const returnBookDialog = useBoolean();
    const data = [
        {
            memberId: 'A9i878',
            role: 'Student',
            name: 'Vikas',
            memberStatus: "Active",
        },
        {
            memberId: 'A9i878',
            role: 'Student',
            name: 'Vishal',
            memberStatus: "Expired",
        },
    ];
    const openDialog = (dialog: any, entry: any = null, editMode = false, renew = false) => {
        setSelectedEntry(entry);
        setIsEdit(editMode);
        setIsRenewMembership(renew)
        dialog.onTrue();
    };


    const closeDialog = (dialog: any) => {
        setSelectedEntry(null);
        setIsEdit(false);
        setIsRenewMembership(false)
        dialog.onFalse();
    };
    const saveHandler = () => {
        console.log('Saved data:', data);

    };


    useEffect(() => { }, [isRenewMembership, isEdit])
    const renderTableActions = (row: any) => (
        <ThreeDotsActions
            placement="right-top"
            actions={({ popover }: any) => (
                <MenuList>
                    <MenuItem
                        onClick={() => {
                            openDialog(addMemberDialog, row, true, false);
                        }}
                    >
                        <Iconify icon="solar:pen-bold" />
                        Edit
                    </MenuItem>
                    {row.memberStatus === "Expired" && <MenuItem
                        onClick={() => {
                            openDialog(addMemberDialog, row, false, true);
                        }}
                    >
                        <Iconify icon="solar:pen-bold" />
                        Renew Membership
                    </MenuItem>}
                    <MenuItem
                        onClick={() => {
                            // Add delete logic here
                            console.log('Delete:', row);
                        }}
                    >
                        <Iconify icon="solar:trash-bin-trash-bold" />
                        Delete
                    </MenuItem>
                </MenuList>
            )}
        />
    );
    return (

        <>
            <CommonCtaComponent
                bookHandler={() => openDialog(addNewBookDialog)}
                issueBookHandler={() => openDialog(issueBookDialog)}
                returnBookHandler={() => openDialog(returnBookDialog)}
                addNewMemberHandler={() => openDialog(addMemberDialog)}

            />
            <CustomizableTable
                columns={[
                    { id: 'memberId', label: 'Member Id' },
                    { id: 'role', label: 'Role' },
                    { id: 'name', label: 'Name' },
                    {
                        id: 'memberStatus', label: 'Member Status', render(value, row) {
                            return <Label
                                variant="soft"
                                color={
                                    value === "Active"
                                        ? 'success'
                                        : 'error'

                                }
                            >
                                {value}
                            </Label>
                        },
                    },

                    { id: 'action', label: 'Action', render: (_, row) => renderTableActions(row) },
                ]}
                data={data}
            />
            {addMemberDialog &&
                <AddNewMemberDialog
                    dialogValue={addMemberDialog.value}
                    data={selectedEntry}
                    onSave={saveHandler}
                    onClose={() => closeDialog(addMemberDialog)}
                    isEdit={isEdit}
                    isRenewMembership={isRenewMembership}

                />
            }
            {/* Add/Edit Book Dialog */}
            {addNewBookDialog.value && (
                <AddNewBookDialog
                    dialogValue={addNewBookDialog.value}
                    data={selectedEntry}
                    onSave={saveHandler}
                    onClose={() => closeDialog(addNewBookDialog)}
                    isEdit={isEdit}
                />
            )}

            {/* Issue Book Dialog */}
            {issueBookDialog.value && (
                <IssueBookDialog
                    dialogValue={issueBookDialog.value}
                    data={selectedEntry}
                    onSave={saveHandler}
                    onClose={() => closeDialog(issueBookDialog)}
                />
            )}

            {/* Return Book Dialog */}
            {returnBookDialog.value && (
                <ReturnBookDialog
                    dialogValue={returnBookDialog.value}
                    onSave={saveHandler}
                    onClose={() => closeDialog(returnBookDialog)}
                />
            )}
        </>
    )
}

export default LibraryMemberManagementScreen