<template>
    <div>{{ order.number }}</div>
</template>

<script setup>
defineProps({ order: Object });
</script>
