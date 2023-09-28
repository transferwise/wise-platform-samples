import { GetServerSideProps } from 'next';

import { exchangeAuthCodeForToken } from '../../common/server/exchangeAuthCodeForToken';

// After granting consent on Wise website you will be redirected back to this page.
// The code must run on server side. There is no need for frontend views.
// It reads the "code" and "profileId" parameters from the URL, then generates (and stores)
// Wise API tokens and redirects to another page where you can start making API calls.
export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  await exchangeAuthCodeForToken(
    query.code as string,
    query.profileId as string
  );
  // Redirect back to index page
  return {
    redirect: {
      destination: '/',
      permanent: false,
    },
  };
};

// You would always be redirected on the server side
export default function WiseRedirectPage() {
  return <p>Nothing to see here..</p>;
}
