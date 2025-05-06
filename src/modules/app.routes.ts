export const appRoutes = {
  health: {
    main: '/health',
  },
  auth: {
    main: '/auth',
    generateJWTToken: '/generateJWTToken',
  },
  sales: {
    main: '/sales',
    createSale: 'createSale',
    cancelSale: 'cancelSale',
    paySale: 'paySale',
  },
};
