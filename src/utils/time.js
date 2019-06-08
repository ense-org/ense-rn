// @flow

import { LocalDateTime, ZonedDateTime, ZoneId } from 'js-joda';

// Intl.DateTimeFormat().resolvedOptions().timeZone
// is another way to get the local tz string; not sure if one is better
export const sysTz = ZoneId.systemDefault();

export const toDeviceTime = (zdt: ZonedDateTime): LocalDateTime =>
  zdt.withZoneSameInstant(ZoneId.of(sysTz)).toLocalDateTime();
