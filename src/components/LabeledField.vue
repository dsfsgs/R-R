<template>
  <div class="labeled-field" :class="variant">
    <div class="labeled-field-label">{{ label }}</div>
    <slot />
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "LabeledField",

  props: {
    label: {
      type: String,
      required: true,
    },

    variant: {
      type: String,
      default: "default",
    },
  },
});
</script>

<style scoped>
.labeled-field {
  /* lets the field shrink inside CSS grid instead of overflowing */
  min-width: 0;
  margin-bottom: 11px;
}

.labeled-field-label {
  margin-bottom: 6px;
  color: #292929;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
  overflow-wrap: anywhere; /* long labels wrap instead of overflowing */
}

.labeled-field.meta {
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.labeled-field.meta .labeled-field-label {
  margin-bottom: 0;
  color: #5c5c5c;
  font-size: 11px;
}
</style>
