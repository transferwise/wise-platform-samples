import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getSelectedWiseProfileId,
  getWiseAccessToken,
  getWiseEnvironmentConfig,
  isWiseTokenAboutToExpire,
} from '../../../common/db';
import { refreshWiseToken } from '../../../common/server/refreshWiseToken';

// This code runs on server side (on your backend).
// We check if Wise account has been connected and return Wise profile details
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<unknown>
) {
  const config = getWiseEnvironmentConfig();
  const oauthToken = getWiseAccessToken();

  // Check if accounts have been connected before (based on if selected profile exists)
  const selectedWiseProfileId = getSelectedWiseProfileId();
  const isWiseAccountConnected = Boolean(selectedWiseProfileId);

  // Wise account not connected, so cannot call Wise API
  if (!isWiseAccountConnected) {
    res.statusCode = 404;
    return;
  }

  // Generate new token if it is expired
  if (isWiseTokenAboutToExpire()) {
    await refreshWiseToken();
  }

  // We have a valid token, so we can proceed with the call to Wise API
  // 1. Creates a quote (TODO: link to docs)
  const quote = await fetch(
    `${config.host}/v3/profiles/${selectedWiseProfileId}/quotes`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${oauthToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceCurrency: 'GBP',
        targetCurrency: 'USD',
        sourceAmount: 10,
        targetAmount: null,
      }),
    }
  ).then((response) => response.json());

  // 2. Creates a new recipient account (TODO: link to docs)
  const recipient = await fetch(`${config.host}/v1/accounts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${oauthToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      accountHolderName: 'John Smith',
      currency: 'USD',
      type: 'ABA',
      details: {
        address: {
          city: 'New York',
          countryCode: 'US',
          postCode: '10025',
          state: 'NY',
          firstLine: '158 Wall Street',
        },
        legalType: 'PRIVATE',
        abartn: '064000020',
        accountType: 'CHECKING',
        accountNumber: '40000000000',
        email: 'example@foobar.com',
      },
    }),
  }).then((response) => response.json());

  // 3. Transfer (TODO: link to docs)
  const transfer = await fetch(`${config.host}/v1/transfers`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${oauthToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      targetAccount: recipient.id,
      quoteUuid: quote.id,
      customerTransactionId: crypto.randomUUID(),
      details: {
        reference: 'my ref',
        transferPurpose: 'verification.transfers.purpose.pay.bills',
      },
    }),
  }).then((response) => response.json());

  res.statusCode = 200;
  res.json(transfer);
}
