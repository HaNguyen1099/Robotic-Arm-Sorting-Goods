/* eslint-disable @typescript-eslint/typedef,@typescript-eslint/no-unused-vars */
import util from 'util';
import _ from 'lodash';

import { QueryRunner, Logger as OrmLogger } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { configure, getLogger, Appender, Layout, LoggingEvent, Logger as Logger4js } from 'log4js';

import { QueryDbError } from '@base/db/pg/db.constant';

import { config } from '@config';

export interface Logger extends Logger4js {
  warnError: (error: any) => void;
}

// eslint-disable-next-line no-control-regex
const COLOR_REGEX = new RegExp('[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]', 'g');

function inspectMessage(logEvent: LoggingEvent, joinAs: string = ' ', color: boolean = true) {
  const msg = logEvent.data
    .map(message => typeof message === 'string'
      ? message
      : util.inspect(message, false, null, color),
    )
    .join(joinAs);
  return color ? msg : msg.replace(COLOR_REGEX, '').replace(/(\r|\n)*/giu, '');
}

const inspectMessageFile = (logEvent: LoggingEvent, joinAs: string = ' ') => inspectMessage(logEvent, joinAs, false);

function splitStack(stack: string, error: Error) {
  const [fileName, lineNumber, columnNumber] = stack.split(':');
  return {
    functionName: fileName,
    fileName: fileName,
    columnNumber: parseInt(columnNumber),
    lineNumber: parseInt(lineNumber),
    callStack: error.stack,
  };
}

const stackReg = /at (?:(.+)\s+\()?(?:(.+?):(\d+)(?::(\d+))?|([^)]+))\)?/;

function defaultParseCallStack(error: Error, linesToSkip: number) {
  const stacklines = error.stack.split('\n').slice(linesToSkip);
  if (!stacklines.length)
    return undefined;

  const lineMatch = stackReg.exec(stacklines[0]);
  if (!lineMatch || lineMatch.length < 6)
    return undefined;

  return {
    functionName: lineMatch[2],
    fileName: lineMatch[2],
    lineNumber: parseInt(lineMatch[3], 10),
    columnNumber: parseInt(lineMatch[4], 10),
    callStack: stacklines.join('\n'),
  };
}

function stackParseFunction(error: Error, linesToSkip: number) {
  try {
    const stacks = (error.stack || '').match(/src[\\a-zA-Z0-9.:\-_/]*/gui);
    if (!stacks) return defaultParseCallStack(error, linesToSkip);

    const stack = stacks.find(stack => stack.search('logging') === -1);
    return stack ? splitStack(stack, error) : defaultParseCallStack(error, linesToSkip);
  } catch (e) {
    return undefined;
  }
}

const layouts: Record<string, Layout> = {
  console: {
    type: 'pattern',
    pattern: '%[%-6p %d %20.20f{2}:%-4.-4l| %.6000x{message} (%c)%]',
    tokens: {
      message: inspectMessage,
    },
  },
  dateFile: {
    type: 'pattern',
    pattern: '%-6p %d %20.20f{2}:%-4.-4l| %x{message} (%c)',
    tokens: {
      message: inspectMessageFile,
    },
  },
  access: {
    type: 'pattern',
    pattern: 'ACCESS %d %23.23x{remoteAddr}  | %x{access} (%c)',
    tokens: {
      remoteAddr: function (logEvent: LoggingEvent) {
        let remoteAddr = logEvent.data.toString().split(' ', 1).pop();
        remoteAddr = remoteAddr.replace(/^.*:/, '');
        remoteAddr = remoteAddr === '1' ? '127.0.0.1' : remoteAddr;
        return remoteAddr;
      },
      access: function (logEvent: LoggingEvent) {
        const [, ...data] = logEvent.data.toString().split(' ');
        data.pop();
        return data.join(' ');
      },
    },
  },
};

const commonAppender: Record<string, Appender> = {
  dateFile: {
    type: 'dateFile',
    filename: 'logs/all.log',
    pattern: 'yyyy-MM-dd',
    layout: layouts.dateFile,
    keepFileExt: true,
    numBackups: 60,
  },
};

const appenders: Record<string, Appender> = {
  console: {
    type: 'console',
    layout: layouts.console,
  },
  dateFile: commonAppender.dateFile,
  dateFileInfo: {
    ...commonAppender.dateFile,
    filename: 'logs/info.log',
  } as Appender,
  dateFileWarn: {
    ...commonAppender.dateFile,
    filename: 'logs/warn.log',
  } as Appender,
  dateFileError: {
    ...commonAppender.dateFile,
    filename: 'logs/error.log',
  } as Appender,
  dateFileInfoFilter: {
    type: 'logLevelFilter',
    appender: 'dateFileInfo',
    level: 'info',
    maxLevel: 'info',
  },
  dateFileWarnFilter: {
    type: 'logLevelFilter',
    appender: 'dateFileWarn',
    level: 'warn',
    maxLevel: 'warn',
  },
  dateFileErrorFilter: {
    type: 'logLevelFilter',
    appender: 'dateFileError',
    level: 'error',
    maxLevel: 'error',
  },
  access: {
    type: 'console',
    layout: layouts.access,
  },
};

class DbLogger implements OrmLogger {
  constructor(private logger: Logger4js) {}

  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner): any {
    this.logger.debug(
      `query=${query}` + (parameters ? ` parameters=${JSON.stringify(parameters)}` : ''),
    );
  }

  logQueryError(
    error: Error & { code: string },
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ): any {
    this.logger.debug(error);
    const errorMessage = error.message ? error.message : error;
    if (Object.values(QueryDbError).includes(error?.code)) return this.logger.warn(errorMessage);

    this.logger.error(errorMessage);
    this.logger.error(`query=${query} parameters=${JSON.stringify(parameters)}`);
  }

  logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner): any {
    this.logger.warn(`time=${time} query=${query} parameters=${JSON.stringify(parameters)}`);
  }

  logSchemaBuild(message: string, queryRunner?: QueryRunner): any {}

  logMigration(message: string, queryRunner?: QueryRunner): any {}

  log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner): any {
    this.logger[level](message);
  }
}

@Injectable()
export class LoggingService {
  constructor() {
    const level = config.DEBUG ? 'debug' : 'info';

    configure({
      pm2: true,
      disableClustering: true,
      appenders: appenders,
      categories: {
        default: {
          appenders: ['console', 'dateFile', 'dateFileInfoFilter', 'dateFileWarnFilter', 'dateFileErrorFilter'],
          level: level,
          enableCallStack: true,
        },
        access: {
          appenders: ['access', 'dateFile'],
          level: 'info',
          enableCallStack: true,
        },
      },
    });
  }

  getLogger(category?: string): Logger {
    const logger = getLogger(category);
    logger.setParseCallStackFunction(stackParseFunction);
    return Object.assign(logger, {
      warnError: (error: any) => {
        logger.warn(this.tryErrorMsg(error));
      },
    });
  }

  private _access = () => {
    const logger = getLogger('access');
    return {
      write: logger.info.bind(logger),
    };
  };

  logger = {
    default: getLogger('default'),
    access: this._access(),
    thirdParty: getLogger('thirdParty'),
  };

  tryErrorMsg(error: any) {
    return gets(error, ['response.data.error', 'response.data.message', 'response.data', 'response', 'message'], error);
  }

  getDbLogger(category: string) {
    return new DbLogger(this.getLogger(category));
  }
}

export const gets = (object: Record<string, any>, paths: string[], failureValue?: any) => {
  for (const path of paths) {
    if (_.get(object, path))
      return _.get(object, path);
  }

  return failureValue;
};