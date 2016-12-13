// @flow

import { assign } from 'lodash';
import fetch from './fetch';
import config from '../../config';

const { GRAVITY_API_BASE } = process.env;
if (!GRAVITY_API_BASE) { throw new Error('Please set GRAVITY_API_BASE in your ENV'); }

export default (path: string, accessToken: string) => {
  const headers = { 'X-XAPP-TOKEN': config.GRAVITY_XAPP_TOKEN };
  if (accessToken) assign(headers, { 'X-ACCESS-TOKEN': accessToken });
  return fetch(`${GRAVITY_API_BASE}/${path}`, { headers });
};
