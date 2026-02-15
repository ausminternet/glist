type Result<T, E> = { ok: true; value: T } | { ok: false; error: E }

function ok<T>(value: T): Result<T, never> {
  return { ok: true, value }
}

function okWithEvent<T, TEvent>(
  value: T,
  event: TEvent,
): Result<{ value: T; event: TEvent }, never> {
  return { ok: true, value: { value, event } }
}

function err<E>(error: E): Result<never, E> {
  return { ok: false, error }
}

export { err, ok, okWithEvent, type Result }
