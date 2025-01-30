<template>
  <div class="article-calendar" v-if="contributionData">
    <div class="calendar-header">
      <div class="month-labels">
        <span v-for="month in 12" :key="month">{{ month }}月</span>
      </div>
    </div>
    <div class="calendar-body">
      <div class="weekday-labels">
        <span>一</span>
        <span>三</span>
        <span>五</span>
        <span>日</span>
      </div>
      <div class="contribution-grid">
        <template v-for="col in 52" :key="col">
          <div
            v-for="row in 7"
            :key="`${col}-${row}`"
            class="contribution-cell"
            :class="[
              getCellClass(getArticlesForCell(col - 1, row - 1)),
              { 'has-articles': getArticlesForCell(col - 1, row - 1).articles.length > 0 }
            ]"
            :data-tooltip="getTooltip(getArticlesForCell(col - 1, row - 1))"
            @click="handleCellClick(getArticlesForCell(col - 1, row - 1))"
          ></div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'

export default {
  name: 'ArticleCalendar',
  props: {
    articles: {
      type: Array,
      required: true
    }
  },
  emits: ['show-articles'],
  setup(props, { emit }) {
    const router = useRouter()
    const mounted = ref(false)

    onMounted(() => {
      mounted.value = true
    })

    onBeforeUnmount(() => {
      mounted.value = false
    })

    const parseDate = (dateStr) => {
      try {
        if (dateStr instanceof Date) return dateStr
        const date = new Date(dateStr)
        // 检查是否是有效的日期对象
        if (isNaN(date.getTime())) {
          console.error('Invalid date:', dateStr)
          return new Date() // 返回当前日期作为后备
        }
        return date
      } catch (error) {
        console.error('Error parsing date:', error)
        return new Date()
      }
    }

    const isSameDay = (date1, date2) => {
      const d1 = parseDate(date1)
      const d2 = parseDate(date2)
      return d1.getFullYear() === d2.getFullYear() &&
             d1.getMonth() === d2.getMonth() &&
             d1.getDate() === d2.getDate()
    }

    const contributionData = computed(() => {
      if (!mounted.value) return []
      
      console.log('Raw articles:', props.articles)
      
      // 获取当前年份
      const currentYear = new Date().getFullYear()
      const days = []
      
      // 获取该年第一天是星期几（0是周日，1是周一）
      const firstDay = new Date(currentYear, 0, 1).getDay()
      // 调整为周一开始，周日结束
      const startOffset = firstDay === 0 ? 6 : firstDay - 1
      
      // 添加上一年的剩余天数以对齐星期
      if (startOffset > 0) {
        const prevYear = currentYear - 1
        const prevYearLastDay = new Date(prevYear, 11, 31).getDate()
        for (let i = startOffset - 1; i >= 0; i--) {
          const date = new Date(prevYear, 11, prevYearLastDay - i)
          days.push({
            date,
            articles: []
          })
        }
      }
      
      // 添加当年的所有天数
      for (let month = 0; month < 12; month++) {
        const daysInMonth = new Date(currentYear, month + 1, 0).getDate()
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(currentYear, month, day)
          days.push({
            date,
            articles: []
          })
        }
      }
      
      // 添加下一年的天数以填满52周
      const remainingDays = 52 * 7 - days.length
      if (remainingDays > 0) {
        for (let i = 1; i <= remainingDays; i++) {
          const date = new Date(currentYear + 1, 0, i)
          days.push({
            date,
            articles: []
          })
        }
      }
      
      // 统计每天的文章
      props.articles.forEach(article => {
        if (!article.createdAt) {
          console.log('Article without createdAt:', article)
          return
        }
        
        const articleDate = parseDate(article.createdAt)
        console.log('Processing article:', {
          title: article.title,
          createdAt: article.createdAt,
          parsedDate: articleDate
        })
        
        // 只处理当年的文章
        if (articleDate.getFullYear() !== currentYear) {
          console.log('Article from different year:', articleDate.getFullYear(), 'vs', currentYear)
          return
        }
        
        const dayEntry = days.find(d => {
          const result = isSameDay(d.date, articleDate)
          if (result) {
            console.log('Found matching day:', formatDate(d.date), 'for article date:', formatDate(articleDate))
          }
          return result
        })
        
        if (dayEntry) {
          console.log('Adding article to day:', formatDate(dayEntry.date))
          dayEntry.articles.push(article)
        } else {
          console.log('No matching day found for article date:', formatDate(articleDate))
        }
      })
      
      const activeDays = days.filter(d => d.articles.length > 0)
      console.log('Days with articles:', activeDays.map(d => ({
        date: formatDate(d.date),
        articleCount: d.articles.length
      })))
      
      return days
    })

    const getArticlesForCell = (col, row) => {
      if (!mounted.value || !contributionData.value) {
        return { date: new Date(), articles: [], count: 0 }
      }

      const index = row + (col * 7)
      if (index < 0 || index >= contributionData.value.length) {
        return { date: new Date(), articles: [], count: 0 }
      }

      const cell = contributionData.value[index]
      const articles = Array.isArray(cell.articles) ? cell.articles : []

      return {
        date: cell.date,
        articles,
        count: articles.length
      }
    }

    const handleCellClick = (cellData) => {
      if (!cellData || !cellData.articles) return
      
      if (cellData.articles.length === 1) {
        router.push(`/article/${cellData.articles[0].id}`)
      } else if (cellData.articles.length > 1) {
        emit('show-articles', cellData.articles)
      }
    }

    const formatDate = (date) => {
      try {
        const parsedDate = parseDate(date)
        return `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}`
      } catch (error) {
        console.error('Error formatting date:', error)
        return 'Invalid Date'
      }
    }

    const getCellClass = (cellData) => {
      const count = cellData.count
      
      console.log('Cell class:', {
        cellData,
        count
      })

      if (!count || count === 0) return 'level-0'
      if (count === 1) return 'level-1'
      if (count === 2) return 'level-2'
      if (count === 3) return 'level-3'
      return 'level-4'
    }

    const getTooltip = (cellData) => {
      if (!cellData || !cellData.articles || cellData.articles.length === 0) {
        return formatDate(cellData?.date || new Date())
      }
      // 先显示日期，然后是文章列表
      return `${formatDate(cellData.date)}\n${'-'.repeat(20)}\n${cellData.articles.map(article => 
        article.title
      ).join('\n')}`
    }

    return {
      handleCellClick,
      formatDate,
      getCellClass,
      getTooltip,
      contributionData,
      getArticlesForCell
    }
  }
}
</script>

<style scoped>
.article-calendar {
  width: 100%;
  padding: 20px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  margin: 20px 0;
}

.calendar-header {
  margin-bottom: 10px;
}

.month-labels {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  font-size: 12px;
  color: #666;
}

.calendar-body {
  display: flex;
  gap: 4px;
}

.weekday-labels {
  display: grid;
  grid-template-rows: repeat(4, 1fr);
  font-size: 12px;
  color: #666;
  margin-right: 8px;
}

.contribution-grid {
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(7, 1fr);
  grid-template-columns: repeat(52, 1fr);
  gap: 2px;
  flex: 1;
}

.contribution-cell {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  transition: all 0.3s;
  box-sizing: border-box;
  position: relative;
}

/* 只有有文章的格子才显示指针和悬停效果 */
.contribution-cell.has-articles {
  cursor: pointer;
}

.contribution-cell.has-articles:hover {
  transform: scale(1.2);
  z-index: 1;
}

/* 只有有文章的格子才显示 tooltip */
.contribution-cell:not(.has-articles):hover::before {
  display: none;
}

.contribution-cell.has-articles:hover::before {
  content: attr(data-tooltip);
  position: fixed;
  bottom: auto;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 12px 16px;
  background: #000000;
  color: white;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-line;
  z-index: 9999;
  min-width: 200px;
  max-width: 300px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: none;
  text-align: left;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.contribution-cell:hover::after {
  display: none; /* 移除箭头 */
}

/* 修改配色为浅色系 */
.level-0 { 
  background-color: #ebedf0; 
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.level-1 { background-color: #ffedd6; }
.level-2 { background-color: #ffd591; }
.level-3 { background-color: #ffa940; }
.level-4 { background-color: #fa8c16; }
</style>