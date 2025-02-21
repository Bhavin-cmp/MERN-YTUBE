// This is a middleware function that takes a function as an argument and returns a function that takes three arguments: req, res, and next.
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };

// const asyncHandler = () => {}; // This is a function that takes no arguments and returns an empty object.
// const asyncHandler = (func) => () => {}; // This is a function that takes a function as an argument and returns a function that takes no arguments.
// const asyncHandler = (func) => async () => {} // This is a function that takes a function as an argument and returns a function that takes three arguments: req, res, and next. The inner function is an async function.

/* const asyncHandler = (fn) => async (req, res, next) => { 
  try {
    await -fn(req, res, next);
  } catch (error) {
    res.status(err.code || 500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
}; */

// This is a middleware function that takes a function as an argument and returns a function that takes three arguments: req, res, and next.
// The inner function calls the function passed as an argument with the req, res, and next arguments.
// If the function throws an error, the error is caught and passed to the next function.
