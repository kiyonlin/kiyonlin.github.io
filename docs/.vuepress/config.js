module.exports = {
    base: '/',
    title: 'VuePress',
    description: 'Just playing around',
    configureWebpack: {
        resolve: {
            alias: {
                '@img': 'img'
            }
        }
    },
    // theme: 'awesome', // node_modules/vuepress-theme-awesome/Layout.vue
    markdown: {
        // options for markdown-it-anchor
        anchor: { permalink: false },
        // options for markdown-it-toc
        toc: { includeLevel: [1, 2] },
        // config: md => {
        //     // use more markdown-it plugins!
        //     // md.use(require('markdown-it-xxx'))
        // }
    },
    themeConfig: {
        nav: [
            { text: 'Home', link: '/' },
            { text: 'Guide', link: '/guide/' },
            { text: 'External', link: 'https://google.com' },
        ],
        sidebar: [
            '/',
        ]
    }
}
