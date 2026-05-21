export function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unable to record or transcribe speech right now.';
}

export function normalizeMetering(metering?: number) {
  if (typeof metering !== 'number' || !Number.isFinite(metering)) {
    return 0;
  }

  return Math.max(0, Math.min(1, (metering + 60) / 60));
}
