# Example Refactoring Sessions

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
