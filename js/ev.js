/**
 * Created by 耸善 on 2016/5/5.
 * Last Modify by 耸善 on 2016/12/12.
 * version 2.1
 <strong>
 2.1版本更新说明：
 －添加新增的本地调用方法

 2.0版本更新说明：
 －合并了Android与iOS的调用，调用时不再需要根据平台区分调用方法
 －采用回调方式响应调用
 －添加了调用的示例，可以直接cvs编程(ctrl + c/ctrl + v/ctrl + s)
 －合并／去除了部分不明／无意义的方法
 </strong>

 <strong>
 * 所有方法均基于全局对象_dialerEnv来调用
 * 请勿覆盖全局对象_dialerEnv
 * 调用数据统计相关方法时请使用_dialerEnv.recorder
 * 调用cookie相关方法时请使用_dialerEnv.cookies
 * 调用日期相关方法时请使用_dialerEnv.dateOps
 </strong>
 */

/**
 * @description 全局变量：
 * @final
 * @param {int} android 0
 * @param {int} iOS 1
 */
var PLATFORM = {
    PLATFORM_IOS:     0,
    PLATFORM_ANDROID: 1,
};

var DEBUG = (typeof DEBUG == "undefined") ? false : DEBUG;

/**
 * @description 百度统计工具
 * 使用示例: _hmt.push(['_trackEvent', path, path+data]);
 * @ignore
 */
var _hmt = _hmt || [];
(function() {
    var hm = document.createElement("script");
    hm.src = "https://hm.baidu.com/hm.js?8203b93a73fd9e8ffc85bdaa08f566ba";
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(hm, s);
})();

/**
 * @description 环境变量DialerEnv
 * 需要使用init方法进行初始化
 * 建议在document ready的时候调用init()
 * @ignore
 **/
var DialerEnv = (function () {
    /**
     * @description env query object
     * @ignore
     **/
    var env = {};
    /**
     * @description base user params
     * @ignore
     **/
    var BaseParams = {
        phone:"",
        token:"",
        platform:"",
        channel:"",
        apiLevel:0,
        version:"",
        registerTime:"",
        intlRoaming: "",
    };

    /**
     * @description callback function register object
     * used for register function as a window function
     * @ignore
     **/
    var CallbackFunction = CallbackFunction || {};
    /**
     * @description local function registerAsWindowFunction
     * Register function as window function for responsing the Calling from native
     * @param {String} functionName Name of the function
     * @param {Function} callback The real function to be callbacked
     * @ignore
     **/
    var registerAsWindowFunction = function(functionName, callback) {
        if (callback && (callback instanceof Function)) {
            CallbackFunction[functionName] = callback;
            window[functionName] = window[functionName] || (function() {
                    var args = Array.prototype.slice.call(arguments);
                    var new_length = args.push(functionName);
                    CallbackFunction[functionName].apply(null, args);
                });
        } else {
            printInfo("register Failed!!!");
        }
    };

    /**
     * @description 环境构建结果的emu
     * @final
     * @param {int} SUCCEED 环境构建成功
     * @param {int} LOGGED 环境构建成功并且用户为已登陆状态
     * @param {int} FAILED 环境构建失败
     **/
    env.STATUS = {
        SUCCEED: 0,
        FAILED:  1,
        LOGGED:  10,
    };

    /**
     * @description 判断当前平台<br/>
     * [调用示例]
     <pre>
     var platform = _dialerEnv.ua();
     if (platform.android) {
        console.log("android");
    } else if (platform.ios) {
        console.log("ios");
    } else if (platform.weixin) {
        console.log("weixin");
    } else if (platform.mobile) {
        console.log("mobile");
    } else if (platform.iPhone) {
        console.log("QQHD");
    } else {
        console.log("PC/Unknow");
    }
     _dialerEnv.init(function(param) {
        console.log("init finish");
    });
     </pre>
     [源码]
     *
     **/
    env.ua = function () {
        var u = navigator.userAgent, app = navigator.appVersion;

        return {
            weixin: u.match(/MicroMessenger/i) || window.WeixinJSBridge != undefined,
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
            android: u.indexOf("Android") > -1 || u.indexOf("Linux") > -1,
            mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
            iPhone: u.indexOf("iPhone") > -1,  //是否为iPhone或者QQHD浏览器
        };
    };


    /**
     * @description 获取当前平台及系统版本信息<br/>
     * [调用示例]
     <pre>
     var os = _dialerEnv.os_info();

     _dialerEnv.init(function(param) {
        console.log("init finish");
    });
     </pre>
     [源码]
     *
     **/
    env.os_info = function () {
        var os = navigator.appVersion;
        return {
            weixin: u.match(/MicroMessenger/i) || window.WeixinJSBridge != undefined,
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
            android: u.indexOf("Android") > -1 || u.indexOf("Linux") > -1,
            mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
            iPhone: u.indexOf("iPhone") > -1,  //是否为iPhone或者QQHD浏览器
        };
    };


    /**
     * @description internal function ua
     * @ignore
     **/
    var ua = env.ua();

    /**
     * @description local function printInfo
     * show log or error message
     * @param {String} errMsg msg
     * @ignore
     **/
    function printInfo(errMsg) {
        (DEBUG) && (function() {
            if (ua.ios) {
                alert(errMsg);
            } else {
                console.log(errMsg);
            }
        });
    }

    /**
     * @description internal handler object
     * @ignore
     **/
    var jsHandler;
    var iosBridge;
    env.jsHandler=
                window.DialerJavaScriptHandler // PresentationJs
                || window.CTKJavaScriptHandler // WebSearchJavaScriptInterface
                || window.generalBridge;  
    /**
     * @description 环境构建方法 init
     * 通过该方法构建与native通信的WebViewJavascriptHandler
     * 建议在document ready时调用该方法<br/>
     [调用示例]
     <pre>
     _dialerEnv.init(function(params) {
            switch (params["status"]) {
                case _dialerEnv.STATUS.LOGGED:
                    phone = params.phone;
                    versionCode = params.version;
                    break;
                case _dialerEnv.STATUS.FAILED:
                    console.log("请在触宝电话中打开此页面！");
                    break;
                case _dialerEnv.STATUS.SUCCEED:
                    console.log("未注册");
                    break;
                default:
                    console.log("nothing");
                    break;
            }
        });
     </pre>
     [源码]
     * @param {Function} callback 回调方法，当构建有结果时会回调该方法，
     * 构建成功的话会将native的相关信息作为参数传递给回调方法
     **/
    env.init = function (callback) {
        printInfo("init call");
        if (ua.android) {
            jsHandler =
                window.DialerJavaScriptHandler // PresentationJs
                || window.CTKJavaScriptHandler // WebSearchJavaScriptInterface
                || window.generalBridge;       // general bridge
            if (jsHandler) {
                params = JSON.parse(jsHandler.init());
                BaseParams.token = params.token;
                BaseParams.phone = params.number;
                BaseParams.platform = PLATFORM.PLATFORM_ANDROID;
                BaseParams.version = params.version;
                BaseParams.channel = params.channel;
                BaseParams.registerTime = params.registerTime;
                BaseParams.intlRoaming = params.isInternationalRoaming;
                BaseParams.apiLevel = jsHandler.getApiLevel();
                BaseParams.status = env.STATUS.SUCCEED;
                (BaseParams.phone) && (BaseParams.status = env.STATUS.LOGGED);
            } else {
                BaseParams.status = env.STATUS.FAILED;
            }
            if (callback && callback instanceof Function) {
                callback.call(null, BaseParams);
            }
        } else if (ua.ios && !ua.weixin) {
            BaseParams.status = env.STATUS.FAILED;
            setTimeout(function () {
                if (BaseParams.status == env.STATUS.FAILED) {
                    if (callback && callback instanceof Function) {
                        callback.call(null, BaseParams);
                    }
                }
            }, 1000);
            document.addEventListener("WebViewJavascriptBridgeReady",
                function(event) {
                    env.iosBridge=event.bridge;
                    iosBridge = event.bridge;
                    iosBridge.init(function(message) {
                        BaseParams.token = message.token;
                        BaseParams.phone = message.number;
                        BaseParams.platform = PLATFORM.PLATFORM_IOS;
                        BaseParams.version = message.version;
                        BaseParams.channel = message.channel;
                        BaseParams.registerTime = message.registerTime;
                        BaseParams.intlRoaming = message.isInternationalRoaming;
                        BaseParams.apiLevel = message.apiLevel;
                        BaseParams.status = env.STATUS.SUCCEED;
                        (message.number) && (BaseParams.status = env.STATUS.LOGGED);
                        if (callback && callback instanceof Function) {
                            callback.call(null, BaseParams);
                        }
                    });
                }, false);
        } else {
            if (callback && callback instanceof Function) {
                BaseParams.status = env.STATUS.FAILED;
                callback.call(null, BaseParams);
            }
        }
    };

    /**
     * @description  分享方法 doShare
     * 通过该方法调用native的分享功能<br/>
     * [调用示例]
     <pre>
     var share_params = {
        approaches: ["wechat", "timeline"],
        dlg_title:"分享至",
        title:"分享标题",
        content:"分享文案",
        from: "web_call",
        url: "http://chubaocn.cootek.com/index.html",
        keep_org_url: false,
        img_url:"http://dialer.cdn.cootekservice.com/icon/invite_icon.png"
    }
     //弹窗方式
     _dialerEnv.doShare("popup", share_params, false);
     //直接分享
     var approach = "wechat";
     _dialerEnv.doShare(approach, share_params, true,
     function(share_from, approach, status) {
            switch (status) {
                case "shareCanceled":
                    break;
                case "shareSucceed":
                    break;
                case "shareFailed":
                    break;
                default:
                    break;
        }
    });
     </pre>
     [源码]
     * @param {String}   approach  分享路径
     * @param {Json}     param     分享参数，其中5741（包含）以下版本img_url参数会被忽略
     * @param {Boolean}  directly  分享方式，是否通过直接/弹框的方式进行分享
     * @param {Function} callback  回调方法，回调分享结果
     **/
    env.doShare = function(approach, params, directly, callback) {
        var ret;
        if (callback) {
            registerAsWindowFunction.call(CallbackFunction, "shareSucceed", function(share_from, org_approach, status) {
                var processedName = processRecordName(org_approach);
                var res_approach = processedName.approach;
                callback.call(window, share_from, res_approach, status, processedName);
            });
            registerAsWindowFunction.call(CallbackFunction, "shareFailed", function(share_from, org_approach, status) {
                var processedName = processRecordName(org_approach);
                var res_approach = processedName.approach;
                callback.call(window, share_from, res_approach, status, processedName);
            });
            registerAsWindowFunction.call(CallbackFunction, "shareCanceled", function(share_from, org_approach, status) {
                var processedName = processRecordName(org_approach);
                var res_approach = processedName.approach;
                callback.call(window, share_from, res_approach, status, processedName);
            });
        }
        if (!approach || !params) {
            (callback) && (callback.call(null, ret));
            return ret;
        }
        // iOS img url named image_url -_-|||
        (params.img_url) && (params.image_url = params.img_url);
        var paramsJson = {
            "approach": approach,
            "params":   params,
            "json":     params
        };
        // alert(iosBridge)
        if (ua.android && jsHandler) {
            if (directly) {
                (jsHandler.share) && (ret =
                    jsHandler.share(paramsJson["approach"], JSON.stringify(paramsJson["params"])));
            } else {
                (jsHandler.share) && (ret =
                    jsHandler.share(JSON.stringify(paramsJson["params"])));
            }
            return ret;
        } else if (ua.ios && iosBridge) {
            if (directly) {
                printInfo("share directly");
                iosBridge.callHandler("webShare", paramsJson, function(result) {
                    var result_params = eval(result);
                    var approach, error, result, status;
                    if ("approach" in result_params) (approach = result_params["approach"]);
                    if ("error" in result_params) (error = result_params["error"]);
                    if ("result" in result_params) (result = result_params["result"]);
                    (error) && (status = "shareFailed");
                    (result == 0) && (status = "shareSucceed");
                    (result == 1) && (status = "shareFailed");
                    (result == 2) && (status = "shareCanceled");
                    (callback) && (callback.call(null, approach, approach, status, "doShare"));
                });
            } else {
                printInfo("share popup");
                iosBridge.callHandler("popShareView", paramsJson["params"], null);
            }
        }
    };

    /**
     * @description   打开链接 openlink
     * 通过该方法打开／重定向一个新的地址，该方法会根据不同版本产生不同的行为<br/>
     * [调用示例]
     <pre>
     _dialerEnv.openLink("http://bing.cn", "必应", function() {
        var arg = JSON.stringify(arguments);
        console.log(arg);
    });
     </pre>
     [源码]
     * @param {String}   url  链接
     * @param {String}   title    页面标题
     * @param {Function} callback  回调方法，回调调用结果
     **/
    env.openLink = function(url, title, callback) {
        var ret;
        if (ua.android && jsHandler) {
            if (window.CTKJavaScriptHandler) {
                window.parent.location.href = url;
            } else {
                (env.pushWeb) && (ret = env.pushWeb(title, url));
            }
        } else if (ua.ios && iosBridge) {
            var from_yp = env.getUrlParam("from_yp", "false");
            if (from_yp == "true") {
                window.location.href = url;
            } else {
                env.pushWeb(url, title, "", function() {
                    ret = arguments;
                });
            }
        } else {
            window.location.href = url;
        }
        (callback) && (callback.call(null, ret, "openLink"));
    };

    /**
     * @deprecated [兼容旧版本方法] 不建议使用
     * @description 打开新的webview并跳转到设定链接 openlink<br/>
     * [Android] <strong>仅在window.generalBridge中有效</strong><br/>
     * 通过该方法打开／重定向一个新的地址，该方法会根据不同版本产生不同的行为<br/>
     * [调用示例]
     <pre>
     _dialerEnv.pushWeb("http://bing.cn", "必应", "", function() {
        var arg = JSON.stringify(arguments);
        console.log(arg);
    });
     </pre>
     [源码]
     * @param {String}   url       链接
     * @param {String}   title     页面标题
     * @param {String}   file_name 文件名称
     * @param {Function} callback  回调方法，回调调用结果
     **/
    env.pushWeb = function(url, title, file_name, callback) {
        var ret;
        if (ua.android && jsHandler) {
            var json = {
                "title" : title,
                "url" : url
            };
            (jsHandler) &&
            (ret = (jsHandler.
                    pushWeb(JSON.stringify(json)))
            );
            (callback) && (callback.call(null, ret, "pushWeb"));
        } else if (ua.ios && iosBridge) {
            var json = {
                "url":url,
                "title":title,
                "file_name":file_name
            };
            iosBridge.callHandler("openWebViewController", json, function() {
                var args = Array.prototype.slice.call(arguments);
                args.push("pushWeb");
                (callback) && (callback.apply(null, args));
            });
        }
    };

    /**
     * @description 弹出native对话框<br/>
     * [调用示例]
     <pre>
     _dialerEnv.showDialog("弹框", "标题", "false",
     "OK", function(){console.log("positive_click")},
     "Cancel", function(){console.log("negative_click")}, null);
     </pre>
     [源码]
     * @param {String}   message   弹框内容
     * @param {String}   title     弹框标题
     * @param {Boolean}   positive_only 仅显示确定按键
     * @param {String}   positive_text 确定按键文案
     * @param {Function}   positive_cb   确定按键回调
     * @param {String}   negative_text Cancel按键文案
     * @param {Function}   negative_cb Cancel按键回调
     * @param {Function} callback  回调方法，回调调用结果
     **/
    env.showDialog = function(message, title, positive_only, positive_text,
                              positive_cb, negative_text, negative_cb, callback) {
        var ret;
        var json = {
            "message" : message,
            "title" : title,
            "positive_only" : String.valueOf(positive_only),
            "positive_text" : positive_text,
            "positive_cb" : "dialogPosCB",
            "negative_text" : negative_text,
            "negative_cb" : "dialogNegCB"
        };
        (positive_cb) && (positive_cb instanceof Function)
        && (registerAsWindowFunction.call(CallbackFunction, "dialogPosCB", positive_cb));
        (negative_cb) && (negative_cb instanceof Function)
        && (registerAsWindowFunction.call(CallbackFunction, "dialogNegCB", negative_cb));
        if (ua.android && jsHandler) {
            (jsHandler.showDialog) && (ret = (jsHandler.showDialog(JSON.stringify(json))));
            ret = true;
            (callback) && (callback.call(null, ret, "showDialog"));
        } else if (ua.ios && iosBridge) {
            iosBridge.registerHandler(positive_cb, function(data, responseCallback) {
                eval(positive_cb);
            });
            iosBridge.registerHandler(negative_cb, function(data, responseCallback) {
                eval(negative_cb);
            });
            iosBridge.callHandler("showDialog", json, function() {
                var args = Array.prototype.slice.call(arguments);
                args.push("showDialog");
                (callback) && (callback.apply(null, args));
            });
        }
    };

    /**
     * @description 执行native的奖励任务<br/>
     * [调用示例]
     <pre>
     _dialerEnv.doTask(27, function(){
            var arg = JSON.stringify(arguments);
            console.log(arg);
        });
     </pre>
     [源码]
     * @param {int}   task_id   任务id
     * @param {Function} callback  回调方法，回调调用结果
     **/
    env.doTask = function(task_id, callback){
        var ret;
        var json = {
            "task_id":task_id
        };
        if (ua.android && jsHandler) {
            (jsHandler.doTask) && (ret = (jsHandler.doTask(JSON.stringify(json))));
            (callback) && (callback.call(null, ret, "doTask"));
        } else if (ua.ios && iosBridge) {
            iosBridge.callHandler("doTask", json, function() {
                var args = Array.prototype.slice.call(arguments);
                args.push("doTask");
                (callback) && (callback.apply(null, args));
            });
        }
    };

    /**
     * @description 检测当前系统是否支持接管系统拨号
     * [Android] <strong>仅对Android有效</strong><br/>
     * [调用示例]
     <pre>
     _dialerEnv.canTakeOver(function(ret){
            console.log(ret);
        });
     </pre>
     [源码]
     * @param {Function}  callback  回调方法，回调调用结果
     **/
    env.canTakeOver = function(callback) {
        var ret;
        if (ua.android && jsHandler) {
            (jsHandler.canTakeOver) && (ret = (jsHandler.canTakeOver()));
            (callback) && (callback.call(null, ret, "canTakeOver"));
            return ret;
        } else if (ua.ios && iosBridge) {
            ret = false;
            (callback) && (callback.call(null , ret, "canTakeOver"));
        }
        return ret;
    };

    /**
     * @description 尝试接管系统拨号
     * [Android] <strong>仅对Android有效</strong><br/>
     * 通常与canTakeOver方法一同使用<br/>
     * [调用示例]
     <pre>
     _dialerEnv.canTakeOver(function(ret) {
            _dialerEnv.takeOverSys(ret, "","","", function(){
                var arg = JSON.stringify(arguments);
                console.log(arg);
            });
        });
     </pre>
     [源码]
     * @param {Boolean}   canTakeOver  能否接管
     * @param {Boolean}   finishPageWhenDismiss  不明参数
     * @param {Boolean}   onlyDismissDlg  不明参数
     * @param {Boolean}   refreshWhenDismiss  不明参数
     * @param {Function}  callback  回调方法，回调调用结果
     **/
    env.takeOverSys = function(canTakeOver, finishPageWhenDismiss, onlyDismissDlg,
                               refreshWhenDismiss, callback) {
        var ret;
        if (ua.android && jsHandler) {
            (jsHandler.takeOverSys) &&
            (ret = (jsHandler.takeOverSys(canTakeOver, finishPageWhenDismiss,
                onlyDismissDlg, refreshWhenDismiss)));
        } else if (ua.ios && iosBridge) {
            //Do nothing
        }
        (callback) && (callback.call(null, ret, this.name));
    };

    /**
     * @description 进入／返回拨号页面<br/>
     * [调用示例]
     <pre>
     _dialerEnv.popToRoot(function(){
            var arg = JSON.stringify(arguments);
            console.log(arg);
        });
     </pre>
     [源码]
     * @param {Function} callback  回调方法，回调调用结果
     **/
    env.popToRoot = function(callback) {
        var ret;
        if (ua.android && jsHandler) {
            (jsHandler.popToRoot) && (ret = (jsHandler.popToRoot()));
            (callback) && (callback.call(null, ret, "popToRoot"));
        } else if (ua.ios && iosBridge) {
            iosBridge.callHandler("popToRoot", null, function() {
                var args = Array.prototype.slice.call(arguments);
                args.push("popToRoot");
                (callback) && (callback.apply(null, args));
            });
        }
    };

    /**
     * @description 不明方法，猜测为兑换本地流量<br/>
     * [调用示例]
     <pre>
     _dialerEnv.exchangeFlow(10, function(){
            var arg = JSON.stringify(arguments);
            console.log(arg);
        });
     </pre>
     [源码]
     * @param {int} number 兑换数量
     * @param {Function} callback  回调方法，回调调用结果
     **/
    env.exchangeFlow = function(number,callback){
        var ret;
        if (ua.android && jsHandler) {
            (jsHandler.exchangeTraffic) && (ret = (jsHandler.exchangeTraffic(number, 0)));
            (callback) && (callback.call(null, ret, "exchangeFlow"));
        } else if (ua.ios && iosBridge) {
            var json = {
                "number":number
            };
            iosBridge.callHandler("TaobaoFlow", json, function() {
                var args = Array.prototype.slice.call(arguments);
                args.push("exchangeFlow");
                (callback) && (callback.apply(null, args));
            });
        }
    };

    /**
     * @description 启动一个native活动(Activiy/ViewController)
     * <br/>调用示例(1)：[Android] without extraData
     <pre>
     _dialerEnv.launchLocalView(
     "com.cootek.smartdialer.feedback.AboutCootekActivity",
     null, false, null);
     </pre>
     <br/>
     调用示例(2)：[Android] with extraData
     <pre>
     var extraData = {
            "paramArray" : [{"extraName": "input_type", "extraValue" : "5",
                "extraType": "Integer"}, {"extraName":"activity_launch_from",
                "extraValue" : "webview", "extraType" : "String"}],
        }
     _dialerEnv.launchLocalView(
     "com.cootek.smartdialer.privacy.PrivateContactInputPasswordActivity",
     extraData, false);
     </pre>

     调用示例(x)：[Android] start websearch activity with extraData
     <pre>
     var extraData = {
            "paramArray" : [
                {"extraName": "EXTRA_SHOW_BACK_ON_MAIN_PAGE", "extraValue" : "true",
                    "extraType": "Boolean"},
                {"extraName":"EXTRA_BACK", "extraValue" : "true", "extraType" : "Boolean"},
                {"extraName":"EXTRA_URL_STRING", "extraValue" : "http://www.bing.com", "extraType" : "String"}],
        }
     _dialerEnv.launchLocalView(
     "com.cootek.smartdialer.websearch.WebSearchPageActivity", extraData, false);
     </pre>
     <br/>
     调用示例(3)：[iOS]
     <pre>
     _dialerEnv.launchLocalView(
     "SkinSettingViewController",
     null, false, null);
     </pre>
     <br/>
     调用示例(4)：[All]
     <pre>
     var viewName = {
            android:"com.cootek.smartdialer.plugin.PersonalCenter",
            iOS:"PersonalCenter"
        }
     _dialerEnv.launchLocalView(
     "SkinSettingViewController",
     null, false, null);
     </pre>
     [源码]
     * @param {String/Json} clsName     活动名称(包名/Conrtoller名称)
     可单独命名不同平台也可同时命名含有不同平台的view名称,属性为"android"/"iOS",详见示例4
     * @param {Json} extraData     extraData信息
     * @param {Boolean} startService 是否以server方式启动<strong>[仅Android有效]</strong>
     * @param {Function} callback  回调方法，回调调用结果
     **/
    env.launchLocalView = function (clsName, extraData, startService, callback) {
        var ret;
        if (ua.android && jsHandler) {
            var default_pkgName = "com.cootek.smartdialer";
            var className = clsName.android || clsName;
            var pkgname = className.lastIndexOf(default_pkgName) > -1 ?
                default_pkgName : className.substring(0, className.lastIndexOf("."));
            if (extraData) {
                var intentData = (extraData["intentData"]) || null;
                var jsonExtraData = (extraData["jsonExtraData"]) || null;
                var paramArray = (extraData["paramArray"]) || null;
                if (intentData || jsonExtraData || startService) {
                    (jsHandler.launchLocalAppByClassName) &&
                    (ret = (jsHandler.launchLocalAppByClassName(pkgname, className,
                        intentData, jsonExtraData, startService)));
                } else if (paramArray) {
                    var paramArrayString = [];
                    for (var index in paramArray) {
                        paramArrayString.push(JSON.stringify(paramArray[index]));
                    }
                    (jsHandler.startActivity) &&
                    (ret = (jsHandler.startActivity(pkgname, className, null, null,
                        -1, null, paramArrayString)));
                }
            } else {
                (jsHandler.launchLocalAppByClassName) &&
                (ret = (jsHandler.launchLocalAppByClassName(pkgname, className,
                    null, null, false)));
            }
            (callback) && (callback.call(null, ret, "launchLocalView"));
        } else if (ua.ios && iosBridge) {
            var controller = clsName.iOS || clsName;
            var json = extraData || {
                    "controller": controller
                };
            json.controller = json.controller || controller;

            iosBridge.callHandler("pushViewController", json, function() {
                var args = Array.prototype.slice.call(arguments);
                args.push("launchLocalView");
                (callback) && (callback.apply(null, args));
            });
        }
    };

    /** @description 启动一个已经安装的应用<br/>
     *  调用示例(1) [Android]：
     <pre>
     _dialerEnv.launchApp("com.android.mms","com.android.mms.ui.ConversationComposer",
     function(){
            var arg = JSON.stringify(arguments);
            console.log(arg);
        });
     </pre>
     调用示例(2) [iOS]：
     <pre>
     _dialerEnv.launchApp("url","weixin://",function(){
        var arg = JSON.stringify(arguments);
        console.log(arg);
    });
     </pre>
     [源码]
     * @param {String}   pkgName  应用包名(Android)/启动类型(iOS)
     * @param {String}   clsName  应用的入口名称
     * @param {Function} callback  回调方法，回调调用结果
     **/
    env.launchApp = function (pkgName, clsName, callback) {
        var ret;
        if (ua.android && jsHandler) {
            //magic number of android FLAG_NEW_TASK
            var FLAG_NEW_TASK = 268435456;
            (jsHandler.startActivity)
            && (jsHandler.startActivity(pkgName, clsName,
                null, null, FLAG_NEW_TASK, null,
                null));
            (callback) && (callback.call(null, ret, "launchApp"));
        } else if (ua.ios && iosBridge) {
            var app = {};
            app[pkgName] = clsName;
            iosBridge.callHandler("canOpenUrl", app, function(can) {
                if (can) {
                    iosBridge.callHandler("openUrl", app, function() {
                        var args = Array.prototype.slice.call(arguments);
                        args.push("launchApp");
                        (callback) && (callback.apply(null, args));
                    });
                }
            });
        }
    };

    env.downloadApk = function(pkgName, url, autoInstall, callback){
        var ret = false;
        var jsonParams = {
            "packageName": pkgName,
            "url": url,
            "autoInstall": autoInstall
        };
        if (ua.android && jsHandler) {
            (jsHandler.downloadApk)
            && (jsHandler.downloadApk(JSON.stringify(jsonParams)));
            ret = true;
        } else if (ua.ios && iosBridge) {
            //Do nothing
        }
        (callback) && (callback.call(null, ret));
    };

    /** @description 下载应用<br/>
     *  调用示例(1) [Android]：
     <pre>
     var download_info = {
        app_id: "baidu_picture",
        url: "http://downpack.baidu.com/baiduimage_AndroidPhone_1014505h.apk",
        packageName: "com.baidu.image",
        bonus_type: 0,//奖励类型，默认请填0
        appName:   "百度图片",
        auto_open:  true
    }
     _dialerEnv.downloadApp(download_info, function(){
        var ret = JSON.stringify(arguments);
        console.log(ret);
    });
     </pre>
     调用示例(2) [iOS]：
     <pre>
     var download_info = {
        app_id : "smartinput",
        appstoreid: 909654683,
        title: "下载触宝输入法",
        appscheme:"touchpalkeyboard://",
        type:0
    }
     _dialerEnv.downloadApp(download_info, function(){
        var ret = JSON.stringify(arguments);
        console.log(ret);
    });
     </pre>
     [源码]
     * @param {Json}   download_info  应用下载信息，详见调用示例
     * @param {Function} callback  回调方法，回调调用结果
     **/
    env.downloadApp = function(download_info, callback) {
        (callback) &&
        (registerAsWindowFunction.call(CallbackFunction, "downloadResult", callback));
        download_info.callback = "downloadResult";
        var params = JSON.stringify(download_info);
        var app_id = download_info.app_id || "default";
        var json = {
            "appid":download_info.app_id,
            "param":params
        };
        if (ua.android && jsHandler) {
            (jsHandler.downloadApp) && (jsHandler.downloadApp(app_id, params));
        } else if (ua.ios && iosBridge) {
            iosBridge.callHandler("downloadOtherApp", json, function() {
                var args = Array.prototype.slice.call(arguments);
                args.push("downloadApp");
                (callback) && (callback.apply(null, args));
            });
        }
    };

    /**
     * @description 展示native的Toast<br/>
     * [调用示例]
     <pre>
     _dialerEnv.showToast("yeah", function(){
            var arg = JSON.stringify(arguments);
            console.log(arg);
        });
     </pre>
     [源码]
     * @param {String} msg 要展示的内容
     * @param {Function} callback  回调方法，回调调用结果
     **/
    env.showToast = function(msg, callback) {
        var ret;
        if (ua.android && jsHandler) {
            (jsHandler.showToast) && (ret = (jsHandler.showToast(msg)));
            (callback) && (callback.call(null, ret, "showToast"));
        } else if (ua.ios && iosBridge) {
            var featureInfo = {
                "featureName": "toast",
                "msg": msg
            };
            iosBridge.callHandler("showGuide", featureInfo, function() {
                var args = Array.prototype.slice.call(arguments);
                args.push("showToast");
                (callback) && (callback.apply(null, args));
            });
        }
    };

    /**
     * @description 复制到剪贴板<br/>
     * [调用示例]
     <pre>
     _dialerEnv.pasteBoard("yeah", function(){
            var arg = JSON.stringify(arguments);
            console.log(arg);
        });
     </pre>
     [源码]
     * @param {String} msg 要复制的内容
     * @param {Function} callback  回调方法，回调调用结果
     **/
    env.pasteBoard = function(msg, callback) {
        var ret;
        if (ua.android && jsHandler) {
            (jsHandler.copyToClipboard) && (ret = (jsHandler.copyToClipboard(msg)));
            (callback) && (callback.call(null, ret, "pasteBoard"));
        } else if (ua.ios && iosBridge) {
            iosBridge.callHandler("pasteboard", {"msg": msg,"copyToPaste": msg}, function() {
                //No Callback from native
            });
            (callback) && (callback.call(null, ret, "pasteBoard"));
        }
    };

    /**
     * @description 展示注册页面<br/>
     * [调用示例]
     <pre>
     _dialerEnv.showRegisterPage("Need Register!!", function(){
            var arg = JSON.stringify(arguments);
            console.log(arg);
        });
     </pre>
     [源码]
     * @param {String} tips 要提示的内容
     * @param {Function} callback  回调方法，回调调用结果
     **/
    env.showRegisterPage = function(tips, callback) {
        var delay = 1000;
        if (tips) {
            if (window && window.alert) {
                window.alert(tips);
            }
        }
        setTimeout(function () {
            if (ua.android && jsHandler && jsHandler.startActivity) {
                var paramArray = [
                    {
                        "extraName": "login_from",
                        "extraValue" : "web_task",
                        "extraType": "String"
                    },
                    {
                        "extraName": "should_open_voip_str",
                        "extraValue" : "true",
                        "extraType": "String"
                    }
                ];
                paramArray = paramArray.map(function(info) {
                    return JSON.stringify(info);
                });
                jsHandler.startActivity("com.cootek.smartdialer",
                    "com.cootek.smartdialer.assist.LoginDialogActivity",
                    null, null, -1, null,
                    paramArray);
                (callback) && (callback.call(null, "showRegisterPage"));
            } else if (ua.ios && iosBridge) {
                var data = {
                    title: "",
                    phone: "",
                    callback: callback // 登录的回调
                    //{"isLogged":"true","token":"","secret":"","loginnumber":"","accesstoken":""}
                };
                iosBridge.callHandler("login", JSON.stringify(data), function() {
                    var args = Array.prototype.slice.call(arguments);
                    args.push("showRegisterPage");
                    (callback) && (callback.call(null, args));
                });
            }
        }, delay);
    };

    /**
     * @description 模拟点击home按键
     * [Android] <strong>仅对Android有效</strong><br/>
     * [调用示例]
     <pre>
     _dialerEnv.performHomeClick(function(){
             var arg = JSON.stringify(arguments);
             console.log(arg);
         });
     </pre>
     [源码]
     * @param {Function}  callback  回调方法，回调调用结果
     */
    env.performHomeClick = function (callback) {
        var ret;
        if (ua.android && jsHandler) {
            (jsHandler.performHomeClick)
            && (ret = (jsHandler.performHomeClick()));
            (callback) && (callback.call(null, ret, "performHomeClick"));
        } else if (ua.ios && iosBridge) {
            //Do nothing
        }
    };

    /**
     * @description 设置本地一个key<br/>
     * [调用示例]
     <pre>
     _dialerEnv.setKey("key", "value", "string", function(){
             var arg = JSON.stringify(arguments);
             console.log(arg);
         });
     </pre>
     [源码]
     * @param      {String}   key key的名称
     * @param      {String}   value 设置的值
     * @param      {String}   type 值的类型["integer" "boolean" "string"]
     * @param {Function}  callback  回调方法，回调调用结果
     */
    env.setKey = function(key, value, type, callback) {
        var ret;
        if (ua.android && jsHandler) {
            if (window.CTKJavaScriptHandler && BaseParams.apiLevel < 13) {
                (jsHandler.setPrefKey) && (ret = (jsHandler.setPrefKey("" + key, "" + value, "" + type)));
            } else {
                (jsHandler.setKey) && (ret = (jsHandler.setKey("" + key, "" + value, "" + type)));
            }
            (callback) && (callback.call(null, ret, "setKey"));
        } else if (ua.ios && iosBridge) {
            var json = {
                "key":key,
                "value":value,
                "type":type
            };
            iosBridge.callHandler("setKey", json, function() {
                var args = Array.prototype.slice.call(arguments);
                args.push("setKey");
                (callback) && (callback.apply(null, args));
            });
        }
    };

    /**
     * @description  getKey 从本地储存中获取数据<br/>
     * 调用示例(1)[All]：
     <pre>
     _dialerEnv.getKey("key", "defaultValue", "string", function(ret){
            var get_value = ret;
            console.log(get_value);
         });
     </pre>
     调用示例(2)[Android]：
     <pre>
     var get_value = _dialerEnv.getKey("key", "defaultValue", "string", null);
     </pre>
     [源码]
     * @param   {String}   key           key名称
     * @param   {String}   defaultValue  默认值
     * @param   {String}   type          类型["integer" "long" "boolean" "string"]
     * @param   {Function} callback      回调方法，回调调用结果
     * @return  {String}   value or null
     */
    env.getKey = function(key, defaultValue, type, callback) {
        var ret;
        if (ua.android && jsHandler) {
            if ( window.CTKJavaScriptHandler && BaseParams.apiLevel < 13 ) {
                // pls fxxk the guy who defined function getPrefKey!
                (jsHandler.getPrefKey) && (ret = jsHandler.getPrefKey("" + key, "" + type, "" + defaultValue));
            } else {
                (jsHandler.getKey) && (ret = jsHandler.getKey("" + key, "" + defaultValue, "" + type));
            }
            (callback) && (callback.call(null, ret, "getKey"));
        } else if (ua.ios && iosBridge) {
            var json = {
                "key":key,
                "defaultValue":defaultValue,
                "type":type
            };
            iosBridge.callHandler("getKey", json, function() {
                var args = Array.prototype.slice.call(arguments);
                args.push("getKey");
                (callback) && (callback.apply(null, args));
            });
        }
        return ret;
    };

    /**
     * @description 获取natvie的邀请码<br/>
     * [调用示例]
     <pre>
     _dialerEnv.getInviteCode(function(code){
            console.log(code);
        });
     </pre>
     [源码]
     * @param {Function} callback  回调方法，回调调用结果
     * @return {String} inviteCode
     **/
    env.getInviteCode = function(callback) {
        var inviteCodeKeyName = ua.android ? "voip_invite_code" :
            ua.ios ? "VOIP_INVITATION_CODE" : "";
        env.getKey(inviteCodeKeyName, "", "string", function(ret) {
            (callback) && (callback.call(null, ret, "getInviteCode"));
            return ret;
        });
    };

    /**
     * @description 获取最后一通voip通话的信息<br/>
     * [调用示例]
     <pre>
     _dialerEnv.getLastVoipCallAndTime(function(info){
            var info_param = JSON.stringify(info);
            console.log(info_param);
        });
     </pre>
     [源码]
     * @param {Function} callback  回调方法，回调调用结果
     * @return {Json}
     {
         time: {long}, //最后一通voip通话的时间戳
         number: {String},//最后一通voip通话的号码
     }
     **/
    env.getLastVoipCallAndTime = function(callback) {
        var info;
        if (ua.android && jsHandler) {
            (jsHandler.getLastCallAndNumber) && (info = (jsHandler.getLastCallAndNumber()));
            if (!info) {
                info = (JSON.parse(info));
            }
            (callback) && (callback.call(null, info));
        } else if (ua.ios && iosBridge) {
            iosBridge.callHandler("getLastCallAndNumber", null, function() {
                var args = Array.prototype.slice.call(arguments);
                args.push("getLastVoipCallAndTime");
                (callback) && (callback.apply(null, args));
            });
        }
        return info;
    };

    /**
     * @description 获取通话记录<br/>
     * [调用示例]
     <pre>
     _dialerEnv.getCallLogByNumber("13000000000",0,20, function(){
        var arg = JSON.stringify(arguments);
        alert(arg);
    });
     </pre>
     [源码]
     * @param {String} number      要查询calllog的电话号码
     * @param {long} ts_start      要查询calllog的起始时间戳
     * @param {int}  max_count     返回的calllog记录最大数量
     * @param {Function} callback  回调方法，回调调用结果
     * @return {Json}
     {
         count: {int}, //该号码的calllog数量
         calllog_ts: {array}, //该号码的calllog时间戳数组
     }
     **/
    env.getCallLogByNumber = function (number, ts_start, max_count, callback) {
        if (!callback || !number) {
            return "";
        }
        var ret       = "",
            ts        = ts_start || new Date().getTime() - 7 * 864000000,
            max_count = max_count || "0";
        var params = {
            "number":    number,
            "ts_start":  ts_start,
            "max_count": max_count
        };

        if (ua.android && jsHandler) {
            registerAsWindowFunction.call(CallbackFunction, "getCalllogCount", callback);
            (jsHandler.getCallLogByNumber) &&
            (ret = (jsHandler.getCallLogByNumber(JSON.stringify(params), "getCalllogCount")));
        }  else if (ua.ios && iosBridge) {
            iosBridge.callHandler("getCallLogByNumber", params, callback);
        }
        return ret;
    };

    /**
     * @description 是否为全新安装<br/>
     * [调用示例]
     <pre>
     _dialerEnv.isNewInstall(function(){
        var arg = JSON.stringify(arguments);
        alert(arg);
    });
     </pre>
     [源码]
     * @param {Function} callback  回调方法，回调调用结果
     * @return {Boolean} true/false
     **/
    env.isNewInstall = function(callback) {
        var ret;
        if (ua.android && jsHandler) {
            (jsHandler.isNewInstall) && (ret = jsHandler.isNewInstall());
            (callback) && (callback.call(null, ret, "isNewInstall"));
        } else if (ua.ios && iosBridge) {
            (callback) && (callback.call(null, ret, "isNewInstall"));
        }
        return ret;
    };

    /**
     * @description 是否已安装某应用<br/>
     * [Android] <strong>仅对Android有效，iOS永远返回false</strong><br/>
     * [调用示例]
     <pre>
     _dialerEnv.isPackageInstalled("com.cootek.smartinput",function(){
        var arg = JSON.stringify(arguments);
        alert(arg);
    });
     </pre>
     [源码]
     * @param {String}   packageName  应用的包名
     * @param {Function} callback  回调方法，回调调用结果
     * @return {Boolean} true/false
     **/
    env.isPackageInstalled = function(packageName, callback) {
        var ret;
        if (ua.android && jsHandler) {
            if (BaseParams.apiLevel < 35) {
                ret = false;
                (callback) && (callback.call(null, ret, "isPackageInstalled"));
            } else {
                (jsHandler.isPackageInstalled) && (ret = jsHandler.isPackageInstalled(packageName));
                (callback) && (callback.call(null, ret, "isPackageInstalled"));
            }
        } else if (ua.ios && iosBridge) {
            ret = false;
            (callback) && (callback.call(null, ret, "isPackageInstalled"));
        }
        return ret;
    };

    /**
     * @description 显示选择号码界面<br/>
     [调用示例]
     <pre>
     var params = {
        type: 0,
        isSingle: true,
        slides_array: ["sms","contact","calllog","voip"]
    }
     _dialerEnv.selectNumber(params, function(ret) {
        ret = JSON.stringify(ret);
        alert(ret);
    });
     </pre>
     [源码]
     * @param {Json} params
        {
            type: {int}, //iOS必填参数，表示显示的号码选择列表类型
                         //SelectTypeALL         = 0,
                         //SelectTypeMOBILE      = 1,
                         //SelectTypeCOOTEKER    = 2
            isSingle: {Boolean},   //iOS必填参数，表示是否单选
            slides_array: {Array}, //Android必填参数，表示需要显示的页面
                                   //["sms","contact","calllog","voip"]
        }
     * @param {Function} callback 回调方法，回调调用结果
     *
     **/
    env.selectNumber = function(params,callback) {
        var jsonParams = {};
        if (ua.android && jsHandler) {
            var ret = {};
            (callback) &&
            (registerAsWindowFunction.call(CallbackFunction, "selectNumberCallback", callback));
            jsonParams.slides_array = params.slides_array
                || ["contact","calllog","voip"];
            (jsHandler.goContact)
            && (ret = (jsHandler.goContact(JSON.stringify(jsonParams), "selectNumberCallback")));
        } else if (ua.ios && iosBridge) {
            jsonParams.type = params.type || "";
            jsonParams.isSingle = params.isSingle || true;
            iosBridge.callHandler("selectUserList", jsonParams, function(ret) {
                (callback) && (callback.call(null, ret, "selectNumber"));
            });

        }
    };

    /**
     * @description 获取城市<br/>
     [调用是咧]：
     <pre>
     _dialerEnv.getCity(function(ret) {
         ret = JSON.stringify(ret);
         alert(ret);
     });
     </pre>
     [源码]
     * @param {Function} callback 回调方法，回调调用结果
     */
    env.getCity = function(callback) {
        var ret = {};
        if (ua.android && jsHandler) {
            (jsHandler.getCityGroupInfo)
            && (ret = (jsHandler.getCityGroupInfo()));
            (callback) && (callback.call(null, ret, "getCity"));
        } else if (ua.ios && iosBridge) {
            iosBridge.callHandler("getCity", null, function(city_info) {
                (callback) && (callback.call(null, city_info, "getCity"));
            });
        }
    };

    /**
     * @description 关闭当前窗口<br/>
     [调用示例]:
     <pre>
     _dialerEnv.closeWindow(function(ret){
         console.log(ret);
     });
     </pre>
     [源码]
     * @param {Function} callback 回调方法，回调调用结果
     */
    env.closeWindow = function (callback) {
        if (ua.android && jsHandler) {
            var ret;
            (jsHandler.closeWebView)
            && (ret = (jsHandler.closeWebView()));
            (callback) && (callback.call(null, ret, "closeWindow"));
        } else if (ua.ios && iosBridge) {
            iosBridge.callHandler("closeWindow", null, function(){
                var ret = Array.prototype.slice.call(arguments);
                ret.push("closeWindow");
                (callback) && (callback.apply(null, ret));
            });
        }
    };


    /**
     * @description 通过微信分享图片<br/>
     * [调用示例]
     <pre>
     _dialerEnv.shareWechatByImageUrl(image_url, if_timeline, from, function(){
        var arg = JSON.stringify(arguments);
        alert(arg);
    });
     </pre>
     [源码]
     * @param {Function} callback  回调方法，回调调用结果
     * @return {Boolean} true/false
     **/
    env.shareWechatByImageUrl = function(image_url, if_timeline, from, callback) {
        var json = {
            "image_url"      : image_url,
            "if_timeline"    : if_timeline,
            "from"           : from
        };
        if (ua.android && jsHandler) {
            var ret = (jsHandler.shareWechatByImageUrl)
                && (jsHandler.shareWechatByImageUrl(JSON.stringify(json)));
            (callback) && (callback.call(null, ret, "shareWechatByImageUrl"));
        } else if (ua.ios && iosBridge) {
            iosBridge.callHandler("shareWechatByImageUrl", json, function(){
                var ret = Array.prototype.slice.call(arguments);
                ret.push("shareWechatByImageUrl");
                (callback) && (callback.apply(null, ret));
            });
        }
    };

    /**
     *@description execute a seattle feature. feature name is needed as the arguments.
     * and a key named `featureName` is a must.
     * e.g. `{'featureName': 'myFeature', 'msg': 'msg'}` <br/>
     * Only Support iOS!!
     * @param featureInfo {Object} the name and data about this feature
     * @param callback {Function} a callback function
     * @return {Void}
     */
    env.useSeattle = function(featureInfo, callback) {
        if (ua.android && jsHandler) {
            //Do nothing
        } else if (ua.ios && iosBridge) {
            iosBridge.callHandler("useSeattle", featureInfo, callback);
        }
    };

    /**
     *@param featureInfo{json}
     * * and a key named `featureName` is a must
     * e.g. `{'featureName': 'callAndHangupWebCommercialAd', 'ads': json}`
     * the name and data about this feature
     * Only Support iOS!!
     * @param callback
     */
    env.commercial = function(featureInfo, callback) {
        if (ua.android && jsHandler) {
            //Do nothing
        } else if (ua.ios && iosBridge) {
            iosBridge.callHandler("commercial", featureInfo, callback);
        }
    };

    /**
     * @description unknow function fullScreen
     * maybe open a url with fullScreen
     * @param {String} url
     * Only Support iOS!!
     */
    env.fullScreen = function(url) {
        if (ua.ios && iosBridge && BaseParams.apiLevel >= 17) {
            var ios = {
                controller: "YellowPageWebViewController",
                fullScreen: false,
                landscape: false,
                showFloatingPoint: false,
                backConfirm: false,
                url_string: url
            };
            var data = {
                ios: ios
            };
            iosBridge.callHandler("startController", JSON.stringify(data), function(response) {
            });
        } else {
            window.location.href = url;
        }
    };

    /**
     * @description 统计方法的对象实例
     * @ignore
     **/
    env.recorder = {};
    /**
     * @description 使用本地usage统计数据<br/>
     * [调用示例1]:
     <pre>
     _dialerEnv.recorder.dialerRecord(null, "voip", {callinfo:10});
     </pre>
     [调用示例2]:
     <pre>
     var map = {
        path: "path_web_page",
        data: {},
        value:{}
    };
     map.data[key] = "record_key";
     map.value[key] = "record_value";
     _dialerEnv.recorder.dialerRecord(map);
     </pre>
     <br/>
     [源码]
     * @param {Json}   map     统计的总键值对(详见示例2，当该值存在时会忽略其他参数)
     * @param {String} path    统计路径
     * @param {Json}   values  统计的键值对
     *
     **/
    env.recorder.dialerRecord = function(map, path, values) {
        var record_path   = path || "";
        var record_values = values || {};
        var record_data = map || {
                "path"  :   record_path,
                "values":   record_values,
                "data"  :   record_values
            };
        if (ua.android && jsHandler) {
            (jsHandler.dialerRecord) && (jsHandler.dialerRecord(record_data.path, JSON.stringify(record_data.data)));
        } else if (ua.ios && iosBridge) {
            iosBridge.callHandler("dialerRecord", record_data, null);
        }
    };
    /**
     * @description 使用百度统计工具统计数据<br/>
     * [调用示例]
     <pre>
     _dialerEnv.recorder.push("voip", "callinfo");
     </pre>
     [源码]
     * @param {String} path  统计路径
     * @param {Json} values  统计的值
     **/
    env.recorder.push = function (path, value) {
        (_hmt) && (_hmt.push(["_trackEvent", path, path + "_" + value]));
    };

    /**
     * @description cookies的操作实例
     * @ignore
     **/
    env.cookies = {};
    /**
     * @description 设置cookie
     * @param      {String}   NameOfCookie cookie名
     * @param      {String}   value cookie值
     * @param      {String}   expiredays cookie有效时长
     */
    env.cookies.setCookie = function (NameOfCookie, value, expiredays) {
        var ExpireDate = new Date();
        ExpireDate.setTime(ExpireDate.getTime() +
            ((expiredays || 30) * 24 * 3600 * 1000));
        document.cookie = NameOfCookie + "=" + decodeURIComponent(value) +
            "; expires=" + ExpireDate.toGMTString();
    };
    /**
     * @description 获取cookie
     * @param      {String}   NameOfCookie cookie名
     * @return     {String}   cookie值
     */
    env.cookies.getCookie = function (NameOfCookie) {
        if (document.cookie.length > 0) {
            begin = document.cookie.indexOf(NameOfCookie + "=");
            if (begin != -1) {
                begin += NameOfCookie.length + 1;
                end = document.cookie.indexOf(";", begin);
                if (end == -1) end = document.cookie.length;
                return encodeURIComponent(document.cookie.substring(begin, end));
            }
        }
        return null;
    };
    /**
     * @description 删除cookie
     * @param      {String}   NameOfCookie cookie名
     */
    env.cookies.delCookie = function (NameOfCookie) {
        if (getCookie(NameOfCookie)) {
            document.cookie = NameOfCookie + "=" +
                "; expires=Thu, 01-Jan-70 00:00:01 GMT";
        }
    };

    /**
     * @ignore
     */
    var mURLParams = [];
    /**
     * @description 获取URL中的参数的值
     * @param      {String}   paramKey 参数名称
     * @param      {String}   defaultValue 默认值
     */
    env.getUrlParam = function(paramKey, defaultValue) {
        if (mURLParams.length < 1) {
            var url= window.location.search;
            if (url.indexOf("?")!=-1) {
                var str = url.substr(1),
                    strs = str.split("&");
                var key=new Array(strs.length);
                var value=new Array(strs.length);
                for(i=0;i<strs.length;i++) {
                    key[i]=strs[i].split("=")[0];
                    value[i]=decodeURI(strs[i].split("=")[1]);
                    mURLParams[key[i]] = value[i];
                }
            }
        }
        if (mURLParams[paramKey]) {
            return mURLParams[paramKey];
        } else {
            return defaultValue;
        }
    };


    /**
     * @description 实时上传数据接口
     * [调用示例]
     <pre>
     //仅记录event_name为test1
     _dialerEnv.recorder.recordCustomEvent("test1");
     //记录event_name为test2，值为123
     _dialerEnv.recorder.recordCustomEvent("test2", 123);
     //记录event_name为test3， 值为333，附加值为{aaa: "aaa", bbb:"bbb"}
     _dialerEnv.recorder.recordCustomEvent("test3", "333", {aaa: "aaa", bbb:"bbb"});
     </pre>
     [源码]
     * @param      {String}   event_name 参数名称
     * @param      {String}   event_value 默认值
     * @param      {Object}   extra 附加值
     */
    env.recorder.recordCustomEvent = function(event_name, event_value, extra) {
        var event_name  = event_name;
        var record_data = {
            event_name:event_name
        };

        if (event_value) {
            record_data["event_value"] = event_value;
        }

        if (extra && extra instanceof Object) {
            for (var key in extra) {
                record_data[key] = extra[key];
            }
        }

        if (ua.android && jsHandler) {
            (jsHandler.recordCustomEvent) && (jsHandler.recordCustomEvent(record_data));
        } else if (ua.ios && iosBridge) {
            iosBridge.callHandler("recordCustomEvent", record_data, null);
        }
    };


    /**
     * @description 日期相关的操作实例
     * @ignore
     **/
    env.dateOps = {};
    /**
     * @description 判断当前日前是否晚于设定值<br/>
     * [调用示例]
     <pre>
     var after = _dialerEnv.dateOps.isAfter("2016/06/12");
     </pre>
     [源码]
     * @param {String} startTime  要判断的时间
     * @return {Boolean} true/false
     **/
    env.dateOps.isAfter = function(startTime) {
        var curDate = new Date();
        var start = new Date(Date.parse(startTime));
        if (curDate >= start) {
            return true;
        } else {
            return false;
        }
    };
    /**
     * @description 判断当前日前是否早于设定值<br/>
     * [调用示例]
     <pre>
     var after = _dialerEnv.dateOps.isBefore("2016/06/12");
     </pre>
     [源码]
     * @param {String} startTime  要判断的时间
     * @return {Boolean} true/false
     **/
    env.dateOps.isBefore = function(endTime) {
        var curDate = new Date();
        var start = new Date(Date.parse(endTime));
        if (curDate < start) {
            return true;
        } else {
            return false;
        }
    };

    /**
     * @description   匹配通讯录名字 matchContactName
     * 通过该方法，根据传入的手机号匹配通讯录名字<br/>
     * [调用示例]
     <pre>
     _dialerEnv.matchContactName("18818208803");
     </pre>
     [源码]
     * @param {String}   phone  目标手机号
     **/
    env.matchContactName = function(phone, callback) {
        var ret;
        if (ua.android && jsHandler) {
            if (jsHandler.getContactNameByNumber) {
                ret = jsHandler.getContactNameByNumber(phone);
                if (callback && callback instanceof Function) {
                    callback.call(window, true, ret);
                }
            } else {
                callback.call(window, false);
            }
            return ret;
        } else if (ua.ios && iosBridge) {
            var json = {
                phone: phone
            };
            iosBridge.callHandler('getContackPersonName', json, function(name) {
                ret = name;
                if (callback && callback instanceof Function) {
                    callback.call(window, true, ret);
                }
            });
            return ret;
        }
    };

    /**
     * @description   打开联系人详情页 openContactDetail
     * 通过该方法，根据传入的手机号打开联系人详情页<br/>
     * [调用示例]
     <pre>
     _dialerEnv.openContactDetail("18818208803");
     </pre>
     [源码]
     * @param {String}   phone  目标手机号
     **/
    env.openContactDetail = function(phone) {
        if (ua.android && jsHandler) {
            (jsHandler.goContactDetailView) && (jsHandler.goContactDetailView(phone));
        } else if (ua.ios && iosBridge) {
            var json = {
                phone_controller: "ContactInfoViewController",
                phone: phone
            };
            iosBridge.callHandler('pushViewController', json);
        }
    };

    /**
     * @description   获取用户头像和用户姓名
     * 通过该方法，根据传入的手机号获取该手机号的头像以及该手机号的保存名字<br/>
     * [调用示例]
     <pre>
     _dialerEnv.getuserPhoneAndImg("18818208803");
     </pre>
     [源码]
     * @param {String}   phone  目标手机号
     **/
    env.getUserPhoneAndImg = function(phone, callback) {
        var res;
        if (ua.android && jsHandler) {
            console.log('android is not has this function');
            return res;
        } else if (ua.ios && iosBridge) {
            var json = {
                phone: phone
            };
            iosBridge.callHandler('getPersonInfoByNumber', json, function(name_img) {
                res = name_img;
                if (callback && callback instanceof Function) {
                    callback.call(window, true, res);
                }
            });
            return res;
        }
    };

    /**
     * @description   获取登录用户选取的头像
     * 通过该方法，根据用户手机号获取用户所选择登录的头像<br/>
     * [调用示例]
     <pre>
     _dialerEnv.getuserImg("18818208803");
     </pre>
     [源码]
     **/
    env.getUserImg = function(callback) {
        //alert('enter to getUserImg');
        var res;
        if (ua.android && jsHandler) {
            console.log('android is not has this function');
            (callback) && (callback instanceof Function) && (callback(res));
        } else if (ua.ios && iosBridge) {
            //alert("enter getUserImg ios")
            iosBridge.callHandler('getSelfRegisterPhoto', null, function(name_img) {
                res = name_img;
                if (callback && callback instanceof Function) {
                    callback.call(window, true, res);
                }
            });
        }
    };

    /**
     * @description   实时自定义事件数据
     * 通过该方法，在APP内h5页面打点记录用户usage数据<br/>
     * [调用示例]
     <pre>
     _dialerEnv.getuserImg("18818208803");
     </pre>
     [源码]
     **/
    env.recordCustomEvent = function(customerEvent) {
        console.log('enter to recordCustomEvent');
        if (ua.android && jsHandler) {
            if(BaseParams.apiLevel >= 42) {
                console.log(customerEvent + "enter recordCustomEvent android");
                (jsHandler.recordCustomEvent) && (jsHandler.recordCustomEvent(customerEvent));
            }
        } else if (ua.ios && iosBridge) {
            console.log('ios is not has this function');
        }
    };

    env.jsHandler = jsHandler;
    env.iosBridge = iosBridge;

    return env;
})();


function processRecordName(org_approach) {
    var approach = "";
    var record_name = "";
    var app_name = "";
    if (org_approach.indexOf("wechat") > -1) {
        approach = "wechat";
        record_name = "WechatShare_Click";
        app_name = "微信";
    } else if (org_approach.indexOf("timeline") > -1) {
        approach = "timeline";
        record_name = "TimelineShare_Click";
        app_name = "微信";
    } else if (org_approach.indexOf("qrcode") > -1) {
        approach = "QRcode";
        record_name = "QRcode_Click";
        app_name = "二维码";
    } else if (org_approach.indexOf("qq") > -1) {
        approach = "qq";
        record_name = "QQShare_Click";
        app_name = "腾讯QQ";
    } else if (org_approach.indexOf("qzone") > -1) {
        approach = "qzone";
        record_name = "QzoneShare_Click";
        app_name = "腾讯QQ";
    } else if (org_approach.indexOf("sms") > -1) {
        approach = "sms";
        record_name = "MessageShare_Click";
        app_name = "短信";
    } else {
        console.log("missing approach");
    }
    return {
        approach:    approach,
        record_name: record_name,
        app_name:    app_name
    };
}


var _dialerEnv = _dialerEnv || (window._dialerEnv = DialerEnv);
