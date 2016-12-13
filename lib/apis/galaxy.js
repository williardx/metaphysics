// @flow

import fetch from './fetch';

const { GALAXY_API_BASE, GALAXY_TOKEN } = process.env;
if (!GALAXY_API_BASE) { throw new Error('Please set DELTA_API_BASE in your ENV'); }
if (!GALAXY_TOKEN) { throw new Error('Please set GALAXY_TOKEN in your ENV'); }

export default (path: string) => {
  const headers = {
    Accept: 'application/vnd.galaxy-public+json',
    'Content-Type': 'application/hal+json',
    'Http-Authorization': GALAXY_TOKEN,
  };
  return fetch(`${GALAXY_API_BASE}/${path}`, { headers });
};
