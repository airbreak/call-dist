/* jshint esversion: 6 */
/**
 * Created by 耸善 on 2016-X-X.
 * Last Modify by 耸善 on 2017-7-10.
 * version 0.1
<strong>
    util 
    工具方法,包含计时器小控件等
 </strong>
 **/


/**
<strong>
    encodeIt
    加／解密字符串，算法及其简单，爱用用
    [调用示例]
    <pre>
        var mUtil = require("dialer_module/util");
        var dec = mUtil.encode.e("some string");
        var org = mUtil.encode.d(dec);
    </pre>
 </strong>
 * @ignore
 **/
var encodeIt = {};
/**
 * @description 加密
 * @param {String} str 欲加密的字符串
 * @return {String} 加密后的字符串
 * @ignore
 */
encodeIt.e = encodeStr;
/**
 * @description 解密
 * @param {String} str 欲解密的字符串
 * @return {String} 解密后的字符串
 * @ignore
 */
encodeIt.d = decodeStr;

/**
 * @ignore
 */
module.exports = {
    debug_flag: false,
    /**
     * @description 环境变量，用于dialer
     * @param {Boolean} inDialer 用于记录当前是否位于触宝电话内
     * @param {Boolean} isRotating 用于记录转盘当前是否正在转动(仅用于转盘类活动页面)
     * @param {Int} retCode 用于记录服务器返回值
     * @ignore
     */
    envInfo: {
        inDialer: false,
        isRotating: false,
        retCode: -1,
    },
    /**
     * @description 设置debug属性
     * @param {Boolean} flag 是否为debug模式
     */
    setDebug: setDebug,
    /**
     * @description 隐藏html元素
     * @param {Element} el html element
     */
    hideSelf: hideSelf,
    /**
     * @description 展示html元素
     * @param {Element} el html element
     */
    showSelf: showSelf,
    /**
     * @description 检测手机号码是否有效
     * @param {String} phone_input 手机号码
     */
    checkPhone: verifyPhone,
    /**
     * @description 显示alert信息
     * @param {String} info 信息
     * @deprecated
     */
    alert: alert,
    /**
     * @description 显示warn信息
     * @param {String} info 信息
     * @deprecated
     */
    warn: warn,
    /**
     * @description 显示debug信息
     * @param {String} info 信息
     * @deprecated
     */
    debug: debug,
    /**
     * @description 显示info信息
     * @param {String} info_str 信息
     * @deprecated
     */
    info: info,
    /**
     * @description 
     * <strong>
        timer 
        计时器小控件
        </strong>
    * [调用示例]
    <pre>
    var mUtil = require("dialer_module/util");
    var timer = new mUtil.Timer();
    timer.calculator(function() {
        timer.start();
    });
    </pre>
    [源码]
    *
    **/
    Timer: Timer,
    /**
    <strong>
        encodeIt
        加／解密字符串，算法及其简单，爱用用
        [调用示例]
    </strong>
    <pre>
    var mUtil = require("dialer_module/util");
    var dec = mUtil.encode.e("some string");
    var org = mUtil.encode.d(dec);
    </pre>
    **/
    encode: encodeIt,
    /**
     * @description 获取URL中的参数的值
     * @param      {String}   paramKey 参数名称
     * @param      {String}   defaultValue 默认值
     */
    getUrlParam: getUrlParam

    /*
     * @ignore
     */
};

/**
 * @description 设置debug属性
 * @param {Boolean} flag 是否为debug模式
 * @ignore
 */
function setDebug(flag) {
    this.debug_flag = flag;
}


/**
 * @description 加密
 * @param {String} str 欲加密的字符串
 * @return {String} 加密后的字符串
 * @ignore
 */
function encodeStr(str) {
    if (str && typeof(str) == "string") {
        return window.btoa(str).replace("=", "+").split("").reverse().join("");
    }
    return "error";
}

/**
 * @description 解密
 * @param {String} str 欲解密的字符串
 * @return {String} 解密后的字符串
 * @ignore
 */
function decodeStr(str) {
    if (str && typeof(str) == "string") {
        return window.atob(str.replace("+", "=").split("").reverse().join(""));
    }
    return "error";
}



/**
 * @ignore
 */
var mURLParams = [];
/**
 * @description 获取URL中的参数的值
 * @param      {String}   paramKey 参数名称
 * @param      {String}   defaultValue 默认值
 * @ignore
 */
function getUrlParam(paramKey, defaultValue) {
    if (mURLParams.length < 1) {
        var url = window.location.search;
        if (url.indexOf("?") != -1) {
            var str = url.substr(1),
                strs = str.split("&");
            var key = new Array(strs.length);
            var value = new Array(strs.length);
            for (i = 0; i < strs.length; i++) {
                key[i] = strs[i].split("=")[0];
                value[i] = decodeURI(strs[i].split("=")[1]);
                mURLParams[key[i]] = value[i];
            }
        }
    }
    if (mURLParams[paramKey]) {
        return mURLParams[paramKey];
    } else {
        return defaultValue;
    }
}

/**
 * @description 
 * <strong>
    timer 
    计时器小控件
    </strong>
    原型方法<br/>
 [源码]
 * @ignore
 **/
function Timer() {
    var component = document.getElementsByClassName("timer")[0];
    var timer = {
        status: "stop",
        component: component,
        anim_id: "timer",
        second: 0,
        sec_per_frame: 60,
        callbacks: {}
    };
    var frame = 0,
        sec_frame = 0,
        calculator_main;
    /**
     * @description  更新计时器的UI
     * @final
     * @ignore
     */
    timer.show = function() {
        timer.component.style.display = "block";
        timer.component.innerHTML = formatSecond(timer.second);
    };
    /**
     * @description  初始计算，计算fps
     * @final
     * @ignore
     */
    timer.calculator = function(finishCallback) {
        function real_loop_frame() {
            ++sec_frame;
            calculator_main = requestAnimationFrame(real_loop_frame);
        }

        (function init() {
            real_loop_frame();
            setTimeout(function() {
                timer.sec_per_frame = (sec_frame);
                sec_frame = 0;
                cancelAnimationFrame(calculator_main);
                (finishCallback) && (finishCallback());
            }, 1000);
        })();
    };
    /**
     * @description  开始计时
     * @final
     * @ignore
     */
    timer.start = function() {
        if (frame % timer.sec_per_frame === 0) {
            timer.status = "counting";
            timer.second++;
            if (timer.countdown && timer.countdown instanceof Function) {
                timer.countdown(timer.second);
            }
            if (timer.component) {
                timer.component.innerHTML = formatSecond(timer.second);
            }
            for (var item_id in timer.callbacks) {
                var item = timer.callbacks[item_id];
                if (timer.second == item.second && !item.executed) {
                    item.executed = true;
                    (item.callback) && (item.callback.call(window));
                }
            }
        }
        frame++;
        if (timer.status == "counting") {
            timer.anim_id = requestAnimationFrame(timer.start);
        }
    };
    /**
     * @description  设定计时回调，可设置多个
     * @param {Function} callback 回调方法，设定后每秒都会调用已设定的回调方法，并传入秒数作为参数
     * @ignore
     */
    timer.setCountdown = function(callback) {
        timer.countdown = callback;
    };
    /**
     * @description  格式化时间
     * @param {Int} second 秒数
     * @ignore
     */
    function formatSecond(second) {
        var hh = 0,
            mm = 0,
            ss = 0;
        hh = parseInt(second / 3600);
        hh = hh >= 10 ? hh : "0" + hh;
        mm = parseInt(second / 60);
        mm = (mm % 60) >= 10 ? (mm % 60) : "0" + (mm % 60);
        ss = (second % 60) >= 10 ? (second % 60) : "0" + (second % 60);
        return (hh + ":" + mm + ":" + ss);
    }
    /**
     * @description  暂停计时
     * @ignore
     */
    timer.pause = function() {
        timer.status = "pause";
        cancelAnimationFrame(timer.anim_id);
    };
    /**
     * @description  恢复计时
     * @ignore
     */
    timer.resume = function() {
        timer.status = "counting";
        timer.anim_id = requestAnimationFrame(timer.start);
    };
    /**
     * @description  重设计时
     * @ignore
     */
    timer.reset = function() {
        timer.status = "stop";
        cancelAnimationFrame(timer.anim_id);
        timer.second = 0;
    };

    /**
     * @description  轮询回调方法
     * @ignore
     */
    timer.loopEvent = function(id, second, callback) {
        var event = {
            id: id,
            second: second,
            callback: callback,
            executed: false
        };

        timer.callbacks[event.id] = event;
    };

    /**
     * @description  隐藏计时器
     * @ignore
     */
    timer.hide = function() {
        timer.component.style.display = "none";
    };

    return timer;
}

/**
 * @description 隐藏html元素
 * @param {Element} el html element
 * @ignore
 */
function hideSelf(el) {
    if (el && el.style) {
        (el.style.opacity = 0);
        setTimeout(function() {
            el.style.display = "none";
            el.style["visibility"] = "hidden";
        }, 1000);
    }
}

/**
 * @description 展示html元素
 * @param {Element} el html element
 * @ignore
 */
function showSelf(el) {
    if (el && el.style) {
        el.style.display = "block";
        el.style["visibility"] = "visible";
        el.style.opacity = 1;
        setTimeout(function() {
            el.style.opacity = 1;
        }, 200);
    }
}

/**
 * @description 检测手机号码是否有效
 * @param {String} phone_input 手机号码
 * @ignore
 */
function verifyPhone(phone_input) {
    var phone_test_reg = /^(0|\+86|17951|86)?(13[0-9]|15[012356789]|18[0-9]|14[57]|17[0-9])[0-9]{8}$/;
    var input_val = "";

    if (typeof phone_input === "string") {
        input_val = phone_input;
    } else if (input_val instanceof HTMLElement) {
        input_val = phone_input.value;
    } else {
        return false;
    }

    if (input_val.length >= 11) {
        if (phone_test_reg.test(input_val)) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}


/**
 * @description 显示alert信息
 * @param {String} info 信息
 * @deprecated
 * @ignore
 */
function alert(info) {
    var _self = this;
    if (!_self.debug_flag) return;
    (info) && (typeof info === "string") && (console.log(info));
    _self.showAlert = false;
    (info) && (typeof info === "string") && (this.showAlert) && (window.alert(info));
}

/**
 * @description 显示warn信息
 * @param {String} info 信息
 * @deprecated
 * @ignore
 */
function warn(info) {
    var _self = this;
    (info) && (typeof info === "string") && (console.warn(info));
}

/**
 * @description 显示alert信息
 * @param {String} info_str 信息
 * @deprecated
 * @ignore
 */
function info(info_str) {
    var _self = this;
    (info_str) && (typeof info_str === "string") && (console.log(info_str));
}

/**
 * @description 显示debug信息
 * @param {String} info 信息
 * @deprecated
 * @ignore
 */
function debug(info) {
    var _self = this;
    if (!_self.debug_flag) return;
    (info) && (typeof info === "string") && (console.log(info));
}