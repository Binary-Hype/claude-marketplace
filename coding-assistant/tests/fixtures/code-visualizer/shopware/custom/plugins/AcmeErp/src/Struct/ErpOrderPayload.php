<?php declare(strict_types=1);

namespace Acme\Erp\Struct;

use Shopware\Core\Checkout\Order\OrderEntity;

final class ErpOrderPayload
{
    public function __construct(public readonly string $orderNumber)
    {
    }

    public static function fromOrder(OrderEntity $order): self
    {
        return new self($order->getOrderNumber());
    }

    public function toArray(): array
    {
        return ['number' => $this->orderNumber, 'note' => 'class Fake extends Nothing {'];
    }
}
