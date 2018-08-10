module.exports = {
    base: "/",
    lang: "zh-CN",
    title: "清峰",
    description: "瞎逼逼乐呵呵",
    configureWebpack: {
        resolve: {
            alias: {
                "@img": "img"
            }
        }
    },
    // theme: 'awesome', // node_modules/vuepress-theme-awesome/Layout.vue
    markdown: {
        // options for markdown-it-anchor
        anchor: { permalink: false },
        // options for markdown-it-toc
        toc: { includeLevel: [1, 2] }
        // config: md => {
        //     // use more markdown-it plugins!
        //     // md.use(require('markdown-it-xxx'))
        // }
    },
    themeConfig: {
        nav: [{ text: "首页", link: "/" }, { text: "认真生活", link: "/life/" }, { text: "开心工作", link: "/work/" }],
        sidebar: {
            "/life/": ["", "life", "儿童敏感期"],
            "/work/": ["", "work"]
        },
        activeHeaderLinks: true, // 默认值：true
        search: true,
        searchMaxSuggestions: 10,
        serviceWorker: {
            updatePopup: true // Boolean | Object, 默认值是 undefined.
            // 如果设置为 true, 默认的文本配置将是:
            // updatePopup: {
            //    message: "New content is available.",
            //    buttonText: "Refresh"
            // }
        },
        repo: "kiyonlin"
    },
    evergreen: true
};
