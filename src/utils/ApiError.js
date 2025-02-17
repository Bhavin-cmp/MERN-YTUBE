// This file is used to create a custom error class that will be used to handle errors in the application.
class ApiError extends Error {
  constructor( // This is the constructor function that takes four arguments: statusCode, message, errors, and stack.
    statusCode,
    message = "Something Went Wrong",
    errors = [],
    stack = ""
  ) {
    super(message); // This will call the super constructor and pass the message argument.
    this.statusCode = statusCode;
    this.data = null; // This will set the data property of the error object to null.
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      // This will check if the stack is provided.
      this.stack = stack; // This will set the stack property of the error object.
    } else {
      Error.captureStackTrace(this, this.constructor); // This will capture the stack trace of the error object.
    }
  }
}

export { ApiError }; // This will export the ApiError class.
