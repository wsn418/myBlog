<template>
  <div class="archive-stats">
    <div class="stats-header">
      <h1>归档</h1>
      <div class="stats-info">
        共 {{ total }} 篇文章，总计 {{ wordCount }} 字
      </div>
      <div class="stats-tags">
        <el-tag 
          v-for="tag in tags" 
          :key="tag.name"
          size="small"
          class="tag-item"
          :class="{ active: currentTag === tag.name }"
          @click="handleTagClick(tag.name)"
        >
          #{{ tag.name }}({{ tag.count }})
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ArchiveStats',
  props: {
    total: {
      type: Number,
      default: 0
    },
    wordCount: {
      type: Number,
      default: 0
    },
    tags: {
      type: Array,
      default: () => []
    },
    currentTag: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleTagClick(tag) {
      this.$emit('tag-click', tag === this.currentTag ? '' : tag)
    }
  }
}
</script>

<style scoped>
.archive-stats {
  margin-bottom: 30px;
}

.stats-header {
  text-align: center;
  padding: 20px 0;
}

.stats-header h1 {
  font-size: 32px;
  margin-bottom: 15px;
  font-weight: normal;
}

.stats-info {
  color: #666;
  margin-bottom: 20px;
}

.stats-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  max-width: 800px;
  margin: 0 auto;
}

.tag-item {
  cursor: pointer;
  transition: all 0.3s;
}

.tag-item:hover {
  transform: translateY(-2px);
}

.tag-item.active {
  background-color: #409EFF;
  color: white;
  border-color: #409EFF;
}
</style> 