import { create, Mode } from '@transferwise/approve-api-action-helpers';
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
import { refreshWiseToken } from '../../common/server/refreshWiseToken';

type PageProps = {
  wiseOAuthPageURL?: string;
  redirectUri?: string;
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

    // We have a valid token
    return { props: {} };
  }

  // Accounts have not been connected. We render a "Connect your Wise account" button (see below)
  const wiseOAuthPageURL = getWiseOAuthPageURL();
  return { props: { wiseOAuthPageURL, redirectUri: config.redirectUri } };
};

// Frontend component of the page.
// Renders a button to connect Wise Account or your name if already connected.
const SCAPage: FC<PageProps> = (props) => {
  const handleSubmit = async (e: React.SyntheticEvent) => {
    // Prevent the browser from reloading the page
    e.preventDefault();
    // Create a test transfer
    const transfer = await fetch('/api/create-transfer').then((response) => response.json());
    // Fund that transfer using money on your account (SCA protected API call)
    const wiseSCARequest = create({ mode: Mode.SANDBOX });
    const result = await wiseSCARequest(`/api/fund-transfer/${transfer.id}`).then((response) => response.json());
    // TODO: handle success better way
    console.log(result);
  };

  return (
    <>
      <Head>
        <title>SCA Sample</title>
      </Head>
      <main>
        <div className="container">
          {!props.redirectUri ? (
            <>
              <h1>Strong Customer Authentication (SCA) sample</h1>
              <p>
                ... mention that "Fund a transfer" is SCA protected endpoint.
                ...We create a transfer and fund it.
              </p>

              <form method="post" onSubmit={handleSubmit}>
                <button type="submit" className="button primary">
                  Send money
                </button>
              </form>
            </>
          ) : (
            <>
              <h1>OAuth Connect Sample</h1>
              <p>
                You'll be redirected to Wise, where you can choose an account to
                authorize access.
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
};

export default SCAPage;
