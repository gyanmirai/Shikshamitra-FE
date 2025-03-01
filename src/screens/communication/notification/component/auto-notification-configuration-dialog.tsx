// import React, { useState } from "react";

// import { TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
// import { Box, Grid, Switch, TextField, Typography, FormControlLabel } from "@mui/material";

// import CustomSelect from "src/components/custom-select";

// import NotificationConditionRuleForm from "./notification-condition-rule-form";

// interface AutoNotificationConfigurationProps {
//     onClose: () => void;
// }

// const AutoNotificationConfigurationDialog: React.FC<AutoNotificationConfigurationProps> = ({ onClose }) => {
//     const [notificationName, setNotificationName] = useState<string>("");
//     const [notificationType, setNotificationType] = useState<any>("");
//     const [value, setValue] = useState(0);
//     const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

//     // const [arithmeticOperator, setArithmeticOperator] = useState<string>("");
//     // const [conditionFor, setConditionFor] = useState<string>("");
//     // const [conditionValue, setConditionValue] = useState<string>("");
//     // const [isPercantage, setIsPercantage] = useState(false);
//     // const [isMultiCondition, setIsMultiCondition] = useState<boolean>(false);
//     // const [isConditionSameForAll, setIsConditionSameForAll] = useState<boolean>(false);

//     // const [mergeOperator, setMergeOperator] = useState("&");

//     const [isConditionSameForAll, setIsConditionSameForAll] = useState(true);

//     // Teacher Conditions
//     const [teacherConditionFor, setTeacherConditionFor] = useState("");
//     const [teacherArithmeticOperator, setTeacherArithmeticOperator] = useState(">");
//     const [teacherConditionValue, setTeacherConditionValue] = useState("");
//     const [teacherMergeOperator, setTeacherMergeOperator] = useState("None");
//     const [teacherIsMultiCondition, setTeacherIsMultiCondition] = useState(false);
//     const [teacherIsPercantage, setTeacherIsPercantage] = useState(false);

//     // Student Conditions
//     const [studentConditionFor, setStudentConditionFor] = useState("");
//     const [studentArithmeticOperator, setStudentArithmeticOperator] = useState(">");
//     const [studentConditionValue, setStudentConditionValue] = useState("");
//     const [studentMergeOperator, setStudentMergeOperator] = useState("None");
//     const [studentIsMultiCondition, setStudentIsMultiCondition] = useState(false);
//     const [studentIsPercantage, setStudentIsPercantage] = useState(false);

//     const [conditions, setConditions] = useState<any>([]);

//     // State for configurations based on channel and role
//     const [configurations, setConfigurations] = useState({
//         email: {
//             teacher: { content: "", timing: "" },
//             student: { content: "", timing: "" }
//         },
//         sms: {
//             teacher: { content: "", timing: "" },
//             student: { content: "", timing: "" }
//         },
//         whatsapp: {
//             content: ""
//         }
//     });

//     const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
//         setValue(newValue);
//     };

//     const handleConfigChange = (channel: string, role: string, field: string, value: string) => {
//         setConfigurations((prev) => ({
//             ...prev,
//             [channel]: {
//                 ...prev[channel],
//                 [role]: {
//                     ...prev[channel][role],
//                     [field]: value
//                 }
//             }
//         }));
//     };

//     const timingOptions = (notificationType === 'event') ? [
//         { label: "Instant", value: "instant" },
//         { label: "Scheduled", value: "scheduled" },

//     ] : (notificationType === 'rule') ? [
//         { label: "Real Time", value: "realTime" },
//         { label: "Scheduled", value: "scheduled" },
//     ] : (notificationType === 'time') ? [
//         { label: "Scheduled", value: "scheduled" },
//     ] : [];

//     const addConditionHandler = () => {
//         setConditions((prevConditions: any) => [...prevConditions, {
//             teacherConditionFor,
//             teacherArithmeticOperator,
//             teacherConditionValue,
//             teacherMergeOperator,
//             teacherIsMultiCondition,
//             teacherIsPercantage,

//         }]);

//         setTeacherConditionFor("");
//         setTeacherArithmeticOperator(">");
//         setTeacherConditionValue("");
//         setTeacherMergeOperator("None");
//         setTeacherIsMultiCondition(false);
//         setTeacherIsPercantage(false);
//     }

//     const deleteConditionHandler = () => {
//         setConditions([])
//     }

//     return (
//         <Grid container spacing={2} px="18px" pt="40px">
//             <Grid container spacing={2}>
//                 <Grid item lg={6} px={0}>
//                     <TextField
//                         label="Notification Name"
//                         value={notificationName}
//                         onChange={(e) => setNotificationName(e.target.value)}
//                         fullWidth
//                         size="small"
//                     />
//                 </Grid>
//                 <Grid item lg={6} px={0} >
//                     <CustomSelect
//                         label="Notification Type"
//                         options={[
//                             { label: "Event Based", value: "event" },
//                             { label: "Rule Based", value: "rule" },
//                             { label: "Time Based", value: "time" }
//                         ]}
//                         value={notificationType}
//                         onChange={(e) => setNotificationType(e as string)}
//                     />
//                 </Grid>
//             </Grid>

//             <>
//                 {notificationType === "rule" && <Grid container spacing={2} mt={2}>
//                     {/* Condition Rule Title & Toggle */}
//                     <Grid item lg={12}>
//                         <Typography variant="subtitle1" gutterBottom>
//                             Condition Rule
//                         </Typography>

//                     </Grid>

//                     <Grid item lg={12}>

//                         <NotificationConditionRuleForm
//                             title=""
//                             conditionFor={teacherConditionFor}
//                             setConditionFor={setTeacherConditionFor}
//                             arithmeticOperator={teacherArithmeticOperator}
//                             setArithmeticOperator={setTeacherArithmeticOperator}
//                             conditionValue={teacherConditionValue}
//                             setConditionValue={setTeacherConditionValue}
//                             mergeOperator={teacherMergeOperator}
//                             setMergeOperator={setTeacherMergeOperator}
//                             isMultiCondition={teacherIsMultiCondition}
//                             setIsMultiCondition={setTeacherIsMultiCondition}
//                             isPercantage={teacherIsPercantage}
//                             setIsPercantage={setTeacherIsPercantage}
//                             addConditionHandler={() => { addConditionHandler() }}
//                             deleteConditionHandler={() => { deleteConditionHandler() }}
//                             isDisabled={false}
//                         />
//                     </Grid>
//                 </Grid>}

//                 {conditions.length > 0 ?
//                     (conditions.map((condition: any, index: any) => (
//                         <Typography key={index} component="span">
//                             {`${" "} ${condition.teacherConditionFor !== "none" ? `${condition.teacherConditionFor.toUpperCase()} ` : ""}${condition.teacherArithmeticOperator} ${condition.teacherConditionValue}${condition.teacherIsPercantage ? "%" : ""}${condition.teacherMergeOperator !== "None" ? ` ${condition.teacherMergeOperator}` : ""}`}
//                         </Typography>
//                     ))) : <Box pt={2} />
//                 }
//             </>

//             <Grid container spacing={2} pt="20px">
//                 <Grid item lg={4}>
//                     <CustomSelect

//                         label="Select Module"
//                         options={[
//                             { label: "HR", value: "hr" },
//                             { label: "Student", value: "student" }
//                         ]}
//                         value=""
//                         onChange={(e) => console.log(e)}
//                     />
//                 </Grid>
//                 <Grid item lg={4}>
//                     <CustomSelect

//                         label="Select Category"
//                         options={[
//                             { label: "Student Records", value: "studentRecords" },

//                         ]}
//                         value=""
//                         onChange={(e) => console.log(e)}
//                     />
//                 </Grid>
//                 <Grid item lg={4}>
//                     <CustomSelect

//                         label="Select Sub Category"
//                         options={[
//                             { label: "Attendance", value: "attendance" },

//                         ]}
//                         value=""
//                         onChange={(e) => console.log(e)}
//                     />
//                 </Grid>
//             </Grid>
//             <Grid container spacing={2} pt="20px">
//                 <Grid item lg={4}>
//                     <CustomSelect
//                         multiple
//                         label="Select Role"
//                         options={[
//                             { label: "Teacher", value: "teacher" },
//                             { label: "Student", value: "student" }
//                         ]}
//                         value={selectedRoles}
//                         onChange={(e) => setSelectedRoles(e as string[])}
//                     />
//                 </Grid>
//                 {selectedRoles.includes("teacher") && <Grid item lg={4}>
//                     <CustomSelect
//                         multiple
//                         label="Select Class Teacher"
//                         options={[
//                             { label: "1", value: "1" },
//                             { label: "2", value: "2" }
//                         ]}
//                         value={[]}
//                         onChange={(e) => console.log(e)}
//                     />
//                 </Grid>}

//                 {selectedRoles.includes("student") && < Grid item lg={4}>
//                     <CustomSelect
//                         multiple
//                         label="Select Student"
//                         options={[
//                             { label: "1", value: "1" },
//                             { label: "2", value: "2" }
//                         ]}
//                         value={[]}
//                         onChange={(e) => console.log(e as string[])}
//                     />
//                 </Grid>}
//             </Grid>
//             <Grid container spacing={2} pt="20px">
//                 {selectedRoles.length > 0 && <Typography variant="h6" py="25px" px="18px" >Notification Template</Typography>}
//                 {
//                     selectedRoles.length > 0 && (
//                         <Grid item lg={12}>
//                             {/* <Tabs value={value} onChange={handleTabChange} aria-label="Communication Channels" sx={{ mb: 2 }}>
//                             <Tab label="Email" />
//                             <Tab label="SMS" />
//                             <Tab label="WhatsApp" />
//                         </Tabs> */}

//                             {value < 2 && (
//                                 <Box display="flex" flexDirection="row" gap={2}>
//                                     {selectedRoles.includes("teacher") && (
//                                         <Grid item lg={6} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//                                             <CustomSelect
//                                                 label={`Select Template for Teacher (${value === 0 ? "Email" : "SMS"})`}
//                                                 options={[]}
//                                                 value={configurations[value === 0 ? "email" : "sms"].teacher.timing}
//                                                 onChange={(e) => handleConfigChange(value === 0 ? "email" : "sms", "teacher", "timing", e as string)}
//                                             />
//                                             <TextField name="content for selected template" multiline rows={4} />
//                                             <CustomSelect
//                                                 label="Timing"
//                                                 options={timingOptions}
//                                                 value={configurations[value === 0 ? "email" : "sms"].teacher.timing}
//                                                 onChange={(e) => handleConfigChange(value === 0 ? "email" : "sms", "teacher", "timing", e as string)}
//                                             />
//                                             {configurations[value === 0 ? "email" : "sms"].teacher.timing === "scheduled" && (
//                                                 <TimePicker
//                                                     value={null}
//                                                     viewRenderers={{
//                                                         hours: renderTimeViewClock,
//                                                         minutes: renderTimeViewClock,
//                                                         seconds: renderTimeViewClock,
//                                                     }}
//                                                     onChange={(newTime) => console.log(newTime)}
//                                                     slotProps={{ textField: { size: 'small' } }}
//                                                 />
//                                             )}
//                                             <FormControlLabel
//                                                 control={
//                                                     <Switch
//                                                         checked
//                                                         onChange={(e) => console.log(e)}

//                                                     />
//                                                 }
//                                                 label="Is Recurring"
//                                             />
//                                         </Grid>
//                                     )}
//                                     {selectedRoles.includes("student") && (
//                                         <Grid item lg={6} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//                                             <CustomSelect
//                                                 label={`Select Template for Student (${value === 0 ? "Email" : "SMS"})`}
//                                                 options={[]}
//                                                 value={configurations[value === 0 ? "email" : "sms"].teacher.timing}
//                                                 onChange={(e) => handleConfigChange(value === 0 ? "email" : "sms", "teacher", "timing", e as string)}
//                                             />
//                                             <TextField name="content for selected template" multiline rows={4} />
//                                             <CustomSelect
//                                                 label="Timing"
//                                                 options={timingOptions}
//                                                 value={configurations[value === 0 ? "email" : "sms"].student.timing}
//                                                 onChange={(e) => handleConfigChange(value === 0 ? "email" : "sms", "student", "timing", e as string)}
//                                             />
//                                             {configurations[value === 0 ? "email" : "sms"].student.timing === "scheduled" && (
//                                                 <TimePicker
//                                                     value={null}
//                                                     viewRenderers={{
//                                                         hours: renderTimeViewClock,
//                                                         minutes: renderTimeViewClock,
//                                                         seconds: renderTimeViewClock,
//                                                     }}
//                                                     onChange={(newTime) => console.log(newTime)}
//                                                     slotProps={{ textField: { size: 'small' } }}
//                                                 />
//                                             )}
//                                         </Grid>
//                                     )}
//                                 </Box>
//                             )}
//                             {value === 2 && (
//                                 <TextField label="WhatsApp Content" multiline rows={3} fullWidth
//                                     value={configurations.whatsapp.content}
//                                     onChange={(e) => setConfigurations(prev => ({ ...prev, whatsapp: { content: e.target.value } }))}
//                                 />
//                             )}
//                         </Grid>
//                     )
//                 }
//             </Grid>

//         </Grid >

//     );
// };

// export default AutoNotificationConfigurationDialog;
