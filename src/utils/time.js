// @flow

import { Instant, LocalDateTime, ZonedDateTime, ZoneId, DateTimeFormatter } from 'js-joda';

export const fmtDateShort = DateTimeFormatter.ofPattern('M/d/yyyy');
export const fmtMonthDay = DateTimeFormatter.ofPattern('MM d');

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
  const secStr = seconds < 10 ? `0${seconds}` : seconds;
  let time = '';
  if (hours !== 0) {
    time = `${hours}:`;
  }
  if (minutes !== 0 || time !== '') {
    const m = minutes < 10 && time !== '' ? `0${minutes}` : String(minutes);
    time += `${m}:`;
  }
  if (time === '') {
    time = `0:${secStr}`;
  } else {
    time += secStr;
  }
  return time;
}
