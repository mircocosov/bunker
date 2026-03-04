declare module 'zod' {
  export namespace z {
    type infer<T> = any;
  }

  export const z: {
    object: (shape: Record<string, any>) => any;
    string: () => any;
    number: () => any;
    boolean: () => any;
    enum: (values: string[]) => any;
    literal: (value: any) => any;
    array: (schema: any) => any;
    record: (k: any, v: any) => any;
    any: () => any;
  };
}
