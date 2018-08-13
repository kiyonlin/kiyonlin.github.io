<template>
  <div class="tags">
    <a-checkable-tag v-for="(tag, index) in $blog.tags" :key="index" :style="style(tag)" :checked="tagName==tag" @change="select(tag)">
      {{tag}} {{$blog.tagedPages[tag].length}}
    </a-checkable-tag>
    <a-divider></a-divider>
    <div v-for="page in pages" :key="page.key" class="mb-10">
      <page-item :page="page"></page-item>
    </div>

    <a-pagination simple hideOnSinglePage :current="current" :total="total" :pageSize="pageSize" @change="onPageChange" class="text-right mb-10" />
    <Content custom/>
  </div>
</template>

<script>
  import {
    toTop
  } from '../theme/util.js'
  export default {
    data() {
      return {
        pageSize: 5
      }
    },
    computed: {
      tagName() {
        return this.$route.params.tagName
      },
      pages() {
        return this.totalPages.slice((this.current - 1) * this.pageSize, this.current * this.pageSize);
      },
      totalPages() {
        return this.$blog.tagedPages[this.tagName];
      },
      total() {
        return this.totalPages.length;
      },
      maxPage() {
        return Math.ceil(this.total / this.pageSize);
      },
      current() {
        let page = +this.$route.query.page || 1;
        if (page < 1) page = 1;
        if (page > this.maxPage) page = this.maxPage;
        return page;
      }
    },
    methods: {
      style(tag) {
        const base = 12 + this.$blog.tagedPages[tag].length;
        return {
          'font-size': base + 'px',
          'height': (base + 10) + 'px',
          'line-height': (base + 8) + 'px',
        }
      },
      select(tag) {
        this.$router.push('/tags/' + tag);
      },
      onPageChange(current) {
        this.$router.push({
          path: this.$route.path,
          query: {
            page: current
          }
        });
        toTop();
      }
    }
  }
</script>

<style lang="stylus">
@import '../theme/styles/config.styl'

.tags
  padding $navbarHeight 2rem 0
  max-width 960px
  margin 0px auto

@media (max-width: $MQMobile)
  .tags
    margin 0px auto

@media (max-width: $MQMobileNarrow)
  .tags
    padding-left 1.5rem
    padding-right 1.5rem
</style>
