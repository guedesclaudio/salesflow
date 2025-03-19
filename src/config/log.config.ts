export function logConfig() {
    return {
        pinoHttp: {
          level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
          // If you want pretty logs during development, you can add:
          transport: process.env.NODE_ENV !== 'production' ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
            },
          } : undefined,
        },
    }
}