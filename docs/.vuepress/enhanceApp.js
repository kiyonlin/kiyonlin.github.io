import { Button, Card } from "ant-design-vue";
import "ant-design-vue/dist/antd.css";

export default ({
    Vue, // the version of Vue being used in the VuePress app
    options, // the options for the root Vue instance
    router // the router instance for the app
}) => {
    // ...apply enhancements to the app
    Vue.component(Button.name, Button);
    Vue.component(Card.name, Card);
};
