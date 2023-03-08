export type Result<T> = { ok: true; value: T } | { ok: false; error: Error }
export type Optional<T> = { ok: true; v: T } | { ok: false }
