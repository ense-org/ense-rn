// @flow
import { Audio } from 'expo-av';
import { get } from 'lodash';
import { Platform } from 'react-native';
import { REC_OPTS } from 'constants/Values';
import { filenameFrom, genColorCode } from 'utils/strings';
import { $post, AWS_ACCESS_KEY_ID, checkStatus, S3_BASE_URL } from 'utils/api/index';
import routes from 'utils/api/routes';
import type { NewEnseResponse } from 'utils/api/types';
import type { PublishInfo } from 'redux/ducks/run';

/**
 * Creating an ense takes a few steps:
 *
 * 1. Tell the ense backend that we want to make a new ense
 *    and get back temp s3 upload creds and a resource key.
 * 2. Upload the file to the s3 bucket
 * 3. Finish publishing the ense by giving the ense backend attributes
 *    like a title, replyHandle, privacy, etc.
 * @param recording
 * @param info
 * @returns {Promise<void>}
 */
export default async (recording: Audio.Recording, info: PublishInfo) => {
  const color = genColorCode();
  const mimeType = _mimeType();
  const create: NewEnseResponse = await $post(routes.newEnse(color), {
    mimeType,
    delayRelease: false,
    unlisted: info.unlisted,
  });
  const {
    contents: { dbKey, uploadKey },
  } = create;
  const formData = _formData(create, recording);
  await fetch(S3_BASE_URL, {
    method: 'POST',
    body: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(checkStatus);
  const fileUrl = `${S3_BASE_URL}${uploadKey}`;
  return $post(routes.publishEnse(color, dbKey), { ...info, fileUrl });
};

const _formData = (res: NewEnseResponse, recording: Audio.Recording) => {
  const { contents } = res;
  const type = _mimeType();
  const policy = get(contents, 'policyBundle');
  const formData = new FormData();
  formData.append('key', contents.uploadKey);
  formData.append('acl', 'public-read');
  formData.append('Content-Type', type);
  formData.append('AWSAccessKeyId', AWS_ACCESS_KEY_ID);
  formData.append('Policy', policy.policyDoc);
  formData.append('Signature', policy.signature);
  const uri = recording.getURI();
  const file = { uri, name: `${filenameFrom(uri)}${fileExt}`, type };
  // $FlowIssue - doesn't understand rn append
  formData.append('file', file);
  return formData;
};

const _mimeType = () => `audio/x-${fileExt.replace('.', '')}`;
const fileExt = Platform.select(REC_OPTS).extension;
