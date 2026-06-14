declare module "@derhuerst/query-overpass" {
  interface QueryOverpassOptions {
    endpoint?: string;
    retryOpts?: {
      retries?: number;
      minTimeout?: number;
    };
  }

  function queryOverpass(
    query: string,
    options?: QueryOverpassOptions,
  ): Promise<any[]>;

  export default queryOverpass;
}
