const calculateAge = (dob: string) => {
  const today = new Date();
  const birthDate = new Date(dob);

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months -= 1;
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, birthDate.getDate());
    days = Math.floor((today.getTime() - lastMonth.getTime()) / (1000 * 60 * 60 * 24));
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return `${years} years ${months} months ${days} days`;
};
export default calculateAge;
