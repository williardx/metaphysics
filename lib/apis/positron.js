// @flow
import fetch from './fetch';

const { POSITRON_API_BASE } = process.env;
if (!POSITRON_API_BASE) { throw new Error('Please set POSITRON_API_BASE in your ENV'); }

export default (path: string) => fetch(`${POSITRON_API_BASE}/${path}`);
