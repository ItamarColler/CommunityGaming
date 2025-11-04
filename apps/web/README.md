# @community-gaming/web

Next.js 14+ web application with App Router and React Server Components.

## Tech Stack

- **Framework**: Next.js 14 (App Router, RSC)
- **State Management**: TanStack Query + Zustand
- **Styling**: CSS Modules + Global CSS Variables
- **UI Components**: Radix Primitives
- **Type Safety**: TypeScript + Zod

## Development

```bash
pnpm dev
```

## Build

```bash
pnpm build
```

## CSS Module Standard

All component-specific styles **must** use CSS Modules to ensure scoped styling and prevent style conflicts.

### Naming Convention

- **File naming**: Use `*.module.css` extension (e.g., `login.module.css`, `button.module.css`)
- **Class naming**: Use camelCase for CSS class names (e.g., `.loginPage`, `.submitButton`, `.formField`)
- **Import naming**: Always import as `styles`

### Import Pattern

```tsx
import styles from './filename.module.css';
```

### Usage Examples

**Good ✅**

```tsx
// LoginForm.tsx
import styles from './login.module.css';

export function LoginForm() {
  return (
    <div className={styles.loginFormContainer}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Welcome</h1>
        <button className={styles.submitButton}>Submit</button>
      </div>
    </div>
  );
}
```

```css
/* login.module.css */
.loginFormContainer {
  width: 100%;
  max-width: 420px;
}

.loginCard {
  background: white;
  border-radius: 12px;
  padding: 2.5rem;
}

.title {
  font-size: 1.875rem;
  font-weight: 700;
}

.submitButton {
  width: 100%;
  padding: 0.875rem 1.5rem;
}
```

**Bad ❌**

```tsx
// Don't use regular CSS files for component styles
import './login.css'; // ❌ Wrong

export function LoginForm() {
  return (
    <div className="login-form-container">
      {' '}
      {/* ❌ No scoping */}
      <h1 className="title">Welcome</h1>
    </div>
  );
}
```

### When to Use Global CSS

Use global CSS (`src/styles/globals.css`) **only** for:

- CSS resets
- Global typography
- CSS variables (colors, spacing, etc.)
- Global utility classes
- Base HTML element styles

### File Structure

```
src/
├── app/
│   ├── login/
│   │   ├── page.tsx              # Route page
│   │   ├── LoginForm.tsx         # Component
│   │   └── login.module.css      # Component styles ✅
│   ├── register/
│   │   ├── page.tsx
│   │   ├── RegisterForm.tsx
│   │   └── register.module.css   # Component styles ✅
│   └── page.module.css           # Home page styles ✅
└── styles/
    └── globals.css                # Global styles only
```

### Benefits

1. **Automatic scoping**: Class names are locally scoped, preventing conflicts
2. **Type safety**: CSS Modules work with TypeScript
3. **Tree shaking**: Unused styles can be eliminated
4. **Component colocation**: Styles live next to their components
5. **Better debugging**: Generated class names include component names in dev mode
