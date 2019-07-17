// @flow
import { fileExtFrom, filenameFrom } from 'utils/strings';
import { $post, AWS_ACCESS_KEY_ID, checkStatus, S3_BASE_URL } from 'utils/api/index';
import routes from 'utils/api/routes';
import type { UploadResponse } from 'utils/api/types';

export default async (localUri: string, type: string) => {
  const mimeType = type.includes('/') ? type : `${type}/${fileExtFrom(localUri)}`;
  const create: UploadResponse = await $post(routes.upload, { mimeType });
  const formData = _formData(create, localUri, mimeType);
  await fetch(S3_BASE_URL, {
    method: 'POST',
    body: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(checkStatus);
  await $post(routes.uploadDone(create.contents.fileID));
  return $post(routes.accountInfo, { profpic: create.contents.fileID });
};

const _formData = (res: UploadResponse, uri: string, contentType: string) => {
  const { contents } = res;
  const formData = new FormData();
  formData.append('key', contents.filepath);
  formData.append('acl', 'public-read');
  formData.append('Content-Type', contentType);
  formData.append('AWSAccessKeyId', AWS_ACCESS_KEY_ID);
  formData.append('Policy', contents.policyDoc);
  formData.append('Signature', contents.signature);
  const name = filenameFrom(uri);
  const file = { uri, name, type: contentType };
  // $FlowIssue - doesn't understand rn append
  formData.append('file', file);
  return formData;
};
