const calculateAge = (dob: string): string => {
  const today = new Date();
  const birthDate = new Date(dob);

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();

  // Adjust if the current month/day is before the birth month/day
  if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
    years -= 1;
    months += 12;
  }

  // Remove extra month if day hasn't passed yet
  if (today.getDate() < birthDate.getDate()) {
    months -= 1;
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  return months === 0 ? `${years} years` : `${years} years ${months} months`;
};

export default calculateAge;
