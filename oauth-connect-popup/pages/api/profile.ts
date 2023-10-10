import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getSelectedWiseProfileId,
  isWiseTokenAboutToExpire,
} from '../../../common/db';
import { fetchProfileDetails } from '../../../common/server/fetchProfileDetails';
import { refreshWiseToken } from '../../../common/server/refreshWiseToken';

type ResponseData = {
  message: string;
};

// This code runs on server side (on your backend).
// We check if Wise account has been connected and return Wise profile details 
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Check if accounts have been connected before (based on if selected profile exists)
  const isWiseAccountConnected = Boolean(getSelectedWiseProfileId());

  // Wise account not connected, so cannot call Wise API
  if (!isWiseAccountConnected) {
    res.statusCode = 404;
    res.json({ message: 'Wise account not connected' });
    return;
  }

  // Generate new token if it is expired
  if (isWiseTokenAboutToExpire()) {
    await refreshWiseToken();
  }

  // We have a valid token, so we can proceed with the call to Wise API
  const profile = await fetchProfileDetails();
  res.statusCode = 200;
  res.json(profile);
}
