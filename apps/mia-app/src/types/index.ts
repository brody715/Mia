// Very special type that is used to represent the absence of a value.
export class None {}

export function hasValue<T>(v: Optional2<T>): v is T {
  return !(v instanceof None)
}

export const NoneValue = new None()

export type Optional2<T> = T | None
export type Result<T> = { ok: true; value: T } | { ok: false; error: Error }

export type Optional<T> = { ok: true; v: T } | { ok: false }
