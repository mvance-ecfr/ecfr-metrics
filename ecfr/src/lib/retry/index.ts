import * as utils from './utils';
import { AxiosInstance } from 'axios';

export default function (axios: AxiosInstance, options = {}) {
  const { isRetryable, wait, retry } = { ...utils, ...options };

  return async function (error: any) {
    if (isRetryable(error)) {
      await wait(error);
      return retry(axios, error);
    } else {
      throw error;
    }
  };
}
