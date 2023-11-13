export const getByteSize = (content?: string | Uint8Array | Buffer) => content == null ? 0 : Buffer.byteLength(content);

export const existed = <T>(value: T): value is NonNullable<T> => value !== null && value !== undefined;
