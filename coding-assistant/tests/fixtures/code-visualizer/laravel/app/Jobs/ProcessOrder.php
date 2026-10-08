<?php

namespace App\Jobs;

use App\Models\Order;
use Illuminate\Contracts\Queue\ShouldQueue;

class ProcessOrder implements ShouldQueue
{
    public function __construct(public Order $order)
    {
    }

    public function handle(): void
    {
    }
}
