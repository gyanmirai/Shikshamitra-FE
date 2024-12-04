import React, { useState } from 'react';

import { Box, Button, TextField, DialogActions, } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';

const LibraryBookAndTagsSetting = () => {
    const [formData, setFormData] = useState({ categoryName: '', description: '' });
    const [data, setData] = useState([
        { categoryName: 'Science-Fiction', description: 'Books about futuristic science and technology' },
        { categoryName: 'Education', description: 'Books for learning and academics' },
    ]);

    const addCategoryDialog = useBoolean();

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddCategory = () => {
        setData((prev) => [...prev, formData]);
        setFormData({ categoryName: '', description: '' });
        addCategoryDialog.onFalse();
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Box display="flex" justifyContent="flex-end" mb={2}>
                <Button onClick={addCategoryDialog.onTrue} size="small" variant="contained">
                    Add Category
                </Button>
            </Box>

            <CustomizableTable
                isFilter={false}
                isShowedDense={false}
                isSearch={false}
                columns={[
                    { id: 'categoryName', label: 'Category Name' },
                    { id: 'description', label: 'Description' },
                ]}
                data={data}
            />

            {addCategoryDialog.value && (
                <CustomDialog
                    title="Add Category"
                    open={addCategoryDialog.value}
                    handleClose={() => { addCategoryDialog.onFalse() }}
                //   actions={[
                //     <Button key="cancel" onClick={addCategoryDialog.onFalse} variant="outlined">
                //       Cancel
                //     </Button>,
                //     <Button key="add" onClick={handleAddCategory} variant="contained">
                //       Add
                //     </Button>,
                //   ]}
                >
                    <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: "350px" }}>

                        <Box display="flex" flexDirection="column" gap={2}>
                            <TextField
                                label="Category Name"
                                value={formData.categoryName}
                                onChange={(e) => handleChange('categoryName', e.target.value)}
                                fullWidth
                            />
                            <TextField
                                label="Description"
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                multiline
                                rows={3}
                                fullWidth
                            />
                        </Box>
                    </Scrollbar>
                    <DialogActions>
                        <Button type="submit" variant="contained" size="small">
                            Save
                        </Button>
                    </DialogActions>

                </CustomDialog>
            )}
        </Box>
    );
};

export default LibraryBookAndTagsSetting;
