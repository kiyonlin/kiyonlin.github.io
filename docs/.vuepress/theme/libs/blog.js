import dayjs from "dayjs";

const install = (Vue, { theme, pages }) => {
    pages = pages.sort((page1, page2) => page1.frontmatter.updated < page2.frontmatter.updated);

    const categories = ["life", "work", "relax"];
    let categoriedPages = {};
    categories.forEach(category => {
        const catRE = new RegExp(`/${category}/` + ".+html");
        categoriedPages[category] = pages.filter(page => catRE.test(page.path));
        categoriedPages[category] && categoriedPages[category].reduce((prev, current) => {
            if(prev){
                prev.frontmatter.next = prev.frontmatter.next || current.path;
                current.frontmatter.prev = current.frontmatter.prev || prev.path;
            }
            return current;
        }, null);
    });
    let tagsSet = new Set();
    let tagedPages = {};

    // 收集tag和tag对应的文章
    pages.forEach(page => {
        page.frontmatter.tag &&
            page.frontmatter.tag.forEach(tag => {
                if (!tagsSet.has(tag)) {
                    tagsSet.add(tag);
                    tagedPages[tag] = [];
                }
                tagedPages[tag].push(page);
            });
    });

    let tags = Array.from(tagsSet);

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
