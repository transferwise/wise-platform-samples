import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { FC } from 'react';

import { DEFAULT_REDIRECT_URI } from '../../common/const';
import {
  getWiseEnvironmentConfig,
  getSelectedWiseProfileId,
  isWiseTokenAboutToExpire,
} from '../../common/db';
import { fetchProfileDetails } from '../../common/server/fetchProfileDetails';
import { refreshWiseToken } from '../../common/server/refreshWiseToken';

// TODO: better comment.
// This block runs on server side. So should run on your backend.
export const getServerSideProps: GetServerSideProps<
  OAuthConnectPageProps
> = async () => {
  // In order to make any calls to Wise API some environment variables must be set (clientId, clientSecret etc).
  // In sample app we collect those in special page (/env-setup).
  // Your application would store those details somewhere else, so no need to go in-depth on that setup.
  const config = getWiseEnvironmentConfig();
  if (!config) {
    return {
      redirect: {
        destination: '/env-setup',
        permanent: false,
      },
    };
  }

  // Check if accounts have been linked before
  const isWiseAccountLinked = Boolean(getSelectedWiseProfileId());
  if (isWiseAccountLinked) {
    // no need to link again

    // 3. token is expired, refresh token
    if (isWiseTokenAboutToExpire()) {
      await refreshWiseToken();
    }

    // We have a valid token
    const profile = await fetchProfileDetails();
    return { props: { name: profile.fullName } };
  }

  // We don't have a previous link on database, so we render the page
  // where you can link your Wise account (current page, see below)
  const wiseOauthPageUrl = `${config.oauthPageUrl}?client_id=${config.clientId}&redirect_uri=${config.redirectUri}`;
  return { props: { wiseOauthPageUrl, redirectUri: config.redirectUri } };
};

type OAuthConnectPageProps = {
  wiseOauthPageUrl?: string;
  redirectUri?: string;
  name?: string;
};

// TODO: comment, keys: frontend component of the page
const OAuthConnectPage: FC<OAuthConnectPageProps> = ({
  wiseOauthPageUrl,
  redirectUri,
  name,
}) => {
  return (
    <>
      <Head>
        <title>OAuth Connect Sample</title>
      </Head>
      <main>
        <div className="container">
          <fieldset>
            <legend>OAuth Connect Sample</legend>
            {name ? (
              <>
                <h3>Hello {name}!</h3>
                <p>Your account is successfully linked.</p>
              </>
            ) : (
              <>
                <p>
                  You'll be redirected to Wise, where you can choose an account to authorize access.
                </p>
                {redirectUri !== DEFAULT_REDIRECT_URI && (
                  <p className="bg-light border-1 p-a-1">
                    The redirectUri in your config is different than this sample
                    app uses.
                    <br />
                    When Wise OAuth page redirects you back please open the following link:
                    <br />
                    <code>
                      http://localhost:3000/wise-redirect?code=...&profileId=...
                    </code>
                  </p>
                )}
                <a href={wiseOauthPageUrl} className="button primary">
                  Connect your Wise account
                </a>
              </>
            )}
          </fieldset>
        </div>
      </main>
    </>
  );
};

export default OAuthConnectPage;
