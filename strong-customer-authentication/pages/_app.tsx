import type { AppProps } from 'next/app';

import '../../common/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
