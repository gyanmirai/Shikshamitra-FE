import React from 'react';
import { TabComponentType } from 'src/screens/hr/leave-request';

import { ChatView } from 'src/sections/chat/view';

// const messages = [
//   {
//     id: 1,
//     sender: 'Alice',
//     subject: 'Meeting Reminder',
//     snippet: "Don't forget our meeting at 3 PM.",
//     time: '2:30 PM',
//   },
//   {
//     id: 2,
//     sender: 'Bob',
//     subject: 'Project Update',
//     snippet: 'The project is on track.',
//     time: '1:45 PM',
//   },
//   // Add more messages here
// ];
// interface Message {
//   id: number;
//   sender: string;
//   subject: string;
//   snippet: string;
//   time: string;
// }
const Inbox = (props: TabComponentType) => <ChatView />;

export default Inbox;
