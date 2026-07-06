
// Shared function for converting bool to int for sqlite
export function mapLeaseFromDb(raw: any): any {
  return {
    ...raw,
    petsAllowed: raw.petsAllowed === undefined ? undefined : raw.petsAllowed === 1,
  };
}

export function booleanToSql(val?: boolean): number | undefined {
  if (val === undefined) return undefined;
  return val ? 1 : 0;
}

export function getLocalIsoString(): string {
  const date = new Date();
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - timezoneOffset);

  return localDate.toISOString().slice(0, -1);
}