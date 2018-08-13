<template>
  <div>
    <a-card hoverable>
      <a-card-meta>
        <template slot="title">
          <router-link :to="page.path">{{ page.title || page.path }}</router-link>
        </template>

        <template slot="description">
          {{ page.updated | dateTime }}
        </template>
      </a-card-meta>
        
      <div v-html="page.excerpt" class="mt-5"></div>

      <template slot="actions">
        <a-tag v-for="(tag, index) in page.frontmatter.tag" :key="index" :to="'/tags' + tag" color="blue" class="m-3">
          <router-link :to="'/tags/'+tag">{{tag}}</router-link>
        </a-tag>
      </template>
    </a-card>
  </div>
</template>

<script>
  export default {
    props: ['page'],
  }
</script>
