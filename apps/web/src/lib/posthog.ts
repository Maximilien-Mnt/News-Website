type PostHogProperties = Record<string, string | number | boolean>;
type PostHogLogLevel = "info" | "error";

type PostHogClient = {
  capture: (event: string, properties?: PostHogProperties) => void;
  logger?: Record<PostHogLogLevel, (message: string, attributes?: PostHogProperties) => void>;
};

export function capturePostHog(event: string, properties?: PostHogProperties): void {
  if (typeof window === "undefined") return;

  try {
    const client = (window as Window & { posthog?: PostHogClient }).posthog;
    client?.capture(event, properties);
  } catch {
    // Analytics must not affect reader interactions.
  }
}

// Only purpose-built calls to this logger are exported to PostHog Logs.
export function logPostHog(
  level: PostHogLogLevel,
  message: string,
  attributes?: PostHogProperties,
): void {
  if (typeof window === "undefined") return;

  try {
    const client = (window as Window & { posthog?: PostHogClient }).posthog;
    client?.logger?.[level](message, attributes);
  } catch {
    // Log delivery must not affect reader interactions.
  }
}
