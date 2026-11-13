<template>
  <v-list density="compact" class="pa-0 ma-0">
    <v-list-subheader class="text-h6 ma-0 pa-0">Variables</v-list-subheader>
    <v-list-group
      v-for="group in groups"
      :key="group.category"
      :value="group.category"
    >
      <template #activator="{ props: activator }">
        <v-list-item
          v-bind="activator"
          :title="variableCount(group.variables.length)"
        >
          <template #prepend>
            <v-chip size="small" label color="primary" class="mr-2">
              {{ group.category }}
            </v-chip>
          </template>
        </v-list-item>
      </template>
      <v-list-item
        v-for="variable in group.variables"
        :key="variable.id"
        :title="variable.title"
      />
    </v-list-group>
  </v-list>
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
