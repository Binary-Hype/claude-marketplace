<?php

namespace App\Http\Controllers;

use App\Events\OrderPlaced;
use App\Jobs\ProcessOrder;
use App\Services\OrderService;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(private OrderService $orders)
    {
    }

    public function store(Request $request)
    {
        $order = $this->orders->place($request->all());
        event(new OrderPlaced($order));
        ProcessOrder::dispatch($order);

        return redirect()->back();
    }
}
