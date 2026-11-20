---
module: academic
domain: workflows
content_type: How-to
status: canonical
updated_on: 2026-11-20
owner: frontend-team
audience: humans-and-agents
---

# Follow the Academic setup workflow

TL;DR: the guide takes an authorized user through the visible configuration families and reuses each manager's real forms.
Saving guide progress records navigation and deferred choices; configuration is saved through the owning form.

## Use the Insights dashboard

Select the academic year, board and medium with the shared global selector, then open Academic Dashboard.
The service returns sections for the user's actual scope; the screen prioritizes those sections for the resolved role.
Administrator, leadership, coordinator, teacher, examination and timetable roles share the existing permission boundaries.
Student and parent dashboards use verified personal context and a linked-student selector when needed.
The absence of a child selection never defaults to a school-wide view.

The section catalogue covers class assignments, Student Academic 360, calendar, syllabus, lesson plans and diary, timetable/rooms/substitutions, learning tasks, evaluation, examinations, reports, notifications, audits and the nine active settings.

On the Substitution workspace, Send reminder is available while an open duty still requires acknowledgement. After the request, the workspace reports the returned delivery state, including queued work, provider acceptance, and an unconfirmed response.
Each visible staff section links to its permitted existing workflows.
Graphs use actual samples: mappings, scatter comparisons, timelines, progress bars, status columns, period occupancy, task stacks, review distributions, exam stages and report counts.
Where the source cannot safely provide the selected scope, the section explains its limitation and retains permitted navigation.
The Rules workspace shows saved configuration separately from event and channel readiness.

The shared header stays visible during loading and failures.
Each insight uses the shared outlined `FormSectionCard`, a neutral semantic icon, a `subtitle1`/600 heading and an adjacent accessible information tooltip.
Section gaps and content spacing follow the shared 16 px rhythm.
The approved-image dashboard is a separate presentation; the previous dashboard implementation remains preserved in code.
It uses compact outlined summary cards, two section columns on wide screens, a single column on narrow screens, compact real-data lesson tables, horizontal task charts, a donut beside its numeric legend, date-led calendar entries, audit/template tables and a full-width settings section.
The calendar preview shows at most five upcoming entries and hides recurring weekend holidays. Real events and other holidays remain visible even when their dates fall on a weekend; an empty preview displays a short message.
Administrator pairs follow the approved image: assignments/syllabus, timetable/lessons, tasks/evaluation, Student360/examination, calendar/reports, templates/audits, then settings. Its summary shows full-scope mapped/total divisions, recorded progress, saved timetables and actual weekly entries; missing source totals remain unavailable.
Other roles retain their existing permitted priorities and metric selection; personal dashboards keep their own titles and never acquire staff workflow links.
The syllabus headline uses only the supplied recorded-progress aggregate, without calculating an average from preview points or inventing chapter counts.
Staff timetable summaries distinguish saved timetables from actual weekly entries beside a compact weekday chart; returned counts retain real zeros and omit missing days. Personal timetables retain their numbered-period matrix.
Settings groups follow Curriculum, Timetable, Homework & Assignment, and Examination; Lecture Slots precedes Weekly Lectures.
Chart values retain a screen-reader alternative without adding a visible data toggle to every section.
Missing context, loading, empty data, section failures and request retry have separate states.
Switching academic context or account permissions removes previously visible response data immediately.

## First access and reopening

1. Wait for authenticated tenant context and initialized Academic permissions.
2. Read the school's configuration-visit state before deciding whether to open the guide automatically.
3. Automatically show setup only while no authorized user at that school has visited Academic configuration.
4. Record a visit from the guide or an included configuration destination through the backend visit client.
5. Keep the guide manually reopenable after the school-wide first visit, even when configuration remains incomplete.

Browser storage, existing record counts, and an individual user's previous route are not substitutes for the server's school-wide visit state.
Do not infer completion from having visited a page.

## Configure and continue

The catalogue orders Welcome, Curriculum, Timetable, Homework & Assignment, Examination, and Review & Finish.
Curriculum includes subjects and elective groups; Timetable includes weekly lectures and lecture slots.
Homework & Assignment includes homework types, assignment types, and reusable rubric templates.
The rubric template's final Preview step reuses the teacher evaluation controls for trial scores and feedback, with a live total and Reset preview action.
Trial entries stay local, are cleared when leaving the preview or changing its configuration, and are excluded from Save draft and Publish Rubric requests.
Examination includes grade scaling and exam types.

The guide renders each existing manager under `AcademicSetupEmbeddingProvider`.
`AcademicSetupManagerHeader` retains the original actions in a compact toolbar without repeating page breadcrumbs.
Outside the provider, the existing standalone screen header is unchanged.

Use the manager's existing add, edit, bulk import, Submit, Save draft, or publish controls.
Those controls own domain validation, duplicate checks, payload conversion, mutations, and toast feedback.
The guide's Save progress action must not claim that invalid or unsubmitted domain values were saved.

Guide saves report their state in the fixed footer, and refresh progress stays outside the content flow.
Successful saves must not insert banners above the heading or peer tabs; tab changes retain their position while saving.
Failures and concurrency recovery remain actionable inline and preserve the current selection.

## Protect unfinished work

Modal forms keep their existing dirty-close guard and backdrop behavior.
Inline rubric and lecture-slot forms report actual dirty and busy states through `useAcademicSetupFormState` so guide navigation and exit cannot discard active work.
Grade-scale forms also report their existing state while preserving the local dialog's owner.
The state hook clears its report when the owning form or manager unmounts.
Embedded Lecture Slots uses one local navigation guard for Cancel, Back, links, browser traversal, and unload protection.
Its embedded forms use normal page flow and a static form footer so the outer setup page owns scrolling; standalone Slot layouts retain their existing internal scrolling.

Submit or discard the active form through its own controls before continuing the guide.
Failed form saves preserve the existing form's retry behavior and do not advance guide configuration status.

## Schedule homework in school time

Homework publish and due pickers use Asia/Kolkata (IST), including initial values and edits from browsers in other timezones. Requests retain an explicit `+05:30` offset. The due picker uses the selected class/division calendar and blocks holidays, vacations and emergency closures; publish timestamps are not restricted by the homework due-date policy. Failed saves keep the form open and show one message owned by the form. The [backend calendar contract](../../../Shikshamitra-BE/docs/modules/academic/product.md#homework-calendar-validation) owns authoritative validation and calendar selection.

## Assign electives after admission

On `/academic/assign-elective-subject`, newly admitted students remain editable beside previously locked students. Locked rows disable their subject controls and selection checkboxes. Individual edits, bulk assignment and clearing preserve locked rows, and saving excludes them from the update payload. Save new selections before using Review & Lock; refreshing after the final lock makes those students read-only too. The [backend product rules](../../../Shikshamitra-BE/docs/modules/academic/product.md#data-integrity) own lock enforcement.

When the roster's server capability permits locked corrections, an edit action appears on locked rows. Save or discard other draft assignments before opening it. Select a new subject, a preference correction, or both, then choose Review changes. The review shows old/new values and backend-reported effects. Confirm changes submits that exact reviewed input and token. A failed or stale confirmation retains the draft and requires a new review; success refreshes the roster while keeping the row locked. Other roles retain the existing read-only locked rows. See [backend correction contracts](../../../Shikshamitra-BE/docs/modules/academic/api.md#locked-elective-corrections).

## Configure Academic notification rules

Open **Academics → Notification** and select a category and rule scope. The table shows the effective saved rule, including rules inherited from a broader scope. Older category links open the matching category.

Staff with rule edit access can use **Configure** to submit a rule for the selected scope. The primary guardian is included for family events. The editor offers choices for additional guardians, the student account, and other recipients where the event supports them. Enabling requires published templates for the selected recipients and channels. Conflicts keep the current draft open.

For Homework Submitted and Assignment Submitted, **Daily digest time** closes the submission count in the school's time zone. Assigned teachers are selected by default for a new rule. Use published teacher templates to enable the digest.

For **Weekly academic summary**, choose a **Day of the week** and **Weekly summary time**. New rules start with Friday at 17:00 in the school's time zone. Publish the recipient and channel templates before enabling. Families get summaries for their linked children, and chosen staff receive division totals. The school can also choose additional authorized family relationships or the eligible student account. [Weekly summary contract](../../../Shikshamitra-BE/docs/modules/academic/api.md#weekly-academic-summary)

Enable the operational impact rule in **Settings** to notify eligible scheduled teachers or the configured reviewer when a Weekly Lectures edit makes a published timetable need review. Publish an inbox or browser push template for each selected audience. Staff can open Timetable Management from the notice. [Weekly lecture requirements impact contract](../../../Shikshamitra-BE/docs/modules/academic/api.md#weekly-lecture-requirements-impact)

For **Progress behind schedule** in Curriculum, **Daily digest time** closes the window for published chapters with saved end dates. Choose the staff recipients and their published templates, then enable the rule. The digest opens Chapter Management. See the [chapter progress digest contract](../../../Shikshamitra-BE/docs/modules/academic/api.md#chapter-progress-digest).

For **Progress milestone reached**, enter the **Milestone percentage** and **Daily digest time** before enabling the rule. Choose the assigned teacher or class teacher audience and its published templates. Each chapter qualifies the first time its saved division progress reaches that percentage.

For Substitution Acknowledgement Due, the assigned substitute receives the first reminder. In **Recipients**, select **Notify the configured reviewer** and set **Escalate after (minutes)** to follow up if the substitute has not responded. Select published templates for both recipients before enabling the rule.

## Notify recipients about exam seating

In the guided Seating Plan **Publish** step, choose guardians, student accounts, or assigned teachers under **Notifications**. Select **Allow email** to permit email for those audiences when the school's Seating Published rule includes it. The rule controls guardian and student account eligibility and channels. Publication locks the plans. Delivery can queue after both seating and the exam are published. See the [seating notification contract](../../../Shikshamitra-BE/docs/modules/academic/api.md#exam-seating-notifications).

## Choose who receives an emergency closure notice

In **Emergency Closure**, choose the scope and then the audiences under **Notify**. New declarations select assigned teachers and guardians. Select **Student accounts** to include them when the school's rule allows it. The edit form restores the saved choices. The details view shows those selections, and Delivery History shows what was sent. See the [emergency closure notification contract](../../../Shikshamitra-BE/docs/modules/academic/api.md#emergency-closure-notifications).

## Create an Academic notification template

Open **Academics → Notification → Templates**. Choose the event and scope, then create a template for one recipient, channel, and language. Use the variable pickers to insert fields from the event catalogue. Email supports rich text. In-app, browser push, and WhatsApp use plain text.

Save the draft and load its preview with sample data. Publish it to make that version available to Rules. Further edits create a new draft while the published version remains available. Version history can preview saved revisions. Restoring the default wording also creates a draft.

**Send test** queues the saved version for the configured test destination using sample data. WhatsApp delivery requires provider approval for the exact version and language.

## Review and send a task reminder

In **Evaluation & Feedback**, select a published homework or assignment, then use **Send reminder** on an unsubmitted student's row. The action is available when the school has the corresponding Academic event integration. The review applies the current recipient rule, which defaults family notices to the primary guardian.

Choose available channels and select **Preview recipients**. Review eligible counts, exclusions, and sample messages before selecting **Confirm send** or **Request approval**. A changed review needs a fresh preview. If the confirmation response is interrupted, **Retry confirmation** checks the same send. Open **Delivery History** to follow the accepted operation.

## Send a Student Academic 360 notification

Open a student's detail drawer from **Academics → Student Academic 360**. Select **Send academic message** or **Request a meeting**. The primary guardian is selected when eligible. Choose among the student's eligible guardians and student account. A meeting request can also include the assigned class teacher when available.

Choose delivery channels and optionally choose a **Preferred template**. Review the recipient counts, channel exclusions and sample wording before confirming. The meeting request asks recipients to arrange a time with the school. Use **Delivery History** to check the queued operation.

[Student Academic 360 notification contract](../../../Shikshamitra-BE/docs/modules/academic/api.md#staff-notification-configuration)

## Send a teacher diary follow-up

Open **Academics → Lesson Plan / Teacher Diary**, select **Teacher Diary**, then open a submitted entry. Choose **Notify teacher** or **Notify reviewer**, when the reviewer option is available. Choose your channels, select **Preview recipients**, and review the recipient and message before selecting **Confirm send**. Open **Delivery History** from the confirmation result.

Saving and submitting a diary leave notifications silent. The follow-up uses the published template for the selected staff role. Diary notes stay in the diary.

## Review delivery history

Assigned approvers open **Academics → Notifications → Delivery History** and select a request in **Pending Approvals**. Review the recipient counts, exclusions and sample messages, then confirm **Approve send** to queue it or **Reject send** to close the request. A changed request requires the sender to review and submit it again. The sender can follow the approval status from the Delivery History link on their send confirmation.

Open Delivery History with a link to a notification operation or Academic source. Filter the attempt table by delivery status. Provider acceptance, delivery and read receipts each have their own status, and the Columns menu exposes the available timestamps. When the current attempt shows **Retry delivery**, confirm **Queue retry** to retry that recipient and channel. History retains the rejected attempt and records the queued status separately. When acceptance is unknown, review the provider outcome before sending again. Staff with cancel access can stop pending work and see how much work is already in progress. [Delivery API](../../../Shikshamitra-BE/docs/modules/academic/api.md#staff-notification-configuration)

## Read or acknowledge a notification

Open the notification bell. **All** shows notifications for the signed-in account, and **Unread** shows messages without a read timestamp. **Mark as read** clears the unread indicator. **Acknowledge** records a separate acknowledgement. Open record follows the school's internal link when one is available.

Academic report ready notices offer **Download report** in the inbox. This opens the same authenticated download used by the report workspace. Export ownership and expiry are checked for every download. If the file expired or is unavailable, the link opens the report status page. Select **Generate again** when available to rerun the saved export with your current access. Download from the status page or the same inbox link when the replacement is ready. [Academic report notification contract](../../../Shikshamitra-BE/docs/modules/academic/api.md#report-export-notifications)

## Set personal notification preferences

Open the notification bell and choose **Notification preferences**. Pick a category and apply it to all your notifications or one linked student. Choose the delivery channels, preferred language, and optional quiet hours in school time. Account-wide channel restrictions also apply to linked students. After a conflicting save, keep editing or reload the saved settings before retrying. [Personal notification contract](../../../Shikshamitra-BE/docs/modules/academic/api.md#personal-notification-preferences)

## Enable notifications on a device

Sign in to the school website on the device that should receive updates.
Open the Notifications drawer and choose **Enable browser notifications**.
Grant browser permission when prompted.
On a supported iPhone or iPad, add the website to the Home Screen and open that installed site first.
To remove the device, choose **Turn off browser notifications** in the same drawer.
Signing out removes the device association for that browser session.

## Review the current scope

Configuration status comes from the backend for the selected academic year, medium, and most recently selected timetable class.
Weekly Lectures and Lecture Slots report their actual class selection through `useAcademicSetupStandard`.
Review identifies that class scope; it must not imply that all classes are configured.

Show inaccessible settings only according to the guide's permission model, and distinguish unavailable context from empty configuration.
Deferred settings remain explicitly deferred instead of receiving a completed state.
Finishing review records the guide review outcome; it does not create missing configuration records.
