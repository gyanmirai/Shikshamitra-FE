// Role color mapping for HR module
export const ROLE_COLORS: Record<string, string> = {
  Teacher: '#1976d2', // Blue
  'Transport Coordinator': '#f57c00', // Orange
  'Office Assistant': '#388e3c', // Green
  'Assistant Teacher': '#e91e63', // Pink/Magenta
  'Academic Coordinator': '#9c27b0', // Deep Purple
  Principal: '#7b1fa2', // Purple
  Admin: '#d32f2f', // Red
  Librarian: '#0097a7', // Cyan
  Accountant: '#5d4037', // Brown
  'HR Manager': '#c2185b', // Pink
  Supervisor: '#303f9f', // Indigo
  'IT Support': '#00796b', // Teal
  // Add more roles as needed
};

// Function to get role color with fallback
export const getRoleColor = (roleName: string | undefined): string => {
  if (!roleName) return '#9e9e9e'; // Default gray for undefined roles
  return ROLE_COLORS[roleName] || '#9e9e9e'; // Return mapped color or default gray
};
