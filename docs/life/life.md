---
title: AAA
tag: 
  - 标签
  - 标签2
date: 2018-02-11 15:17:00
updated: 2018-02-11 15:17:00
---
{{ $page }}
[[toc]]

# Hello aaaa
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

## Escaping <Badge text="beta" type="warn"/>

v-pre不解析{{}}

::: v-pre
`{{ This will be displayed as-is }}`
:::