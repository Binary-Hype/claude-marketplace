<?php declare(strict_types=1);

namespace Acme\Erp\Service;

use Acme\Erp\Struct\ErpOrderPayload;
use GuzzleHttp\ClientInterface;

class ErpClient
{
    public function __construct(private readonly ClientInterface $http)
    {
    }

    public function send(ErpOrderPayload $payload): void
    {
        $this->http->request('POST', '/orders', ['json' => $payload->toArray()]);
    }
}
