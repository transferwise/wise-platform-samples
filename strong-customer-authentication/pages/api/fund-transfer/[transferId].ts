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
const X_SIGNATURE = 'X-Signature';

// This code runs on server side (on your backend).
// We check if Wise account has been connected and return Wise profile details 
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
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

  // Setup headers
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  headers.set('Authorization', `Bearer ${oauthToken}`);
  // Pass on X_2FA_APPROVAL_HEADER if frontend sent it to us
  if (req.headers[X_2FA_APPROVAL_HEADER]) {
    headers.set(X_2FA_APPROVAL_HEADER, req.headers[X_2FA_APPROVAL_HEADER] as string);
  }

  const url = `${config.host}/v3/profiles/${selectedWiseProfileId}/transfers/${req.query.transferId}/payments`;
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ type: 'BALANCE' }),
    headers,
  });

  const result = await response.json();
  const x2faApproval = response.headers.get(X_2FA_APPROVAL_HEADER);
  const x2faApprovalResult = response.headers.get(X_2FA_APPROVAL_RESULT_HEADER);
  if (x2faApproval && x2faApprovalResult) {
    res.setHeader(X_2FA_APPROVAL_HEADER, x2faApproval);
    res.setHeader(X_2FA_APPROVAL_RESULT_HEADER, x2faApprovalResult);
  }

  res.statusCode = response.status;
  res.json(result);
}
