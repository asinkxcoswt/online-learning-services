export type ErrorMapper<T> = (error: Error | null, status: number | undefined) => [T, number];
