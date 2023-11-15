import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getSelectedWiseProfileId,
  getWiseAccessToken,
  getWiseEnvironmentConfig,
  isWiseTokenAboutToExpire,
} from '../../../../common/db';
import { refreshWiseToken } from '../../../../common/server/refreshWiseToken';

type ResponseData = {
  message: string;
};

const X_2FA_APPROVAL_HEADER = 'x-2fa-approval';
const X_2FA_APPROVAL_RESULT_HEADER = 'x-2fa-approval-result';

// This code runs on server side (on your backend).
// This call will fund a transfer using money on your Wise account
// https://docs.wise.com/api-docs/api-reference/transfer#fund
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
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

  // Setup headers
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  headers.set('Authorization', `Bearer ${oauthToken}`);
  
  // Pass on X_2FA_APPROVAL_HEADER if frontend sent it to us
  if (req.headers[X_2FA_APPROVAL_HEADER]) {
    headers.set(
      X_2FA_APPROVAL_HEADER,
      req.headers[X_2FA_APPROVAL_HEADER] as string
    );
  }

  // Calls fund a transfer endpoint on Wise (SCA protected endpoint)
  // https://docs.wise.com/api-docs/api-reference/transfer#fund
  const url = `${config.host}/v3/profiles/${selectedWiseProfileId}/transfers/${req.query.transferId}/payments`;
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ type: 'BALANCE' }),
    headers,
  });

  const result = await response.json();

  // Pass on some headers. Based on that, frontend widget will know when to display
  // popup wih challenges
  const x2faApproval = response.headers.get(X_2FA_APPROVAL_HEADER);
  const x2faApprovalResult = response.headers.get(X_2FA_APPROVAL_RESULT_HEADER);
  if (x2faApproval && x2faApprovalResult) {
    res.setHeader(X_2FA_APPROVAL_HEADER, x2faApproval);
    res.setHeader(X_2FA_APPROVAL_RESULT_HEADER, x2faApprovalResult);
  }

  res.statusCode = response.status;
  res.json(result);
}
