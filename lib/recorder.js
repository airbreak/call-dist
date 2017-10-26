/* jshint esversion: 6 */
/**
 * Created by 耸善 on 2016-X-X.
 * Last Modify by 耸善 on 2017-7-5.
 * version 0.1
<strong>
    recorder
    数据统计，主要使用google统计
 </strong>
 **/


var recorder = {
    path: "",
    /**
     * @description 构建方法
     * @param {String} path 记录的事件名称，一般为项目名称
     * @param {String} usage 记录使用的账号，默认则不需要填写
     * 
     */
    init: function(path, usage) {
        (function(i, s, o, g, r, a, m) {
            i['GoogleAnalyticsObject'] = r;
            i[r] = i[r] || function() {
                (i[r].q = i[r].q || []).push(arguments)
            }, i[r].l = 1 * new Date();
            a = s.createElement(o),
                m = s.getElementsByTagName(o)[0];
            a.async = 1;
            a.src = g;
            m.parentNode.insertBefore(a, m)
        })(window, document, "script", "https://www.google-analytics.com/analytics.js", "ga");

        if (usage) {
            switch (usage) {
                case "neo":
                    ga("create", "UA-53478192-3", "auto");
                    break;
                default:
                    ga("create", "UA-85445375-1", "auto");
                    break;
            }
        } else {
            ga("create", "UA-85445375-1", "auto");
        }

        ga("send", "pageview");
        this.path = path;
    },
    /**
     * @description 重设事件名称
     * @param {String} path 记录的事件名称，一般为项目名称
     */
    setPath: function(path) {
        this.path = path;
    },
    /**
     * @description 记录行为
     * @param {String} event 行为名称
     * @param {String} path 记录的事件名称，非必填
     */
    record: function(event, path) {
        var self = this;
        var _path = path || self.path;
        if (_path) {
            ga('send', 'event', {
                'eventCategory': _path,
                'eventAction': event
            });
        }
    }
};

module.exports = recorder;