'use client';

import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { Box, Alert, Button, Skeleton } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ImageSlider } from './image-slider';
import { BasicInformationForm } from './basic-information-form';
import { basicInformationColumns } from './basic-information-columns';
import { useBasicInformationWorkspace } from './use-basic-information-workspace';

export default function BasicInformation() {
  const workspace = useBasicInformationWorkspace();
  const { isSuperAdmin, form, close, detail, list, record, editData, ready } = workspace;
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
      <CustomBreadcrumbs
        heading="Basic Information"
        description="Manage and create tenant information for schools, including institute details, contact information, and assets like logos and banners."
        links={[{ name: 'Institute Setup' }, { name: 'Basic Information' }]}
        isBack={isSuperAdmin && form.value}
        onBack={close}
        action={
          isSuperAdmin &&
          ready && (
            <Button
              variant="contained"
              size="small"
              startIcon={form.value ? <Iconify icon="eva:arrow-back-fill" /> : <Add />}
              onClick={form.value ? close : form.onTrue}
            >
              {form.value ? 'Back' : 'Institute'}
            </Button>
          )
        }
      />
      {!ready ? (
        <Skeleton height={200} />
      ) : isSuperAdmin ? (
        form.value ? (
          <BasicInformationForm handleClose={close} editData={editData} />
        ) : (
          <CustomizableTable
            tableId="institute-setup"
            isLoading={list.isLoading}
            isRefreshing={list.isFetching && !list.isLoading}
            error={list.error}
            onRetry={list.refetch}
            columns={basicInformationColumns(workspace.edit, workspace.setImages)}
            data={workspace.records}
            noDataText={
              <>
                No Institute have been added yet.{' '}
                <Box
                  onClick={form.onTrue}
                  color="primary.main"
                  fontWeight={600}
                  sx={{
                    '&:hover': {
                      cursor: 'pointer',
                      color: 'primary.main',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Add Institute
                </Box>
              </>
            }
          />
        )
      ) : detail.isError ? (
        <Alert severity="error" action={<Button onClick={() => detail.refetch()}>Retry</Button>}>
          School profile could not be loaded.
        </Alert>
      ) : record ? (
        <BasicInformationForm key={record.id} editData={record} />
      ) : (
        <Skeleton height={200} />
      )}
      {workspace.images && (
        <ImageSlider images={workspace.images} open onClose={() => workspace.setImages(null)} />
      )}
    </Box>
  );
}
