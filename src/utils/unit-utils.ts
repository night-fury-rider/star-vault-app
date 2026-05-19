const calculateAge = (dateStr?: string): number | null => {
  if (!dateStr) {
    return null;
  }
  const birth = new Date(dateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const cmToFeetInches = (cm?: string): string | null => {
  if (!cm) {
    return null;
  }
  const totalCm = parseFloat(cm);
  if (isNaN(totalCm)) {
    return null;
  }
  const totalInches = totalCm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}" (${totalCm} cm)`;
};

const formatBirthdayWithAge = (dateStr?: string): string | null => {
  const date = formatDate(dateStr);
  const age = calculateAge(dateStr);
  if (!date) {
    return null;
  }
  return age !== null ? `${date} (Age ${age})` : date;
};

const formatDate = (dateStr?: string): string | null => {
  if (!dateStr) {
    return null;
  }
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const kgToLbs = (kg?: string): string | null => {
  if (!kg) {
    return null;
  }
  const totalKg = parseFloat(kg);
  if (isNaN(totalKg)) {
    return null;
  }
  const lbs = Math.round(totalKg * 2.20462);
  return `${lbs} lbs (${totalKg} kg)`;
};

export {
  calculateAge,
  cmToFeetInches,
  formatBirthdayWithAge,
  formatDate,
  kgToLbs,
};
