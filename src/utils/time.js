// @flow

import { Instant, LocalDateTime, ZonedDateTime, ZoneId, DateTimeFormatter } from '@js-joda/core';
import '@js-joda/timezone';
// import { Locale } from '@js-joda/locale_en-us'; // TODO

export const fmtDateShort = DateTimeFormatter.ofPattern('M/d/yyyy');
export const fmtMonthDay = DateTimeFormatter.ofPattern('M/d/yyyy'); // TODO want "MMM d"

// Intl.DateTimeFormat().resolvedOptions().timeZone
// is another way to get the local tz string; not sure if one is better
export const sysTz = ZoneId.systemDefault();

export const toDeviceTime = (zdt: ZonedDateTime): LocalDateTime => {
  try {
    return zdt.withZoneSameInstant(ZoneId.of(sysTz)).toLocalDateTime();
  } catch (e) {
    return zdt
      .withZoneSameInstant(ZoneId.of(Intl.DateTimeFormat().resolvedOptions().timeZone))
      .toLocalDateTime();
  }
};

export const epochToLDT = (epochS: number): LocalDateTime =>
  LocalDateTime.ofInstant(Instant.ofEpochSecond(epochS));

export function toDurationStr(i: number) {
  const hours = Math.floor(i / 3600);
  const minutes = Math.floor((i - hours * 3600) / 60);
  const seconds = parseInt(i, 10) - hours * 3600 - minutes * 60;
  const padLow = n => (n < 10 ? `0${n}` : String(n));
  const h = hours ? `${hours}:` : '';
  const m = hours ? padLow(minutes) : minutes;
  const s = padLow(seconds);

  return `${h}${m}:${s}`;
}
