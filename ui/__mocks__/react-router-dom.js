// Mock for react-router-dom to avoid ES module issues in Jest
// Note: Individual test files use jest.requireActual() to get the real module,
// so this mock is only used by test-utils.tsx for MemoryRouter and BrowserRouter

module.exports = {
  // Routers - simple pass-through implementations (used by test-utils.tsx)
  MemoryRouter: ({ children }) => children,
  BrowserRouter: ({ children }) => children,
  // Hooks - return default mocks (fallback when tests don't explicitly mock)
  // These are REQUIRED because some tests (Layout, LoginCard, SignupCard) don't mock
  // react-router-dom, but their components use these hooks
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  useParams: () => ({}),
};
