export function randomString(): string {
  return crypto.randomUUID();
}

export function copyValue<T>(object: T): T {
  return JSON.parse(JSON.stringify(object));
}
