<template>
  <div class="archive-navigation">
    <div class="year-list">
      <div
        v-for="year in years"
        :key="year"
        class="year-item"
        :class="{ active: currentYear === year }"
        @click="$emit('year-click', year)"
      >
        {{ year }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ArchiveNavigation',
  props: {
    years: {
      type: Array,
      required: true
    },
    currentYear: {
      type: Number,
      required: true
    }
  }
}
</script>

<style scoped>
.archive-navigation {
  width: 80px;
  margin-left: 40px;
}

.year-list {
  position: sticky;
  top: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.year-item {
  padding: 8px 16px;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s;
  color: #666;
  border-radius: 4px;
}

.year-item:hover {
  color: #409EFF;
}

.year-item.active {
  color: #409EFF;
  font-weight: bold;
  background: #ecf5ff;
}

@media screen and (max-width: 768px) {
  .archive-navigation {
    width: 100%;
    margin: 0 0 20px 0;
  }
  
  .year-list {
    position: static;
    flex-direction: row;
    overflow-x: auto;
    padding: 4px;
  }
  
  .year-item {
    flex-shrink: 0;
  }
}
</style> 