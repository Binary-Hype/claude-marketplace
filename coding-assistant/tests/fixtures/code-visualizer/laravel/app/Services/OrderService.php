<?php

namespace App\Services;

use App\Models\Order;

class OrderService
{
    public function place(array $data): Order
    {
        return Order::create($data);
    }
}
