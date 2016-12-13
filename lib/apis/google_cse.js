// @flow

import fetch from './fetch';

const { GOOGLE_CSE_API_BASE } = process.env;
if (!GOOGLE_CSE_API_BASE) { throw new Error('Please set GOOGLE_CSE_API_BASE in your ENV'); }

export default (path: string) => fetch(`${GOOGLE_CSE_API_BASE}/${path}`);
