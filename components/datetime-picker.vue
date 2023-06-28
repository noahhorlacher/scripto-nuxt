<script setup>
import { DatePicker as VCalendarDatePicker } from 'v-calendar'
import 'v-calendar/dist/style.css'

const props = defineProps({
  modelValue: {
    type: Date,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:model-value', 'close'])

const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')

const date = computed({
  get: () => props.modelValue,
  set: value => {
    emit('update:model-value', value)
    emit('close')
  }
})

const label = computed(
    () => {
        new Date(date.value).toLocaleDateString('en-us',
        { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }
    )
    }
)

const attrs = [{
  key: 'today',
  highlight: {
    color: 'blue',
    fillMode: 'outline',
    class: '!bg-gray-100 dark:!bg-gray-800'
  },
  dates: new Date()
}]
</script>

<template>
    <UPopover :popper="{ placement: 'bottom-start' }">
        <UButton :loading="loading" icon="i-heroicons-calendar-days-20-solid" :label="label" />

        <template #panel="{ close }">
            <VCalendarDatePicker
                v-model="date"
                transparent
                borderless
                :attributes="attrs"
                :is-dark="isDark"
                title-position="left"
                trim-weeks
                :first-day-of-week="2"
                mode="dateTime"
                is24hr
            />
        </template>
    </UPopover>
</template>