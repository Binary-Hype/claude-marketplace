---
name: refactoring-assistant
description: Identifies code smells and suggests refactoring improvements using proven design patterns. Helps improve code quality, maintainability, and testability with Laravel-specific refactoring guidance.
---

# Refactoring Assistant

An intelligent skill that analyzes your code to identify improvement opportunities, code smells, and anti-patterns, then provides actionable refactoring suggestions using industry best practices and Laravel-specific patterns.

## When to Use This Skill

Use this skill when:
- You have legacy code that needs improvement
- Code is becoming difficult to maintain or test
- You notice repetitive patterns across your codebase
- Methods or classes are growing too large
- You want to apply SOLID principles to existing code
- You're preparing code for a major feature addition
- Code review reveals complexity or maintainability issues
- You want to improve code readability and structure
- You need to extract reusable components or services

## What This Skill Does

This skill provides comprehensive refactoring guidance by:

1. **Code Smell Detection**
   - Long methods (>50 lines) and god classes
   - Duplicate code and similar patterns
   - Nested conditionals and complex logic
   - Feature envy (methods using other class data heavily)
   - Primitive obsession (not using value objects)
   - Dead code and unused parameters
   - Magic numbers and unclear variable names

2. **Laravel-Specific Analysis**
   - Fat controllers that should use Actions or Services
   - Complex Eloquent queries needing Query Scopes
   - Repeated validation logic needing Form Requests
   - Missing resource classes for API transformations
   - Opportunities for Observer patterns
   - Policy extraction opportunities
   - Job/Event extraction for async operations

3. **Design Pattern Recommendations**
   - **Action Pattern**: Single-responsibility classes for business logic
   - **Repository Pattern**: Database abstraction layers
   - **Strategy Pattern**: Interchangeable algorithms
   - **Factory Pattern**: Complex object creation
   - **Observer Pattern**: Event-driven architecture
   - **Decorator Pattern**: Adding behavior dynamically
   - **Service Pattern**: Coordinating multiple operations

4. **Refactoring Strategies**
   - Extract Method: Break down long methods
   - Extract Class: Split god classes
   - Replace Conditional with Polymorphism
   - Introduce Parameter Object
   - Replace Magic Numbers with Constants
   - Move Method to appropriate class
   - Rename for clarity

5. **Code Quality Improvements**
   - Improve naming conventions
   - Add type hints and return types
   - Enhance error handling
   - Reduce cyclomatic complexity
   - Improve testability through dependency injection
   - Add PHPDoc for complex logic

## How to Use

Simply invoke the skill when you want to improve existing code:

```
/refactoring-assistant
```

Or ask for specific refactoring help:

```
/refactoring-assistant Analyze my UserController for refactoring opportunities
```

```
I have a complex method that's hard to test. Can you help refactor it?
```

```
/refactoring-assistant Help me apply the Action pattern to this controller
```

## Refactoring Process

When this skill is invoked, it follows this systematic approach:

1. **Understand the Scope**
   - Identify which files need refactoring
   - Read the target code thoroughly
   - Understand the business logic and purpose
   - Check for related files and dependencies

2. **Analyze Code Quality**
   - Measure method and class complexity
   - Identify code smells and anti-patterns
   - Check for SOLID principle violations
   - Find duplicated or similar code patterns
   - Review Laravel conventions adherence

3. **Prioritize Issues**
   - **Critical**: Code that blocks testing or causes bugs
   - **High**: Significant complexity or maintainability issues
   - **Medium**: Code smells that reduce readability
   - **Low**: Minor improvements and naming conventions

4. **Generate Refactoring Plan**
   - List specific refactorings with rationale
   - Show before/after code examples
   - Explain benefits of each change
   - Highlight risks or considerations
   - Provide step-by-step implementation

5. **Validate with Code Review**
   - After refactoring suggestions, optionally invoke **code-review** subagent
   - Ensures refactored code maintains quality standards
   - Verifies no security or performance regressions

## Output Format

The skill provides structured refactoring recommendations:

```
## Refactoring Analysis: [FileName]

📊 Code Quality Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lines of Code: [X]
Methods Analyzed: [Y]
Issues Found: [Z]

Priority Breakdown:
🔴 Critical: [N]
🟠 High: [N]
🟡 Medium: [N]
⚪ Low: [N]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🔴 Critical Refactorings

### 1. [Issue Title] - [Method/Class:Line]

**Problem**:
[Clear description of the code smell or issue]

**Current Code**:
```php
[Problematic code snippet]
```

**Impact**:
- Makes testing difficult/impossible
- Creates tight coupling
- Violates SOLID principles
- [Other specific impacts]

**Refactoring Strategy**: [Pattern name]

**Refactored Code**:
```php
[Improved code example]
```

**Benefits**:
- ✓ Improved testability
- ✓ Better separation of concerns
- ✓ Follows Laravel conventions
- ✓ [Other benefits]

**Migration Steps**:
1. [Step by step instructions]
2. [How to safely apply changes]
3. [Testing recommendations]

---

## 🟠 High Priority Refactorings

[Same structure as above]

---

## 🟡 Medium Priority Refactorings

[Same structure as above]

---

## ⚪ Low Priority Refactorings

[Same structure as above]

---

## 📋 Refactoring Checklist

- [ ] Extract [method/class name]
- [ ] Create [Action/Service/Policy]
- [ ] Add type hints to [methods]
- [ ] Rename [variables] for clarity
- [ ] Move [logic] to appropriate class
- [ ] Add tests for refactored code

## 🎯 Overall Recommendations

1. **Immediate Actions** (Critical/High):
   - [Specific refactorings that should be done first]

2. **Next Steps** (Medium):
   - [Follow-up improvements]

3. **Future Considerations** (Low):
   - [Nice-to-have improvements]

## 🔗 Integration Suggestions

- Run **code-review** after refactoring to verify quality
- Use **commit-message** skill to document refactoring changes
- Consider **test-generator** to add tests for refactored code
```

## Laravel-Specific Refactoring Patterns

### 1. Fat Controller → Action Pattern

**Problem**: Controllers with complex business logic

```php
// BEFORE: Fat Controller
class UserController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([...]);

        $user = User::create($validated);

        $user->assignRole('customer');

        Mail::to($user)->send(new WelcomeEmail($user));

        event(new UserRegistered($user));

        $subscription = Subscription::create([
            'user_id' => $user->id,
            'plan' => $request->plan,
        ]);

        return redirect()->route('dashboard');
    }
}
```

**Solution**: Extract to Action class

```php
// AFTER: Thin Controller
class UserController extends Controller
{
    public function store(StoreUserRequest $request, RegisterUserAction $action)
    {
        $user = $action->execute($request->validated());

        return redirect()->route('dashboard');
    }
}

// App/Actions/RegisterUserAction.php
class RegisterUserAction
{
    public function execute(array $data): User
    {
        $user = User::create($data);

        $user->assignRole('customer');

        Mail::to($user)->send(new WelcomeEmail($user));

        event(new UserRegistered($user));

        if (isset($data['plan'])) {
            $this->createSubscription($user, $data['plan']);
        }

        return $user;
    }

    private function createSubscription(User $user, string $plan): Subscription
    {
        return Subscription::create([
            'user_id' => $user->id,
            'plan' => $plan,
        ]);
    }
}
```

### 2. Complex Queries → Query Scopes

**Problem**: Repeated complex queries across controllers

```php
// BEFORE: Repeated query logic
$activeUsers = User::where('status', 'active')
    ->where('email_verified_at', '!=', null)
    ->whereHas('subscription', function ($query) {
        $query->where('expires_at', '>', now());
    })
    ->get();
```

**Solution**: Extract to model scopes

```php
// AFTER: Reusable scopes
class User extends Model
{
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeVerified($query)
    {
        return $query->whereNotNull('email_verified_at');
    }

    public function scopeSubscribed($query)
    {
        return $query->whereHas('subscription', function ($query) {
            $query->where('expires_at', '>', now());
        });
    }
}

// Usage
$activeUsers = User::active()->verified()->subscribed()->get();
```

### 3. Validation Logic → Form Requests

**Problem**: Validation scattered across controllers

```php
// BEFORE: Inline validation
public function update(Request $request, User $user)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email,' . $user->id,
        'role' => 'required|in:admin,user',
    ]);

    $user->update($validated);
}
```

**Solution**: Extract to Form Request

```php
// AFTER: Form Request class
class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('user'));
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $this->user->id,
            'role' => 'required|in:admin,user',
        ];
    }
}

// Controller
public function update(UpdateUserRequest $request, User $user)
{
    $user->update($request->validated());
}
```

### 4. Raw Data → API Resources

**Problem**: Exposing raw models in API responses

```php
// BEFORE: Raw model data
public function show(User $user)
{
    return response()->json($user);
}
```

**Solution**: Use API Resources

```php
// AFTER: Controlled API response
class UserResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'created_at' => $this->created_at->toIso8601String(),
            'posts_count' => $this->whenLoaded('posts', fn() => $this->posts->count()),
        ];
    }
}

// Controller
public function show(User $user)
{
    return new UserResource($user->load('posts'));
}
```

### 5. Model Callbacks → Observers

**Problem**: Model bloated with event listeners

```php
// BEFORE: Callbacks in model
class User extends Model
{
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($user) {
            $user->uuid = Str::uuid();
        });

        static::created(function ($user) {
            Mail::to($user)->send(new WelcomeEmail($user));
        });

        static::deleting(function ($user) {
            $user->posts()->delete();
            $user->comments()->delete();
        });
    }
}
```

**Solution**: Extract to Observer

```php
// AFTER: Observer class
class UserObserver
{
    public function creating(User $user): void
    {
        $user->uuid = Str::uuid();
    }

    public function created(User $user): void
    {
        Mail::to($user)->send(new WelcomeEmail($user));
    }

    public function deleting(User $user): void
    {
        $user->posts()->delete();
        $user->comments()->delete();
    }
}

// Register in AppServiceProvider
User::observe(UserObserver::class);
```

## Example Refactoring Sessions

### Example 1: Refactoring a Payment Controller

**User Request:**
```
/refactoring-assistant Analyze PaymentController.php
```

**Output:**
```
## Refactoring Analysis: PaymentController.php

📊 Code Quality Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lines of Code: 245
Methods Analyzed: 6
Issues Found: 8

Priority Breakdown:
🔴 Critical: 2
🟠 High: 3
🟡 Medium: 2
⚪ Low: 1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🔴 Critical Refactorings

### 1. Extract Payment Processing to Action - processPayment():78-145

**Problem**:
The `processPayment` method contains 67 lines of complex business logic mixing validation, Stripe API calls, database operations, email notifications, and error handling. This violates Single Responsibility Principle and makes testing extremely difficult.

**Current Code**:
```php
public function processPayment(Request $request)
{
    // 67 lines of mixed concerns
    $validated = $request->validate([...]);

    try {
        $charge = Stripe::charges()->create([...]);

        $payment = Payment::create([...]);

        $order->update(['status' => 'paid']);

        Mail::to($user)->send(new PaymentReceipt($payment));

        event(new PaymentProcessed($payment));

        // ... more logic
    } catch (\Exception $e) {
        // Error handling
    }
}
```

**Impact**:
- Impossible to unit test without hitting Stripe API
- Can't mock email sending in tests
- Difficult to add new payment methods
- Hard to maintain and debug

**Refactoring Strategy**: Action Pattern + Service Layer

**Refactored Code**:
```php
// Controller (thin)
class PaymentController extends Controller
{
    public function processPayment(
        ProcessPaymentRequest $request,
        ProcessPaymentAction $action
    ) {
        try {
            $payment = $action->execute(
                $request->user(),
                $request->validated()
            );

            return response()->json([
                'success' => true,
                'payment' => new PaymentResource($payment),
            ]);
        } catch (PaymentFailedException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}

// Action (business logic)
class ProcessPaymentAction
{
    public function __construct(
        private StripeService $stripe,
        private PaymentRepository $payments
    ) {}

    public function execute(User $user, array $data): Payment
    {
        $charge = $this->stripe->createCharge(
            amount: $data['amount'],
            token: $data['stripe_token']
        );

        $payment = $this->payments->create([
            'user_id' => $user->id,
            'amount' => $data['amount'],
            'stripe_charge_id' => $charge->id,
        ]);

        event(new PaymentProcessed($payment));

        return $payment;
    }
}
```

**Benefits**:
- ✓ Controller reduced from 245 to 45 lines
- ✓ Each class has single responsibility
- ✓ Easy to test with mocked dependencies
- ✓ Can swap Stripe for other payment providers
- ✓ Business logic reusable across API/web
- ✓ Clear error handling strategy

**Migration Steps**:
1. Create `ProcessPaymentRequest` for validation
2. Create `ProcessPaymentAction` class
3. Create `StripeService` to wrap API calls
4. Update controller to use action
5. Write unit tests for action with mocks
6. Deploy and verify functionality

---

## 🟠 High Priority Refactorings

### 2. Extract Stripe Logic to Service - Multiple methods

**Problem**:
Stripe API calls are scattered across 4 different methods, making it hard to mock in tests and difficult to switch payment providers.

**Refactoring Strategy**: Service Pattern

**Refactored Code**:
```php
// App/Services/StripeService.php
class StripeService
{
    public function createCharge(int $amount, string $token): Charge
    {
        return Stripe::charges()->create([
            'amount' => $amount,
            'currency' => 'usd',
            'source' => $token,
        ]);
    }

    public function refundCharge(string $chargeId): Refund
    {
        return Stripe::refunds()->create([
            'charge' => $chargeId,
        ]);
    }

    public function createCustomer(User $user, string $token): Customer
    {
        return Stripe::customers()->create([
            'email' => $user->email,
            'source' => $token,
        ]);
    }
}
```

**Benefits**:
- ✓ Centralized Stripe logic
- ✓ Easy to mock in tests
- ✓ Can add logging/retry logic in one place
- ✓ Simpler to switch to different payment provider

---

[Additional refactorings...]

## 📋 Refactoring Checklist

- [ ] Extract ProcessPaymentAction class
- [ ] Create StripeService for API calls
- [ ] Create PaymentRepository for database operations
- [ ] Add ProcessPaymentRequest for validation
- [ ] Write unit tests for ProcessPaymentAction
- [ ] Write unit tests for StripeService
- [ ] Update routes and controller
- [ ] Test refactored payment flow

## 🎯 Overall Recommendations

1. **Immediate Actions** (Critical/High):
   - Extract payment processing to Action class
   - Create StripeService to isolate API calls
   - Add comprehensive unit tests

2. **Next Steps** (Medium):
   - Extract common email logic
   - Add refund action class
   - Implement payment method interface for provider swapping

3. **Future Considerations** (Low):
   - Consider event sourcing for payment history
   - Add retry mechanism for failed charges

## 🔗 Integration Suggestions

After refactoring:
- Run **code-review** subagent to verify code quality and security
- Use **test-generator** skill to create comprehensive test suite
- Use **commit-message** skill to document refactoring work
```

### Example 2: Refactoring Complex Conditional Logic

**User Request:**
```
This discount calculation method is getting too complex. Help me refactor it.
```

**Analysis Output:**
```
## Refactoring Analysis: calculateDiscount() method

🔴 Critical: Complex Conditional Logic

**Problem**:
Deeply nested if/else statements make the discount logic hard to understand, test, and extend.

**Current Code**:
```php
public function calculateDiscount(Order $order)
{
    $discount = 0;

    if ($order->user->isVip()) {
        if ($order->total > 1000) {
            $discount = 0.25;
        } else if ($order->total > 500) {
            $discount = 0.15;
        } else {
            $discount = 0.10;
        }
    } else if ($order->user->isReturning()) {
        if ($order->total > 500) {
            $discount = 0.10;
        } else {
            $discount = 0.05;
        }
    } else {
        if ($order->total > 1000) {
            $discount = 0.05;
        }
    }

    return $order->total * (1 - $discount);
}
```

**Refactoring Strategy**: Strategy Pattern + Polymorphism

**Refactored Code**:
```php
// Define strategy interface
interface DiscountStrategy
{
    public function calculate(Order $order): float;
}

// VIP discount strategy
class VipDiscountStrategy implements DiscountStrategy
{
    public function calculate(Order $order): float
    {
        return match(true) {
            $order->total > 1000 => 0.25,
            $order->total > 500 => 0.15,
            default => 0.10,
        };
    }
}

// Returning customer strategy
class ReturningCustomerDiscountStrategy implements DiscountStrategy
{
    public function calculate(Order $order): float
    {
        return $order->total > 500 ? 0.10 : 0.05;
    }
}

// New customer strategy
class NewCustomerDiscountStrategy implements DiscountStrategy
{
    public function calculate(Order $order): float
    {
        return $order->total > 1000 ? 0.05 : 0;
    }
}

// Discount calculator using strategy
class DiscountCalculator
{
    public function calculate(Order $order): float
    {
        $strategy = $this->getStrategy($order->user);
        $discountRate = $strategy->calculate($order);

        return $order->total * (1 - $discountRate);
    }

    private function getStrategy(User $user): DiscountStrategy
    {
        return match(true) {
            $user->isVip() => new VipDiscountStrategy(),
            $user->isReturning() => new ReturningCustomerDiscountStrategy(),
            default => new NewCustomerDiscountStrategy(),
        };
    }
}

// Usage in controller
$calculator = new DiscountCalculator();
$finalPrice = $calculator->calculate($order);
```

**Benefits**:
- ✓ Each discount strategy is isolated and testable
- ✓ Easy to add new customer types (just create new strategy)
- ✓ No nested conditionals - clear and readable
- ✓ Follows Open/Closed Principle
- ✓ Each strategy can have its own complex logic
```

## Tips for Effective Refactoring

1. **Start Small**
   - Refactor one method or class at a time
   - Ensure tests pass after each refactoring
   - Commit frequently with descriptive messages

2. **Write Tests First**
   - Add tests for current behavior before refactoring
   - Tests ensure refactoring doesn't break functionality
   - Use **test-generator** skill to create comprehensive tests

3. **Use Laravel Patterns**
   - Prefer Actions over fat controllers
   - Use Form Requests for validation
   - Leverage Eloquent scopes for query logic
   - Apply Observers for model events

4. **Maintain Backwards Compatibility**
   - Keep public APIs stable during refactoring
   - Use deprecation warnings if changing interfaces
   - Update documentation as you refactor

5. **Validate with Code Review**
   - Use **code-review** subagent after refactoring
   - Ensure no security or performance regressions
   - Verify Laravel best practices are followed

6. **Document Changes**
   - Use **commit-message** skill for clear commits
   - Update inline comments for complex logic
   - Note architectural decisions in docs

## Integration with Other Skills

This skill works well with:

- **code-review**: Validate refactored code meets quality standards
- **test-generator**: Create tests for refactored components
- **commit-message**: Document refactoring changes clearly
- **laravel-best-practices**: Ensure refactoring follows Laravel conventions

## Common Refactoring Red Flags

Watch for these code smells that signal refactoring needs:

1. **Method Length**: Methods over 50 lines
2. **Class Size**: Classes over 300 lines
3. **Parameter Lists**: Methods with 4+ parameters
4. **Nested Conditions**: More than 2 levels deep
5. **Duplicate Code**: Same logic in 3+ places
6. **God Classes**: Classes doing too many things
7. **Feature Envy**: Methods using other class data excessively
8. **Long Parameter Lists**: Consider parameter objects
9. **Primitive Obsession**: Use value objects for domain concepts
10. **Comments**: Over-commenting to explain complex code (refactor instead)

## Limitations

- Refactoring suggestions require reading and understanding business logic
- Automated refactoring can't account for all business rules
- Some refactorings may require database changes or migrations
- Complex legacy code may need incremental refactoring over time
- Always test thoroughly after applying refactorings

## Success Criteria

Refactoring is successful when:

- ✓ Code is easier to read and understand
- ✓ Tests pass after refactoring
- ✓ New features are easier to add
- ✓ Code follows SOLID principles
- ✓ Laravel conventions are properly applied
- ✓ Business logic is properly separated from infrastructure
- ✓ Code-review subagent finds no new critical issues

## Important Notes

1. **Always Test**: Never refactor without tests protecting functionality
2. **Incremental Changes**: Small, safe refactorings are better than large rewrites
3. **Business Logic First**: Understand what the code does before refactoring
4. **Team Review**: Complex refactorings benefit from team discussion
5. **Performance**: Profile before/after to ensure no performance regression
6. **Laravel Conventions**: Follow framework patterns for consistency

Remember: The goal of refactoring is to improve code quality without changing behavior. Use the **code-review** subagent to validate your refactored code maintains quality standards.
