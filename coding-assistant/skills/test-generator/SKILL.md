---
name: test-generator
description: Generates comprehensive Laravel tests using Pest syntax. Creates feature tests, unit tests, factories, and test data with proper assertions, mocking, and Laravel testing helpers.
---

# Test Generator (Laravel + Pest)

An intelligent skill that creates comprehensive test suites for your Laravel application using Pest PHP. Generates feature tests, unit tests, database factories, and realistic test data with proper assertions and Laravel testing conventions.

## When to Use This Skill

Use this skill when:
- You need to add tests to existing code
- You're practicing TDD (Test-Driven Development)
- You want comprehensive test coverage for a feature
- You need to generate database factories and seeders
- You're testing API endpoints and responses
- You want to test authentication and authorization
- You need integration tests for complex workflows
- You're adding tests before refactoring (safety net)
- You want to learn Pest testing patterns

## What This Skill Does

This skill provides comprehensive test generation by:

1. **Feature Test Generation**
   - HTTP request/response tests
   - API endpoint testing with JSON assertions
   - Authentication and authorization tests
   - Form validation testing
   - Database interaction tests
   - File upload/download tests
   - Email and notification tests

2. **Unit Test Generation**
   - Class method testing
   - Service and Action class tests
   - Model relationship tests
   - Helper function tests
   - Business logic validation
   - Edge case coverage

3. **Pest-Specific Features**
   - Uses Pest's expressive syntax
   - Proper dataset usage for parameterized tests
   - Custom expectations and matchers
   - Test organization with describe blocks
   - Proper use of `it()` and `test()` functions
   - beforeEach/afterEach hooks

4. **Laravel Testing Helpers**
   - `actingAs()` for authentication
   - `assertDatabaseHas()` / `assertDatabaseMissing()`
   - `assertJson()` / `assertJsonStructure()`
   - `assertStatus()` / `assertRedirect()`
   - `fake()` for mocking Mail, Queue, Events
   - `RefreshDatabase` trait usage

5. **Factory and Seeder Generation**
   - Model factories with realistic data
   - State definitions for different scenarios
   - Relationship factory setup
   - Database seeders for test data

## How to Use

Simply invoke the skill when you need tests:

```
/test-generator
```

Or request specific tests:

```
/test-generator Create tests for UserController
```

```
/test-generator Generate factory and tests for Post model
```

```
I need feature tests for my authentication system
```

```
/test-generator Write unit tests for DiscountCalculator service
```

## Test Generation Process

When this skill is invoked, it follows this systematic approach:

1. **Understand the Code**
   - Read the target file (controller, service, model)
   - Identify methods and their responsibilities
   - Analyze dependencies and relationships
   - Review validation rules and business logic
   - Use **code-review** subagent to understand code structure

2. **Determine Test Types**
   - Feature tests for HTTP endpoints
   - Unit tests for business logic
   - Integration tests for complex workflows
   - Database tests for model interactions

3. **Generate Test Structure**
   - Organize tests with Pest describe blocks
   - Create descriptive test names using `it()`
   - Set up necessary factories and test data
   - Mock external dependencies (Mail, API calls, etc.)

4. **Write Assertions**
   - Use appropriate Laravel test assertions
   - Verify database state changes
   - Check response structures and status codes
   - Validate business logic outcomes

5. **Cross-Reference with Documentation**
   - Use **api-documentation** skill to verify endpoint contracts
   - Ensure tests match documented behavior

## Output Format

The skill provides complete test files ready to use:

```php
<?php

use App\Models\User;
use App\Models\Post;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('Post Management', function () {
    beforeEach(function () {
        $this->user = User::factory()->create();
    });

    describe('GET /posts', function () {
        it('returns paginated posts', function () {
            Post::factory()->count(25)->create();

            $response = $this->actingAs($this->user)
                ->getJson('/api/posts');

            $response->assertStatus(200)
                ->assertJsonStructure([
                    'data' => [
                        '*' => ['id', 'title', 'content', 'author']
                    ],
                    'meta' => ['current_page', 'total', 'per_page'],
                    'links'
                ]);

            expect($response->json('data'))->toHaveCount(15);
        });

        it('filters posts by author', function () {
            $author = User::factory()->create();
            Post::factory()->count(5)->for($author, 'author')->create();
            Post::factory()->count(3)->create();

            $response = $this->actingAs($this->user)
                ->getJson("/api/posts?author={$author->id}");

            $response->assertStatus(200);
            expect($response->json('data'))->toHaveCount(5);
        });

        it('requires authentication', function () {
            $response = $this->getJson('/api/posts');

            $response->assertStatus(401);
        });
    });

    describe('POST /posts', function () {
        it('creates a post with valid data', function () {
            $postData = [
                'title' => 'Test Post',
                'content' => 'This is test content.',
                'status' => 'draft',
            ];

            $response = $this->actingAs($this->user)
                ->postJson('/api/posts', $postData);

            $response->assertStatus(201)
                ->assertJsonFragment([
                    'title' => 'Test Post',
                    'author_id' => $this->user->id,
                ]);

            $this->assertDatabaseHas('posts', [
                'title' => 'Test Post',
                'author_id' => $this->user->id,
            ]);
        });

        it('validates required fields', function (array $invalidData, string $errorField) {
            $response = $this->actingAs($this->user)
                ->postJson('/api/posts', $invalidData);

            $response->assertStatus(422)
                ->assertJsonValidationErrors($errorField);
        })->with([
            'missing title' => [['content' => 'Content'], 'title'],
            'missing content' => [['title' => 'Title'], 'content'],
            'invalid status' => [['title' => 'Title', 'content' => 'Content', 'status' => 'invalid'], 'status'],
        ]);

        it('sends notification to followers when published', function () {
            Notification::fake();

            $follower = User::factory()->create();
            $this->user->followers()->attach($follower);

            $response = $this->actingAs($this->user)
                ->postJson('/api/posts', [
                    'title' => 'Published Post',
                    'content' => 'Content',
                    'status' => 'published',
                ]);

            Notification::assertSentTo($follower, PostPublished::class);
        });
    });

    describe('PUT /posts/{post}', function () {
        it('allows author to update their post', function () {
            $post = Post::factory()->for($this->user, 'author')->create();

            $response = $this->actingAs($this->user)
                ->putJson("/api/posts/{$post->id}", [
                    'title' => 'Updated Title',
                    'content' => $post->content,
                ]);

            $response->assertStatus(200);

            $this->assertDatabaseHas('posts', [
                'id' => $post->id,
                'title' => 'Updated Title',
            ]);
        });

        it('prevents non-author from updating post', function () {
            $otherUser = User::factory()->create();
            $post = Post::factory()->for($otherUser, 'author')->create();

            $response = $this->actingAs($this->user)
                ->putJson("/api/posts/{$post->id}", [
                    'title' => 'Hacked Title',
                ]);

            $response->assertStatus(403);
        });
    });

    describe('DELETE /posts/{post}', function () {
        it('soft deletes a post', function () {
            $post = Post::factory()->for($this->user, 'author')->create();

            $response = $this->actingAs($this->user)
                ->deleteJson("/api/posts/{$post->id}");

            $response->assertStatus(204);

            $this->assertSoftDeleted('posts', ['id' => $post->id]);
        });
    });
});
```

## Pest Syntax Patterns

### 1. Basic Test Structure

```php
// Simple test
it('calculates discount correctly', function () {
    $calculator = new DiscountCalculator();

    $result = $calculator->calculate(100, 0.1);

    expect($result)->toBe(90);
});

// Alternative with test()
test('user can register', function () {
    $response = $this->post('/register', [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => 'password',
    ]);

    $response->assertRedirect('/dashboard');
});
```

### 2. Datasets for Parameterized Tests

```php
it('validates email format', function (string $email, bool $isValid) {
    $validator = Validator::make(
        ['email' => $email],
        ['email' => 'required|email']
    );

    expect($validator->passes())->toBe($isValid);
})->with([
    ['user@example.com', true],
    ['invalid-email', false],
    ['@example.com', false],
    ['user@', false],
]);
```

### 3. Using beforeEach and afterEach

```php
describe('Shopping Cart', function () {
    beforeEach(function () {
        $this->user = User::factory()->create();
        $this->cart = Cart::factory()->for($this->user)->create();
    });

    afterEach(function () {
        Cache::flush();
    });

    it('adds items to cart', function () {
        $product = Product::factory()->create();

        $this->cart->addItem($product, quantity: 2);

        expect($this->cart->items)->toHaveCount(1);
        expect($this->cart->total)->toBe($product->price * 2);
    });
});
```

### 4. Custom Expectations

```php
it('returns valid user data', function () {
    $user = User::factory()->create([
        'name' => 'John Doe',
        'email' => 'john@example.com',
    ]);

    expect($user)
        ->toBeInstanceOf(User::class)
        ->name->toBe('John Doe')
        ->email->toBe('john@example.com')
        ->email_verified_at->toBeNull();
});
```

## Laravel-Specific Testing Patterns

### 1. Testing API Resources

```php
it('returns user resource with correct structure', function () {
    $user = User::factory()->create([
        'name' => 'John Doe',
        'email' => 'john@example.com',
    ]);

    $response = $this->actingAs($user)
        ->getJson("/api/users/{$user->id}");

    $response->assertStatus(200)
        ->assertJson([
            'data' => [
                'id' => $user->id,
                'name' => 'John Doe',
                'email' => 'john@example.com',
            ]
        ])
        ->assertJsonStructure([
            'data' => ['id', 'name', 'email', 'created_at']
        ]);
});
```

### 2. Testing Form Requests

```php
it('validates store user request', function (array $data, string $error) {
    $response = $this->actingAs(User::factory()->admin()->create())
        ->postJson('/api/users', $data);

    $response->assertStatus(422)
        ->assertJsonValidationErrors($error);
})->with([
    'missing name' => [['email' => 'john@example.com'], 'name'],
    'invalid email' => [['name' => 'John', 'email' => 'invalid'], 'email'],
    'duplicate email' => [fn() => [
        'name' => 'John',
        'email' => User::factory()->create()->email
    ], 'email'],
]);
```

### 3. Testing Jobs and Queues

```php
it('dispatches email job when user registers', function () {
    Queue::fake();

    $this->post('/register', [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => 'password',
    ]);

    Queue::assertPushed(SendWelcomeEmail::class, function ($job) {
        return $job->user->email === 'john@example.com';
    });
});

it('processes payment job successfully', function () {
    $payment = Payment::factory()->pending()->create();

    ProcessPayment::dispatch($payment);

    expect($payment->fresh()->status)->toBe('completed');
});
```

### 4. Testing Events and Listeners

```php
it('fires user registered event', function () {
    Event::fake([UserRegistered::class]);

    $user = User::factory()->create();

    Event::assertDispatched(UserRegistered::class, function ($event) use ($user) {
        return $event->user->id === $user->id;
    });
});
```

### 5. Testing Mail

```php
it('sends welcome email to new users', function () {
    Mail::fake();

    $user = User::factory()->create();

    Mail::assertSent(WelcomeEmail::class, function ($mail) use ($user) {
        return $mail->hasTo($user->email);
    });
});
```

### 6. Testing File Uploads

```php
it('uploads user avatar', function () {
    Storage::fake('public');

    $file = UploadedFile::fake()->image('avatar.jpg', 600, 600);

    $response = $this->actingAs(User::factory()->create())
        ->post('/profile/avatar', ['avatar' => $file]);

    $response->assertStatus(200);

    Storage::disk('public')->assertExists('avatars/' . $file->hashName());
});
```

### 7. Testing Database Transactions

```php
it('creates order with items in transaction', function () {
    $user = User::factory()->create();
    $products = Product::factory()->count(3)->create();

    $response = $this->actingAs($user)
        ->postJson('/api/orders', [
            'items' => $products->map(fn($p) => [
                'product_id' => $p->id,
                'quantity' => 2,
            ])->toArray()
        ]);

    $response->assertStatus(201);

    $this->assertDatabaseHas('orders', ['user_id' => $user->id]);
    $this->assertDatabaseCount('order_items', 3);
});
```

## Factory Generation

### Model Factory Example

```php
<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PostFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(),
            'slug' => fake()->slug(),
            'content' => fake()->paragraphs(3, true),
            'excerpt' => fake()->text(160),
            'status' => 'draft',
            'author_id' => User::factory(),
            'published_at' => null,
            'view_count' => fake()->numberBetween(0, 1000),
        ];
    }

    /**
     * Indicate that the post is published.
     */
    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'published',
            'published_at' => fake()->dateTimeBetween('-1 year', 'now'),
        ]);
    }

    /**
     * Indicate that the post is a draft.
     */
    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'draft',
            'published_at' => null,
        ]);
    }

    /**
     * Indicate that the post is featured.
     */
    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true,
        ]);
    }
}
```

## Example Test Outputs

### Example 1: Testing a Service Class

**User Request:**
```
/test-generator Create unit tests for DiscountCalculator service
```

**Output:**
```php
<?php

use App\Services\DiscountCalculator;
use App\Models\User;
use App\Models\Order;

describe('DiscountCalculator', function () {
    beforeEach(function () {
        $this->calculator = new DiscountCalculator();
    });

    describe('calculate()', function () {
        it('applies VIP discount correctly', function () {
            $user = User::factory()->vip()->make();
            $order = Order::factory()->make([
                'total' => 1000,
                'user_id' => $user->id,
            ]);

            $discount = $this->calculator->calculate($order);

            expect($discount)->toBe(250.0); // 25% of 1000
        });

        it('applies returning customer discount', function () {
            $user = User::factory()->returning()->make();
            $order = Order::factory()->make([
                'total' => 500,
                'user_id' => $user->id,
            ]);

            $discount = $this->calculator->calculate($order);

            expect($discount)->toBe(50.0); // 10% of 500
        });

        it('returns zero discount for new customers under threshold', function () {
            $user = User::factory()->make();
            $order = Order::factory()->make([
                'total' => 500,
                'user_id' => $user->id,
            ]);

            $discount = $this->calculator->calculate($order);

            expect($discount)->toBe(0.0);
        });

        it('handles different order amounts', function (float $amount, float $expected) {
            $user = User::factory()->vip()->make();
            $order = Order::factory()->make([
                'total' => $amount,
                'user_id' => $user->id,
            ]);

            $discount = $this->calculator->calculate($order);

            expect($discount)->toBe($expected);
        })->with([
            [100, 10.0],    // VIP 10% for <500
            [500, 75.0],    // VIP 15% for 500-1000
            [1000, 250.0],  // VIP 25% for >1000
            [1500, 375.0],  // VIP 25% for >1000
        ]);
    });

    describe('applyCoupon()', function () {
        it('applies valid percentage coupon', function () {
            $order = Order::factory()->make(['total' => 100]);
            $coupon = Coupon::factory()->make(['type' => 'percentage', 'value' => 20]);

            $discount = $this->calculator->applyCoupon($order, $coupon);

            expect($discount)->toBe(20.0);
        });

        it('applies valid fixed coupon', function () {
            $order = Order::factory()->make(['total' => 100]);
            $coupon = Coupon::factory()->make(['type' => 'fixed', 'value' => 15]);

            $discount = $this->calculator->applyCoupon($order, $coupon);

            expect($discount)->toBe(15.0);
        });

        it('throws exception for expired coupon', function () {
            $order = Order::factory()->make(['total' => 100]);
            $coupon = Coupon::factory()->expired()->make();

            expect(fn() => $this->calculator->applyCoupon($order, $coupon))
                ->toThrow(CouponExpiredException::class);
        });

        it('does not exceed order total', function () {
            $order = Order::factory()->make(['total' => 50]);
            $coupon = Coupon::factory()->make(['type' => 'fixed', 'value' => 100]);

            $discount = $this->calculator->applyCoupon($order, $coupon);

            expect($discount)->toBe(50.0); // Max discount is order total
        });
    });
});
```

### Example 2: Testing Authentication

**User Request:**
```
/test-generator Create tests for authentication endpoints
```

**Output:**
```php
<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

describe('Authentication', function () {
    describe('POST /api/auth/register', function () {
        it('registers a new user with valid data', function () {
            $userData = [
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'password' => 'Password123',
                'password_confirmation' => 'Password123',
            ];

            $response = $this->postJson('/api/auth/register', $userData);

            $response->assertStatus(201)
                ->assertJsonStructure([
                    'access_token',
                    'token_type',
                    'expires_in'
                ]);

            $this->assertDatabaseHas('users', [
                'name' => 'John Doe',
                'email' => 'john@example.com',
            ]);

            expect(User::where('email', 'john@example.com')->exists())->toBeTrue();
        });

        it('validates required fields', function (array $data, string $error) {
            $response = $this->postJson('/api/auth/register', $data);

            $response->assertStatus(422)
                ->assertJsonValidationErrors($error);
        })->with([
            'missing name' => [['email' => 'john@example.com', 'password' => 'password'], 'name'],
            'missing email' => [['name' => 'John', 'password' => 'password'], 'email'],
            'invalid email' => [['name' => 'John', 'email' => 'invalid', 'password' => 'password'], 'email'],
            'short password' => [['name' => 'John', 'email' => 'john@example.com', 'password' => 'pass'], 'password'],
            'password mismatch' => [[
                'name' => 'John',
                'email' => 'john@example.com',
                'password' => 'password',
                'password_confirmation' => 'different'
            ], 'password'],
        ]);

        it('prevents duplicate email registration', function () {
            $user = User::factory()->create(['email' => 'existing@example.com']);

            $response = $this->postJson('/api/auth/register', [
                'name' => 'Jane Doe',
                'email' => 'existing@example.com',
                'password' => 'password',
                'password_confirmation' => 'password',
            ]);

            $response->assertStatus(422)
                ->assertJsonValidationErrors('email');
        });

        it('hashes password before storing', function () {
            $this->postJson('/api/auth/register', [
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'password' => 'Password123',
                'password_confirmation' => 'Password123',
            ]);

            $user = User::where('email', 'john@example.com')->first();

            expect(Hash::check('Password123', $user->password))->toBeTrue();
            expect($user->password)->not->toBe('Password123');
        });
    });

    describe('POST /api/auth/login', function () {
        beforeEach(function () {
            $this->user = User::factory()->create([
                'email' => 'john@example.com',
                'password' => Hash::make('password'),
            ]);
        });

        it('authenticates user with valid credentials', function () {
            $response = $this->postJson('/api/auth/login', [
                'email' => 'john@example.com',
                'password' => 'password',
            ]);

            $response->assertStatus(200)
                ->assertJsonStructure([
                    'access_token',
                    'token_type',
                    'expires_in'
                ]);

            expect($response->json('token_type'))->toBe('Bearer');
        });

        it('rejects invalid email', function () {
            $response = $this->postJson('/api/auth/login', [
                'email' => 'wrong@example.com',
                'password' => 'password',
            ]);

            $response->assertStatus(401)
                ->assertJson(['message' => 'Invalid credentials']);
        });

        it('rejects invalid password', function () {
            $response = $this->postJson('/api/auth/login', [
                'email' => 'john@example.com',
                'password' => 'wrongpassword',
            ]);

            $response->assertStatus(401);
        });
    });

    describe('POST /api/auth/logout', function () {
        it('logs out authenticated user', function () {
            $user = User::factory()->create();
            $token = $user->createToken('test-token')->plainTextToken;

            $response = $this->withHeader('Authorization', "Bearer {$token}")
                ->postJson('/api/auth/logout');

            $response->assertStatus(200);

            // Token should be deleted
            expect($user->tokens()->count())->toBe(0);
        });

        it('requires authentication', function () {
            $response = $this->postJson('/api/auth/logout');

            $response->assertStatus(401);
        });
    });

    describe('GET /api/auth/user', function () {
        it('returns authenticated user data', function () {
            $user = User::factory()->create([
                'name' => 'John Doe',
                'email' => 'john@example.com',
            ]);

            $response = $this->actingAs($user)
                ->getJson('/api/auth/user');

            $response->assertStatus(200)
                ->assertJson([
                    'id' => $user->id,
                    'name' => 'John Doe',
                    'email' => 'john@example.com',
                ]);
        });

        it('requires authentication', function () {
            $response = $this->getJson('/api/auth/user');

            $response->assertStatus(401);
        });
    });
});
```

## Tips for Writing Effective Tests

1. **Follow AAA Pattern**
   - **Arrange**: Set up test data and dependencies
   - **Act**: Execute the code being tested
   - **Assert**: Verify the expected outcome

2. **Use Descriptive Test Names**
   - `it('sends email when user registers')` ✓
   - `test('test_method')` ✗

3. **Test One Thing Per Test**
   - Each test should verify one specific behavior
   - Makes failures easier to diagnose

4. **Use Factories Liberally**
   - Create realistic test data with factories
   - Use factory states for different scenarios

5. **Mock External Dependencies**
   - Mock Mail, Queue, Storage, HTTP clients
   - Prevents actual emails/jobs/API calls in tests

6. **Test Edge Cases**
   - Empty inputs, null values
   - Boundary conditions
   - Error scenarios

7. **Leverage Datasets**
   - Use `->with()` for parameterized tests
   - Test multiple scenarios efficiently

8. **Keep Tests Fast**
   - Use `RefreshDatabase` instead of migrations
   - Mock slow operations
   - Avoid unnecessary database queries

## Integration with Other Skills

This skill works well with:

- **code-review**: Understand code structure before writing tests
- **api-documentation**: Ensure tests match documented API behavior
- **refactoring-assistant**: Add tests before refactoring as safety net

## Common Test Patterns

### Testing Policies
```php
it('allows users to update their own posts', function () {
    $user = User::factory()->create();
    $post = Post::factory()->for($user, 'author')->create();

    expect($user->can('update', $post))->toBeTrue();
});

it('prevents users from updating others posts', function () {
    $user = User::factory()->create();
    $post = Post::factory()->create();

    expect($user->can('update', $post))->toBeFalse();
});
```

### Testing Middleware
```php
it('redirects unauthenticated users', function () {
    $response = $this->get('/dashboard');

    $response->assertRedirect('/login');
});

it('allows authenticated users', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertStatus(200);
});
```

### Testing Scopes
```php
it('returns only active users', function () {
    User::factory()->count(3)->create(['status' => 'active']);
    User::factory()->count(2)->create(['status' => 'inactive']);

    $activeUsers = User::active()->get();

    expect($activeUsers)->toHaveCount(3);
});
```

## Limitations

- Cannot write tests for poorly structured code
- Requires understanding of business logic
- May need manual adjustment for complex scenarios
- Test quality depends on code quality

## Success Criteria

Tests are successful when:

- ✓ All tests pass on first run
- ✓ Tests are readable and well-organized
- ✓ Edge cases are covered
- ✓ Mocking is used appropriately
- ✓ Test names clearly describe behavior
- ✓ Factories provide realistic data
- ✓ Tests run quickly (< 1 second each)
- ✓ Tests are independent (can run in any order)

## Important Notes

1. **Run Tests Frequently**: Execute tests after each change
2. **Use RefreshDatabase**: Ensures clean database state
3. **Mock External Services**: Never hit real APIs/send real emails in tests
4. **Follow Pest Conventions**: Use `it()` for readable test names
5. **Keep Tests Isolated**: Each test should be independent
6. **Test Behavior, Not Implementation**: Focus on outcomes, not internals

Remember: Good tests are your safety net for refactoring and adding features. Use **code-review** subagent to ensure the code you're testing follows best practices before writing tests.
