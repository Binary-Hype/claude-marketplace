<?php

namespace Tests\Feature;

use App\Models\Order;

class OrderTest
{
    public function test_it_creates(): void
    {
        Order::create([]);
    }
}
