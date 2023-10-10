import JSONdb from '../lib/Simple-JSONdb';

import type { Config } from '../types/Config';
import type { SelectedProfile } from '../types/SelectedProfile';
import type { Tokens } from '../types/Tokens';

const ONE_HOUR_IN_MS = 60 * 60 * 1000;

// Instead of proper database we have a simple JSON file
export const store = new JSONdb('../storage.json');

export const getSelectedWiseProfileId = () => {
  const selectedProfile = store.get('selectedProfile');
  if (!selectedProfile) {
    return null;
  }
  return (selectedProfile as SelectedProfile).id;
}

export const getWiseEnvironmentConfig = () => store.get('config') as Config;

export const getWiseOAuthPageURL = () => {
  const config = getWiseEnvironmentConfig();
  return `${config.oauthPageUrl}?client_id=${config.clientId}&redirect_uri=${config.redirectUri}`;
};

export const getWiseTokens = () => {
  const selectedProfileId = getSelectedWiseProfileId();
  if (!selectedProfileId) {
    throw Error('No selectedProfileId');
  }
  return store.get(selectedProfileId) as Tokens;
};

export const getWiseAccessToken = () => {
  return getWiseTokens().accessToken;
};

export const getWiseRefreshToken = () => {
  return getWiseTokens().refreshToken;
};

export const isWiseTokenAboutToExpire = ()=> {
  const tokens = getWiseTokens();
  // Token already expired or will expire within 1 hour
  return Date.now() > parseInt(tokens.accessTokenExpiresAt, 10) - ONE_HOUR_IN_MS;
};