import template from './acme-erp-list.html.twig';

export default {
    template,
    inject: ['repositoryFactory'],
    methods: {
        loadOrders() {
            return this.repositoryFactory.create('order').search();
        },
    },
};
