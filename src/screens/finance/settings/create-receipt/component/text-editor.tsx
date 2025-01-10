// import React, { useMemo, useState } from 'react';
// import { Slate, Editable, withReact } from 'slate-react';

// interface RichTextEditor {
//     initialContent: any,
//     onContentChange: any,
// }

// const RichTextEditor = ({ initialContent, onContentChange }) => {
//     const editor = useMemo(() => withReact(createEditor()), []);
//     const [value, setValue] = useState([{ type: 'paragraph', children: [{ text: initialContent }] }]);

//     return (
//         <Slate
//             editor={editor}
//             value={value}
//             onChange={(newValue) => {
//                 setValue(newValue);
//                 const plainText = newValue.map((n) => n.children.map((c) => c.text).join('')).join('\n');
//                 onContentChange(plainText); // Send plain text to the parent
//             }}
//         >
//             <Editable placeholder="Start typing your template here..." />
//         </Slate>
//     );
// };

// export default RichTextEditor;
