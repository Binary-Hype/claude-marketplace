<?php declare(strict_types=1);

namespace Acme\Erp\Subscriber;

use Acme\Erp\Event\OrderExportedEvent;
use Acme\Erp\Service\ErpExportService;
use Shopware\Core\Checkout\Cart\Event\CheckoutOrderPlacedEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Contracts\EventDispatcher\EventDispatcherInterface;

class OrderSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly ErpExportService $exporter,
        private readonly EventDispatcherInterface $dispatcher,
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            CheckoutOrderPlacedEvent::class => 'onOrderPlaced',
        ];
    }

    public function onOrderPlaced(CheckoutOrderPlacedEvent $event): void
    {
        // new NotARealClass() inside a comment must be ignored
        $payload = $this->exporter->export($event->getOrder());
        $this->dispatcher->dispatch(new OrderExportedEvent($payload));
    }
}
