class AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  constructor(
    message: string = 'Something went wrong',
    statusCode: number = 400
  ) {
    super(message);
    this.statusCode = statusCode;
    // mark if error was cause because of failed request or other erorr
    this.status = statusCode.toString().startsWith('4') ? 'fail' : 'error';

    // mark error as operational error, meaning only errors created by API will have this mark, allowing us to distinguish api logic errors or other unexpected errors such as reading properies of undefined
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
