import store from './mockDataStore';
import type { Config } from '../types/Config';
import type { Tokens } from '../types/Tokens';

const ONE_HOUR_IN_MS = 60 * 60 * 1000;

export const getSelectedWiseProfileId = () => store.get('selectedProfileId') as string;

export const getWiseEnvironmentConfig = () => store.get('config') as Config;

export const getWiseTokens = () => {
  const selectedProfileId = getSelectedWiseProfileId();
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