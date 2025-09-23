<template>
  <div class="relative">
    <apexchart
      type="bar"
      height="100%"
      :options="computedOptions"
      :series="computedSeries"
    />
  </div>
  </template>

<script setup>
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const apexchart = VueApexCharts

const props = defineProps({
  series: { type: Array, default: undefined },
  chartOptions: { type: Object, default: undefined },
  data: { type: Object, default: undefined },
  options: { type: Object, default: () => ({}) }
})

const computedSeries = computed(() => {
  if (props.series) return props.series
  if (!props.data) return []
  return (props.data.datasets || []).map(ds => ({
    name: ds.label || 'Series',
    data: ds.data || []
  }))
})

const computedOptions = computed(() => {
  if (props.chartOptions) return props.chartOptions
  const labels = props.data?.labels || []
  return {
    chart: { toolbar: { show: false } },
    xaxis: { categories: labels },
    legend: { position: 'bottom' },
    grid: { strokeDashArray: 4 }
  }
})
</script>

