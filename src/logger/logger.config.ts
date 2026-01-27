import { Params } from 'nestjs-pino';

const isProduction = process.env.NODE_ENV === 'production';

export const loggerConfig: Params = {
  pinoHttp: {
    level: isProduction ? 'info' : 'debug',
    transport: !isProduction
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            levelFirst: true,
            translateTime: 'yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname',
            singleLine: true,
            messageFormat: '{req.method} {req.url} - {msg}',
          },
        }
      : undefined, // which means Pino will output raw JSON logs
    customProps: () => ({
      context: 'HTTP',
    }),
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url,
          query: req.query,
          params: req.params,
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
    autoLogging: {
      ignore: (req) => {
        // Ignore health check endpoints
        return req.url === '/health' || req.url === '/';
      },
    },
  },
};
