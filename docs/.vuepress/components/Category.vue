<template>
  <div class="category">
    <div v-for="page in pages" :key="page.key" class="mb-10">
      <page-item :page="page"></page-item>
    </div>
    <a-pagination simple hideOnSinglePage :current="current" :total="total" :pageSize="pageSize" @change="onPageChange" class="text-right" />
    <Content custom/>
  </div>
</template>

<script>
  import PageItem from './PageItem.vue'
  export default {
    components: {
      PageItem
    },
    data() {
      return {
        current: 1,
        pageSize: 10
      }
    },
    computed: {
      pages() {
        return this.totalPages.slice((this.current - 1) * this.pageSize, this.current * this.pageSize);
      },
      totalPages() {
        // 匹配当前分类下的所有pages
        const category = this.$page.path.replace(/\//g, '');
        return this.$blog.categoriedPages[category];
      },
      total() {
        return this.totalPages.length;
      }
    },
    methods: {
      onPageChange(current) {
        this.current = current;
      }
    }
  }
</script>

<style lang="stylus">
@import '../theme/styles/config.styl'

.category
  padding $navbarHeight 2rem 0
  max-width 960px
  margin 0px auto

@media (max-width: $MQMobile)
  .category
    margin 0px auto

@media (max-width: $MQMobileNarrow)
  .category
    padding-left 1.5rem
    padding-right 1.5rem
</style>
