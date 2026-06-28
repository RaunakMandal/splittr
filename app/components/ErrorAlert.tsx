"use client";

export function ErrorAlert({
  message,
  onDismiss,
  onRetry,
  className = "",
}: {
  message: string;
  onDismiss: () => void;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border border-danger/20 bg-danger-muted px-3 py-2.5 text-sm text-danger ${className}`}
    >
      <p className="min-w-0 flex-1 leading-relaxed">{message}</p>
      <div className="flex shrink-0 items-center gap-2">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="cursor-pointer rounded-full border border-danger/20 bg-surface px-3 py-1 text-xs font-medium text-danger transition-colors hover:bg-danger-muted"
          >
            Retry
          </button>
        )}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="cursor-pointer rounded-full p-1 text-danger transition-colors hover:bg-danger-muted"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden
          >
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
