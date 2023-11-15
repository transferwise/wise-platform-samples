import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getSelectedWiseProfileId,
  getWiseAccessToken,
  getWiseEnvironmentConfig,
  isWiseTokenAboutToExpire,
} from '../../../common/db';
import { refreshWiseToken } from '../../../common/server/refreshWiseToken';

// This code runs on server side (on your backend).
// This endpoint will create a transfer (quote + recipient + transfer) on Wise.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<unknown>
) {
  const config = getWiseEnvironmentConfig();
  const oauthToken = getWiseAccessToken();
  const selectedWiseProfileId = getSelectedWiseProfileId();

  // Wise account not connected, so cannot call Wise API
  if (!selectedWiseProfileId) {
    res.statusCode = 404;
    return;
  }

  // Generate new token if it is expired
  if (isWiseTokenAboutToExpire()) {
    await refreshWiseToken();
  }

  // We have a valid token, so we can proceed with the call to Wise API
  // 1. Creates a quote (https://docs.wise.com/api-docs/api-reference/quote)
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

  // 2. Creates a new recipient account (https://docs.wise.com/api-docs/api-reference/recipient)
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

  // 3. Transfer (https://docs.wise.com/api-docs/api-reference/transfer)
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
