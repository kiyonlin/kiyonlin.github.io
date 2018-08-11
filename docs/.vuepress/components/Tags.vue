<template>
  <div class="tags">
    <a-checkable-tag v-for="(tag, index) in $blog.tags" :key="index" :style="style(tag)" :checked="selectedTag==tag" @change="select(tag)">
      {{tag}} {{$blog.tagedPages[tag].length}}
    </a-checkable-tag>
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
      data() {
        return this.$page.frontmatter
      },
    },
    methods: {
      colors() {
        let r = Math.floor(Math.random() * 255);
        let g = Math.floor(Math.random() * 255);
        let b = Math.floor(Math.random() * 255);
        let bg_color = 'rgba(' + r + ',' + g + ',' + b + ',1)';
        let color = r * 0.299 + g * 0.578 + b * 0.114 >= 192 ? '#111' : '#eee';
        return {
          color,
          bg_color
        };
      },
      style(tag) {
        const base = 12 + this.$blog.tagedPages[tag].length;
        const colors = this.colors();
        return {
          'font-size': base + 'px',
          'height': (base + 10) + 'px',
          'line-height': (base + 8) + 'px',
          // 'color': colors.color,
          // 'background-color': colors.bg_color
        }
      },
      select(tag) {
        this.selectedTag = tag;
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
