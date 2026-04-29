export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type TestCaseStatus = 'draft' | 'ready' | 'blocked' | 'deprecated';
export type ScenarioStatus = 'draft' | 'ready' | 'generating' | 'failed';
export type AutomationStatus = 'idle' | 'running' | 'pass' | 'fail';

export interface AutomationTest {
  id: string;
  name: string;
  status: AutomationStatus;
  lastRunAt?: string;
  runDurationMs?: number;
  recordingId?: string;       // Links to /recordings/$id
  screenshotUrl?: string;     // Thumbnail of last state (pass or fail screenshot)
  errorMessage?: string;      // Error excerpt for failed runs
  failedStepIndex?: number;   // Which step failed (1-based)
}

export interface TestStep {
  id: string;
  order: number;
  action: string;
  data?: string;
  expected: string;
}

export interface TestCase {
  id: string;
  order: number;
  code: string;
  title: string;
  description?: string;
  preCondition?: string;
  steps: TestStep[];
  tags: string[];
  priority: Priority;
  type: string;
  status: TestCaseStatus;
  automationTest?: AutomationTest;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestSection {
  id: string;
  order: number;
  title: string;
  description?: string;
  testCases: TestCase[];
}

export interface ScenarioStats {
  totalSections: number;
  totalTestCases: number;
  totalSteps: number;
  automatedCount: number;
  passCount: number;
  failCount: number;
  draftCount: number;
}

export interface TestScenarioV2 {
  id: string;
  title: string;
  description?: string;
  sections: TestSection[];
  projectId?: string;
  projectName?: string;
  status: ScenarioStatus;
  error?: string;
  stats?: ScenarioStats;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

function autoStats(sections: TestSection[]): ScenarioStats {
  const allCases = sections.flatMap(s => s.testCases);
  const allSteps = allCases.flatMap(tc => tc.steps);
  const automated = allCases.filter(tc => tc.automationTest);
  return {
    totalSections: sections.length,
    totalTestCases: allCases.length,
    totalSteps: allSteps.length,
    automatedCount: automated.length,
    passCount: automated.filter(tc => tc.automationTest?.status === 'pass').length,
    failCount: automated.filter(tc => tc.automationTest?.status === 'fail').length,
    draftCount: allCases.filter(tc => tc.status === 'draft').length,
  };
}

const now = new Date().toISOString();

const scenarioEcommerce: TestScenarioV2 = {
  id: 'mock-scenario-ecommerce',
  title: 'E-Commerce Platform End-to-End Test Suite',
  description:
    'Comprehensive QA coverage for the customer-facing e-commerce web application. Covers authentication, catalog browsing, cart management, checkout flows, and post-order operations.',
  projectId: '42',
  projectName: 'E-Commerce Web',
  status: 'ready',
  createdAt: '2025-03-15T08:00:00Z',
  updatedAt: now,
  createdBy: 'Kevin Ananda',
  sections: [
    {
      id: 'sec-auth',
      order: 1,
      title: 'Authentication',
      description: 'Login, registration, password reset, and session management.',
      testCases: [
        {
          id: 'tc-auth-001',
          order: 1,
          code: 'TC-001',
          title: 'Login with valid credentials',
          description: 'Verify that registered users can successfully log in using valid username and password.',
          preCondition: 'User account "testuser@example.com" exists and is active.',
          status: 'ready',
          priority: 'high',
          type: 'positive',
          tags: ['smoke', 'login', 'regression'],
          automationTest: {
            id: 'auto-auth-001',
            name: 'Auth_Login_Valid_Credentials',
            status: 'pass',
            lastRunAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
            runDurationMs: 3200,
            recordingId: 'rec-auth-001',
          },
          steps: [
            { id: 'st-001-1', order: 1, action: 'Navigate to /login page', expected: 'Login form is displayed with username and password fields' },
            { id: 'st-001-2', order: 2, action: 'Enter "testuser@example.com" in the username field', data: 'testuser@example.com', expected: 'Username field displays the entered email' },
            { id: 'st-001-3', order: 3, action: 'Enter "SecurePass123!" in the password field', data: 'SecurePass123!', expected: 'Password characters are masked with dots' },
            { id: 'st-001-4', order: 4, action: 'Click the "Sign In" button', expected: 'User is redirected to /dashboard and greeting shows "Welcome back"' },
          ],
          note: 'Occasionally flaky on staging environment. Re-run once if first attempt fails.',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'tc-auth-002',
          order: 2,
          code: 'TC-002',
          title: 'Login with invalid password',
          description: 'Verify that login fails gracefully when the password is incorrect.',
          preCondition: 'User account exists.',
          status: 'ready',
          priority: 'high',
          type: 'negative',
          tags: ['smoke', 'login', 'security'],
          automationTest: {
            id: 'auto-auth-002',
            name: 'Auth_Login_Invalid_Password',
            status: 'pass',
            lastRunAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            runDurationMs: 2800,
            recordingId: 'rec-auth-002',
          },
          steps: [
            { id: 'st-002-1', order: 1, action: 'Navigate to /login page', expected: 'Login form is displayed' },
            { id: 'st-002-2', order: 2, action: 'Enter valid username', data: 'testuser@example.com', expected: 'Username field populated' },
            { id: 'st-002-3', order: 3, action: 'Enter invalid password', data: 'WrongPassword!', expected: 'Password field populated' },
            { id: 'st-002-4', order: 4, action: 'Click the "Sign In" button', expected: 'Error message "Invalid credentials" is displayed. User remains on login page.' },
          ],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'tc-auth-003',
          order: 3,
          code: 'TC-003',
          title: 'Password reset flow',
          description: 'Verify users can request a password reset and receive an email.',
          status: 'ready',
          priority: 'medium',
          type: 'positive',
          tags: ['login', 'email'],
          automationTest: {
            id: 'auto-auth-003',
            name: 'Auth_Password_Reset',
            status: 'fail',
            lastRunAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
            runDurationMs: 15400,
            recordingId: 'rec-auth-003',
            errorMessage: 'Email delivery timeout: Expected confirmation email within 60s, but inbox remained empty after 120s.',
            failedStepIndex: 4,
          },
          steps: [
            { id: 'st-003-1', order: 1, action: 'Click "Forgot password?" on login page', expected: 'Password reset form appears' },
            { id: 'st-003-2', order: 2, action: 'Enter registered email address', data: 'testuser@example.com', expected: 'Email field accepts input' },
            { id: 'st-003-3', order: 3, action: 'Click "Send reset link" button', expected: 'Success toast: "Check your email" appears' },
            { id: 'st-003-4', order: 4, action: 'Check test email inbox', expected: 'Password reset email received within 60 seconds' },
          ],
          note: 'Email delivery is timing out in CI. Needs investigation.',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'tc-auth-004',
          order: 4,
          code: 'TC-004',
          title: 'Session expiry after 30 minutes',
          description: 'Verify inactive sessions are terminated after the configured timeout.',
          status: 'draft',
          priority: 'medium',
          type: 'positive',
          tags: ['security', 'session'],
          steps: [
            { id: 'st-004-1', order: 1, action: 'Login as a regular user', expected: 'Dashboard loads successfully' },
            { id: 'st-004-2', order: 2, action: 'Wait 30 minutes without any activity', expected: 'Session token expires server-side' },
            { id: 'st-004-3', order: 3, action: 'Attempt to navigate to /profile', expected: 'User is redirected to /login with "Session expired" message' },
          ],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'tc-auth-005',
          order: 5,
          code: 'TC-005',
          title: 'Concurrent login from two devices',
          description: 'Verify session handling when the same user logs in from two browsers.',
          status: 'ready',
          priority: 'low',
          type: 'positive',
          tags: ['security', 'session'],
          automationTest: {
            id: 'auto-auth-005',
            name: 'Auth_Concurrent_Login',
            status: 'pass',
            lastRunAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            runDurationMs: 5100,
            recordingId: 'rec-auth-005',
          },
          steps: [
            { id: 'st-005-1', order: 1, action: 'Login in Chrome browser', expected: 'Session A created' },
            { id: 'st-005-2', order: 2, action: 'Login in Firefox browser with same credentials', expected: 'Session B created. Session A remains valid or is invalidated based on config.' },
            { id: 'st-005-3', order: 3, action: 'Refresh page in Chrome', expected: 'Behavior matches product spec for concurrent sessions' },
          ],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'tc-auth-006',
          order: 6,
          code: 'TC-006',
          title: 'Registration with existing email',
          description: 'Verify duplicate email registration is rejected.',
          status: 'ready',
          priority: 'high',
          type: 'negative',
          tags: ['registration', 'validation'],
          steps: [
            { id: 'st-006-1', order: 1, action: 'Navigate to /register', expected: 'Registration form displayed' },
            { id: 'st-006-2', order: 2, action: 'Fill form with already-registered email', data: 'existing@example.com', expected: 'All fields valid except duplicate email' },
            { id: 'st-006-3', order: 3, action: 'Click "Create Account"', expected: 'Validation error: "Email already registered" shown under email field' },
          ],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'tc-auth-007',
          order: 7,
          code: 'TC-007',
          title: 'Registration password strength validation',
          description: 'Verify weak passwords are rejected during registration.',
          status: 'draft',
          priority: 'medium',
          type: 'negative',
          tags: ['registration', 'security'],
          steps: [
            { id: 'st-007-1', order: 1, action: 'Navigate to /register', expected: 'Registration form displayed' },
            { id: 'st-007-2', order: 2, action: 'Enter weak password "123"', data: '123', expected: 'Password strength indicator shows "Weak" in red' },
            { id: 'st-007-3', order: 3, action: 'Attempt to submit form', expected: 'Form submission blocked with validation message' },
          ],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'tc-auth-008',
          order: 8,
          code: 'TC-008',
          title: 'Logout functionality',
          description: 'Verify logout clears session and redirects to login.',
          status: 'ready',
          priority: 'high',
          type: 'positive',
          tags: ['smoke', 'login'],
          automationTest: {
            id: 'auto-auth-008',
            name: 'Auth_Logout',
            status: 'pass',
            lastRunAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
            runDurationMs: 2100,
            recordingId: 'rec-auth-008',
          },
          steps: [
            { id: 'st-008-1', order: 1, action: 'Login as a user', expected: 'Dashboard loads' },
            { id: 'st-008-2', order: 2, action: 'Click user avatar dropdown', expected: 'Dropdown menu appears with Logout option' },
            { id: 'st-008-3', order: 3, action: 'Click "Logout"', expected: 'User redirected to /login. Session cookie removed.' },
            { id: 'st-008-4', order: 4, action: 'Navigate back to /dashboard via browser back button', expected: 'Redirected to /login. Dashboard content not accessible.' },
          ],
          createdAt: now,
          updatedAt: now,
        },
      ],
    },
    {
      id: 'sec-catalog',
      order: 2,
      title: 'Product Catalog',
      description: 'Browsing, filtering, searching, and viewing product details.',
      testCases: [
        {
          id: 'tc-cat-001',
          order: 1,
          code: 'TC-009',
          title: 'Browse product category listing',
          description: 'Verify category pages load products with correct pagination.',
          status: 'ready',
          priority: 'high',
          type: 'positive',
          tags: ['catalog', 'smoke'],
          automationTest: {
            id: 'auto-cat-001',
            name: 'Catalog_Browse_Category',
            status: 'pass',
            lastRunAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            runDurationMs: 4200,
            recordingId: 'rec-cat-001',
          },
          steps: [
            { id: 'st-009-1', order: 1, action: 'Navigate to /category/electronics', expected: 'Page loads with electronics products' },
            { id: 'st-009-2', order: 2, action: 'Verify first page shows 24 products', expected: 'Product grid contains exactly 24 items' },
            { id: 'st-009-3', order: 3, action: 'Click page 2 in pagination', expected: 'Next 24 products loaded. URL updated with ?page=2' },
          ],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'tc-cat-002',
          order: 2,
          code: 'TC-010',
          title: 'Search for product by keyword',
          description: 'Verify search returns relevant results.',
          status: 'ready',
          priority: 'high',
          type: 'positive',
          tags: ['catalog', 'search'],
          automationTest: {
            id: 'auto-cat-002',
            name: 'Catalog_Search_Keyword',
            status: 'pass',
            lastRunAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
            runDurationMs: 3600,
            recordingId: 'rec-cat-002',
          },
          steps: [
            { id: 'st-010-1', order: 1, action: 'Click search bar', expected: 'Search input focused' },
            { id: 'st-010-2', order: 2, action: 'Type "wireless headphones"', data: 'wireless headphones', expected: 'Search suggestions appear' },
            { id: 'st-010-3', order: 3, action: 'Press Enter', expected: 'Search results page loads with relevant products' },
            { id: 'st-010-4', order: 4, action: 'Verify result count is greater than 0', expected: 'At least 1 product shown in results' },
          ],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'tc-cat-003',
          order: 3,
          code: 'TC-011',
          title: 'Apply multiple filters simultaneously',
          description: 'Verify combining brand, price, and rating filters works correctly.',
          status: 'draft',
          priority: 'medium',
          type: 'positive',
          tags: ['catalog', 'filter'],
          steps: [
            { id: 'st-011-1', order: 1, action: 'Navigate to /category/laptops', expected: 'Laptops listing page loads' },
            { id: 'st-011-2', order: 2, action: 'Select brand filter "Dell"', expected: 'Only Dell laptops displayed. URL updated.' },
            { id: 'st-011-3', order: 3, action: 'Set price range $500-$1000', expected: 'Products filtered to price range' },
            { id: 'st-011-4', order: 4, action: 'Select 4+ star rating filter', expected: 'Only Dell laptops $500-$1000 with 4+ stars shown' },
            { id: 'st-011-5', order: 5, action: 'Verify no results message when filters are too restrictive', data: 'brand=Apple, price=$0-$100', expected: '"No products match your filters" message shown' },
          ],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'tc-cat-004',
          order: 4,
          code: 'TC-012',
          title: 'Product detail page loads all variants',
          description: 'Verify color and size variants are displayed correctly.',
          status: 'ready',
          priority: 'medium',
          type: 'positive',
          tags: ['catalog', 'product'],
          steps: [
            { id: 'st-012-1', order: 1, action: 'Click on a product with variants', expected: 'Product detail page loads' },
            { id: 'st-012-2', order: 2, action: 'Verify color swatches are visible', expected: 'Color options shown as clickable swatches' },
            { id: 'st-012-3', order: 3, action: 'Click a different color swatch', expected: 'Product image updates to selected color' },
            { id: 'st-012-4', order: 4, action: 'Verify price updates for premium variant', expected: 'Price reflects selected variant correctly' },
          ],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'tc-cat-005',
          order: 5,
          code: 'TC-013',
          title: 'Out of stock product behavior',
          description: 'Verify out-of-stock products show correct messaging.',
          status: 'ready',
          priority: 'medium',
          type: 'negative',
          tags: ['catalog', 'inventory'],
          automationTest: {
            id: 'auto-cat-005',
            name: 'Catalog_Out_Of_Stock',
            status: 'pass',
            lastRunAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
            runDurationMs: 2900,
            recordingId: 'rec-cat-005',
          },
          steps: [
            { id: 'st-013-1', order: 1, action: 'Navigate to out-of-stock product page', expected: 'Product detail loads' },
            { id: 'st-013-2', order: 2, action: 'Verify "Out of Stock" badge is visible', expected: 'Red badge displayed near product title' },
            { id: 'st-013-3', order: 3, action: 'Verify "Add to Cart" button is disabled', expected: 'Button grayed out with text "Unavailable"' },
            { id: 'st-013-4', order: 4, action: 'Verify "Notify when available" option shown', expected: 'Email input and Notify button visible' },
          ],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'tc-cat-006',
          order: 6,
          code: 'TC-014',
          title: 'Sort products by price low to high',
          description: 'Verify sorting functionality works correctly.',
          status: 'ready',
          priority: 'low',
          type: 'positive',
          tags: ['catalog', 'sorting'],
          steps: [
            { id: 'st-014-1', order: 1, action: 'Navigate to category page', expected: 'Products loaded with default sorting' },
            { id: 'st-014-2', order: 2, action: 'Select "Price: Low to High" from sort dropdown', expected: 'Products reordered by ascending price' },
            { id: 'st-014-3', order: 3, action: 'Verify first product has lowest price', expected: 'Price of first item <= price of second item' },
          ],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'tc-cat-007',
          order: 7,
          code: 'TC-015',
          title: 'Quick view modal',
          description: 'Verify quick view opens a modal with product summary.',
          status: 'draft',
          priority: 'low',
          type: 'positive',
          tags: ['catalog', 'ui'],
          steps: [
            { id: 'st-015-1', order: 1, action: 'Hover over product card', expected: 'Quick view button appears' },
            { id: 'st-015-2', order: 2, action: 'Click quick view button', expected: 'Modal opens with product image, title, price, and Add to Cart' },
            { id: 'st-015-3', order: 3, action: 'Click outside modal', expected: 'Modal closes' },
          ],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'tc-cat-008',
          order: 8,
          code: 'TC-016',
          title: 'Compare products feature',
          description: 'Verify product comparison table works.',
          status: 'blocked',
          priority: 'low',
          type: 'positive',
          tags: ['catalog', 'feature'],
          note: 'Blocked by backend ticket API-442. Comparison endpoint not ready.',
          steps: [
            { id: 'st-016-1', order: 1, action: 'Click compare checkbox on two products', expected: 'Compare bar appears at bottom' },
            { id: 'st-016-2', order: 2, action: 'Click "Compare" in compare bar', expected: 'Comparison page loads with spec table' },
          ],
          createdAt: now,
          updatedAt: now,
        },
      ],
    },
    {
      id: 'sec-cart',
      order: 3,
      title: 'Shopping Cart',
      description: 'Adding, updating quantities, and removing items from cart.',
      testCases: [
        {
          id: 'tc-cart-001',
          order: 1,
          code: 'TC-017',
          title: 'Add single item to cart',
          description: 'Verify a product can be added to the cart.',
          status: 'ready',
          priority: 'critical',
          type: 'positive',
          tags: ['cart', 'smoke', 'checkout'],
          automationTest: {
            id: 'auto-cart-001',
            name: 'Cart_Add_Single_Item',
            status: 'pass',
            lastRunAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
            runDurationMs: 2500,
            recordingId: 'rec-cart-001',
          },
          steps: [
            { id: 'st-017-1', order: 1, action: 'Navigate to a product page', expected: 'Product detail loads' },
            { id: 'st-017-2', order: 2, action: 'Click "Add to Cart" button', expected: 'Toast notification: "Added to cart" appears' },
            { id: 'st-017-3', order: 3, action: 'Click cart icon in header', expected: 'Cart sidebar opens showing 1 item' },
            { id: 'st-017-4', order: 4, action: 'Verify product details in cart', expected: 'Product name, price, quantity (1) match' },
          ],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'tc-cart-002',
          order: 2,
          code: 'TC-018',
          title: 'Update item quantity in cart',
          description: 'Verify quantity can be changed and totals update.',
          status: 'ready',
          priority: 'high',
          type: 'positive',
          tags: ['cart'],
          automationTest: {
            id: 'auto-cart-002',
            name: 'Cart_Update_Quantity',
            status: 'pass',
            lastRunAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
            runDurationMs: 3100,
            recordingId: 'rec-cart-002',
          },
          steps: [
            { id: 'st-018-1', order: 1, action: 'Add a product to cart', expected: 'Product in cart' },
            { id: 'st-018-2', order: 2, action: 'Change quantity from 1 to 3', data: '3', expected: 'Quantity field shows 3' },
            { id: 'st-018-3', order: 3, action: 'Click update button', expected: 'Cart total recalculated to 3x unit price' },
            { id: 'st-018-4', order: 4, action: 'Verify subtotal accuracy', expected: 'Subtotal = unit price * 3' },
          ],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'tc-cart-003',
          order: 3,
          code: 'TC-019',
          title: 'Remove item from cart',
          description: 'Verify items can be removed and cart updates correctly.',
          status: 'ready',
          priority: 'high',
          type: 'positive',
          tags: ['cart'],
          automationTest: {
            id: 'auto-cart-003',
            name: 'Cart_Remove_Item',
            status: 'pass',
            lastRunAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
            runDurationMs: 2400,
            recordingId: 'rec-cart-003',
          },
          steps: [
            { id: 'st-019-1', order: 1, action: 'Add two different products to cart', expected: 'Cart shows 2 items' },
            { id: 'st-019-2', order: 2, action: 'Click remove (X) on first item', expected: 'Item removed with animation' },
            { id: 'st-019-3', order: 3, action: 'Verify cart total updated', expected: 'Total reflects only remaining item' },
            { id: 'st-019-4', order: 4, action: 'Verify cart badge shows 1', expected: 'Header cart badge displays "1"' },
          ],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'tc-cart-004',
          order: 4,
          code: 'TC-020',
          title: 'Add out-of-stock item to cart',
          description: 'Verify out-of-stock items cannot be added.',
          status: 'ready',
          priority: 'medium',
          type: 'negative',
          tags: ['cart', 'inventory'],
          steps: [
            { id: 'st-020-1', order: 1, action: 'Navigate to out-of-stock product', expected: 'Product page loads with out-of-stock badge' },
            { id: 'st-020-2', order: 2, action: 'Attempt to click "Add to Cart"', expected: 'Button is disabled, click has no effect' },
            { id: 'st-020-3', order: 3, action: 'Verify cart count unchanged', expected: 'Cart badge shows same count as before' },
          ],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'tc-cart-005',
          order: 5,
          code: 'TC-021',
          title: 'Cart persists across sessions',
          description: 'Verify cart items survive page refresh and re-login.',
          status: 'draft',
          priority: 'medium',
          type: 'positive',
          tags: ['cart', 'session'],
          steps: [
            { id: 'st-021-1', order: 1, action: 'Add item to cart while logged in', expected: 'Item in cart' },
            { id: 'st-021-2', order: 2, action: 'Refresh browser page', expected: 'Cart still contains the item' },
            { id: 'st-021-3', order: 3, action: 'Logout and login again', expected: 'Cart still contains the item after re-authentication' },
          ],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'tc-cart-006',
          order: 6,
          code: 'TC-022',
          title: 'Apply coupon code',
          description: 'Verify valid coupon codes apply discounts correctly.',
          status: 'ready',
          priority: 'high',
          type: 'positive',
          tags: ['cart', 'promo'],
          automationTest: {
            id: 'auto-cart-006',
            name: 'Cart_Apply_Coupon',
            status: 'fail',
            lastRunAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
            runDurationMs: 4800,
            recordingId: 'rec-cart-006',
            errorMessage: 'Coupon service returned 500 Internal Server Error on POST /api/coupons/apply. Response: {"error":"service_unavailable"}.',
            failedStepIndex: 3,
          },
          steps: [
            { id: 'st-022-1', order: 1, action: 'Add item to cart and go to cart page', expected: 'Cart page loaded with items' },
            { id: 'st-022-2', order: 2, action: 'Enter coupon code "SAVE20"', data: 'SAVE20', expected: 'Coupon code entered in promo field' },
            { id: 'st-022-3', order: 3, action: 'Click "Apply" button', expected: 'Discount applied. Total reduced by 20%.' },
            { id: 'st-022-4', order: 4, action: 'Verify discount line item shown', expected: 'Line item: "Discount (SAVE20) -$X.XX" visible' },
          ],
          note: 'Coupon service returning 500 in staging. Test fails on apply step.',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'tc-cart-007',
          order: 7,
          code: 'TC-023',
          title: 'Invalid coupon code rejection',
          description: 'Verify expired/invalid coupons are rejected.',
          status: 'ready',
          priority: 'medium',
          type: 'negative',
          tags: ['cart', 'promo'],
          steps: [
            { id: 'st-023-1', order: 1, action: 'Go to cart page with items', expected: 'Cart page loaded' },
            { id: 'st-023-2', order: 2, action: 'Enter expired coupon "EXPIRED"', data: 'EXPIRED', expected: 'Code entered' },
            { id: 'st-023-3', order: 3, action: 'Click "Apply"', expected: 'Error message: "Coupon code is invalid or expired"' },
            { id: 'st-023-4', order: 4, action: 'Verify cart total unchanged', expected: 'Total remains original amount' },
          ],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'tc-cart-008',
          order: 8,
          code: 'TC-024',
          title: 'Cart minimum order validation',
          description: 'Verify checkout is blocked below minimum order value.',
          status: 'draft',
          priority: 'low',
          type: 'negative',
          tags: ['cart', 'validation'],
          steps: [
            { id: 'st-024-1', order: 1, action: 'Add a low-value item ($5) to cart', expected: 'Item in cart' },
            { id: 'st-024-2', order: 2, action: 'Click "Proceed to Checkout"', expected: 'Validation message: "Minimum order value is $10"' },
            { id: 'st-024-3', order: 3, action: 'Add another item to reach $10+', expected: 'Checkout button becomes enabled' },
          ],
          createdAt: now,
          updatedAt: now,
        },
      ],
    },
    {
      id: 'sec-checkout',
      order: 4,
      title: 'Checkout Flow',
      description: 'Shipping, billing, payment, and order confirmation.',
      testCases: [
        {
          id: 'tc-chk-001',
          order: 1,
          code: 'TC-025',
          title: 'Complete checkout with credit card',
          description: 'Verify full checkout flow using Stripe test card.',
          status: 'ready',
          priority: 'critical',
          type: 'positive',
          tags: ['checkout', 'smoke', 'payment'],
          automationTest: {
            id: 'auto-chk-001',
            name: 'Checkout_Credit_Card_Success',
            status: 'pass',
            lastRunAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            runDurationMs: 8900,
            recordingId: 'rec-chk-001',
          },
          steps: [
            { id: 'st-025-1', order: 1, action: 'Add item to cart and proceed to checkout', expected: 'Checkout page loads with cart summary' },
            { id: 'st-025-2', order: 2, action: 'Enter shipping address', data: '123 Test St, Test City, 12345', expected: 'Address form completed' },
            { id: 'st-025-3', order: 3, action: 'Select "Credit Card" payment method', expected: 'Stripe card element appears' },
            { id: 'st-025-4', order: 4, action: 'Enter test card 4242 4242 4242 4242', data: '4242 4242 4242 4242, 12/30, 123', expected: 'Card details accepted' },
            { id: 'st-025-5', order: 5, action: 'Click "Place Order"', expected: 'Order confirmation page loads with order number' },
          ],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'tc-chk-002',
          order: 2,
          code: 'TC-026',
          title: 'Checkout with saved address',
          description: 'Verify saved addresses populate the form automatically.',
          status: 'ready',
          priority: 'high',
          type: 'positive',
          tags: ['checkout', 'address'],
          steps: [
            { id: 'st-026-1', order: 1, action: 'Login as user with saved address', expected: 'User authenticated' },
            { id: 'st-026-2', order: 2, action: 'Go to checkout with cart items', expected: 'Checkout page loads' },
            { id: 'st-026-3', order: 3, action: 'Select saved address from dropdown', expected: 'Shipping form auto-populated with saved address' },
            { id: 'st-026-4', order: 4, action: 'Verify address fields are disabled', expected: 'Fields show saved address, edit button available' },
          ],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'tc-chk-003',
          order: 3,
          code: 'TC-027',
          title: 'Declined card handling',
          description: 'Verify declined payment shows appropriate error.',
          status: 'ready',
          priority: 'high',
          type: 'negative',
          tags: ['checkout', 'payment'],
          automationTest: {
            id: 'auto-chk-003',
            name: 'Checkout_Declined_Card',
            status: 'pass',
            lastRunAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            runDurationMs: 5600,
            recordingId: 'rec-chk-003',
          },
          steps: [
            { id: 'st-027-1', order: 1, action: 'Proceed to checkout', expected: 'Checkout page loaded' },
            { id: 'st-027-2', order: 2, action: 'Enter declined test card 4000 0000 0000 0002', data: '4000 0000 0000 0002', expected: 'Card details entered' },
            { id: 'st-027-3', order: 3, action: 'Click "Place Order"', expected: 'Error message: "Your card was declined."' },
            { id: 'st-027-4', order: 4, action: 'Verify user remains on checkout page', expected: 'Order not placed. Cart intact.' },
          ],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'tc-chk-004',
          order: 4,
          code: 'TC-028',
          title: 'Guest checkout flow',
          description: 'Verify checkout works without creating an account.',
          status: 'draft',
          priority: 'high',
          type: 'positive',
          tags: ['checkout', 'guest'],
          steps: [
            { id: 'st-028-1', order: 1, action: 'Add item to cart as guest', expected: 'Cart has item, user not logged in' },
            { id: 'st-028-2', order: 2, action: 'Proceed to checkout', expected: 'Guest checkout form displayed' },
            { id: 'st-028-3', order: 3, action: 'Fill email and shipping address', expected: 'Form valid' },
            { id: 'st-028-4', order: 4, action: 'Complete payment with test card', expected: 'Order confirmed' },
            { id: 'st-028-5', order: 5, action: 'Verify order confirmation email sent', expected: 'Email received at provided address' },
          ],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'tc-chk-005',
          order: 5,
          code: 'TC-029',
          title: 'Shipping cost calculation',
          description: 'Verify shipping costs are calculated based on address and weight.',
          status: 'ready',
          priority: 'medium',
          type: 'positive',
          tags: ['checkout', 'shipping'],
          steps: [
            { id: 'st-029-1', order: 1, action: 'Add heavy item (5kg) to cart', expected: 'Item in cart' },
            { id: 'st-029-2', order: 2, action: 'Enter domestic address', expected: 'Address saved' },
            { id: 'st-029-3', order: 3, action: 'Verify standard shipping cost', expected: 'Shipping line shows $12.99' },
            { id: 'st-029-4', order: 4, action: 'Change to international address', expected: 'Shipping recalculates to $34.99' },
          ],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'tc-chk-006',
          order: 6,
          code: 'TC-030',
          title: 'Order confirmation email',
          description: 'Verify order confirmation email contains correct details.',
          status: 'ready',
          priority: 'medium',
          type: 'positive',
          tags: ['checkout', 'email'],
          automationTest: {
            id: 'auto-chk-006',
            name: 'Checkout_Confirmation_Email',
            status: 'pass',
            lastRunAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
            runDurationMs: 7200,
            recordingId: 'rec-chk-006',
          },
          steps: [
            { id: 'st-030-1', order: 1, action: 'Complete a purchase', expected: 'Order confirmation page shown' },
            { id: 'st-030-2', order: 2, action: 'Wait for email in test inbox', expected: 'Confirmation email arrives within 2 minutes' },
            { id: 'st-030-3', order: 3, action: 'Verify email subject', expected: 'Subject contains order number' },
            { id: 'st-030-4', order: 4, action: 'Verify email body contains order summary', expected: 'Items, prices, shipping address all correct' },
          ],
          createdAt: now,
          updatedAt: now,
        },
      ],
    },
    {
      id: 'sec-orders',
      order: 5,
      title: 'Order Management',
      description: 'Order history, tracking, returns, and cancellations.',
      testCases: [
        {
          id: 'tc-ord-001',
          order: 1,
          code: 'TC-031',
          title: 'View order history',
          description: 'Verify past orders are listed in account page.',
          status: 'ready',
          priority: 'medium',
          type: 'positive',
          tags: ['orders', 'account'],
          steps: [
            { id: 'st-031-1', order: 1, action: 'Login and navigate to /account/orders', expected: 'Order history page loads' },
            { id: 'st-031-2', order: 2, action: 'Verify orders are sorted by date (newest first)', expected: 'Most recent order at top' },
            { id: 'st-031-3', order: 3, action: 'Click on an order', expected: 'Order detail page loads with items and status' },
          ],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'tc-ord-002',
          order: 2,
          code: 'TC-032',
          title: 'Cancel unshipped order',
          description: 'Verify orders can be cancelled before shipping.',
          status: 'ready',
          priority: 'high',
          type: 'positive',
          tags: ['orders', 'cancellation'],
          automationTest: {
            id: 'auto-ord-002',
            name: 'Orders_Cancel_Unshipped',
            status: 'pass',
            lastRunAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
            runDurationMs: 4300,
            recordingId: 'rec-ord-002',
          },
          steps: [
            { id: 'st-032-1', order: 1, action: 'Place a test order', expected: 'Order confirmed with status "Processing"' },
            { id: 'st-032-2', order: 2, action: 'Go to order details', expected: 'Cancel button visible' },
            { id: 'st-032-3', order: 3, action: 'Click "Cancel Order"', expected: 'Confirmation dialog appears' },
            { id: 'st-032-4', order: 4, action: 'Confirm cancellation', expected: 'Order status changes to "Cancelled". Refund initiated.' },
          ],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'tc-ord-003',
          order: 3,
          code: 'TC-033',
          title: 'Track shipped order',
          description: 'Verify tracking number links to carrier website.',
          status: 'draft',
          priority: 'medium',
          type: 'positive',
          tags: ['orders', 'tracking'],
          steps: [
            { id: 'st-033-1', order: 1, action: 'Navigate to a shipped order', expected: 'Order shows status "Shipped"' },
            { id: 'st-033-2', order: 2, action: 'Click tracking number link', expected: 'Carrier tracking page opens in new tab' },
            { id: 'st-033-3', order: 3, action: 'Verify tracking number matches', expected: 'Carrier page shows same tracking number' },
          ],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'tc-ord-004',
          order: 4,
          code: 'TC-034',
          title: 'Request return for delivered item',
          description: 'Verify return request flow works.',
          status: 'ready',
          priority: 'medium',
          type: 'positive',
          tags: ['orders', 'returns'],
          steps: [
            { id: 'st-034-1', order: 1, action: 'Navigate to delivered order', expected: 'Order shows "Delivered" status' },
            { id: 'st-034-2', order: 2, action: 'Click "Request Return"', expected: 'Return form appears with item selection' },
            { id: 'st-034-3', order: 3, action: 'Select item and reason "Defective"', expected: 'Form valid' },
            { id: 'st-034-4', order: 4, action: 'Submit return request', expected: 'Return confirmation shown. Status updated.' },
          ],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'tc-ord-005',
          order: 5,
          code: 'TC-035',
          title: 'Reorder previous order',
          description: 'Verify reorder button adds all items to cart.',
          status: 'draft',
          priority: 'low',
          type: 'positive',
          tags: ['orders', 'ux'],
          steps: [
            { id: 'st-035-1', order: 1, action: 'Navigate to past order with 3 items', expected: 'Order detail loaded' },
            { id: 'st-035-2', order: 2, action: 'Click "Reorder" button', expected: 'All 3 items added to cart' },
            { id: 'st-035-3', order: 3, action: 'Go to cart', expected: 'Cart contains all 3 items with quantities matching original order' },
          ],
          createdAt: now,
          updatedAt: now,
        },
      ],
    },
  ],
};

// Compute stats after building sections
scenarioEcommerce.stats = autoStats(scenarioEcommerce.sections);

export const mockScenarios: Record<string, TestScenarioV2> = {
  [scenarioEcommerce.id]: scenarioEcommerce,
};

export function getMockScenario(id: string): TestScenarioV2 | undefined {
  return mockScenarios[id] ?? Object.values(mockScenarios)[0];
}
