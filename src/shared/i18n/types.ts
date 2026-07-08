import type { en } from "./en";

type DeepStringValues<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringValues<T[K]>;
};

export type Messages = DeepStringValues<typeof en>;
