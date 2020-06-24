---
title: CSS小技巧
tags: [css]
categories:
  - web
  - css
date: 2017-02-11 15:17:00
updated: 2017-02-11 15:17:00
---
## 聊天框添加小三角
重点是`.chat-box`样式的`position`属性设置为`relative`，再利用`::after`伪元素设置小三角相对位置。
```css
.chat-box {
    width:500px;
    height:300px;
    margin:100px auto;
    border:2px solid #acacac;
    border-radius:10px;
    position:relative;
}

.chat-box::after {
    background: #fff none repeat scroll 0 0;
    border-bottom: 2px solid #acacac;
    border-right: 2px solid #acacac;
    bottom: -22px;
    content: " ";
    display: block;
    height: 40px;
    left: 45px;
    position: absolute;
    transform: rotate(45deg);
    width: 40px;
}
```

## css loading 加载
A collection of loading indicators animated with CSS
[SpinKit](https://github.com/tobiasahlin/SpinKit)
