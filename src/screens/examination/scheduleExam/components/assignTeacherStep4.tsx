import type { FormikProps } from 'formik';

import { useState } from 'react';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IExamFormValues } from '../type';

const AssignTeachers = (props: FormikProps<IExamFormValues>) => {
  const formik = props;
  // State to store exam schedules based on selected subjects
  const [examSchedules, setExamSchedules] = useState(formik.values.subjects);

  return (
    <CustomizableTable
      isFilter={false}
      isPagination={false}
      isScrollbar={false}
      isShowedDense={false}
      isSearch={false}
      tableId="examschedule-table"
      columns={[
        { id: 'subjectName', label: 'Subject Name' },
        {
          id: 'teacher',
          label: 'Teacher',
          render(value, row) {
            return (
              <CustomSelect
                options={[]}
                label="Teacher"
                value=""
                onChange={() => {}}
                formControlProps={{ sx: { minWidth: '180px', width: '100%' } }}
              />
            );
          },
        },
        {
          id: 'invigilationTeacher',
          label: 'Invigilation Teacher',
          render(value, row) {
            return (
              <CustomSelect
                options={[]}
                label="Invigilation Teachers"
                value=""
                onChange={() => {}}
                formControlProps={{ sx: { minWidth: '180px', width: '100%' } }}
              />
            );
          },
        },
      ]}
      data={examSchedules}
    />
  );
};
export default AssignTeachers;
