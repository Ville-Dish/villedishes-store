export const normalizeStartDate = (d: Date) => {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
};

export const normalizeEndDate = (d: Date) => {
  const out = new Date(d);
  out.setHours(23, 59, 59, 999);
  return out;
};
