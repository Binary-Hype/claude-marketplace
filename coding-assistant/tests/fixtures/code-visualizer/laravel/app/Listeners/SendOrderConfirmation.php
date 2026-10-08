<?php

namespace App\Listeners;

use App\Events\OrderPlaced;

class SendOrderConfirmation
{
    public function handle(OrderPlaced $event): void
    {
    }
}
