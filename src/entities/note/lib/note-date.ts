function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function isSameLocalDay(first: Date, second: Date): boolean {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export function formatNoteTimestampForWorkspace(timestampMs: number): string {
  const date = new Date(timestampMs);

  const datePart = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);

  const timePart = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);

  return `${datePart}, ${timePart}`;
}

export function formatNoteTimestampForList(timestampMs: number): string {
  const now = new Date();
  const date = new Date(timestampMs);

  if (isSameLocalDay(now, date)) {
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  }

  const day = pad2(date.getDate());
  const month = pad2(date.getMonth() + 1);
  const year = String(date.getFullYear());
  return `${day}.${month}.${year}`;
}
