---
trigger: always_on
---

# Agent Gemini Guidelines

## 1. Angular Template Control Flow

Always use Angular’s modern control flow syntax in templates.

### Rules

* Use `@if` instead of legacy `*ngIf`
* Use `@for` instead of `*ngFor`
* Always include proper `track` expressions in loops for performance

### Example

```html
@if (isVisible) {
  <div>Content is visible</div>
}

@for (item of items; track item.id) {
  <div>{{ item.name }}</div>
}
```

---

## 2. Tailwind CSS Configuration

All styling colors must be centralized using the Tailwind configuration.

### Rules

* Do **not** use hardcoded color values in components
* Always define colors in `tailwind.config.js`
* Use semantic naming (e.g., `primary`, `secondary`, `accent`)

### Example

```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        primary: '#1E40AF',
        secondary: '#9333EA',
        accent: '#F59E0B',
      },
    },
  },
};
```

### Usage

```html
<div class="bg-primary text-white">
  Styled using Tailwind config colors
</div>
```

---

## 3. Angular Lifecycle Hooks

Prefer classical Angular lifecycle hooks over newer reactive or experimental approaches.

### Rules

* Use `ngOnInit()` for initialization logic
* Use `ngOnDestroy()` for cleanup
* Use additional hooks when required:

  * `ngOnChanges()`
  * `ngAfterViewInit()`

### Example

```ts
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
})
export class ExampleComponent implements OnInit, OnDestroy {

  ngOnInit(): void {
    // Initialization logic
  }

  ngOnDestroy(): void {
    // Cleanup logic
  }
}
```

---

## 4. Models and Types

All models and TypeScript types must be organized in a dedicated `models` directory.

### Rules

* Do **not** define interfaces or types inside components
* Place all models in the `models/` folder
* Use clear and descriptive naming conventions
* Prefer `interface` for object structures and `type` when needed

### Example Structure

```
src/
 └── app/
     └── models/
         ├── user.model.ts
         ├── product.model.ts
```

### Example Model

```ts
// models/user.model.ts
export interface User {
  id: number;
  name: string;
  email: string;
}
```

### Usage

```ts
import { User } from '../models/user.model';

const user: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
};
```

---

## 5. Never rounded border for cards

## 6. Don't use $ sign instead use ₹
