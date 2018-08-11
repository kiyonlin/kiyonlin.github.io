const Layout = _ => import("../Layout");

const install = (Vue, { router, theme }) => {
    const { tags } = theme;
    const routes = [];

    if (tags) {
        routes.push({
            path: tags.path,
            component: Layout,
            meta: {
                layout: "tags"
            }
        });
    }

    router.addRoutes(routes);
};

export default { install };
