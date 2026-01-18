# API Testing Script

This shell script automatically tests all API endpoints to verify the backend is working correctly.

## Features

✅ Tests all 17 API endpoints  
✅ Color-coded output (green for pass, red for fail)  
✅ Automatic test user creation  
✅ Sequential testing with proper cleanup  
✅ Detailed error reporting  
✅ Summary statistics  

## Prerequisites

1. **Server must be running**
   ```bash
   npm run dev
   ```

2. **MongoDB must be connected**
   - Make sure your `.env` file has a valid `MONGO_URI`

3. **curl must be installed** (pre-installed on macOS)

## Usage

### Run the test script:

```bash
./test-api.sh
```

Or if you need to make it executable first:

```bash
chmod +x test-api.sh
./test-api.sh
```

## What Gets Tested

### Authentication (4 tests)
- ✓ User Registration
- ✓ User Login
- ✓ Get User Profile
- ✓ Update User Profile

### Sessions (5 tests)
- ✓ Create Session
- ✓ Get All Sessions
- ✓ Get Session by ID
- ✓ Update Session
- ✓ Delete Session

### Questions (5 tests)
- ✓ Create Question
- ✓ Get Questions by Session
- ✓ Update Question
- ✓ Toggle Pin Question
- ✓ Delete Question

### AI Features (2 tests - optional)
- ⊘ Generate AI Questions (requires GEMINI_API_KEY)
- ⊘ Get AI Answer (requires GEMINI_API_KEY)

### Security (1 test)
- ✓ Unauthorized Access Protection

## Sample Output

```
╔════════════════════════════════════════════════════════════╗
║   Interview Preparation Backend - API Test Suite          ║
╚════════════════════════════════════════════════════════════╝

========================================
Checking Server Status
========================================

✓ PASS - Server is running on http://localhost:8000

========================================
Testing Authentication - Register
========================================

✓ PASS - User registration successful
   Token: eyJhbGciOiJIUzI1NiIs...

...

========================================
Test Summary
========================================

Total Tests:  17
Passed:       17
Failed:       0

🎉 All tests passed! Backend is working correctly.
```

## Notes

- The script creates a new test user with a unique email each time
- All test data is cleaned up at the end
- AI tests will be skipped if `GEMINI_API_KEY` is not configured (this is optional)
- The script exits with code 0 on success, 1 on failure (useful for CI/CD)

## Troubleshooting

**Server not running:**
```
Please start the server with 'npm run dev' before running tests
```
→ Start the server in another terminal

**MongoDB connection error:**
```
Error Connecting to MongoDB
```
→ Check your `MONGO_URI` in `.env`

**All tests fail:**
→ Make sure the server is running on port 8000 (or update `BASE_URL` in the script)

## Customization

You can customize the base URL by editing the script:

```bash
BASE_URL="http://localhost:8000"  # Change port if needed
```
