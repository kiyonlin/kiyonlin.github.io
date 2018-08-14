<template>
  <div class="theme-container">
    <div class="content">
      <h1>404</h1>
      <blockquote v-for="msg in msgs">{{ msg }}</blockquote>
      <router-link to="/" class="text-xl"><a-icon type="rollback"></a-icon>首页</router-link>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        msgs: [
          `莫听穿林打叶声，` +
          `何妨吟啸且徐行。` +
          `竹杖芒鞋轻胜马，` +
          `谁怕？` +
          `一蓑烟雨任平生。` +
          `料峭春风吹酒醒，` +
          `微冷，` +
          `山头斜照却相迎。` +
          `回首向来萧瑟处，` +
          `归去，` +
          `也无风雨也无晴。`
        ]
      }
    }
  }
</script>
