const calculateAge = (dob: string) => {
  const today = new Date();
  const birthDate = new Date(dob);

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();

  // Adjust years and months if birth month hasn't occurred this year
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  // Return age in year.month format
  return `${years}.${months}`;
};

export default calculateAge;
