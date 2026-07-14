export class AudioInitializationTimeoutError extends Error {
  readonly stage: string;

  constructor(stage: string, timeoutMs: number) {
    super(`Audio initialization timed out during ${stage} after ${Math.round(timeoutMs)}ms`);
    this.name = 'AudioInitializationTimeoutError';
    this.stage = stage;
  }
}

export function withAudioTimeout<T>(
  promise: PromiseLike<T>,
  timeoutMs: number,
  stage: string,
): Promise<T> {
  const safeTimeoutMs = Math.max(1, timeoutMs);

  return new Promise<T>((resolve, reject) => {
    const timer = globalThis.setTimeout(() => {
      reject(new AudioInitializationTimeoutError(stage, safeTimeoutMs));
    }, safeTimeoutMs);

    Promise.resolve(promise).then(
      (value) => {
        globalThis.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        globalThis.clearTimeout(timer);
        reject(error);
      },
    );
  });
}

