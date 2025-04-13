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

#### 6. Fixed Quoting in Channels (Was working in DMs, fix by Muthui)
- **Files**: `ChatPage.jsx`
- **Fix**: Tweaked the code to properly quote in Channels, the same way it work in DMs
- **Rule**: `Not-Applicable`

#### 7. Unrecognized words "it", "describe" and "expect" from test files 
- **Files**: `account.test.js, default.test.js, channels.test.js`
- **Fix**: Added code lines 20-28 in the  `eslit.config.mjs` to enable the Jest environment for the test files
- **Rule**: `no-undef`

#### 8. Unrecognized words "it", "describe" and "expect" from test files 
- **Files**: `DMPage.jsx`
- **Fix**: Removed line 5 where the varibale `upload` is declared since it is never used 
- **Rule**: `no-unused-vars`

---

### ✅ Linter Report After Fixes:
See: [`eslint-report-after.txt`](./eslint-report-after.txt)
