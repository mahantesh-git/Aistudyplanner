# Comprehensive AI Study Planner Test Script
Write-Host "🚀 Starting Comprehensive AI Study Planner Tests..." -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Yellow

$API_BASE = "http://localhost:5000/api"
$FRONTEND_URL = "http://localhost:5173"

# Test results
$PASSED = 0
$FAILED = 0

# Function to run test
function Run-Test {
    param(
        [string]$TestName,
        [string]$Command,
        [string]$ExpectedPattern = $null
    )
    
    Write-Host "`nTesting: $TestName" -ForegroundColor Yellow
    Write-Host "Command: $Command"
    
    try {
        # Run command and capture output
        $output = Invoke-Expression $Command 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            if ($ExpectedPattern -and $output -match $ExpectedPattern) {
                Write-Host "✅ PASSED" -ForegroundColor Green
                Write-Host "Output: $output"
                $script:PASSED++
            } elseif (-not $ExpectedPattern) {
                Write-Host "✅ PASSED" -ForegroundColor Green
                Write-Host "Output: $output"
                $script:PASSED++
            } else {
                Write-Host "❌ FAILED" -ForegroundColor Red
                Write-Host "Expected pattern not found: $ExpectedPattern"
                Write-Host "Actual output: $output"
                $script:FAILED++
            }
        } else {
            Write-Host "❌ FAILED" -ForegroundColor Red
            Write-Host "Exit code: $LASTEXITCODE"
            Write-Host "Output: $output"
            $script:FAILED++
        }
    } catch {
        Write-Host "❌ FAILED" -ForegroundColor Red
        Write-Host "Error: $_"
        $script:FAILED++
    }
}

# Test 1: Backend Health Check
Run-Test "Backend Health Check" "curl -s '$API_BASE/../api/health'" '"status":"ok"'

# Test 2: User Authentication
Write-Host "`nTesting: User Authentication" -ForegroundColor Yellow
try {
    $authResponse = curl -s -X POST "$API_BASE/auth/login" -H "Content-Type: application/json" -d '{"email":"newuser@example.com","password":"password123"}'
    
    if ($authResponse -match "token") {
        if ($authResponse -match '"token":"([^"]*)"') {
            $TOKEN = $matches[1]
            Write-Host "✅ Authentication PASSED" -ForegroundColor Green
            Write-Host "Token obtained: $($TOKEN.Substring(0,20))..."
            $script:PASSED++
        }
    } else {
        Write-Host "❌ Authentication FAILED" -ForegroundColor Red
        Write-Host "Response: $authResponse"
        $script:FAILED++
    }
} catch {
    Write-Host "❌ Authentication FAILED" -ForegroundColor Red
    Write-Host "Error: $_"
    $script:FAILED++
}

# Test 3: Create Subject
if ($TOKEN) {
    Run-Test "Create Subject" "curl -s -X POST '$API_BASE/subjects' -H 'Content-Type: application/json' -H 'Authorization: Bearer $TOKEN' -d '{\"name\":\"Test Subject\",\"priority\":3}'" '"name":"Test Subject"'
    
    # Get subject ID for next test
    try {
        $subjectResponse = curl -s -X POST "$API_BASE/subjects" -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"name":"Subject for Topics","priority":2}'
        
        if ($subjectResponse -match '"_id":"([^"]*)"') {
            $SUBJECT_ID = $matches[1]
            Write-Host "Subject ID: $SUBJECT_ID"
        }
    } catch {
        Write-Host "Could not get subject ID"
    }
}

# Test 4: Add Topic to Subject
if ($TOKEN -and $SUBJECT_ID) {
    Run-Test "Add Topic to Subject" "curl -s -X POST '$API_BASE/subjects/$SUBJECT_ID/topics' -H 'Content-Type: application/json' -H 'Authorization: Bearer $TOKEN' -d '{\"title\":\"Test Topic\",\"difficulty\":3,\"estimatedTime\":45}'" '"title":"Test Topic"'
}

# Test 5: Create Manual Task
if ($TOKEN) {
    Run-Test "Create Manual Task" "curl -s -X POST '$API_BASE/tasks' -H 'Content-Type: application/json' -H 'Authorization: Bearer $TOKEN' -d '{\"title\":\"Manual Test Task\",\"description\":\"Test description\",\"priority\":2,\"deadline\":\"2024-12-31\"}'" '"topic":"Manual Test Task"'
}

# Test 6: Generate AI Study Plan
if ($TOKEN) {
    Run-Test "Generate AI Study Plan" "curl -s -X POST '$API_BASE/study-plan/generate' -H 'Content-Type: application/json' -H 'Authorization: Bearer $TOKEN' -d '{\"date\":\"2026-03-24\",\"overwrite\":true}'" '"tasksCreated"'
}

# Test 7: Get Subjects
if ($TOKEN) {
    Run-Test "Get All Subjects" "curl -s -X GET '$API_BASE/subjects' -H 'Authorization: Bearer $TOKEN'" '\['
}

# Test 8: Frontend Accessibility
Run-Test "Frontend Accessibility" "curl -s -o /dev/null -w '%{http_code}' '$FRONTEND_URL'" '200'

# Test 9: Frontend Login Page
Run-Test "Frontend Login Page" "curl -s '$FRONTEND_URL/login'" 'AI Study Planner'

# Test 10: Frontend Dashboard
Run-Test "Frontend Dashboard" "curl -s '$FRONTEND_URL/dashboard'" 'AI Study Planner'

# Final Results
Write-Host "`n==================================================" -ForegroundColor Yellow
Write-Host "📊 TEST RESULTS SUMMARY" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Yellow
Write-Host "✅ PASSED: $PASSED" -ForegroundColor Green
Write-Host "❌ FAILED: $FAILED" -ForegroundColor Red
Write-Host "📈 TOTAL: $($PASSED + $FAILED)" -ForegroundColor Yellow

if ($FAILED -eq 0) {
    Write-Host "`n🎉 ALL TESTS PASSED! AI Study Planner is fully functional!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n⚠️ Some tests failed. Check the logs above for details." -ForegroundColor Red
    exit 1
}
