declare module "@derhuerst/query-overpass" {
  function queryOverpass(query: string): Promise<any[]>;
  export default queryOverpass;
}
