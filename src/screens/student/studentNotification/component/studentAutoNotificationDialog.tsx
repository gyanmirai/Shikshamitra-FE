import { useFormik } from 'formik';
import React, { useState } from 'react';
import CustomSelect from 'src/components/custom-select';
import { useSearchParam } from 'src/hooks/use-search-param';
import { Scrollbar } from 'src/components/scrollbar/scrollbar';
import { Box, Grid, Card, Button, TextField, Typography, DialogActions } from '@mui/material';
import NotificationConditionRuleForm from 'src/screens/communication/notification/component/notification-condition-rule-form';

import RoleConfigForNotification from './role-config-for-notification';

interface StudentAutoNotificationConfigurationDialogProps {
  onClose: () => void;
  data: any;
  fromSendManual: boolean;
}

const StudentAutoNotificationConfigurationDialog: React.FC<
  StudentAutoNotificationConfigurationDialogProps
> = ({ onClose, data, fromSendManual }) => {
  const {
    category,
    subCategory,
    typeOfNotification,
    nameOfTheNotification,
    role,
    teacherRecipient,
    studentRecipient,
    communicationTypeForTeacher,
    communicationTypeForStudent,
    selectedTemplateName,
    selectedTemplateContentForTeacher,
    selectedTemplateContentForStudent,
    conditionRule,
  } = data || {}; // Ensure 'data' is not undefined

  const formik = useFormik({
    initialValues: {
      notificationName: nameOfTheNotification || '',
      notificationType: typeOfNotification || '',

      category: category || '',
      subcategory: subCategory || '',

      selectedRoles: role?.length ? role : [],
      selectedClassForTeacher: teacherRecipient?.length ? teacherRecipient : [],
      selectedClassForStudent: studentRecipient?.length ? studentRecipient : [],

      notificationTemplateListForTeacher: [], // No mapping available, keeping empty
      notificationTemplateListForStudent: [], // No mapping available, keeping empty

      selectedTemplateNameForTeacher: selectedTemplateName || '',
      selectedTemplateNameForStudent: selectedTemplateName || '',

      selectedTemplateContentForTeacher: selectedTemplateContentForTeacher || '',
      selectedTemplateContentForStudent: selectedTemplateContentForStudent || '',

      selectedCommunicationChannelForStudent: communicationTypeForStudent?.length
        ? communicationTypeForStudent
        : [],
      selectedCommunicationChannelForTeacher: communicationTypeForTeacher?.length
        ? communicationTypeForTeacher
        : [],

      conditionRule: !fromSendManual ? '' : conditionRule || '',
      selectedTiminggForStudent: '',
      selectedTiminggForTeacher: '',
      scheduledTimeForStudent: '',
      scheduledTimeForTeacher: '',
      isRecurringForStudent: false,
      isRecurringForTeacher: false,
      recurringValueForStudent: 0,
      recurringValueForTeacher: 0,
      eventType: '',
    },
    onSubmit: (values) => {
      console.log('Form Submitted type:', values);
    },
  });

  // const { generateTime, nameOfTheNotification, occurance, role, teacherRecipient, studentRecipient, communicationType, category, subCategory, typeOfNotification } = data
  const [conditionFor, setConditionFor] = useState('');
  const [arithmeticOperator, setArithmeticOperator] = useState('>');
  const [conditionValue, setConditionValue] = useState('');
  const [mergeOperator, setMergeOperator] = useState('None');
  const [isMultiCondition, setIsMultiCondition] = useState(false);
  const [isPercentage, setIsPercentage] = useState(false);

  const [conditions, setConditions] = useState<any>([]);

  interface Roles {
    [key: string]: { content: string; timing: string };
  }

  const roles: Roles = {
    Teacher: { content: 'Hello', timing: '10s' },
    Student: { content: 'Hi', timing: '5s' },
  };
  const [configurations, setConfigurations] = useState(roles);

  const handleConfigChange = (rol: string, field: string, value: string) => {
    setConfigurations((prev) => ({
      ...prev,
      [rol]: {
        ...prev[rol],
        [field]: value,
      },
    }));
  };

  const timingOptions =
    formik.values.notificationType === 'event'
      ? [
          { label: 'Instant', value: 'instant' },
          { label: 'Scheduled', value: 'scheduled' },
        ]
      : formik.values.notificationType === 'rule'
        ? [
            { label: 'Real Time', value: 'realTime' },
            { label: 'Scheduled', value: 'scheduled' },
          ]
        : formik.values.notificationType === 'time'
          ? [{ label: 'Scheduled', value: 'scheduled' }]
          : [];

  const addConditionHandler = () => {
    setConditions((prevConditions: any) => [
      ...prevConditions,
      {
        conditionFor,
        arithmeticOperator,
        conditionValue,
        mergeOperator,
        isMultiCondition,
        isPercentage,
      },
    ]);

    setConditionFor('');
    setArithmeticOperator('>');
    setConditionValue('');
    setMergeOperator('None');
    setIsMultiCondition(false);
    setIsPercentage(false);
  };

  const deleteConditionHandler = () => {
    setConditions([]);
  };

  const handleCommunicationChannelForTeacher = (d: string[]) => {
    formik.setFieldValue('selectedCommunicationChannelForTeacher', d);
  };

  const handleCommunicationChannelForStudent = (d: string[]) => {
    formik.setFieldValue('selectedCommunicationChannelForStudent', d);
  };

  // recurring is on off
  const handleRecurringForTeacher = (d: boolean) => {
    formik.setFieldValue('isRecurringForTeacher', d);
  };

  const handleRecurringForStudent = (d: boolean) => {
    formik.setFieldValue('isRecurringForStudent', d);
  };

  // recurring value
  const handleRecurringValueForStudent = (d: number) => {
    formik.setFieldValue('recurringValueForStudent', d);
  };

  const handleRecurringValueForTeacher = (d: number) => {
    formik.setFieldValue('recurringValueForTeacher', d);
  };

  const handleTemplateChangeForStudent = (d: string) => {
    formik.setFieldValue('selectedTemplateNameForStudent', d);
  };

  const handleTemplateChangeForTeacher = (d: string) => {
    formik.setFieldValue('selectedTemplateNameForTeacher', d);
  };
  const TABS = [
    {
      value: 'Teacher',
      label: 'Teacher',
      component: () => (
        <RoleConfigForNotification // eslint-disable-next-line jsx-a11y/aria-role
          role="Teacher"
          selectedRoles={formik.values.selectedRoles}
          configurations={configurations}
          handleConfigChange={handleConfigChange}
          communicationChannel={formik.values.selectedCommunicationChannelForTeacher}
          setCommunicationChannel={handleCommunicationChannelForTeacher}
          isRecurring={formik.values.isRecurringForTeacher}
          setIsRecurring={handleRecurringForTeacher}
          timingOptions={timingOptions}
          recurringValue={formik.values.recurringValueForTeacher}
          setRecurringValue={handleRecurringValueForTeacher}
          showRecurringSwitch={formik.values.notificationType !== 'event'}
          selectedTemplateContent={formik.values.selectedTemplateContentForTeacher}
          selectedTemplateName={formik.values.selectedTemplateNameForTeacher}
          fromSendManual={fromSendManual}
          templateOptions={[
            {
              value: 'generalInquirySubmittedTemplate',
              label: 'General Inquiry Submitted Template',
            },
            {
              value: 'generalTemplateForBelow80%Attendance',
              label: 'General Template For Below 80% Attendance',
            },
          ]}
          handleTemplateChange={handleTemplateChangeForTeacher}
        />
      ),
    },
    {
      value: 'Student',
      label: 'Student',
      component: () => (
        <RoleConfigForNotification
          // eslint-disable-next-line jsx-a11y/aria-role
          role="Student"
          selectedRoles={formik.values.selectedRoles}
          configurations={configurations}
          handleConfigChange={handleConfigChange}
          communicationChannel={formik.values.selectedCommunicationChannelForStudent}
          setCommunicationChannel={handleCommunicationChannelForStudent}
          isRecurring={formik.values.isRecurringForStudent}
          setIsRecurring={handleRecurringForStudent}
          timingOptions={timingOptions}
          recurringValue={formik.values.recurringValueForStudent}
          setRecurringValue={handleRecurringValueForStudent}
          showRecurringSwitch={formik.values.notificationType !== 'event'}
          selectedTemplateContent={formik.values.selectedTemplateContentForStudent}
          selectedTemplateName={formik.values.selectedTemplateNameForStudent}
          fromSendManual={fromSendManual}
          templateOptions={[
            {
              value: 'generalInquirySubmittedTemplate',
              label: 'General Inquiry Submitted Template',
            },
            {
              value: 'generalTemplateForBelow80%Attendance',
              label: 'General Template For Below 80% Attendance',
            },
          ]}
          handleTemplateChange={handleTemplateChangeForStudent}
        />
      ),
    },
  ];
  const [searchParams] = useSearchParam({ tab: 'dashboard' });
  return (
    <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
      <form onSubmit={formik.handleSubmit}>
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Scrollbar
            sx={{
              p: 1,
              height: '100%',
            }}
          >
            <Grid container spacing={2} px="18px" pt="40px">
              <Grid container spacing={2}>
                <Grid size={{ lg: 4 }} px={0}>
                  <TextField
                    label="Notification Name"
                    value={formik.values.notificationName}
                    onChange={(e) => formik.setFieldValue('notificationName', e.target.value)}
                    fullWidth
                    size="small"
                    disabled={fromSendManual}
                  />
                </Grid>
                <Grid size={{ lg: 4 }} px={0}>
                  <CustomSelect
                    disabled={fromSendManual}
                    label="Notification Type"
                    options={[
                      { label: 'Event Based', value: 'event' },
                      { label: 'Rule Based', value: 'rule' },
                      { label: 'Time Based', value: 'time' },
                    ]}
                    value={formik.values.notificationType}
                    onChange={(e) =>
                      formik.setFieldValue(
                        'notificationType',
                        e as string | number | string[] | number[]
                      )
                    }
                  />
                </Grid>
                <Grid size={{ lg: 4 }} px={0}>
                  <CustomSelect
                    disabled={fromSendManual}
                    label="Event Type"
                    options={[
                      { label: 'While Home-work Create', value: 'While Home-work Create' },
                      { label: 'Rule Based', value: 'rule' },
                    ]}
                    value={formik.values.eventType}
                    onChange={(e) =>
                      formik.setFieldValue('eventType', e as string | number | string[] | number[])
                    }
                  />
                </Grid>
              </Grid>

              {fromSendManual && formik.values.notificationType === 'rule' && (
                <>
                  <Grid size={{ lg: 12 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Your Message will be sent on the following conditions:
                    </Typography>
                  </Grid>
                  <Typography component="span" px="18px" pb="20px">
                    {`${' '} ${formik.values.conditionRule}`}
                  </Typography>
                </>
              )}
              {!fromSendManual && (
                <>
                  {formik.values.notificationType === 'rule' && (
                    <Grid container spacing={2} mt={2}>
                      {/* Condition Rule Title & Toggle */}
                      <Grid size={{ lg: 12 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Create Condition to trigger the notification
                        </Typography>
                      </Grid>

                      <Grid size={{ lg: 12 }}>
                        <NotificationConditionRuleForm
                          title=""
                          conditionFor={conditionFor}
                          setConditionFor={setConditionFor}
                          arithmeticOperator={arithmeticOperator}
                          setArithmeticOperator={setArithmeticOperator}
                          conditionValue={conditionValue}
                          setConditionValue={setConditionValue}
                          mergeOperator={mergeOperator}
                          setMergeOperator={setMergeOperator}
                          isMultiCondition={isMultiCondition}
                          setIsMultiCondition={setIsMultiCondition}
                          isPercentage={isPercentage}
                          setIsPercentage={setIsPercentage}
                          addConditionHandler={addConditionHandler}
                          deleteConditionHandler={deleteConditionHandler}
                          isDisabled={false}
                        />
                      </Grid>
                    </Grid>
                  )}

                  <>
                    {conditions.length > 0 && formik.values.notificationType === 'rule' && (
                      <Grid size={{ lg: 12 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Your Message will be sent on the following conditions:
                        </Typography>
                      </Grid>
                    )}

                    {conditions.length > 0 && formik.values.notificationType === 'rule' ? (
                      conditions.map((condition: any, index: any) => (
                        <Typography key={index} component="span" px="18px">
                          {`${' '} ${condition.conditionFor !== 'none' ? `${condition.conditionFor.toUpperCase()} ` : ''}${condition.arithmeticOperator} ${condition.conditionValue}${condition.isPercentage ? '%' : ''}${condition.mergeOperator !== 'None' ? ` ${condition.mergeOperator}` : ''}`}
                        </Typography>
                      ))
                    ) : (
                      <Box pt={2} />
                    )}
                  </>
                </>
              )}
              <Grid container spacing={2} pt="20px">
                <Grid size={{ lg: 4 }}>
                  <CustomSelect
                    disabled={fromSendManual}
                    label="Select Category"
                    options={[{ label: 'Student Records', value: 'studentRecord' }]}
                    value={formik.values.category}
                    onChange={(e) => formik.setFieldValue('category', e)}
                  />
                </Grid>
                <Grid size={{ lg: 4 }}>
                  <CustomSelect
                    disabled={fromSendManual}
                    label="Select Sub Category"
                    options={[
                      { label: 'Inquiry', value: 'inquiry' },
                      { label: 'Attendance', value: 'attendance' },
                    ]}
                    value={formik.values.subcategory}
                    onChange={(e) => formik.setFieldValue('subcategory', e)}
                  />
                </Grid>
                <Grid size={{ lg: 4 }}>
                  <CustomSelect
                    multiple
                    name="role"
                    label="Select Role"
                    options={[
                      { label: 'Teacher', value: 'Teacher' },
                      { label: 'Student', value: 'Student' },
                      { label: 'Non-Teaching Staff', value: 'Non-Teaching Staff' },
                    ]}
                    value={formik.values.selectedRoles}
                    onChange={(e) => formik.setFieldValue('selectedRoles', e)}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2} pt="20px">
                {formik.values.selectedRoles.includes('Teacher') && (
                  <Grid size={{ lg: 4 }}>
                    <CustomSelect
                      // disabled={fromSendManual}
                      multiple
                      label="Select Class Teacher"
                      options={[
                        { label: '1', value: '1' },
                        { label: '2', value: '2' },
                        { label: 'All', value: 'All' },
                      ]}
                      value={formik.values.selectedClassForTeacher}
                      onChange={(e) => formik.setFieldValue('selectedClassForTeacher', e)}
                    />
                  </Grid>
                )}

                {formik.values.selectedRoles.includes('Student') && (
                  <Grid size={{ lg: 4 }}>
                    <CustomSelect
                      // disabled={fromSendManual}
                      multiple
                      label="Select Student"
                      options={[
                        { label: '1', value: '1' },
                        { label: '2', value: '2' },
                        { label: 'All', value: 'All' },
                      ]}
                      value={formik.values.selectedClassForStudent}
                      onChange={(e) => formik.setFieldValue('selectedClassForStudent', e)}
                    />
                  </Grid>
                )}
              </Grid>
              <Grid container spacing={2} pt="20px">
                {formik.values.selectedRoles.length > 0 && (
                  <Typography variant="h6" py="25px" px="18px">
                    Notification Template
                  </Typography>
                )}

                {formik.values.selectedRoles.length > 0 && (
                  <Grid size={{ lg: 12 }}>
                    <Box display="flex" flexDirection="row" gap={2}>
                      <RoleConfigForNotification // eslint-disable-next-line jsx-a11y/aria-role
                        role="Teacher"
                        selectedRoles={formik.values.selectedRoles}
                        configurations={configurations}
                        handleConfigChange={handleConfigChange}
                        communicationChannel={formik.values.selectedCommunicationChannelForTeacher}
                        setCommunicationChannel={handleCommunicationChannelForTeacher}
                        isRecurring={formik.values.isRecurringForTeacher}
                        setIsRecurring={handleRecurringForTeacher}
                        timingOptions={timingOptions}
                        recurringValue={formik.values.recurringValueForTeacher}
                        setRecurringValue={handleRecurringValueForTeacher}
                        showRecurringSwitch={formik.values.notificationType !== 'event'}
                        selectedTemplateContent={formik.values.selectedTemplateContentForTeacher}
                        selectedTemplateName={formik.values.selectedTemplateNameForTeacher}
                        fromSendManual={fromSendManual}
                        templateOptions={[
                          {
                            value: 'generalInquirySubmittedTemplate',
                            label: 'General Inquiry Submitted Template',
                          },
                          {
                            value: 'generalTemplateForBelow80%Attendance',
                            label: 'General Template For Below 80% Attendance',
                          },
                        ]}
                        handleTemplateChange={handleTemplateChangeForTeacher}
                      />

                      <RoleConfigForNotification
                        // eslint-disable-next-line jsx-a11y/aria-role
                        role="Student"
                        selectedRoles={formik.values.selectedRoles}
                        configurations={configurations}
                        handleConfigChange={handleConfigChange}
                        communicationChannel={formik.values.selectedCommunicationChannelForStudent}
                        setCommunicationChannel={handleCommunicationChannelForStudent}
                        isRecurring={formik.values.isRecurringForStudent}
                        setIsRecurring={handleRecurringForStudent}
                        timingOptions={timingOptions}
                        recurringValue={formik.values.recurringValueForStudent}
                        setRecurringValue={handleRecurringValueForStudent}
                        showRecurringSwitch={formik.values.notificationType !== 'event'}
                        selectedTemplateContent={formik.values.selectedTemplateContentForStudent}
                        selectedTemplateName={formik.values.selectedTemplateNameForStudent}
                        fromSendManual={fromSendManual}
                        templateOptions={[
                          {
                            value: 'generalInquirySubmittedTemplate',
                            label: 'General Inquiry Submitted Template',
                          },
                          {
                            value: 'generalTemplateForBelow80%Attendance',
                            label: 'General Template For Below 80% Attendance',
                          },
                        ]}
                        handleTemplateChange={handleTemplateChangeForStudent}
                      />
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Scrollbar>
          <DialogActions sx={{ p: 2, pb: 10 }}>
            {!fromSendManual ? (
              // <Grid display="flex" justifyContent="flex-end" alignItems="flex-end" mt="130px">
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  formik.handleSubmit();
                }}
              >
                Save
              </Button>
            ) : (
              // </Grid>
              // <Grid display="flex" justifyContent="flex-end" alignItems="flex-end" mt="130px">
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  formik.handleSubmit();
                }}
              >
                Send Manual
              </Button>
              // </Grid>
            )}
          </DialogActions>
        </Box>
      </form>
    </Card>
  );
};

export default StudentAutoNotificationConfigurationDialog;
