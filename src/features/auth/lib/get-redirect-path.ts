import { isRecord, isString } from '@shared/lib/type-guards';

export function getRedirectPath(locationState: unknown): string {
  if (!isRecord(locationState)) return '/notes';

  const fromValue = locationState['from'];
  if (!isRecord(fromValue)) return '/notes';

  const pathnameValue = fromValue['pathname'];
  if (!isString(pathnameValue) || pathnameValue.length === 0) return '/notes';

  const searchValue = fromValue['search'];
  const searchPart = isString(searchValue) ? searchValue : '';

  return `${pathnameValue}${searchPart}`;
}
