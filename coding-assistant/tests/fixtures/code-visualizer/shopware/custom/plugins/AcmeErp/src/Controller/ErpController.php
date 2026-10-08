<?php declare(strict_types=1);

namespace Acme\Erp\Controller;

use Acme\Erp\Service\ErpExportService;
use Shopware\Core\Framework\Context;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route(defaults: ['_routeScope' => ['api']])]
class ErpController extends AbstractController
{
    public function __construct(private readonly ErpExportService $exporter)
    {
    }

    #[Route(path: '/api/_action/acme-erp/sync', name: 'api.action.acme-erp.sync', methods: ['POST'])]
    public function sync(Context $context): JsonResponse
    {
        return new JsonResponse(['ok' => true]);
    }
}
