import Head from 'next/head';
import { FC } from 'react';

import { DEFAULT_REDIRECT_URI } from '../../const';

export type OAuthConnectPageProps = {
  wiseOAuthPageURL?: string;
  redirectUri?: string;
};

// Frontend component of the page. 
// Renders a button to connect your Wise account.
const OAuthConnectPage: FC<OAuthConnectPageProps> = (props) => (
  <>
    <Head>
      <title>Connect your Wise account</title>
    </Head>
    <main>
      <div className="container">
        <h1>Connect your Wise account</h1>
        <p>
          You'll be redirected to Wise, where you can choose an account to
          authorize access.
        </p>
        {props.redirectUri !== DEFAULT_REDIRECT_URI && (
          <p className="bg-light border-1 p-a-1">
            The redirectUri in your config is different than this sample app
            uses.
            <br />
            When Wise OAuth page redirects you back please open the following
            link:
            <br />
            <code>
              http://localhost:3000/wise-redirect?code=...&profileId=...
            </code>
          </p>
        )}
        <a href={props.wiseOAuthPageURL} className="button primary">
          Connect your Wise account
        </a>
      </div>
    </main>
  </>
);

export default OAuthConnectPage;
