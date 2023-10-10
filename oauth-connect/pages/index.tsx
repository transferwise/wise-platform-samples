import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { FC } from 'react';

import { DEFAULT_REDIRECT_URI } from '../../common/const';
import {
  getWiseEnvironmentConfig,
  getSelectedWiseProfileId,
  isWiseTokenAboutToExpire,
  getWiseOAuthPageURL,
} from '../../common/db';
import { fetchProfileDetails } from '../../common/server/fetchProfileDetails';
import { refreshWiseToken } from '../../common/server/refreshWiseToken';

type PageProps = {
  wiseOAuthPageURL?: string;
  redirectUri?: string;
  name?: string;
};

// This block runs on server side (on your backend) before anything is rendered.
// We check if Wise account has already been linked. If not, we the UI will render "Connect" button.
export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
  const config = getWiseEnvironmentConfig(); // returns Wise API clientId, clientSecret, redirectUri etc.

  // Special page for setting up environment vars. You wouldn't need it on your app!
  if (!config) {
    return { redirect: { destination: '/env-setup', permanent: false } };
  }

  // Check if accounts have been connected before (based on if selected profile exists)
  const isWiseAccountConnected = Boolean(getSelectedWiseProfileId());
  if (isWiseAccountConnected) {
    // Generate new token if it is expired
    if (isWiseTokenAboutToExpire()) {
      await refreshWiseToken();
    }

    // We have a valid token, so we can call one of Wise API endpoints
    const profile = await fetchProfileDetails();
    return { props: { name: profile.fullName } };
  }

  // Accounts have not been connected. We render a "Connect your Wise account" button (see below)
  const wiseOAuthPageURL = getWiseOAuthPageURL();
  return { props: { wiseOAuthPageURL, redirectUri: config.redirectUri } };
};

// Frontend component of the page. 
// Renders a button to connect Wise Account or your name if already connected.
const OAuthConnectPage: FC<PageProps> = (props) => (
  <>
    <Head>
      <title>OAuth Connect Sample</title>
    </Head>
    <main>
      <div className="container">
        {props.name ? (
          <>
            <h1>Hello {props.name}!</h1>
            <p>Your account is successfully connected.</p>
          </>
        ) : (
          <>
            <h1>OAuth Connect Sample</h1>
            <p>
              You'll be redirected to Wise, where you can choose an account
              to authorize access.
            </p>
            {props.redirectUri !== DEFAULT_REDIRECT_URI && (
              <p className="bg-light border-1 p-a-1">
                The redirectUri in your config is different than this sample
                app uses.
                <br />
                When Wise OAuth page redirects you back please open the
                following link:
                <br />
                <code>
                  http://localhost:3000/wise-redirect?code=...&profileId=...
                </code>
              </p>
            )}
            <a href={props.wiseOAuthPageURL} className="button primary">
              Connect your Wise account
            </a>
          </>
        )}
      </div>
    </main>
  </>
);

export default OAuthConnectPage;
