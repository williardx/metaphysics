// @flow

import { toKey } from '../helpers';
import galaxy from '../apis/galaxy';
import httpLoader from './http';

export const galaxyLoader = httpLoader(galaxy);

export default (path: string, options: any = {}) =>
  galaxyLoader.load(toKey(path, options));
