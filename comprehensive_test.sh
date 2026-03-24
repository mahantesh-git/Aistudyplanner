#!/bin/bash

echo "🚀 Starting Comprehensive AI Study Planner Tests..."
echo "=================================================="

API_BASE="http://localhost:5000/api"
FRONTEND_URL="http://localhost:5173"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0

# Function to run test
run_test() {
    local test_name="$1"
    local command="$2"
    local expected_pattern="$3"
    
    echo -e "\n${YELLOW}Testing: $test_name${NC}"
    echo "Command: $command"
    
    # Run command and capture output
    output=$(eval "$command" 2>&1)
    exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        if [[ -n "$expected_pattern" && "$output" =~ $expected_pattern ]]; then
            echo -e "${GREEN}✅ PASSED${NC}"
            echo "Output: $output"
            ((PASSED++))
        elif [[ -z "$expected_pattern" ]]; then
            echo -e "${GREEN}✅ PASSED${NC}"
            echo "Output: $output"
            ((PASSED++))
        else
            echo -e "${RED}❌ FAILED${NC}"
            echo "Expected pattern not found: $expected_pattern"
            echo "Actual output: $output"
            ((FAILED++))
        fi
    else
        echo -e "${RED}❌ FAILED${NC}"
        echo "Exit code: $exit_code"
        echo "Output: $output"
        ((FAILED++))
    fi
}

# Test 1: Backend Health Check
run_test "Backend Health Check" \
    "curl -s '$API_BASE/../api/health'" \
    '"status":"ok"'

# Test 2: User Authentication
echo -e "\n${YELLOW}Testing: User Authentication${NC}"
AUTH_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"newuser@example.com","password":"password123"}')

if [[ "$AUTH_RESPONSE" =~ "token" ]]; then
    TOKEN=$(echo "$AUTH_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Authentication PASSED${NC}"
    echo "Token obtained: ${TOKEN:0:20}..."
    ((PASSED++))
else
    echo -e "${RED}❌ Authentication FAILED${NC}"
    echo "Response: $AUTH_RESPONSE"
    ((FAILED++))
fi

# Test 3: Create Subject
if [[ -n "$TOKEN" ]]; then
    run_test "Create Subject" \
        "curl -s -X POST '$API_BASE/subjects' \
            -H 'Content-Type: application/json' \
            -H 'Authorization: Bearer $TOKEN' \
            -d '{\"name\":\"Test Subject\",\"priority\":3}'" \
        '"name":"Test Subject"'
    
    # Get subject ID for next test
    SUBJECT_RESPONSE=$(curl -s -X POST "$API_BASE/subjects" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d '{"name":"Subject for Topics","priority":2}')
    
    if [[ "$SUBJECT_RESPONSE" =~ "_id" ]]; then
        SUBJECT_ID=$(echo "$SUBJECT_RESPONSE" | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)
        echo "Subject ID: $SUBJECT_ID"
    fi
fi

# Test 4: Add Topic to Subject
if [[ -n "$TOKEN" && -n "$SUBJECT_ID" ]]; then
    run_test "Add Topic to Subject" \
        "curl -s -X POST '$API_BASE/subjects/$SUBJECT_ID/topics' \
            -H 'Content-Type: application/json' \
            -H 'Authorization: Bearer $TOKEN' \
            -d '{\"title\":\"Test Topic\",\"difficulty\":3,\"estimatedTime\":45}'" \
        '"title":"Test Topic"'
fi

# Test 5: Create Manual Task
if [[ -n "$TOKEN" ]]; then
    run_test "Create Manual Task" \
        "curl -s -X POST '$API_BASE/tasks' \
            -H 'Content-Type: application/json' \
            -H 'Authorization: Bearer $TOKEN' \
            -d '{\"title\":\"Manual Test Task\",\"description\":\"Test description\",\"priority\":2,\"deadline\":\"2024-12-31\"}'" \
        '"topic":"Manual Test Task"'
fi

# Test 6: Generate AI Study Plan
if [[ -n "$TOKEN" ]]; then
    run_test "Generate AI Study Plan" \
        "curl -s -X POST '$API_BASE/study-plan/generate' \
            -H 'Content-Type: application/json' \
            -H 'Authorization: Bearer $TOKEN' \
            -d '{\"date\":\"2026-03-24\",\"overwrite\":true}'" \
        '"tasksCreated"'
fi

# Test 7: Get Subjects
if [[ -n "$TOKEN" ]]; then
    run_test "Get All Subjects" \
        "curl -s -X GET '$API_BASE/subjects' \
            -H 'Authorization: Bearer $TOKEN'" \
        '\['
fi

# Test 8: Frontend Accessibility
run_test "Frontend Accessibility" \
    "curl -s -o /dev/null -w '%{http_code}' '$FRONTEND_URL'" \
    '200'

# Test 9: Frontend Login Page
run_test "Frontend Login Page" \
    "curl -s '$FRONTEND_URL/login'" \
    'AI Study Planner'

# Test 10: Frontend Dashboard (after login simulation)
run_test "Frontend Dashboard" \
    "curl -s '$FRONTEND_URL/dashboard'" \
    'AI Study Planner'

# Final Results
echo -e "\n=================================================="
echo -e "📊 TEST RESULTS SUMMARY"
echo -e "=================================================="
echo -e "${GREEN}✅ PASSED: $PASSED${NC}"
echo -e "${RED}❌ FAILED: $FAILED${NC}"
echo -e "${YELLOW}📈 TOTAL: $((PASSED + FAILED))${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED! AI Study Planner is fully functional!${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️ Some tests failed. Check the logs above for details.${NC}"
    exit 1
fi
