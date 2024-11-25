import React from 'react'

import { Box, alpha, Button } from '@mui/material'

import { varAlpha } from 'src/theme/styles/utils';

interface CommonCtaComponentProps {
    bookHandler: () => void;
    issueBookHandler: () => void;
    returnBookHandler: () => void;
    addNewMemberHandler: () => void;
}


const CommonCtaComponent: React.FC<CommonCtaComponentProps> = (
    { bookHandler, issueBookHandler, returnBookHandler, addNewMemberHandler }
) => {
    const data = []
    return (
        <Box display="flex" flexDirection="row" gap={2} justifyContent="flex-end">
            <Button
                // startIcon={<Iconify icon="ion:download" />}
                variant="contained"
                color="primary"
                sx={{
                    backgroundColor: (theme) =>
                        varAlpha(theme.palette.primary.mainChannel, 0.1),
                    color: 'primary.main',
                    '&:hover': {
                        backgroundColor: (theme) =>
                            varAlpha(theme.palette.primary.mainChannel, 0.1),
                    },
                }}
                onClick={addNewMemberHandler}


            >

                Add New Member
            </Button>

            <Button
                // startIcon={<Iconify icon="ion:download" />}
                variant="contained"
                color="warning"
                sx={{
                    backgroundColor: (theme) =>
                        varAlpha(theme.palette.warning.mainChannel, 0.1),
                    color: 'warning.main',
                    '&:hover': {
                        backgroundColor: (theme) =>
                            varAlpha(theme.palette.warning.mainChannel, 0.1),
                    },
                }}
                onClick={bookHandler}
            >
                Add New Book
            </Button>
            <Button
                // startIcon={<Iconify icon="ion:print" />}
                variant="contained"
                color="secondary"
                sx={{
                    backgroundColor: (theme) =>
                        varAlpha(theme.palette.secondary.mainChannel, 0.1),
                    color: 'secondary.main',
                    '&:hover': {
                        backgroundColor: (theme) =>
                            varAlpha(theme.palette.secondary.mainChannel, 0.1),
                    },
                }}
                onClick={issueBookHandler}
            >
                Issue Book
            </Button>
            <Button
                variant="contained"
                sx={{
                    backgroundColor: alpha("#ff5630", 0.1), // Lightened background using 10% opacity
                    color: "#ff5630", // Text color
                    "&:hover": {
                        backgroundColor: alpha("#ff5630", 0.2), // Slightly darker background on hover
                    },
                }}
                onClick={returnBookHandler}
            >
                Return Book
            </Button>

        </Box>
    )
}

export default CommonCtaComponent