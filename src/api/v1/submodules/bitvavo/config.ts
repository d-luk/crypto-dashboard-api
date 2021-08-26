const config = () => ({
  bitvavoApi: {
    apiUrl: 'https://api.bitvavo.com/v2',
    accessWindowMillis: 10_000,

    /**
     * Minimum amount of rate limit remaining to make sure the limit
     * is never exceeded to prevent an IP/key ban.
     */
    weightMargin: 100,
    requiredApiKeyLength: 64,
  },
});

export type Config = ReturnType<typeof config>['bitvavoApi'];

export default config;
