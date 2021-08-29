import Logger from 'pino';

const log = Logger();

export const processLogger = log.child({ where: 'process' });

export const logger = log.child({ where: 'global' });
