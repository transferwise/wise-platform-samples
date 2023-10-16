import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { FC, useState, useEffect } from 'react';

import { DEFAULT_REDIRECT_URI } from '../../common/const';
import { getWiseEnvironmentConfig, getWiseOAuthPageURL } from '../../common/db';
import { popupFlow } from '../src/popupHandler';

type PageProps = {
  wiseOAuthPageURL: string;
  redirectUri: string;
};

// Makes sure that Wise environment vars (clientId, clientSecret, redirectUri etc.) are set up.
export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
  const config = getWiseEnvironmentConfig(); // returns Wise API clientId, clientSecret, redirectUri etc.
  
   // Special page for setting up environment vars. You wouldn't need it on your app!
  if (!config) {
    return { redirect: { destination: '/env-setup', permanent: false } };
  }

  // Passes some props from backend to frontend (see below). Might not be relevant for your setup
  const wiseOAuthPageURL = getWiseOAuthPageURL();
  return { props: { wiseOAuthPageURL, redirectUri: config.redirectUri } };
};

// Frontend component of the page.
// Renders a button to connect Wise Account or your name if already connected.
const OAuthConnectPopupPage: FC<PageProps> = (props) => {
  const [name, setName] = useState();

  // Calls your backend to get Wise profile details (see /pages/api/profile.ts)
  const getWiseProfile = () => {
    fetch('/api/profile')
      .then((response) => response.json())
      .then((result) => {
        if (result.fullName) {
          setName(result.fullName);
        }
      });
  };

  // Runs on page load
  useEffect(() => {
    getWiseProfile();
  }, []);

  return (
    <>
      <Head>
        <title>OAuth Connect Popup Sample</title>
      </Head>
      <main>
        <div className="container">
          {name ? (
            <>
              <h1>Hello {name}!</h1>
              <p>Your account is successfully connected.</p>
            </>
          ) : (
            <>
              <h1>OAuth Connect Popup Sample</h1>
              <p>
                You'll be redirected to Wise, where you can choose an account to
                authorize access.
              </p>
              {props.redirectUri !== DEFAULT_REDIRECT_URI && (
                <p className="bg-light border-1 p-a-1">
                  The redirectUri in your config is different than this sample
                  app uses.
                  <br />
                  When Wise OAuth page redirects you back, please change the URL
                  within the popup to:
                  <br />
                  <code>
                    http://localhost:3000/wise-redirect?code=...&profileId=...
                  </code>
                </p>
              )}
              <button
                onClick={() => {
                  // Normally you would do a full redirect to Wise OAuth page here.
                  // We are creating a new popup and opening the same page within that popup instead.
                  // This requires some communication between current page and the popup.
                  // Have a look at '/src/popupHandler.ts' for details on that.
                  popupFlow(props.wiseOAuthPageURL).then(() => {
                    getWiseProfile(); // do the initial call again
                  });
                }}
                className="button primary"
              >
                Connect your Wise account
              </button>
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default OAuthConnectPopupPage;
