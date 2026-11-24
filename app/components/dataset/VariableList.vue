<template>
  <section class="variable-list">
    <h3 class="text-h6">Variables</h3>
    <details
      v-for="group in groups"
      :key="group.category"
      class="variable-disclosure"
    >
      <summary class="variable-group">
        <v-icon class="variable-chevron" size="20" aria-hidden="true">
          mdi-chevron-right
        </v-icon>
        <span class="variable-label">
          <span class="variable-category">{{ group.category }}</span>
          {{ " "
          }}<span class="variable-count">{{
            variableCount(group.variables.length)
          }}</span>
        </span>
      </summary>
      <ul class="variable-titles">
        <li v-for="variable in group.variables" :key="variable.id">
          {{ variable.title }}
        </li>
      </ul>
    </details>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Variable } from "@/types/metadata";

const props = defineProps<{
  variables?: Variable[] | null;
}>();

// Variables without a category go under this one, last.
const UNCATEGORIZED = "Other";

// Grouped by category, in the order the variables arrive (sorted by `order`).
// Every group starts closed.
const groups = computed(() => {
  const byCategory = new Map<string, Variable[]>();
  for (const variable of props.variables ?? []) {
    const category = variable.category || UNCATEGORIZED;
    if (!byCategory.has(category)) byCategory.set(category, []);
    byCategory.get(category)!.push(variable);
  }
  const uncategorized = byCategory.get(UNCATEGORIZED);
  if (uncategorized) {
    byCategory.delete(UNCATEGORIZED);
    byCategory.set(UNCATEGORIZED, uncategorized);
  }
  return [...byCategory].map(([category, variables]) => ({
    category,
    variables,
  }));
});

function variableCount(count: number) {
  return count === 1 ? "1 variable" : `${count} variables`;
}
</script>

<style scoped>
.variable-list > h3 {
  margin-bottom: 8px;
}

.variable-disclosure + .variable-disclosure {
  margin-top: 6px;
}

.variable-group {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  min-height: 48px;
  padding: 10px 12px;
  border-radius: 4px;
  background: rgba(var(--v-theme-primary), 0.04);
  color: rgb(var(--v-theme-primary));
  font-size: 0.875rem;
  line-height: 1.5;
  list-style: none;
  cursor: pointer;
}

.variable-group::-webkit-details-marker {
  display: none;
}

.variable-disclosure[open] > .variable-group .variable-chevron {
  transform: rotate(90deg);
}

.variable-label {
  display: flex;
  /* Move the count below the category before squeezing the category text. */
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 4px 12px;
}

.variable-category {
  font-weight: 600;
  overflow-wrap: anywhere;
}

.variable-count {
  color: rgb(var(--v-theme-muted));
}

.variable-disclosure[open] > .variable-group {
  background: rgba(var(--v-theme-primary), 0.08);
}

@media (hover: hover) {
  .variable-group:hover {
    background: rgba(var(--v-theme-primary), 0.09);
  }
}

.variable-group:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

.variable-titles {
  padding: 8px 12px 10px 60px;
  overflow-wrap: anywhere;
}

.variable-titles li {
  padding-block: 4px;
}
</style>
