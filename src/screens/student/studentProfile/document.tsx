import React from 'react';
import { RenderDocuments } from 'src/components/studentProfile/form-fields/RenderDocument';

import type { StudentTabsComponentType } from '.';

// const GB = 1000000000 * 24;

const Document = (props: StudentTabsComponentType) => <RenderDocuments id={props?.student?.id} />;
export default Document;
