# Maintenance Log

## Date: April 11, 2025

### Summary:
Ran `npm run lint` and found multiple ESLint errors. This log documents the fixes applied, associated linter rules, and relevant commits.

---

### ✅ Linter Report Before Fixes:
See: [`eslint-report-before.txt`](./eslint-report-before.txt)

---

### 🔧 Fixes Applied:

#### 1. Remove unused variable 'e'
- **Files**: `server.js`
- **Fix**: Removed `error` form the try-catch block
- **Rule**: `no-unused-vars`

#### 2. Remove unused variable 'messageJSON'
- **Files**: `ChatPage.jsx`
- **Fix**: Removed lines 305- 314 where the varibale `messageJSON` is declared (line 314) and `messageData` is assigned a value but never used (line 305)
- **Rule**: `no-unused-vars`

#### 3. Remove unused variable 'chat_content'
- **Files**: `ChatPage.jsx`
- **Fix**: Removed line 686 where the varibale `chat_content` is declared
- **Rule**: `no-unused-vars`

#### 4. Fixed the raw apastrophe (') used in HTML block
- **Files**: `LoginPage.jsx`
- **Fix**: Replaced `'` with the HTML- safe character `&apos;` (line 252)
- **Rule**: `react/no-unescaped-entities`

#### 5. 'FileReader' is not defined 
- **Files**: `DM.jsx, ChatPage.jsx, LoginPage.jsx`
- **Fix**: Added `...globals.browser` in the  `eslit.config.mjs` to inform ESLint that the code runs in a browser environment 
- **Rule**: `no-undef`




---

### ✅ Linter Report After Fixes:
See: [`eslint-report-after.txt`](./eslint-report-after.txt)
