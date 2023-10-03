import { IncomingMessage } from 'http';

// Makes accessing POST parameters easier
export const getPostBodyAsURLSearchParams = async (req: IncomingMessage): Promise<URLSearchParams> => {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => resolve(new URLSearchParams(body)));
  });
};
