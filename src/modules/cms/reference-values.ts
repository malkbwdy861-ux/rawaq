export function uniqueIds(ids: string[]) {
  return [...new Set(ids)];
}

export function retainExistingSelectedIds(selectedIds: string[], availableIds: Iterable<string>) {
  const available = new Set(availableIds);
  return uniqueIds(selectedIds).filter((id) => available.has(id));
}
