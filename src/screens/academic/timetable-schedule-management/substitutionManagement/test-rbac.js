const fs = require('fs');

const file = 'SubstitutionManagementScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

// The first three replacements worked because I see the diff had isAdminOrManager, but let me check if 2 and 3 worked.
// Actually, let's just do it securely using indexOf.

// Wrap "Mark acknowledged"
let idxAck = content.indexOf('<MenuItem\n            disabled={!actionRow || ![\'Waiting Ack\', \'Assigned\'].includes(actionRow.status)}\n            onClick={() => {\n              if (actionRow) updateSubstitutionStatus(actionRow.id, \'Acknowledged\');\n              closeActionMenu();\n            }}\n          >');
if (idxAck === -1) {
  idxAck = content.indexOf('<MenuItem\r\n            disabled={!actionRow || ![\'Waiting Ack\', \'Assigned\'].includes(actionRow.status)}\r\n            onClick={() => {\r\n              if (actionRow) updateSubstitutionStatus(actionRow.id, \'Acknowledged\');\r\n              closeActionMenu();\r\n            }}\r\n          >');
}

if (idxAck !== -1) {
    console.log('Found Mark acknowledged');
} else {
    console.log('NOT FOUND Mark acknowledged');
}
