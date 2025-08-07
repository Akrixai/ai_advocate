# Login Instructions for Advocate AI Pro

## Test Accounts

The following test accounts have been set up for testing the application:

### Lawyer Account
- **Email**: testlawyer@example.com
- **Password**: Test@123
- **User Type**: lawyer

### Admin Account
- **Email**: testadmin@example.com
- **Password**: Admin@123
- **User Type**: admin

## Login Process

1. Navigate to the login page at `/auth/login`
2. Enter the email address and password for the desired account
3. Select the appropriate user type (lawyer or admin)
4. Click the "Sign In" button

## Authentication Flow

The application uses JWT (JSON Web Token) for authentication. Upon successful login:

1. The server verifies the credentials against the database
2. A JWT token is generated with user information (ID, email, user type)
3. The token is returned to the client and should be stored for subsequent requests
4. Protected routes and API endpoints require this token for access

## Troubleshooting

If you encounter login issues:

1. Ensure you're using the correct email, password, and user type combination
2. Check that the server is running properly
3. Verify that the database connection is working
4. Check browser console for any JavaScript errors
5. Check server logs for authentication-related errors

## Technical Notes

- The application uses Supabase as the database
- Authentication is implemented with JWT tokens that expire after 7 days
- Password hashing is done using bcrypt
- RLS (Row Level Security) policies are in place to protect user data
- Custom RPC functions are used to bypass RLS for specific operations