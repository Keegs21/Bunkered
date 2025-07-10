# Contributing to Bunkered

We love your input! We want to make contributing to **Bunkered** as easy and transparent as possible, whether it's:

- 🐛 Reporting a bug
- 💬 Discussing the current state of the code
- 📝 Submitting a fix
- 🚀 Proposing new features
- 👨‍💻 Becoming a maintainer

## 📋 Table of Contents

- [Development Process](#development-process)
- [Mobile-First Requirements](#mobile-first-requirements)
- [Code Standards](#code-standards)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Testing Requirements](#testing-requirements)
- [Documentation Standards](#documentation-standards)

## 🔄 Development Process

We use GitHub to host code, track issues and feature requests, and accept pull requests.

### Getting Started

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a new branch for your feature/fix
4. **Make** your changes following our standards
5. **Test** thoroughly across devices
6. **Submit** a pull request

```bash
# Fork and clone
git clone https://github.com/your-username/bunkered.git
cd bunkered

# Create feature branch
git checkout -b feature/amazing-feature

# Make changes and commit
git add .
git commit -m "feat: add amazing mobile-optimized feature"

# Push and create PR
git push origin feature/amazing-feature
```

## 📱 Mobile-First Requirements

**Critical**: All contributions must follow our mobile-first approach.

### ✅ Mobile Requirements Checklist

- [ ] **Touch Targets**: Minimum 44px (iOS) / 48px (Android) for interactive elements
- [ ] **Responsive Design**: Works seamlessly from 320px to 2560px+ width
- [ ] **Typography**: Responsive font scaling with proper line heights
- [ ] **Performance**: No significant performance degradation on mobile devices
- [ ] **Accessibility**: WCAG 2.1 AA compliance for mobile interfaces
- [ ] **Cross-Device Testing**: Tested on multiple device sizes and orientations

### 🎯 Mobile Development Patterns

#### Component Structure

```typescript
const MyComponent: React.FC<Props> = ({ ...props }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Container
      sx={{
        // Mobile-first: base styles for xs (0px+)
        padding: 2,
        fontSize: "0.875rem",

        // Progressive enhancement for larger screens
        [theme.breakpoints.up("sm")]: {
          padding: 3,
          fontSize: "1rem",
        },
        [theme.breakpoints.up("md")]: {
          padding: 4,
          fontSize: "1.125rem",
        },
      }}
    >
      {isMobile ? <MobileLayout /> : <DesktopLayout />}
    </Container>
  );
};
```

#### Touch-Optimized Styling

```typescript
const touchOptimizedStyles = {
  minHeight: { xs: 52, sm: 44 }, // Larger on mobile
  fontSize: { xs: "16px", sm: "1rem" }, // Prevents iOS zoom
  cursor: "pointer",
  transition: "all 0.2s ease",

  "&:hover": {
    transform: { xs: "none", md: "translateY(-2px)" }, // No hover on mobile
  },

  "&:active": {
    transform: "scale(0.98)", // Touch feedback
  },
};
```

## 📝 Code Standards

### TypeScript Requirements

- **Strict Mode**: Enabled - no `any` types allowed
- **Interfaces**: Define clear interfaces for all props and data structures
- **Type Safety**: Comprehensive type coverage for all functions and components

```typescript
// ✅ Good: Properly typed component
interface PlayerCardProps {
  player: Player;
  onSelect: (player: Player) => void;
  variant?: "compact" | "expanded";
  showActions?: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  onSelect,
  variant = "compact",
  showActions = true,
}) => {
  // Implementation
};

// ❌ Bad: Any types and missing interfaces
const PlayerCard = ({ player, onSelect, ...props }: any) => {
  // Implementation
};
```

### React Patterns

#### Component Best Practices

```typescript
// ✅ Good: Mobile-responsive with proper hooks
const DataTable: React.FC<TableProps> = ({ data, columns }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use SortableTable for consistent mobile behavior
  return (
    <SortableTable
      columns={columns.map((col) => ({
        ...col,
        mobilePriority: col.mobilePriority || 3,
      }))}
      data={data}
      loading={loading}
      mobileCardLayout={true}
    />
  );
};

// ❌ Bad: Not mobile-optimized
const DataTable = ({ data, columns }) => (
  <Table>{/* Standard table without mobile consideration */}</Table>
);
```

#### State Management

```typescript
// ✅ Good: Proper state typing and management
interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const useUserData = () => {
  const [state, setState] = useState<UserState>({
    user: null,
    loading: false,
    error: null,
  });

  // Implementation with proper error handling
};
```

### Styling Standards

#### Mobile-First CSS-in-JS

```typescript
// ✅ Good: Mobile-first responsive design
const useStyles = () => ({
  container: {
    // Base mobile styles
    padding: 16,
    fontSize: 14,

    // Progressive enhancement
    [theme.breakpoints.up("sm")]: {
      padding: 24,
      fontSize: 16,
    },
    [theme.breakpoints.up("md")]: {
      padding: 32,
      fontSize: 18,
    },
  },
});

// ❌ Bad: Desktop-first approach
const badStyles = {
  padding: 32,
  fontSize: 18,

  [theme.breakpoints.down("md")]: {
    padding: 16,
    fontSize: 14,
  },
};
```

## 🔄 Pull Request Process

### Before Submitting

1. **Update Documentation**: Any API changes must include documentation updates
2. **Add Tests**: Minimum 80% code coverage for new features
3. **Mobile Testing**: Test on multiple device sizes
4. **Performance Check**: No significant performance regressions
5. **Accessibility Audit**: Ensure WCAG compliance

### PR Template

```markdown
## Description

Brief description of the changes

## Type of Change

- [ ] 🐛 Bug fix (non-breaking change)
- [ ] ✨ New feature (non-breaking change)
- [ ] 💥 Breaking change (fix or feature causing existing functionality to break)
- [ ] 📚 Documentation update

## Mobile Testing

- [ ] Tested on iPhone (specify model/size)
- [ ] Tested on Android (specify model/size)
- [ ] Tested on tablet (specify size)
- [ ] Verified touch targets meet minimum sizes
- [ ] Confirmed responsive behavior across breakpoints

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass (if applicable)
- [ ] Manual testing completed

## Screenshots

<!-- Add screenshots showing mobile and desktop views -->

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Code is commented (particularly complex areas)
- [ ] Documentation updated
- [ ] No console errors or warnings
```

### Review Process

1. **Automated Checks**: All CI/CD checks must pass
2. **Code Review**: At least one maintainer review required
3. **Mobile Review**: Mobile functionality verified by reviewer
4. **Performance Review**: No significant performance impact
5. **Merge**: Squash and merge with descriptive commit message

## 🐛 Issue Guidelines

### Bug Reports

Use our bug report template:

```markdown
**Bug Description**
Clear description of the bug

**To Reproduce**

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What should happen

**Screenshots**
Add screenshots (especially for mobile issues)

**Device Information:**

- Device: [e.g. iPhone 12, Samsung Galaxy S21]
- OS: [e.g. iOS 15.1, Android 12]
- Browser: [e.g. Safari, Chrome]
- Screen Size: [e.g. 375x667]
- Version: [e.g. 1.2.3]

**Additional Context**
Any other context about the problem
```

### Feature Requests

```markdown
**Feature Description**
Clear description of the feature

**Problem Statement**
What problem does this solve?

**Proposed Solution**
Describe your preferred solution

**Mobile Considerations**
How should this work on mobile devices?

**Alternatives Considered**
Other solutions you've considered

**Additional Context**
Screenshots, mockups, or other context
```

## 🧪 Testing Requirements

### Frontend Testing

```bash
# Unit tests with Vitest
npm run test

# Component testing with React Testing Library
npm run test:components

# E2E testing with Playwright
npm run test:e2e

# Mobile-specific testing
npm run test:mobile

# Coverage reporting (minimum 80%)
npm run test:coverage
```

#### Mobile Testing Patterns

```typescript
// tests/components/SortableTable.test.tsx
describe("SortableTable Mobile Behavior", () => {
  const mobileViewport = { width: 375, height: 667 };
  const tabletViewport = { width: 768, height: 1024 };

  test("switches to card layout on mobile", () => {
    render(<SortableTable {...props} />, {
      wrapper: MockThemeProvider,
      viewport: mobileViewport,
    });

    expect(screen.getByTestId("mobile-card-layout")).toBeInTheDocument();
    expect(screen.queryByTestId("desktop-table")).not.toBeInTheDocument();
  });

  test("handles touch interactions correctly", async () => {
    const user = userEvent.setup();
    render(<SortableTable {...props} />);

    const expandButton = screen.getByText("Show More");
    await user.click(expandButton);

    expect(screen.getByTestId("expanded-content")).toBeInTheDocument();
  });

  test("meets minimum touch target sizes", () => {
    render(<SortableTable {...props} />, { viewport: mobileViewport });

    const interactiveElements = screen.getAllByRole("button");
    interactiveElements.forEach((element) => {
      const styles = getComputedStyle(element);
      expect(parseInt(styles.minHeight)).toBeGreaterThanOrEqual(44);
      expect(parseInt(styles.minWidth)).toBeGreaterThanOrEqual(44);
    });
  });
});
```

### Backend Testing

```bash
# Unit tests with pytest
pytest tests/

# Integration tests
pytest tests/integration/

# API endpoint testing
pytest tests/api/

# Coverage reporting (minimum 80%)
pytest --cov=app tests/
```

## 📚 Documentation Standards

### Code Documentation

````typescript
/**
 * SortableTable component with intelligent mobile card layout
 *
 * @example
 * ```tsx
 * <SortableTable
 *   columns={[
 *     { id: "name", label: "Name", mobilePriority: 1 },
 *     { id: "rank", label: "Rank", mobilePriority: 2 },
 *   ]}
 *   data={players}
 *   mobileCardLayout={true}
 * />
 * ```
 */
interface SortableTableProps {
  /** Column definitions with mobile optimization options */
  columns: Column[];
  /** Data array to display */
  data: any[];
  /** Enable mobile card layout (auto-detected if not specified) */
  mobileCardLayout?: boolean;
}
````

### README Updates

When adding new features, update relevant documentation:

- **README.md**: Main project documentation
- **API.md**: API endpoint documentation
- **.ai-context.md**: AI development context
- **Component documentation**: JSDoc comments

### Commit Message Standards

Follow conventional commits:

```bash
# Features
feat(mobile): add touch-optimized player cards
feat(api): add mobile-optimized data endpoints

# Bug fixes
fix(mobile): resolve touch target sizing on iOS
fix(responsive): fix layout issues on small tablets

# Documentation
docs(mobile): update mobile development guidelines
docs(api): add mobile API optimization examples

# Performance
perf(mobile): optimize bundle size for mobile devices
perf(api): improve mobile data loading performance

# Tests
test(mobile): add comprehensive mobile interaction tests
test(responsive): add cross-device testing suite
```

## 🎯 Development Priorities

### High Priority

1. **Mobile Performance**: Optimal experience on all mobile devices
2. **Accessibility**: WCAG 2.1 AA compliance across all features
3. **Type Safety**: Comprehensive TypeScript coverage
4. **Test Coverage**: Minimum 80% coverage for all new code

### Medium Priority

1. **Documentation**: Clear, comprehensive documentation
2. **Performance**: Desktop optimization and bundle size
3. **Developer Experience**: Improved tooling and workflows

### Low Priority

1. **Advanced Features**: Complex analytics and visualizations
2. **Integrations**: Additional third-party service integrations

## 💬 Getting Help

- **GitHub Discussions**: For questions about development
- **GitHub Issues**: For bug reports and feature requests
- **Documentation**: Check `.ai-context.md` for AI assistant guidance
- **Code Review**: Ask for early feedback on complex changes

## 🏆 Recognition

Contributors who consistently follow these guidelines and make valuable contributions will be recognized as:

- **Top Contributors**: Featured in README
- **Core Team**: Invited to join maintenance team
- **Special Thanks**: Acknowledged in releases

---

**Thank you for contributing to Bunkered!** 🏌️‍♂️

Your efforts help make golf analytics accessible to everyone, on every device.
