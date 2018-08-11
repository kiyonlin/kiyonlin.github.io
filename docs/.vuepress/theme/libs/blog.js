import dayjs from "dayjs";

const install = (Vue, { theme, pages }) => {
    const categories = ["life", "work", "relax"];
    let categoriedPages = {};
    categories.forEach(category => {
        const catRE = new RegExp(`/${category}/` + ".+html");
        categoriedPages[category] = pages
            .filter(page => catRE.test(page.path))
            .sort((page1, page2) => page1.frontmatter.updated < page2.frontmatter.updated);
    });
    let tags = new Set();
    let tagedPages = {};

    // 收集tag和tag对应的文章
    pages.forEach(page => {
        page.frontmatter.tag &&
            page.frontmatter.tag.forEach(tag => {
                if (!tags.has(tag)) {
                    tags.add(tag);
                    tagedPages[tag] = [];
                }
                tagedPages[tag].push(page);
            });
    });

    Vue.mixin({
        computed: {
            $blog() {
                return { categoriedPages, tagedPages, tags };
            }
        }
    });

    const format = theme.format;
    Vue.filter("date", value => dayjs(value).format(format.date));
    Vue.filter("dateTime", value => dayjs(value).format(format.dateTime));
};

export default { install };
