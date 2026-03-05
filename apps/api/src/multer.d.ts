declare module 'multer' {
  export function diskStorage(options: {
    destination: (
      req: unknown,
      file: unknown,
      cb: (error: Error | null, destination: string) => void,
    ) => void;
    filename: (
      req: unknown,
      file: { originalname: string },
      cb: (error: Error | null, filename: string) => void,
    ) => void;
  }): unknown;
}
