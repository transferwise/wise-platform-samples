import { getSelectedWiseProfileId, getWiseEnvironmentConfig, getWiseAccessToken } from '../db';

export const fetchProfileDetails = async () => {
  const config = getWiseEnvironmentConfig();
  const selectedProfileId = getSelectedWiseProfileId();
  if (!selectedProfileId) {
    throw Error('No selectedProfileId');
  }
  const oauthToken = getWiseAccessToken();
  const headers = new Headers();
  headers.set('Authorization', `Bearer ${oauthToken}`);
  const response = await fetch(`${config.host}/v2/profiles/${selectedProfileId}`, { headers });
  const result = await response.json();
  return result;
};
