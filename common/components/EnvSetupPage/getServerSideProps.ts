import { GetServerSideProps } from 'next';
import { store } from '../../db';
import { getPostBodyAsURLSearchParams } from '../../utils/getPostBodyAsURLSearchParams';

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