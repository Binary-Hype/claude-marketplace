<?php declare(strict_types=1);

namespace Acme\Erp\Event;

use Acme\Erp\Struct\ErpOrderPayload;

class OrderExportedEvent
{
    public function __construct(public readonly ErpOrderPayload $payload)
    {
    }
}
