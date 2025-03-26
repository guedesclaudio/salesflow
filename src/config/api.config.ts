export const apiConfig = {
    port: Number(process.env.API_PORT || 3050),
    prefix: process.env.API_PREFIX || '/api',
    nodeEnv: process.env.NODE_ENV || 'development',
    host: process.env.API_HOST || 'localhost',
}
