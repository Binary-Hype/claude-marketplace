---
name: fluxui-docs
description: Automatically checks official FluxUI documentation (https://fluxui.dev/docs) when using or modifying Flux components. Fetches and analyzes component-specific documentation to ensure proper usage, available props, and best practices.
---

# FluxUI Documentation Checker

An intelligent skill that automatically references official FluxUI documentation when working with Flux components. This skill recognizes when Flux components are being used or modified, searches the FluxUI documentation site, and provides accurate information about component APIs, props, methods, and best practices.

## When to Use This Skill

Use this skill when:
- You're implementing a new Flux component in your code
- You need to understand available props for a Flux component
- You're modifying or customizing existing Flux components
- You want to verify the correct usage of a Flux component
- You need examples of how to use a specific Flux component
- You're troubleshooting issues with Flux components
- You want to ensure you're following FluxUI best practices
- You need to know the latest API for a Flux component

## What This Skill Does

This skill provides comprehensive FluxUI documentation support by:

1. **Component Recognition**
   - Identifies Flux component usage in code (e.g., `<flux:input>`, `<flux:button>`)
   - Recognizes Flux components being discussed or modified
   - Detects Flux component patterns in Livewire and Blade files

2. **Documentation Retrieval**
   - Searches https://fluxui.dev/docs for the specific component
   - Fetches the official documentation page for the component
   - Extracts relevant information about props, slots, methods, and usage

3. **Information Analysis**
   - Provides component API details (available props and their types)
   - Shows usage examples from official docs
   - Highlights important notes and best practices
   - Identifies common patterns and anti-patterns

4. **Context-Aware Guidance**
   - Answers specific questions about component usage
   - Suggests appropriate props for your use case
   - Provides alternatives when needed
   - Helps troubleshoot component-related issues

## How to Use

The skill automatically activates when you mention or work with Flux components:

```
/fluxui-docs What props are available for flux:input?
```

```
/fluxui-docs How do I use flux:button with icons?
```

```
/fluxui-docs Show me the documentation for flux:modal
```

Or simply work with Flux components and ask questions:

```
I'm adding a flux:select component. What options does it support?
```

```
How do I make a flux:checkbox disabled?
```

## Workflow

When this skill is invoked, it follows this process:

1. **Identify the Component**
   - Extract the Flux component name from your query or code
   - Normalize the component name (e.g., "flux:input", "flux.input", "Input")

2. **Search FluxUI Documentation**
   - Use WebFetch to access https://fluxui.dev/docs
   - Search for the specific component documentation page
   - Locate the URL for the component (e.g., https://fluxui.dev/docs/input)

3. **Retrieve Component Documentation**
   - Fetch the component's documentation page
   - Extract information about:
     - Available props and their types
     - Required vs optional props
     - Default values
     - Usage examples
     - Slots (if available)
     - Events (if available)
     - Special notes or warnings

4. **Provide Contextual Answer**
   - Answer the specific question asked
   - Include relevant code examples
   - Highlight important considerations
   - Suggest best practices

## Component Coverage

This skill works with all FluxUI components including:

**Form Components:**
- `flux:input` - Text inputs with various types
- `flux:textarea` - Multi-line text input
- `flux:select` - Dropdown selection
- `flux:checkbox` - Checkbox inputs
- `flux:radio` - Radio button groups
- `flux:toggle` - Toggle switches
- `flux:file` - File upload inputs

**UI Components:**
- `flux:button` - Buttons with variants
- `flux:badge` - Status badges
- `flux:modal` - Modal dialogs
- `flux:card` - Card containers
- `flux:table` - Data tables
- `flux:tabs` - Tabbed interfaces
- `flux:accordion` - Collapsible sections
- `flux:dropdown` - Dropdown menus

**Layout Components:**
- `flux:container` - Container layouts
- `flux:grid` - Grid layouts
- `flux:stack` - Stack layouts
- `flux:separator` - Visual separators

**Feedback Components:**
- `flux:alert` - Alert messages
- `flux:toast` - Toast notifications
- `flux:progress` - Progress bars
- `flux:spinner` - Loading spinners

## Examples

### Example 1: Input Component Query

**User asks:**
```
What props are available for flux:input?
```

**Skill behavior:**
1. Recognizes "flux:input" component
2. Fetches https://fluxui.dev/docs/input
3. Extracts prop information
4. Returns structured answer

**Example output:**
```
According to the FluxUI documentation, flux:input supports these props:

Required Props:
- name (string) - The input name attribute

Common Props:
- type (string) - Input type (text, email, password, etc.) [default: "text"]
- label (string) - Label text displayed above the input
- placeholder (string) - Placeholder text
- value (string) - Initial value
- disabled (boolean) - Disables the input [default: false]
- required (boolean) - Marks as required [default: false]

Validation Props:
- error (string) - Error message to display
- helper (string) - Helper text below input

Styling Props:
- size (string) - Size variant (sm, md, lg) [default: "md"]
- variant (string) - Visual variant

Note: FluxUI inputs automatically include error message handling,
so you don't need to add additional error displays.

Example usage:
<flux:input
    name="email"
    type="email"
    label="Email Address"
    placeholder="you@example.com"
    required
/>
```

### Example 2: Button with Icon

**User asks:**
```
How do I add an icon to a flux:button?
```

**Skill behavior:**
1. Identifies flux:button component and icon requirement
2. Fetches button documentation
3. Looks for icon-related information
4. Provides usage example

**Example output:**
```
Based on FluxUI docs, flux:button supports icons through slots:

Method 1: Using the icon slot
<flux:button>
    <x-slot:icon>
        <svg>...</svg>
    </x-slot:icon>
    Button Text
</flux:button>

Method 2: Using icon prop (if available)
<flux:button icon="heroicon-o-check">
    Button Text
</flux:button>

Available props for styling:
- iconPosition (string) - Position of icon (left, right) [default: "left"]

Example with Heroicons:
<flux:button variant="primary">
    <x-slot:icon>
        @svg('heroicon-o-arrow-right', 'w-5 h-5')
    </x-slot:icon>
    Continue
</flux:button>
```

### Example 3: Modal Component

**User asks:**
```
Show me how to use flux:modal
```

**Skill behavior:**
1. Fetches modal component documentation
2. Extracts comprehensive usage information
3. Provides complete example

**Example output:**
```
FluxUI Modal component usage (from official docs):

Basic Structure:
<flux:modal name="confirm-action">
    <flux:modal.header>
        Confirm Action
    </flux:modal.header>

    <flux:modal.body>
        Are you sure you want to continue?
    </flux:modal.body>

    <flux:modal.footer>
        <flux:button @click="$wire.closeModal()">Cancel</flux:button>
        <flux:button variant="primary" @click="$wire.confirm()">Confirm</flux:button>
    </flux:modal.footer>
</flux:modal>

Available Props:
- name (string) - Unique modal identifier [required]
- show (boolean) - Controls visibility
- maxWidth (string) - Maximum width (sm, md, lg, xl, 2xl)
- closeable (boolean) - Allow closing with X button [default: true]

Opening the modal:
$wire.openModal('confirm-action')

Closing the modal:
$wire.closeModal()

Best Practices:
- Always provide a unique name for each modal
- Use semantic structure (header, body, footer)
- Include clear action buttons
- Handle both confirm and cancel actions
```

### Example 4: Form Field with Error

**User asks:**
```
How do I show validation errors on a flux:select?
```

**Skill behavior:**
1. Fetches select component documentation
2. Focuses on error/validation handling
3. Notes the user's CLAUDE.md instruction about error messages

**Example output:**
```
FluxUI Select with error handling:

<flux:select
    name="status"
    label="Status"
    :options="$statusOptions"
    wire:model="status"
/>

Important: According to your project configuration, FluxUI inputs
already have error messages attached automatically. You don't need
to add additional error displays.

The component will automatically show validation errors from:
- Livewire validation
- Laravel Form Requests
- Manual $errors bag

Available error-related props:
- error (string) - Manual error message override

Auto-detection:
FluxUI components automatically detect errors from:
$errors->get('status')

So if your Livewire component has:
$this->validate(['status' => 'required']);

The flux:select will automatically show the error without additional markup.
```

### Example 5: Component Not Found

**User asks:**
```
How do I use flux:calendar?
```

**Skill behavior:**
1. Searches FluxUI docs for calendar component
2. If not found, provides helpful response

**Example output:**
```
I searched the FluxUI documentation but couldn't find a "flux:calendar"
component.

Available FluxUI components include:
- Form inputs (input, select, textarea, checkbox, radio, toggle)
- Buttons and badges
- Modals and dropdowns
- Tables and cards
- Layout components

Suggestions:
1. Check if the component has a different name in FluxUI
2. This component might be custom to your project
3. You might need a third-party package for calendar functionality
4. Consider using a date picker: flux:input with type="date"

Would you like me to:
- Show you how to use flux:input with type="date"?
- Search for calendar/date picker packages compatible with Livewire?
- Help you create a custom calendar component?
```

## Integration with Your Workflow

This skill integrates seamlessly with your development process:

**During Implementation:**
```
I need to add a user registration form. Let me check the FluxUI docs for the form components.
/fluxui-docs What components should I use for a registration form?
```

**During Code Review:**
```
I see you're using flux:button here. Let me verify you're using all available props correctly.
/fluxui-docs Review this flux:button usage for best practices
```

**During Troubleshooting:**
```
The flux:modal isn't closing properly. Let me check the docs.
/fluxui-docs How should I handle closing a flux:modal?
```

## Best Practices

1. **Always Check Documentation First**
   - Use this skill before implementing new Flux components
   - Verify prop names and types from official docs
   - Follow official examples and patterns

2. **Respect Project Conventions**
   - Remember: Use `<livewire:component>` syntax, not `@livewire('component')`
   - FluxUI inputs already have error messages (don't duplicate)
   - Follow your project's established patterns

3. **Stay Updated**
   - FluxUI may update component APIs
   - Use this skill to get the latest information
   - Check docs when upgrading FluxUI versions

4. **Combine with Other Skills**
   - Use alongside code-review for comprehensive feedback
   - Use with technical-refinement for planning Flux-based features
   - Reference during implementation for accurate prop usage

## Limitations

- Requires internet access to fetch FluxUI documentation
- Documentation accuracy depends on FluxUI maintaining their docs site
- May not cover undocumented or experimental features
- Custom components in your project won't be in FluxUI docs

## Tips for Best Results

1. **Be Specific**: Mention the exact component name (e.g., "flux:input" not just "input")
2. **Ask Direct Questions**: "What props does flux:button support?" vs "Tell me about buttons"
3. **Provide Context**: Mention what you're trying to achieve with the component
4. **Verify in Code**: Always test the documentation guidance in your actual project
5. **Report Issues**: If the docs seem outdated, verify against the FluxUI GitHub repo

## Related Use Cases

- Implementing forms with FluxUI components
- Building admin panels with Flux UI elements
- Creating consistent UI patterns across your app
- Migrating from other UI libraries to FluxUI
- Training team members on FluxUI usage
- Ensuring accessibility with proper component usage
- Optimizing component performance
- Troubleshooting component behavior

## Technical Implementation Notes

This skill uses the WebFetch tool to:
1. Access the FluxUI documentation site
2. Search for component-specific pages
3. Extract and parse documentation content
4. Present information in a developer-friendly format

The skill is designed to be efficient and cache-aware, minimizing unnecessary requests to the FluxUI documentation site while ensuring you always have access to the most current information.
