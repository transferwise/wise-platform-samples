import { create, Mode } from '@transferwise/approve-api-action-helpers';
import Head from 'next/head';
import React, { FC, useState } from 'react';

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
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    // Prevent the browser from reloading the page
    e.preventDefault();
    setIsSuccess(false);
    // Create a test transfer
    const transfer = await fetch('/api/create-transfer').then((response) =>
      response.json()
    );
    // Fund that transfer using money on your account (SCA protected API call)
    const wiseSCARequest = create({ mode: Mode.SANDBOX });
    await wiseSCARequest(`/api/fund-transfer/${transfer.id}`);
    setIsSuccess(true);
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
            Clicking on "Send money" creates a dummy transfer and tries to fund it using
            your Wise account.
            <br />
            <a
              href="https://docs.wise.com/api-docs/api-reference/transfer#fund"
              target="_blank"
            >
              Fund a transfer
            </a> is SCA protected endpoint. A popup will appear asking
            to confirm the action.
          </p>
          {isSuccess && <p className="text-success text-center">Success!</p>}
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
