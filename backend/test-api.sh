#!/bin/bash

# Interview Preparation Backend - API Test Script
# This script tests all API endpoints to verify they are working correctly

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:8000"
API_URL="${BASE_URL}/api"

# Variables to store tokens and IDs
TOKEN=""
USER_ID=""
SESSION_ID=""
QUESTION_ID=""

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to print section headers
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

# Function to print test results
print_test() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC} - $2"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ FAIL${NC} - $2"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Function to check if server is running
check_server() {
    print_header "Checking Server Status"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" ${BASE_URL})
    
    if [ "$response" -eq 404 ] || [ "$response" -eq 200 ]; then
        print_test 0 "Server is running on ${BASE_URL}"
        return 0
    else
        print_test 1 "Server is not running on ${BASE_URL}"
        echo -e "${RED}Please start the server with 'npm run dev' before running tests${NC}"
        exit 1
    fi
}

# Test 1: Register User
test_register() {
    print_header "Testing Authentication - Register"
    
    RANDOM_EMAIL="testuser$(date +%s)@example.com"
    
    response=$(curl -s -X POST "${API_URL}/auth/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"name\": \"Test User\",
            \"email\": \"${RANDOM_EMAIL}\",
            \"password\": \"password123\"
        }")
    
    # Check if response contains token
    if echo "$response" | grep -q "token"; then
        TOKEN=$(echo "$response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        USER_ID=$(echo "$response" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
        print_test 0 "User registration successful"
        echo -e "   ${YELLOW}Token:${NC} ${TOKEN:0:20}..."
    else
        print_test 1 "User registration failed"
        echo -e "   ${RED}Response:${NC} $response"
    fi
}

# Test 2: Login User
test_login() {
    print_header "Testing Authentication - Login"
    
    response=$(curl -s -X POST "${API_URL}/auth/login" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"${RANDOM_EMAIL}\",
            \"password\": \"password123\"
        }")
    
    if echo "$response" | grep -q "token"; then
        print_test 0 "User login successful"
    else
        print_test 1 "User login failed"
        echo -e "   ${RED}Response:${NC} $response"
    fi
}

# Test 3: Get User Profile
test_get_profile() {
    print_header "Testing Authentication - Get Profile"
    
    response=$(curl -s -X GET "${API_URL}/auth/profile" \
        -H "Authorization: Bearer ${TOKEN}")
    
    if echo "$response" | grep -q "email"; then
        print_test 0 "Get user profile successful"
    else
        print_test 1 "Get user profile failed"
        echo -e "   ${RED}Response:${NC} $response"
    fi
}

# Test 4: Update User Profile
test_update_profile() {
    print_header "Testing Authentication - Update Profile"
    
    response=$(curl -s -X PUT "${API_URL}/auth/profile" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${TOKEN}" \
        -d "{
            \"name\": \"Updated Test User\"
        }")
    
    if echo "$response" | grep -q "Profile updated successfully"; then
        print_test 0 "Update user profile successful"
    else
        print_test 1 "Update user profile failed"
        echo -e "   ${RED}Response:${NC} $response"
    fi
}

# Test 5: Create Session
test_create_session() {
    print_header "Testing Sessions - Create Session"
    
    response=$(curl -s -X POST "${API_URL}/sessions" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${TOKEN}" \
        -d "{
            \"role\": \"Full Stack Developer\",
            \"experience\": \"Mid-level (3-5 years)\",
            \"topicsToFocus\": \"React, Node.js, MongoDB, System Design\",
            \"description\": \"Preparing for FAANG interviews\"
        }")
    
    if echo "$response" | grep -q "Session created successfully"; then
        SESSION_ID=$(echo "$response" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
        print_test 0 "Create session successful"
        echo -e "   ${YELLOW}Session ID:${NC} ${SESSION_ID}"
    else
        print_test 1 "Create session failed"
        echo -e "   ${RED}Response:${NC} $response"
    fi
}

# Test 6: Get All Sessions
test_get_all_sessions() {
    print_header "Testing Sessions - Get All Sessions"
    
    response=$(curl -s -X GET "${API_URL}/sessions" \
        -H "Authorization: Bearer ${TOKEN}")
    
    if echo "$response" | grep -q "sessions"; then
        print_test 0 "Get all sessions successful"
    else
        print_test 1 "Get all sessions failed"
        echo -e "   ${RED}Response:${NC} $response"
    fi
}

# Test 7: Get Session by ID
test_get_session_by_id() {
    print_header "Testing Sessions - Get Session by ID"
    
    response=$(curl -s -X GET "${API_URL}/sessions/${SESSION_ID}" \
        -H "Authorization: Bearer ${TOKEN}")
    
    if echo "$response" | grep -q "session"; then
        print_test 0 "Get session by ID successful"
    else
        print_test 1 "Get session by ID failed"
        echo -e "   ${RED}Response:${NC} $response"
    fi
}

# Test 8: Update Session
test_update_session() {
    print_header "Testing Sessions - Update Session"
    
    response=$(curl -s -X PUT "${API_URL}/sessions/${SESSION_ID}" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${TOKEN}" \
        -d "{
            \"description\": \"Updated description for interview prep\"
        }")
    
    if echo "$response" | grep -q "Session updated successfully"; then
        print_test 0 "Update session successful"
    else
        print_test 1 "Update session failed"
        echo -e "   ${RED}Response:${NC} $response"
    fi
}

# Test 9: Create Question
test_create_question() {
    print_header "Testing Questions - Create Question"
    
    response=$(curl -s -X POST "${API_URL}/questions" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${TOKEN}" \
        -d "{
            \"sessionId\": \"${SESSION_ID}\",
            \"question\": \"What is the difference between let and const in JavaScript?\",
            \"answer\": \"let allows reassignment, const does not\",
            \"note\": \"Important for interviews\"
        }")
    
    if echo "$response" | grep -q "Question created successfully"; then
        QUESTION_ID=$(echo "$response" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
        print_test 0 "Create question successful"
        echo -e "   ${YELLOW}Question ID:${NC} ${QUESTION_ID}"
    else
        print_test 1 "Create question failed"
        echo -e "   ${RED}Response:${NC} $response"
    fi
}

# Test 10: Get Questions by Session
test_get_questions_by_session() {
    print_header "Testing Questions - Get Questions by Session"
    
    response=$(curl -s -X GET "${API_URL}/questions/session/${SESSION_ID}" \
        -H "Authorization: Bearer ${TOKEN}")
    
    if echo "$response" | grep -q "questions"; then
        print_test 0 "Get questions by session successful"
    else
        print_test 1 "Get questions by session failed"
        echo -e "   ${RED}Response:${NC} $response"
    fi
}

# Test 11: Update Question
test_update_question() {
    print_header "Testing Questions - Update Question"
    
    response=$(curl -s -X PUT "${API_URL}/questions/${QUESTION_ID}" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${TOKEN}" \
        -d "{
            \"answer\": \"Updated answer: let allows reassignment, const creates read-only reference\"
        }")
    
    if echo "$response" | grep -q "Question updated successfully"; then
        print_test 0 "Update question successful"
    else
        print_test 1 "Update question failed"
        echo -e "   ${RED}Response:${NC} $response"
    fi
}

# Test 12: Toggle Pin Question
test_toggle_pin_question() {
    print_header "Testing Questions - Toggle Pin"
    
    response=$(curl -s -X PATCH "${API_URL}/questions/${QUESTION_ID}/pin" \
        -H "Authorization: Bearer ${TOKEN}")
    
    if echo "$response" | grep -q "pinned"; then
        print_test 0 "Toggle pin question successful"
    else
        print_test 1 "Toggle pin question failed"
        echo -e "   ${RED}Response:${NC} $response"
    fi
}

# Test 13: Generate AI Questions (Optional - requires GEMINI_API_KEY)
test_generate_ai_questions() {
    print_header "Testing AI - Generate Questions (Optional)"
    
    response=$(curl -s -X POST "${API_URL}/ai/generate-questions" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${TOKEN}" \
        -d "{
            \"sessionId\": \"${SESSION_ID}\"
        }")
    
    if echo "$response" | grep -q "Questions generated successfully"; then
        print_test 0 "Generate AI questions successful"
    elif echo "$response" | grep -q "AI service not configured"; then
        echo -e "${YELLOW}⊘ SKIP${NC} - AI service not configured (GEMINI_API_KEY not set)"
        echo -e "   ${YELLOW}Note:${NC} This is optional. Add GEMINI_API_KEY to .env to enable AI features"
    else
        print_test 1 "Generate AI questions failed"
        echo -e "   ${RED}Response:${NC} $response"
    fi
}

# Test 14: Get AI Answer (Optional - requires GEMINI_API_KEY)
test_get_ai_answer() {
    print_header "Testing AI - Get Answer (Optional)"
    
    response=$(curl -s -X POST "${API_URL}/ai/get-answer" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${TOKEN}" \
        -d "{
            \"questionId\": \"${QUESTION_ID}\"
        }")
    
    if echo "$response" | grep -q "Answer generated successfully"; then
        print_test 0 "Get AI answer successful"
    elif echo "$response" | grep -q "AI service not configured"; then
        echo -e "${YELLOW}⊘ SKIP${NC} - AI service not configured (GEMINI_API_KEY not set)"
        echo -e "   ${YELLOW}Note:${NC} This is optional. Add GEMINI_API_KEY to .env to enable AI features"
    else
        print_test 1 "Get AI answer failed"
        echo -e "   ${RED}Response:${NC} $response"
    fi
}

# Test 15: Delete Question
test_delete_question() {
    print_header "Testing Questions - Delete Question"
    
    response=$(curl -s -X DELETE "${API_URL}/questions/${QUESTION_ID}" \
        -H "Authorization: Bearer ${TOKEN}")
    
    if echo "$response" | grep -q "Question deleted successfully"; then
        print_test 0 "Delete question successful"
    else
        print_test 1 "Delete question failed"
        echo -e "   ${RED}Response:${NC} $response"
    fi
}

# Test 16: Delete Session
test_delete_session() {
    print_header "Testing Sessions - Delete Session"
    
    response=$(curl -s -X DELETE "${API_URL}/sessions/${SESSION_ID}" \
        -H "Authorization: Bearer ${TOKEN}")
    
    if echo "$response" | grep -q "Session and associated questions deleted successfully"; then
        print_test 0 "Delete session successful"
    else
        print_test 1 "Delete session failed"
        echo -e "   ${RED}Response:${NC} $response"
    fi
}

# Test 17: Unauthorized Access Test
test_unauthorized_access() {
    print_header "Testing Security - Unauthorized Access"
    
    response=$(curl -s -X GET "${API_URL}/auth/profile")
    
    if echo "$response" | grep -q "Not authorized"; then
        print_test 0 "Unauthorized access properly blocked"
    else
        print_test 1 "Unauthorized access test failed"
        echo -e "   ${RED}Response:${NC} $response"
    fi
}

# Print final summary
print_summary() {
    print_header "Test Summary"
    
    echo -e "Total Tests:  ${TOTAL_TESTS}"
    echo -e "${GREEN}Passed:       ${PASSED_TESTS}${NC}"
    echo -e "${RED}Failed:       ${FAILED_TESTS}${NC}"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "\n${GREEN}🎉 All tests passed! Backend is working correctly.${NC}\n"
        exit 0
    else
        echo -e "\n${RED}⚠️  Some tests failed. Please check the errors above.${NC}\n"
        exit 1
    fi
}

# Main execution
main() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║   Interview Preparation Backend - API Test Suite          ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Check if server is running
    check_server
    
    # Run all tests
    test_register
    test_login
    test_get_profile
    test_update_profile
    test_create_session
    test_get_all_sessions
    test_get_session_by_id
    test_update_session
    test_create_question
    test_get_questions_by_session
    test_update_question
    test_toggle_pin_question
    test_generate_ai_questions
    test_get_ai_answer
    test_delete_question
    test_delete_session
    test_unauthorized_access
    
    # Print summary
    print_summary
}

# Run main function
main
