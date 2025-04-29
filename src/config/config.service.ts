import * as path from 'path';

import * as customEnv from 'custom-env';
import * as ip from 'ip';
import ms from 'ms';
import { Injectable } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

process.env.NODE_ENV = process.env.NODE_ENV ?? 'dev';
const customEnvName = process.env.DOT_ENV_SUFFIX ?? process.env.NODE_ENV;
customEnv.env(customEnvName);
const env = Object.assign({}, process.env);

console.log('Using NODE_ENV: ' + process.env.NODE_ENV);
console.log('Using customEnvName: ' + customEnvName);

@Injectable()
export class ConfigService {
  // COMMON
  DEV = 'dev';
  TEST = 'test';
  PROD = 'prod';
  JEST = 'jest';
  DEBUG = (env.DEBUG ?? 'false').toLowerCase() !== 'false';

  NODE_ENV = env.NODE_ENV;
  PAGINATION_PAGE_SIZE = parseInt(env.PAGINATION ?? '250', 10);
  UPLOAD_LIMIT = parseInt(env.UPLOAD_LIMIT, 10) || 1024 * 1024 * 25; // 5G Byte

  WORK = {
    TASK: {
      TIME_CHECK_ALERT: ms('30m'),
    },
    WORK_CYCLE: {
      DAY: {
        LIMIT_TIME_RANGE: parseInt('62', 10),
      },
      WEEK: {
        LIMIT_TIME_RANGE: parseInt('50', 10),
      },
      MONTH: {
        LIMIT_TIME_RANGE: parseInt('24', 10),
      },
      YEAR: {
        LIMIT_TIME_RANGE: parseInt('10', 10),
      },
    },
  };

  // DIR
  ROOT_PATH = path.resolve('.');
  STATIC_PATH = 'statics';
  UPLOAD_PATH = 'uploads';

  // NETWORK
  LOCAL_IP: string = ip.address();
  PUBLIC_IP: string = env.PUBLIC_IP ?? this.LOCAL_IP;
  PORT: number = +env.PORT;
  HOST = env.HOST ?? `http://${this.PUBLIC_IP}:${this.PORT}`;
  SENTRY_DNS = env.SENTRY_DNS;

  // MIDDLEWARE
  RATE_LIMIT = {
    windowMs: 60_000,
    max: parseInt(env.RATE_LIMIT_MIN, 10) || 120,
  };

  THROTTLER = {
    LIMIT_CREATE: {
      ttl: 60,
      limit: 20,
    },
  };

  CORS: CorsOptions = {
    origin: true,
    credentials: true,
    methods: ['POST', 'PUT', 'GET', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders:
      'content-type, authorization, accept-encoding, user-agent, accept, cache-control, connection, cookie, x-company-id, x-language',
    exposedHeaders:
      'x-ratelimit-reset, set-cookie, content-disposition, x-file-name',
  };

  // DB
  DB_TYPE = (env.DB_TYPE ?? 'postgres') as 'postgres' | 'mysql';
  DB_HOST = env.DB_HOST ?? '127.0.0.1';
  DB_PORT = parseInt(env.DB_PORT ?? '5432', 10);
  DB_USERNAME = env.DB_USERNAME ?? 'postgres';
  DB_PASSWORD = env.DB_PASSWORD ?? '';
  DB_DATABASE = env.DB_DATABASE ?? '';
  DB_MAX_QUERY_EXECUTION_TIME = parseInt(
    env.DB_MAX_QUERY_EXECUTION_TIME ?? '5000',
    10,
  );

  CACHE_AUTH_ABILITY_TIMEOUT = ms('15s');
  CACHE_SHORT_TIMEOUT = ms('60s');
  CACHE_TIMEOUT = ms('15m');
  CACHE_LONG_TIMEOUT = ms('30d');
  CACHE_DB_TIMEOUT = ms('60s');
  ENABLE_CACHE_API = (env.ENABLE_CACHE_API ?? 'true').toLowerCase() !== 'false';

  // USER
  PASSWORD_SALT = parseInt(env.PASSWORD_SALT ?? '10', 10);
  REFRESH_SECRET = env.REFRESH_SECRET ?? 'refresh-super-secret';
  REFRESH_TOKEN_EXP = env.REFRESH_TOKEN_EXP ?? '7d';
  ACCESS_SECRET = env.ACCESS_SECRET ?? 'access-super-secret';
  ACCESS_TOKEN_EXP = env.ACCESS_TOKEN_EXP ?? '30d';
  OTP_ENABLE = (env.OTP_ENABLE ?? 'true').toLowerCase() !== 'false';
  OTP_SECRET = env.OTP_SECRET ?? 'super-secret';
  OTP_OPTION = {
    digits: 4,
    step: 60,
    window: 5, // total time = step * window (sec)
  };

  LINK_OPTION = {
    digits: 10,
    step: 0,
    window: (3 * 24 * 60 * 60) / 30,
  };

  // MAIL
  EMAIL_USE_TLS = (env.EMAIL_USE_TLS ?? 'true').toLowerCase() === 'true';
  EMAIL_HOST = env.EMAIL_HOST ?? 'smtp.gmail.com';
  EMAIL_USER = env.EMAIL_USER ?? '';
  EMAIL_PASSWORD = env.EMAIL_PASSWORD ?? '';
  EMAIL_PORT = parseInt(env.EMAIL_PORT ?? '587', 10);
  EMAIL_FROM_ADDRESS = env.EMAIL_FROM_ADDRESS ?? 'no-reply@nnha.io';
}

export const config = new ConfigService();
