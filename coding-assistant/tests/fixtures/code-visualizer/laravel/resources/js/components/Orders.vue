<template>
    <OrderRow v-for="order in orders" :key="order.id" :order="order" />
</template>

<script setup>
import { ref } from 'vue';
import OrderRow from './OrderRow.vue';

const orders = ref([]);
fetch('/orders').then((r) => r.json()).then((data) => { orders.value = data; });
</script>
