import { GetServerSideProps } from 'next';
import { getWiseEnvironmentConfig, getWiseOAuthPageURL } from '../../db';
import { OAuthConnectPageProps } from './OAuthConnectPage';

// This block runs on server side (on your backend) before anything is rendered.
// Your app does not need this block if Wise redirect URL is already available for the frontend.
export const getServerSideProps: GetServerSideProps<OAuthConnectPageProps> = async () => {
  const config = getWiseEnvironmentConfig(); // returns Wise API clientId, clientSecret, redirectUri etc.
  return {
    props: {
      wiseOAuthPageURL: getWiseOAuthPageURL(),
      redirectUri: config.redirectUri,
    },
  };
};