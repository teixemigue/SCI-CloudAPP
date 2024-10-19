# Cloud APP


### Secret Keys

The access keys are stored in a json file within the project folder.


## API Overview

### How the API Works

This API is designed for user authentication and management. It uses JSON Web Tokens (JWT) for secure communication. The API handles user login, token issuance, and user role-based access control.

#### Token Flow:

1. **User Login**: Users provide their credentials to log in. Upon successful authentication, the server responds with an access token and a refresh token.
2. **Access Token**: This short-lived token is used for authenticating API requests. It expires after 15 minutes.
3. **Refresh Token**: A longer-lived token (30 minutes) that can be used to obtain a new access token once the original expires.
4. **Token Refresh**: If the access token is invalid,  the app should request a new one using the /token/refresh route. In case refreshToken is also invalid, the user should login again.

### Endpoints

#### Authentication

##### Login

- **POST** `/login`
- **Description**: Authenticates a user and returns tokens.
- **Request Body**:
    ```json
    {
        "username": "your_username",
        "password": "your_password"
    }
    ```
- **Response**:
    ```json
    {
        "accessToken": "your_access_token",
        "refreshToken": "your_refresh_token"
    }
    ```
- **Usage**: Call this endpoint to obtain the tokens after providing valid credentials.

#### User Info

##### Get Users Info

- **GET** `/info/users`
- **Description**: Retrieves a list of users. This endpoint is restricted to users with the "admin" role.
- **Headers**: 
    ```
    Authorization: Bearer <your_access_token>
    ```
- **Response**:
    ```json
    {
        "users": [
            {
                "userId": 1,
                "role": "admin"
            },
            ...
        ]
    }
    ```
- **Usage**: Call this endpoint after logging in and obtaining the access token to fetch user information.

### Token Management

#### Access Token

- **Expiration**: The access token is valid for **15 minutes**.


#### Refresh Token

- **Expiration**: The refresh token is valid for **30 minutes**.
- **Usage**: If the access token expires, use the refresh token to obtain a new access token.
- **Refresh Token Endpoint**:
  - **POST** `/token/refresh`
  - **Request Body**:
    ```json
    {
        "refreshToken": "your_refresh_token"
    }
    ```
  - **Response**:
    ```json
    {
        "accessToken": "new_access_token"
    }
    ```

## Middleware

### Authentication Middleware

The `authenticateToken` middleware checks the validity of the access token and refreshes it if valid.

### Authorization Middleware

The `authorizeRoles` middleware ensures that only users with the appropriate roles can access certain routes.

## Client Integration

Make sure to implement the client-side logic to handle tokens. 



