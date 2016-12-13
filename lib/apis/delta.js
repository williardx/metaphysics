// @flow

import fetch from './fetch';
const { DELTA_API_BASE } = process.env;
if (!DELTA_API_BASE) { throw new Error('Please set DELTA_API_BASE in your ENV'); }

export default (path: string) => fetch(`${DELTA_API_BASE}/${path}`);
