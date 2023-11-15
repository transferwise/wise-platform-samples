// Special page for setting up environment vars. You wouldn't need it on your app!
import Head from 'next/head';
import React, { FC } from 'react';

import { DEFAULT_REDIRECT_URI } from '../../const';

export const EnvSetupPage: FC = () => {
  return (
    <>
      <Head>
        <title>Environment setup page</title>
      </Head>
      <main>
        <div className="container">
          {/* Submitting basically reloads the same page, but now getServerSideProps will receive POST parameters */}
          <form action="/" method="POST">
            <fieldset>
              <legend>Environment variables</legend>
              <p className="m-t-1">
                In order to make calls to the Wise API, it's necessary to
                configure certain environment variables.
                <br />
                Sample app stores those locally in <code>
                  storage.json
                </code>{' '}
                file (root dir).
                <br />
                <a href="https://docs.wise.com/api-docs/features/authentication-access">
                  Read more about authentication & access
                </a>
                .
              </p>
              <label htmlFor="host">Host</label>
              <input
                type="text"
                name="host"
                id="host"
                defaultValue="https://sandbox.transferwise.tech/gateway"
                required
              />
              <label htmlFor="clientId">Client Id</label>
              <input type="text" name="clientId" id="clientId" required />
              <label htmlFor="clientSecret">Client Secret</label>
              <input
                type="text"
                name="clientSecret"
                id="clientSecret"
                required
              />
              <label htmlFor="redirectUri">Redirect URI</label>
              <input
                type="text"
                name="redirectUri"
                id="redirectUri"
                defaultValue={DEFAULT_REDIRECT_URI}
                required
              />
              <p className="bg-light border-1 p-a-1">
                This sample app expects redirect URL to be{' '}
                <code>{DEFAULT_REDIRECT_URI}</code>.<br />
                If you haven't registered that URL with us, please copy code and
                profileId and navigate to
                <br />
                <code>
                  http://localhost:3000/wise-redirect?code=123&profileId=223
                </code>
              </p>
              <label htmlFor="oauthPageUrl">Wise OAuth page URL</label>
              <input
                type="text"
                name="oauthPageUrl"
                id="oauthPageUrl"
                defaultValue="https://sandbox.transferwise.tech/oauth/authorize"
                required
              />
              <button type="submit" className="m-t-1">
                Save
              </button>
            </fieldset>
          </form>
        </div>
      </main>
    </>
  );
};
