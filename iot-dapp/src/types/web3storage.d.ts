declare module 'web3.storage' {
  export class Web3Storage {
    constructor(config: { token: string });
    put(files: File[]): Promise<string>;
    get(cid: string): Promise<Web3Response>;
  }

  interface Web3Response {
    ok: boolean;
    files(): Promise<File[]>;
  }
}
