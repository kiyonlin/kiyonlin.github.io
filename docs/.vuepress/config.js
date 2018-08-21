module.exports = {
    base: "/",
    lang: "zh-CN",
    title: "清峰",
    description: "瞎逼逼乐呵呵",
    head: [["link", { rel: "shortcut icon", href: "/favicon.ico" }]],
    configureWebpack: {
        resolve: {
            alias: {
                "@img": "img"
            }
        }
    },
    // theme: 'awesome', // node_modules/vuepress-theme-awesome/Layout.vue
    markdown: {
        lineNumbers: true,
        // options for markdown-it-anchor
        anchor: { permalink: true },
        // options for markdown-it-toc
        toc: { includeLevel: [2, 3, 4] },
        config: md => {
            // use more markdown-it plugins!
            md.use(require("markdown-it-footnote"));
        }
    },
    themeConfig: {
        nav: [
            { text: "首页", link: "/" },
            { text: "认真生活", link: "/life/" },
            { text: "开心工作", link: "/work/" },
            { text: "劳逸结合", link: "/relax/" }
        ],
        sidebar: "auto",
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
        lastUpdated: "最后更新",
        repo: "kiyonlin",
        format: {
            date: "YYYY-MM-DD",
            dateTime: "YYYY-MM-DD HH:mm:ss"
        },
        tags: {
            path: "/tags/:tagName"
        },
        // gitment 评论总开关，默认关闭
        // comment: false,
        gitment: {
            owner: 'kiyonlin',
            repo: 'kiyonlin.github.io',
            oauth: {
                clientID: 'c1f6ff56b40b5e7baecb',
                client_secret: '81a6ed3f1109e570c0ea825dae1d888c3e57bb52',
            },
        }
    },
    evergreen: true
};
