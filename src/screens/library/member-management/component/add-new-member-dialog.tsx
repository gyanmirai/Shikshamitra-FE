import React from 'react'
import { useFormik } from 'formik';

import { Box, Grid, Button, TextField, DialogActions, } from '@mui/material';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';


interface AddNewMemberDialogProps {
    dialogValue: boolean;
    onSave: (values: any) => void;
    onClose: () => void;
    data?: any;
    isEdit: boolean;
    isRenewMembership: boolean;


}

const AddNewMemberDialog: React.FC<AddNewMemberDialogProps> = ({ isRenewMembership, isEdit, dialogValue, onSave, onClose, data }) => {
    const formik = useFormik<any>({
        initialValues: {
            bookTitle: '',
            bookAuthor: '',
            isbn: '',
            tags: '',
            quantity: '',
            category: '',
            condition: '',
        },
        onSubmit: (values: any) => {
            console.log('Form Submitted:', values);
            onSave(values);
        },
    });

  
    return (
        <CustomDialog
            title={`${isRenewMembership ? "Renew Membership" : isEdit ? 'Edit Member' : 'Add New Member'} `}
            open={dialogValue}
            handleClose={onClose}
            maxWidth="sm"
        >
            <Box>
                <form onSubmit={formik.handleSubmit}>
                    <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', }}>
                        {isEdit && <Box display="flex" justifyContent="flex-end">
                            <Label
                                variant="soft"
                                color={
                                    data !== null ? data.memberStatus === "Active"
                                        ? 'success'
                                        : 'error'
                                        : "info"
                                }
                            >
                                {data !== null ? data.memberStatus : ""}
                            </Label>
                        </Box>}
                        <Grid container spacing={3} pt="10px">

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    name="name"
                                    label="Name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <CustomSelect
                                    label="Role"
                                    options={[]}
                                    value={formik.values.Role}
                                    onChange={(value) => formik.setFieldValue('role', value)}
                                    formControlProps={{ sx: { minWidth: 270 } }}
                                    disabled={isEdit}
                                />
                            </Grid>



                            
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    name="borrowingLimit"
                                    label="Borrowing Limit"
                                    value={formik.values.borrowingLimit}
                                    onChange={formik.handleChange}
                                    size="small"
                                />
                            </Grid>
                            {isRenewMembership && data !== null  && data.memberStatus === "Expired" && <Grid item xs={12} md={6}>
                                <CustomSelect
                                    label="Renewal Duration"
                                    options={[]}
                                    value={formik.values.renewalDuration}
                                    onChange={(value) => formik.setFieldValue('renewalDuration', value)}
                                    formControlProps={{ sx: { minWidth: 270 } }}
                                    disabled={isEdit}
                                />
                            </Grid>}


                        </Grid>
                    </Scrollbar>
                    <DialogActions>
                        {isRenewMembership && data !== null  && data.memberStatus === "Expired" && <Button type="submit" variant="contained" size="small">
                            Renew Membership
                        </Button>}
                        {!isEdit &&  !isRenewMembership && <Button type="submit" variant="contained" size="small">
                            Add New Member
                        </Button>
                        
                        }
                          {isEdit && <Button type="submit" variant="contained" size="small">
                            Save
                        </Button>
                        
                        }
                    </DialogActions>
                </form>
            </Box>
        </CustomDialog>
    )
}

export default AddNewMemberDialog