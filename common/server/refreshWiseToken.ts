import { getSelectedWiseProfileId, getWiseEnvironmentConfig, getWiseRefreshToken } from '../db';
import store from '../db/mockDataStore';
import { toUrlencoded } from '../utils/toUrlencoded';

const MINUTE_IN_MS = 60 * 1000; 

export const refreshWiseToken = async () => {
  const config = getWiseEnvironmentConfig();
  const refreshToken = getWiseRefreshToken();
  const selectedProfileId = getSelectedWiseProfileId();
  const headers = new Headers();
  headers.set('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
  headers.set(
    'Authorization',
    `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`,
  );
  const body = toUrlencoded({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });
  const response = await fetch(`${config.host}/oauth/token`, { method: 'POST', headers, body });
  const result = await response.json();
  if (result.access_token) {
    store.set(selectedProfileId, {
      accessToken: result.access_token,
      refreshToken: result.refresh_token,
      // turns expires_in (seconds) into timestamp so we can use it later
      accessTokenExpiresAt: Date.now() + (result.expires_in * MINUTE_IN_MS),
    });
  }
};
