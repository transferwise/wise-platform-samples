import { GetServerSideProps } from 'next';
import { useEffect } from 'react';

import { exchangeAuthCodeForToken } from '../../common/server/exchangeAuthCodeForToken';

const MESSAGE_SUCCESS = 'wise-oauth-success';

// We're letting the tab that opened popup (pages/index.ts) know that it can be closed now.
// There is no need to send any data using this way so just a
// message "we-are-done-and-you-can-close-me" is enough.
// https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
const notifyOpener = (message: string) => {
  if (window.opener) {
    window.opener.postMessage(message, 'http://localhost:3000');
  }
};

// After granting consent on Wise website you will be redirected back to this page.
// The following block must run on server side. It reads the "code" and "profileId" parameters from the URL,
// then generates (and stores) Wise API tokens.
export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  await exchangeAuthCodeForToken(
    query.code as string,
    query.profileId as string
  );
  return { props: {} };
};


// Frontend side of the page. Here we're only notifying parent tab (opener) that we can be closed now.
export default function WiseRedirectPage() {

  // runs on page load
  useEffect(() => {
    notifyOpener(MESSAGE_SUCCESS);
  }, []);

  return <p>Nothing to see here..</p>;
}
