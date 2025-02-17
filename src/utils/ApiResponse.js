class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    // This is the constructor function that takes three arguments: statusCode, data, and message.
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400; // This will set the success property of the response object to true if the status code is less than 400.
  }
}

export { ApiResponse };
// This file is used to create a custom response class that will be used to send responses from the API.
