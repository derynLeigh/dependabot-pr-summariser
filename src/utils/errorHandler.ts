import type { Request, Response, NextFunction } from 'express';

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: string;
    path?: string;
  };
}

export function handleErrorResponse(
  res: Response,
  error: unknown,
  context?: { request?: Request }
): void {
  const timestamp = new Date().toISOString();
  const errorDetails =
    error instanceof Error
      ? {
          code: 'INTERNAL_ERROR',
          message: error.message,
          stack:
            process.env.NODE_ENV === 'development' ? error.stack : undefined,
        }
      : {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred',
        };

  console.error(
    `[${timestamp}] Error processing request to ${context?.request?.originalUrl}:`
  );
  console.error(errorDetails);

  res.status(500).json({
    error: {
      code: errorDetails.code,
      message: errorDetails.message,
      ...(process.env.NODE_ENV === 'development' && { details: errorDetails }),
    },
    meta: {
      timestamp,
      path: context?.request?.originalUrl,
    },
  });
}

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  handleErrorResponse(res, error, { request: req });
}
