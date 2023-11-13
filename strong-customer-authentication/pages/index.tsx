import { create, Mode } from '@transferwise/approve-api-action-helpers';
import Head from 'next/head';
import React, { FC } from 'react';

import {
  getWiseEnvironmentConfig,
  getSelectedWiseProfileId,
  isWiseTokenAboutToExpire,
} from '../../common/db';
import { refreshWiseToken } from '../../common/server/refreshWiseToken';

// This block runs on server side (on your backend) before anything is rendered.
// We check if Wise account has already been linked. If not, we redirect to "Connect your Wise account" page
export const getServerSideProps = async () => {
  // Special page for setting up environment vars. You wouldn't need it on your app!
  if (!Boolean(getWiseEnvironmentConfig())) {
    return { redirect: { destination: '/env-setup', permanent: false } };
  }

  // Accounts have not been connected (based on if selected profile exists). We render a "Connect your Wise account" page
  const isWiseAccountConnected = Boolean(getSelectedWiseProfileId());
  if (!isWiseAccountConnected) {
    return { redirect: { destination: '/oauth-connect', permanent: false } };
  }

  // Generate new token if it is expired
  if (isWiseTokenAboutToExpire()) {
    await refreshWiseToken();
  }

  // We have a valid token
  return { props: {} };
};

// Frontend component of the page.
// Renders a button to connect Wise Account or your name if already connected.
const SCAPage: FC = () => {
  const handleSubmit = async (e: React.SyntheticEvent) => {
    // Prevent the browser from reloading the page
    e.preventDefault();
    // Create a test transfer
    const transfer = await fetch('/api/create-transfer').then((response) =>
      response.json()
    );
    // Fund that transfer using money on your account (SCA protected API call)
    const wiseSCARequest = create({ mode: Mode.SANDBOX });
    const result = await wiseSCARequest(
      `/api/fund-transfer/${transfer.id}`
    ).then((response) => response.json());
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
          <h1>Strong Customer Authentication (SCA) sample</h1>
          <p>
            ... mention that "Fund a transfer" is SCA protected endpoint. ...We
            create a transfer and fund it.
          </p>

          <form method="post" onSubmit={handleSubmit}>
            <button type="submit" className="button primary">
              Send money
            </button>
          </form>
        </div>
      </main>
    </>
  );
};

export default SCAPage;
