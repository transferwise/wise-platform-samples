// This component/page is responsible for making sure that all the
// required variables are stored in mock storage.
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useState } from 'react';

import { DEFAULT_REDIRECT_URI } from '../../common/const';
import store from '../../common/db/mockDataStore';
import { getPostBodyAsURLSearchParams } from '../../common/utils/getPostBodyAsURLSearchParams';

// This function runs only on the server side.
// If form gets submitted, we store the variables in our mock data store
export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  if (req.method === 'POST') {
    const body = await getPostBodyAsURLSearchParams(req);
    store.set('config', {
      host: body.get('host'),
      clientId: body.get('clientId'),
      clientSecret: body.get('clientSecret'),
      redirectUri: body.get('redirectUri'),
      oauthPageUrl: body.get('oauthPageUrl'),
    });
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
  return { props: {} };
};

export default function EnvSetupPage() {
  const [redirectUri, setRedirectUri] = useState(DEFAULT_REDIRECT_URI);
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
                Sample app stores those locally in <code>storage.json</code> file (root dir).<br />
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
                value={redirectUri}
                onChange={(e) => setRedirectUri(e.target.value)}
                required
              />
              {redirectUri !== DEFAULT_REDIRECT_URI && (
                <p className="bg-light border-1 p-a-1">
                  This sample app expects redirect URL to be{' '}
                  <code>http://localhost:3000/wise-redirect</code>.<br /><br />
                  You can still use the app though. Wise OAuth page redirects you back to:<br />
                  <code>
                    {redirectUri}?code=123&profileId=223
                  </code>
                  <br /> 
                  You just have to copy the parameters and navigate to:<br />
                  <code>
                    http://localhost:3000/wise-redirect?code=123&profileId=223
                  </code>
                </p>
              )}
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
}
