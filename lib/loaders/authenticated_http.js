// @flow
import timer from '../timer';
import { verbose, error } from '../loggers';

export default (api: (path: string, headers: any) => Promise<any>, headers: any) => {
  return (path: string) => {
    const clock = timer(path);
    clock.start();
    return new Promise((resolve, reject) => {
      verbose(`Requested: ${path}`);
      api(path, headers)
        .then(({ body }) => {
          resolve(body);
          clock.end();
        })
        .catch((err) => {
          error(path, err);
          reject(err);
        });
    });
  };
};
