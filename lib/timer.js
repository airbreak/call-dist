/* jshint esversion: 6 */
/**
 * Created by 耸善 on 2016-X-X.
 * Last Modify by 耸善 on 2017-7-5.
 * version 0.1
<strong>
    timer 
    计时器小控件,已整合进util.js,该处保留仅为兼容旧版本
 </strong>
 @deprecated 
 **/


/**
 * @description 原型方法<br/>
 * [调用示例]
 <pre>
 var timer = new Timer();
 </pre>
 [源码]
 *
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
     */
    timer.show = function() {
        timer.component.style.display = "block";
        timer.component.innerHTML = formatSecond(timer.second);
    };

    /**
     * @description  初始计算，计算fps
     * @final
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
     */
    timer.start = function() {
        if (frame % timer.sec_per_frame == 0) {
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
     * 
     */
    timer.pause = function() {
        timer.status = "pause";
        cancelAnimationFrame(timer.anim_id);
    };

    /**
     * @description  恢复计时
     * 
     */
    timer.resume = function() {
        timer.status = "counting";
        timer.anim_id = requestAnimationFrame(timer.start);
    };

    /**
     * @description  重设计时
     * 
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
     * 
     */
    timer.hide = function() {
        timer.component.style.display = "none";
    };

    return timer;
}

var define = window.define || {};
(define) && ((typeof define) == "function") &&
(define(function(require) {
    return {
        create: function() {
            return new Timer();
        }
    };
}));

module.exports = Timer;