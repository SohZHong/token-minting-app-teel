export type TxState = {
  hash?: `0x${string}`;
  isPending: boolean;
  isConfirmed: boolean;
  error: Error | null;
};
