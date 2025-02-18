=> while coding in app.js, we learn that app.use() and app.get() use for different Operation.
=> app.use are used for middleware or configurations ans
=> app.get/post are used for routes

Also we have created files in utils folder
The utils folder is typically used to store utility functions and helper modules that are used throughout your application.
These files contain reusable code that can be shared across different parts of your project to avoid duplication and improve maintainability.
Usually we put Helper Function, Configuration Files, API Utilities, Data Processing, Loggong etc.
Generally we create Higher order function {HOC}in Utility, Means
A Higher-Order-Function is a function that either takes one or more function as an argument or returns a function as its result. it is a powerful feature in javascript, and commonly used for creating reusable and composable code.

=====================================================JWT=============================================================

- JWT is a bearer token. means ye token jiske pass hai me usko data bhej dunga, wo authorized person hai.
  Access Token and Refresh Token
  Access Token and refresh token are used in authentication and authorization process. particularly in token-based authentication system.

## ACCESS TOKEN :

- Access token are used to grant access to protected resources (API, user Data)
- They typically have a short lifespan
- sent with each request to the server and authorize access to resource.

## REFRESH TOKEN

- Refresh token are used to obtain new access token without requiring the useer to re-authenticate.
- they have longer lifespan.
- when access token expires the client uses the refresh token to request a new access token.
