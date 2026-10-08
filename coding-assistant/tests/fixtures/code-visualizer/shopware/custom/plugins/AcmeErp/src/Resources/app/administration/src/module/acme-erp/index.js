const { Module, Component } = Shopware;

Component.register('acme-erp-list', () => import('./page/acme-erp-list'));

Module.register('acme-erp', {
    type: 'plugin',
    name: 'acme-erp',
});
