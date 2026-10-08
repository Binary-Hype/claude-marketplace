<?php declare(strict_types=1);

namespace Acme\Erp\Service;

use Acme\Erp\Struct\ErpOrderPayload;
use Shopware\Core\Checkout\Order\OrderEntity;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;

class ErpExportService
{
    public function __construct(
        private readonly ErpClient $client,
        private readonly EntityRepository $orderRepository,
    ) {
    }

    public function export(OrderEntity $order): ErpOrderPayload
    {
        $payload = ErpOrderPayload::fromOrder($order);
        $this->client->send($payload);

        return $payload;
    }
}
