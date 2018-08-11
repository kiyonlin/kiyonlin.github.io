<template>
  <div class="category">
    分类{{ $page }}
    <a-button @click="handleClick" style="marginTop: 16px">Toggle loading</a-button>
    <div v-for="page in pages" :key="page.key" class="prev mb-20">
      <router-link :to="page.path">
        <a-card :loading="loading" :title="page.title || page.path" hoverable>
          whatever content
        </a-card>
      </router-link>
      <div class="mt-3">
        <a-tag v-for="(tag, index) in page.frontmatter.tag" :key="index" color="blue">{{tag}}</a-tag>
      </div>
    </div>
    <Content custom/>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        loading: true,
      }
    },
    computed: {
      data() {
        return this.$page.frontmatter
      },
      pages() {
        // 匹配当前分类下的所有pages
        const pageRE = new RegExp(this.$page.path + '.+html')
        return this.$site.pages
          .filter((page) => pageRE.test(page.path))
          .sort((page1, page2) => page1.frontmatter.updated < page2.frontmatter.updated);
      }
    },
    methods: {
      handleClick() {
        this.loading = !this.loading
      }
    },
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
