<template>
  <div class="tags">
    <a-checkable-tag v-for="(tag, index) in $blog.tags" :key="index" :style="style(tag)" :checked="tagName==tag" @change="select(tag)">
      {{tag}} {{$blog.tagedPages[tag].length}}
    </a-checkable-tag>

    <a-divider></a-divider>

    <div v-for="page in pages" :key="page.key" class="mb-10">
      <page-item :page="page"></page-item>
    </div>
    <Content custom/>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        selectedTag: ''
      }
    },
    computed: {
      tagName() {
      return this.$route.params.tagName
    },
      pages(){
        return this.$blog.tagedPages[this.tagName];
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
