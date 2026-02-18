# Laravel-Specific Refactoring Patterns

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
