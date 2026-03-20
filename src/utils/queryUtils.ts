export function buildSearchQuery(search: string, fields: string[]) {
  if (!search?.trim()) return {};
  const regex = new RegExp(search, 'i');
  return { $or: fields.map((field) => ({ [field]: regex })) };
}
