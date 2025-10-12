// Error Recovery and User Feedback System

export interface ErrorContext {
  operation: string;
  error: Error;
  attemptNumber: number;
  maxRetries?: number;
}

export const errorMessages = {
  imageUploadFailed: "Failed to upload image. Please ensure it's under 5MB and try again.",
  imageProcessingFailed: "Couldn't process the image. Try a clearer photo or different format.",
  apiConnectionFailed: "Connection issue. Please check your internet and try again.",
  apiQuotaExceeded: "We've hit our API limit. Please try again in a few moments.",
  streamingFailed: "Streaming failed. Switching to standard mode...",
  modelNotAvailable: "AI model temporarily unavailable. Trying backup...",
  invalidInput: "Please provide a valid question or upload an image.",
  timeout: "Request took too long. Please try a simpler question.",
  unknown: "Something went wrong. Please try again.",
};

export class RecoverableError extends Error {
  constructor(
    public userMessage: string,
    public technicalMessage: string,
    public retryable: boolean = true,
    public suggestedAction?: string
  ) {
    super(technicalMessage);
    this.name = 'RecoverableError';
  }
}

export const errorRecovery = {
  /**
   * Handle file upload errors with user-friendly messages
   */
  handleFileError: (error: Error): RecoverableError => {
    const message = error.message.toLowerCase();
    
    if (message.includes('size') || message.includes('large')) {
      return new RecoverableError(
        errorMessages.imageUploadFailed,
        error.message,
        true,
        "Try compressing the image or using a smaller file"
      );
    }
    
    if (message.includes('format') || message.includes('type')) {
      return new RecoverableError(
        "Invalid file format. Please upload PNG, JPG, or GIF images.",
        error.message,
        true,
        "Convert your file to a supported format"
      );
    }
    
    return new RecoverableError(
      errorMessages.imageUploadFailed,
      error.message,
      true
    );
  },

  /**
   * Handle API errors with retry logic
   */
  handleApiError: (error: any, context: ErrorContext): RecoverableError => {
    const { attemptNumber, maxRetries = 3 } = context;
    const retryable = attemptNumber < maxRetries;
    
    // Quota exceeded
    if (error.message?.includes('quota') || error.message?.includes('429')) {
      return new RecoverableError(
        errorMessages.apiQuotaExceeded,
        error.message,
        false,
        "API quota reached. Please wait a few minutes."
      );
    }
    
    // Network errors
    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      return new RecoverableError(
        errorMessages.apiConnectionFailed,
        error.message,
        retryable,
        "Check your internet connection and try again"
      );
    }
    
    // Timeout
    if (error.message?.includes('timeout')) {
      return new RecoverableError(
        errorMessages.timeout,
        error.message,
        retryable,
        "Try asking a shorter or simpler question"
      );
    }
    
    // Model not available
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      return new RecoverableError(
        errorMessages.modelNotAvailable,
        error.message,
        retryable,
        "Trying alternate AI model..."
      );
    }
    
    return new RecoverableError(
      errorMessages.unknown,
      error.message,
      retryable
    );
  },

  /**
   * Retry with exponential backoff
   */
  retry: async <T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    delayMs: number = 1000
  ): Promise<T> => {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        console.log(`Attempt ${attempt} failed:`, error);
        
        if (attempt < maxAttempts) {
          // Exponential backoff
          const delay = delayMs * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  },

  /**
   * Validate input before processing
   */
  validateInput: (message: string, image?: string): RecoverableError | null => {
    if (!message.trim() && !image) {
      return new RecoverableError(
        errorMessages.invalidInput,
        "Empty input",
        false,
        "Please type a question or upload an image"
      );
    }
    
    if (message.length > 5000) {
      return new RecoverableError(
        "Question is too long. Please keep it under 5000 characters.",
        "Message too long",
        false,
        "Try breaking your question into smaller parts"
      );
    }
    
    return null;
  },

  /**
   * Get user-friendly error message
   */
  getUserMessage: (error: any): string => {
    if (error instanceof RecoverableError) {
      return error.userMessage + (error.suggestedAction ? `\n\n💡 ${error.suggestedAction}` : '');
    }
    
    return errorMessages.unknown;
  },
};

