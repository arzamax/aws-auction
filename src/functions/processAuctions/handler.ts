import 'source-map-support/register';
import createHttpError from 'http-errors';

import { getEndedAuctions } from '@libs/getEndedAuctions';
import { closeAuction } from '@libs/closeAuction';

const processAuctions = async () => {
  try {
    const auctionsToClose = await getEndedAuctions();
    await Promise.all(auctionsToClose.map(auction => closeAuction(auction.id)));
    return { closed: auctionsToClose.length };
  } catch (error) {
    throw new createHttpError.InternalServerError(error);
  }
}

export const main = processAuctions;