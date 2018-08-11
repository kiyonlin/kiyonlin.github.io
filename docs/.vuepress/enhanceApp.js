import { Button, Card, Tag, BackTop } from "ant-design-vue";
import "ant-design-vue/dist/antd.css";
import "tailwindcss/dist/utilities.css";
import blog from "./theme/libs/blog"
import routes from "./theme/libs/routes"

export default ({
    Vue, // the version of Vue being used in the VuePress app
    options, // the options for the root Vue instance
    router, // the router instance for the app
    siteData
}) => {
    const { themeConfig: theme, pages } = siteData;
    Vue.use(blog, { theme, pages });
    Vue.use(routes, { router, theme });

    // ...apply enhancements to the app
    Vue.component(Button.name, Button);
    Vue.component(Card.name, Card);
    Vue.component(Tag.name, Tag);
    Vue.component(BackTop.name, BackTop);
};
