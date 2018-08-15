import dayjs from "dayjs";

const install = (Vue, { theme, pages }) => {
    const categories = ["life", "work", "relax"];
    let categoriedPages = {};
    categories.forEach(category => {
        const catRE = new RegExp(`/${category}/` + ".+html");
        categoriedPages[category] = pages.filter(page => catRE.test(page.path)).sort((page1, page2) => {
            let d1 = dayjs(page1.frontmatter.date);
            let d2 = dayjs(page2.frontmatter.date);
            return d1.isAfter(d2) ? -1 : d1.isBefore(d2) ? 1 : 0;
        });
        categoriedPages[category] &&
            categoriedPages[category].reduce((prev, current) => {
                if (prev) {
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

    tags.forEach(tag => {
        tagedPages[tag] = tagedPages[tag].sort((page1, page2) => page1.frontmatter.date < page2.frontmatter.date);
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
