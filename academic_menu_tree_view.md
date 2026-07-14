# Academic Menu Tree View & Codebase Analysis

This document provides a comprehensive review of the **Academic Menu** structure within the **Shiksha Mitra** platform. It maps the current state of the navigation menu in the frontend code, outlines the commented-out/hidden modules, and details the recommended final product layout for school lifecycle fitment.

---

## 1. Summary of Code vs. Roadmap Gaps

*   **Active in Code:** Core modules like Dashboard, Curriculum (Subject Allocation & Syllabus), Timetable (Management & Weekly Slots), Homework (Tasks & Feedback), Examination (Scheduling, Seating, Grade Entry & Results), and Notification are actively rendered.
*   **Hidden in Code (Commented Out):** Student Electives, Teacher Assignments, Learning Resources, Chapter Progress, Class Teacher Assignment, Quiz Management, Activities/Groups, and the LMS modules are defined but commented out in the navigation configuration.
*   **Proposed/Missing Modules:** Lesson Plan/Teacher Diary, Question Bank Creator, and Year-End Rollover need to be built and integrated into the menu structure.

---

## 2. Current Codebase Menu Tree (`academic-menu.ts`)

Below is the exact representation of `src/constants/academic-menu.ts` as of today. 

*   🟢 **Active** items are visible in the sidebar UI.
*   🔴 **Hidden** items are currently commented out in the codebase navigation structure.

```text
Academic (Root Path: /academic | Permission: Academics.Academics)
├── 🟢 Dashboard
│   ├── Path: /academic/dashboard
│   └── Permission: Academics.Academics.Dashboard
│
├── 🟢 Curriculum
│   ├── Path: (Submenu parent)
│   ├── Permission: Academics.Academics.Curriculum
│   ├── Children:
│   │   ├── 🟢 Subject Allocation
│   │   │   ├── Path: /academic/curriculumSubjects
│   │   │   └── Permission: Academics.CurriculumManagement.SubjectAssignment
│   │   ├── 🔴 Student Elective Assignment
│   │   │   └── Path: /academic/assign-elective-subject
│   │   ├── 🔴 Choose Elective Subjects
│   │   │   └── Path: /academic/choose-elective-subject
│   │   ├── 🔴 Teachers Assignment
│   │   │   └── Path: /academic/teacher
│   │   ├── 🟢 Syllabus
│   │   │   ├── Path: /academic/courseSubjects
│   │   │   └── Permission: Academics.CurriculumManagement.ChapterManagement
│   │   ├── 🔴 Learning Resources (Caption: "Coming Soon")
│   │   │   ├── Path: /academic/learningResources
│   │   │   └── Permission: Academics.CurriculumManagement.Resources
│   │   ├── 🔴 Chapters Progress
│   │   │   └── Path: /academic/courseProgress
│   │   ├── 🟢 Reports
│   │   │   ├── Path: /academic/curriculumReports
│   │   │   └── Permission: Academics.CurriculumManagement.Reports
│   │   └── 🟢 Settings
│   │       ├── Path: (Submenu parent)
│   │       ├── Permission: Academics.Academics.Curriculum.Settings
│   │       └── Children:
│   │           ├── 🟢 Subjects Creation
│   │           │   ├── Path: /academic/curriculumSetting/subjectCreation
│   │           │   └── Permission: Academics.CurriculumManagement.Settings.SubjectCreation
│   │           └── 🟢 Elective Group Creation
│   │               ├── Path: /academic/curriculumSetting/electiveGroupCreation
│   │               └── Permission: Academics.CurriculumManagement.Settings.ElectiveGroupCreation
│
├── 🟢 Timetable
│   ├── Path: (Submenu parent)
│   ├── Permission: Academics.Academics.Timetable
│   ├── Children:
│   │   ├── 🟢 Timetable Management
│   │   │   ├── Path: /academic/newTimetable
│   │   │   └── Permission: Academics.Timetable.TimetableManagement
│   │   ├── 🟢 Reports
│   │   │   ├── Path: /academic/timetableReports
│   │   │   └── Permission: Academics.Timetable.Reports
│   │   └── 🟢 Settings
│   │       ├── Path: (Submenu parent)
│   │       ├── Permission: Academics.Academics.Timetable.Settings
│   │       └── Children:
│   │           ├── 🟢 Weekly Lectures
│   │           │   ├── Path: /academic/timetableSettings/weeklyLectures
│   │           │   └── Permission: Academics.Timetable.Settings.WeeklyLectures
│   │           └── 🟢 Lecture Slots
│   │               ├── Path: /academic/timetableSettings/lectureSlots
│   │               └── Permission: Academics.Timetable.Settings.LectureSlots
│
├── 🟢 Homework & Assignment
│   ├── Path: /academic/homework-assignment-management
│   ├── Permission: Academics.Academics.HomeworkAssignment
│   ├── Children:
│   │   ├── 🟢 Learning Tasks
│   │   │   ├── Path: /academic/homeworkCreation
│   │   │   └── Permission: Academics.HomeworkAndAssignment.LearningTasks
│   │   ├── 🟢 Evaluation & Feedback
│   │   │   ├── Path: /academic/gradingAndFeedback
│   │   │   └── Permission: Academics.HomeworkAndAssignment.AssessmentAndFeedback
│   │   ├── 🟢 Reports
│   │   │   ├── Path: /academic/homeworkAssignmentReports
│   │   │   └── Permission: Academics.HomeworkAndAssignment.Reports
│   │   ├── 🟢 Settings
│   │   │   ├── Path: /academic/homeworkSettings
│   │   │   ├── Permission: Academics.Academics.HomeworkAssignment.Settings
│   │   │   └── Children:
│   │   │       ├── 🟢 Homework Types
│   │   │       │   ├── Path: /academic/homeworkSettings/homeworkTypes
│   │   │       │   └── Permission: Academics.HomeworkAndAssignment.Settings.HomeworkTypes
│   │   │       └── 🟢 Assignment Types
│   │   │           ├── Path: /academic/homeworkSettings/assignmentTypes
│   │   │           └── Permission: Academics.HomeworkAndAssignment.Settings.AssignmentTypes
│   │   └── 🔴 My Submission
│   │       └── Path: /academic/mySubmission
│
├── 🔴 Assign Class Teacher
│   └── Path: /academic/assignTeacher
│
├── 🟢 Examination
│   ├── Path: (Submenu parent)
│   ├── Permission: Academics.Academics.Examination
│   ├── Children:
│   │   ├── 🟢 Schedule Exam
│   │   │   ├── Path: /academic/scheduleExam
│   │   │   └── Permission: Academics.Examination.ScheduleExam
│   │   ├── 🟢 Seating Plan
│   │   │   ├── Path: /academic/seatallocation
│   │   │   └── Permission: Academics.Examination.SeatAllocation
│   │   ├── 🟢 Grade Entry
│   │   │   ├── Path: /academic/gradeEntry
│   │   │   └── Permission: Academics.Examination.RecordMarks
│   │   ├── 🟢 Result Creation
│   │   │   ├── Path: /academic/resultCreation
│   │   │   └── Permission: Academics.Examination.Result
│   │   ├── 🔴 Quiz Management (Caption: "Coming Soon")
│   │   │   ├── Path: /academic/quizManagement
│   │   │   └── Permission: Academics.Examination.QuizManagement
│   │   ├── 🟢 Reports
│   │   │   ├── Path: /academic/examinationReports
│   │   │   └── Permission: Academics.Examination.Reports
│   │   └── 🟢 Settings
│   │       ├── Path: (Submenu parent)
│   │       ├── Permission: Academics.Academics.Examination.Settings
│   │       └── Children:
│   │           ├── 🟢 Grade Scaling
│   │           │   ├── Path: /academic/examinationSetting/gradeScaling
│   │           │   └── Permission: Academics.Examination.Settings.GradeScaling
│   │           └── 🟢 Exam Types
│   │               ├── Path: /academic/examinationSetting/examTypes
│   │               └── Permission: Academics.Examination.Settings.ExamTypes
│
├── 🔴 Group Management (Caption: "Coming Soon")
│   ├── Path: (Submenu parent)
│   ├── Permission: Academics.Academics.GroupManagement
│   └── Children:
│       ├── 🔴 Dashboard
│       │   ├── Path: /academic/activityDashboard
│       │   └── Permission: Academics.GroupManagement.Dashboard
│       ├── 🔴 Dynamic Group
│       │   ├── Path: /academic/dynamicGroup
│       │   └── Permission: Academics.GroupManagement.DynamicGroup
│       └── 🔴 Activity Management
│           ├── Path: /academic/activityManagement
│           └── Permission: Academics.GroupManagement.ActivityManagement
│
├── 🔴 Learning Management System (LMS) (Caption: "Coming Soon")
│   ├── Path: /academic/learning-management-system
│   ├── Permission: Academics.Academics.LMS
│   └── Children:
│       ├── 🔴 Dashboard
│       │   ├── Path: /academic/lmsDashboard
│       │   └── Permission: Academics.LearningManagementSystem.Dashboard
│       ├── 🔴 Course
│       │   ├── Path: /academic/course
│       │   └── Permission: Academics.LearningManagementSystem.Course
│       ├── 🔴 Student Progress Tracking
│       │   ├── Path: /academic/studentProgressTracking
│       │   └── Permission: Academics.LearningManagementSystem.StudentProgressTracking
│       ├── 🔴 Content Library
│       │   ├── Path: /academic/contentLibrary
│       │   └── Permission: Academics.LearningManagementSystem.ContentLibrary
│       ├── 🔴 Reports And Analytics
│       │   ├── Path: /academic/reportsAndAnalytics
│       │   └── Permission: Academics.LearningManagementSystem.ReportsAndAnalytics
│       └── 🔴 Settings
│           ├── Path: (Submenu parent)
│           ├── Permission: Academics.Academics.LMS.Settings
│           └── Children:
│               ├── 🔴 General
│               │   ├── Path: /academic/lmsSettings/generalSettings
│               │   └── Permission: Academics.LearningManagementSystem.Settings.General
│               ├── 🔴 Course Management
│               │   ├── Path: /academic/lmsSettings/courseManagementSettings
│               │   └── Permission: Academics.LearningManagementSystem.Settings.CourseManagement
│               ├── 🔴 Content Management
│               │   ├── Path: /academic/lmsSettings/contentManagementSettings
│               │   └── Permission: Academics.LearningManagementSystem.Settings.ContentManagement
│               ├── 🔴 Notification
│               │   ├── Path: /academic/lmsSettings/notificationSettings
│               │   └── Permission: Academics.LearningManagementSystem.Settings.Notification
│               └── 🔴 Integration
│                   ├── Path: /academic/lmsSettings/integrationSettings
│                   └── Permission: Academics.LearningManagementSystem.Settings.Integration
│
└── 🟢 Notification
    ├── Path: /academic/notification
    └── Permission: Academics.Academics.Notification
```

---

## 3. Recommended Final Academic Menu Tree (Target School Lifecycle)

The following tree represents the complete school lifecycle recommended in the roadmap after removing the requested items and module-specific dashboards.

*   ✨ **New/Proposed** items are highlighted.
*   🔄 **Rearranged/Renamed** items are listed for better UX.

```text
Academic
├── Dashboard
│
├── Curriculum & Syllabus (Renamed from Curriculum)
│   ├── 🟢 Subject Allocation (Section/Class mapping)
│   ├── 🟢 Syllabus / Chapter Management (Active "Syllabus" module)
│   ├── ✨ Lesson Plan / Teacher Diary (Daily tracking logs)
│   ├── 🟢 Chapter Progress (Unhide & link to Teacher Diary)
│   ├── 🟢 Learning Resources (Unhide & link library resources)
│   └── 🟢 Curriculum Reports
│
├── Timetable & Calendar
│   ├── 🟢 Timetable Management
│   ├── ✨ Academic Calendar (Holidays, half-days, event markers)
│   ├── 🟢 Weekly Lectures Setup
│   ├── 🟢 Lecture Slots Config
│   ├── ✨ Room & Resource Availability (Conflict checker)
│   ├── ✨ Substitution Management (For absent teacher scheduling)
│   └── 🟢 Timetable Reports
│
├── Homework & Assignment
│   ├── 🟢 Learning Tasks (Creation portal)
│   ├── 🟢 Evaluation & Feedback (Grading screen)
│   ├── 🟢 Homework Reports
│   └── 🟢 Settings (Homework/Assignment Types)
│
├── Examination & Results (Renamed from Examination)
│   ├── 🟢 Schedule Exam
│   ├── 🟢 Seating Plan (Room allocation)
│   ├── 🟢 Grade Entry (Record marks)
│   ├── 🟢 Result Creation
│   ├── ✨ Question Bank Creator (Bloom's taxonomy tags)
│   ├── 🟢 Examination Reports
│   └── 🟢 Settings (Exam Types & Grade Scaling)
│
└── LMS & Content Library (Keep hidden until backend OAuth/storage is ready)
    ├── 🟢 Courses
    ├── 🟢 Content Library
    ├── 🟢 Student Progress Tracking
    └── 🟢 LMS Settings
```

---

## 4. Phase-wise Action Plan for Developers

To align the menu structure of `Shikshamitra-FE` with the proposed lifecycle, implement code changes in the following phases:

### Phase 1: Clean Up & Unhide Existing Assets (Sprint 1)
1. Unhide **Teachers Assignment** / **Assign Class Teacher** (`/academic/assignTeacher` & `/academic/teacher`).
2. Move **Learning Resources** and **Chapter Progress** from "coming soon" to active once API bindings are established.
3. Keep **LMS** routes hidden in menu.

### Phase 2: Core Operational Additions (Sprint 2-3)
1. Create routes and views for **Academic Calendar** (Holiday definitions).
2. Develop the **Lesson Plan / Teacher Diary** UI component under Curriculum.

### Phase 3: Exam Execution & Evaluation Extensions (Sprint 4-5)
1. Move Gradebook from static mocks to dynamic calculations.
