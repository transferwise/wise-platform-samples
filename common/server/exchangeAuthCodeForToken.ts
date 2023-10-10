import { getWiseEnvironmentConfig } from '../db';
import { store } from '../db';
import { toUrlencoded } from '../utils/toUrlencoded';

// Obtain Wise access token and refresh token.
// https://docs.wise.com/api-docs/api-reference/user-tokens#authzcode
export const exchangeAuthCodeForToken = async (
  authCode: string,
  profileId: string
) => {
  const config = getWiseEnvironmentConfig();
  const headers = new Headers();
  headers.set(
    'Content-Type',
    'application/x-www-form-urlencoded;charset=UTF-8'
  );
  headers.set(
    'Authorization',
    `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString(
      'base64'
    )}`
  );

  const body = toUrlencoded({
    grant_type: 'authorization_code',
    client_id: config.clientId,
    code: authCode.toString(),
    redirect_uri: config.redirectUri,
  });

  const response = await fetch(`${config.host}/oauth/token`, {
    method: 'POST',
    headers,
    body,
  });
  const result = await response.json();
  // Stores Wise profileId and tokens in our demo database (storage.json).
  // In a production environment, you would associate these tokens with a logged-in user
  // in your system.
  store.set('selectedProfile', { id: profileId });
  store.set(profileId, {
    accessToken: result.access_token,
    refreshToken: result.refresh_token,
    // Turns expires_in (seconds) into JS timestamp (milliseconds) so we can use it later
    accessTokenExpiresAt: Date.now() + result.expires_in * 1000,
  });
};
