---
title: Blogging Like a Hacker
lang: en-US
meta:
  - name: description
    content: hello
  - name: keywords
    content: super duper SEO

home: true
heroImage: /hero.png
actionText: Get Started →
actionLink: /guide/
features:
- title: Simplicity First
  details: Minimal setup with markdown-centered project structure helps you focus on writing.
- title: Vue-Powered
  details: Enjoy the dev experience of Vue + webpack, use Vue components in markdown, and develop custom themes with Vue.
- title: Performant
  details: VuePress generates pre-rendered static HTML for each page, and runs as an SPA once a page is loaded.
footer: MIT Licensed | Copyright © 2018-present Evan You
---

[[toc]]

# Hello VurPress
## Table
| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| col 3 is :tada: :100:| right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |

## Image
![An image](/ics.png)


## Custom Containers
::: tip
This is a tip
:::

::: warning
This is a warning
:::

::: danger
This is a dangerous warning
:::

::: danger STOP
Danger zone, do not proceed
:::


## Line Highlighting in Code Blocks

``` js{2-4,7}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```
## vue
{{ 1 + 1 }}

<span v-for="i in 3">{{ i }} </span>

{{ $page.path }}

## Escaping

v-pre不解析{{}}

::: v-pre
`{{ This will be displayed as-is }}`
:::