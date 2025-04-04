/**
 * @overview ccm component for learning exchange
 * @author Wiete Lück <wiete.lueck@gmail.com>, 2025
 * @license The MIT License (MIT)
 */

ccm.files["ccm.learning_exchange.js"] = {
    name: "learning-exchange",
    //ccm: "https://ccmjs.github.io/ccm/ccm.js",
    ccm: "../libs/ccm-master/ccm.js",
    config: {
        //store: ["ccm.store", {url: "https://ccm2.inf.h-brs.de", name: "wlueck2s_mycollection"}],

        css: ["ccm.load", "./resources/styles.css"],
        html: {
            template: ["ccm.load", "./resources/template.html"],
        },

        user: ["ccm.start", "../libs/fb02user/ccm.fb02user.js"],
    },

    Instance: function () {
        let user, dataset;

        this.start = async () => {
            this.element.innerHTML = this.html.template;
        }
    }
}
