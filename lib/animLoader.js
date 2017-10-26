/**
 * Created by 耸善 on 2016/9/22.
 * Last Modify by 耸善 on 2017/3/16.
 * version 0.1.1

<strong>
------- Update 2017/3/16 -------
 添加module.export调用方式
</strong>


<strong>
 多图片动画canvas播放插件
 －可以播放多图片形式的视频／动画
 －合并了预加载的图片读取
</strong>

 <strong>
 * 通过new的方式构建新的对象
 * 每个AnimLoader对象管理一段动画
 * 调用资源加载的相关方法时请使用resourceManager
 * 调用视频／动画的相关方法时请使用animManager
 * 可以反复构建一个AnimLoader对象以避免内存溢出情况
 </strong>
 */

/**
 * @description  最大速度， 初始值为10
 **/
var MAX_SPEED = 10;
/**
    Renderer类，实时渲染类
* @description   内部渲染方法，请勿通过任何方式直接调用
[源码]
**/
var Renderer = function(ctx, size, images, duration, loop, endCallback, timer) {
    var renderer = {};
    var frame = 0;
    var _timer;
    var info = {
        size: size,
        endCallback: endCallback,
        play_fps: 0,
        sec_per_frame: 60,
        index: 0
    };
    _timer = timer || false;

    var STATUS = {
        READY: "ready",
        RENDERING: "rendering",
        STOP: "stop",
        END: "end"
    };

    var RAF = {
        rendering: {},
        calculator: {}
    };

    var MIN_FPS = 2;

    function calcFps(page_fps, anim_fps) {
        var temp_fps = page_fps < anim_fps ? page_fps : anim_fps;
        return parseInt(page_fps / temp_fps) < MIN_FPS ?
            MIN_FPS : parseInt(page_fps / temp_fps);
    }

    /**
    * @description   init方法
            主要用来计算fps,计算结果会存入sec_per_frame,请勿随意修改该值
    [源码]
    **/
    renderer.init = function(onReady) {
        if (_timer && _timer.sec_per_frame > 5) {
            info.sec_per_frame = _timer.sec_per_frame;
            var img_fps = parseFloat(images.length / duration);
            info.play_fps = calcFps(info.sec_per_frame, img_fps);
            renderer.status = STATUS.READY;
            if (onReady && (onReady instanceof Function)) {
                onReady.call(this);
            }
        } else {
            frame = 0;
            (function loop_frame() {
                ++frame;
                RAF.calculator = requestAnimationFrame(loop_frame);
            }());

            setTimeout(function() {
                info.sec_per_frame = (frame * 5);
                frame = 0;
                cancelAnimationFrame(RAF.calculator);
                var img_fps = parseFloat(images.length / duration);
                info.play_fps = calcFps(info.sec_per_frame, img_fps);
                renderer.status = STATUS.READY;
                if (onReady && (onReady instanceof Function)) {
                    onReady.call(this);
                }
            }, 200);
        }
    };
    /**
        内部方法
    * @description   内部渲染方法，请勿通过任何方式直接调用
    * @ignore
    [源码]
    **/
    renderer.renderFrame = function() {
        ++frame;
        if (frame % info.play_fps === 0 && info.index > -1) {
            if (info.index >= images.length) {
                if (loop) {
                    info.index = 0;
                } else {
                    info.index = -1;
                    endCallback.apply(this, arguments);
                    frame = 0;
                    return;
                }
            } else {
                if (renderer.status == STATUS.STOP) {
                    frame = 0;
                    return;
                }
                renderer.status = STATUS.RENDERING;
                if (ctx) {
                    ctx.drawImage(images[info.index], 0, 0,
                        info.size.width, info.size.height);
                }
                ++(info.index);
            }
        }
        RAF.rendering = requestAnimationFrame(renderer.renderFrame);
    };
    renderer.STATUS = STATUS;
    renderer.RAF = RAF;
    return renderer;
};


/**
    AnimLoader类，主要的实体构造类
*/
var AnimLoader = function() {
    var resourceManager = {},
        animManager = {},
        rendering = {},
        calculator = {},
        renderer = {};
    var status = "start";
    var ctx = {};
    var soundPool = [];
    var _timer;

    /**
        内部方法
    * @description   内部渲染方法，请勿通过任何方式直接调用
    * @ignore
    [源码]
    * @ignore
    **/
    var tryPlayAnim = function(curStatus, endCallback, timer) {
        switch (curStatus) {
            case "go":
                this.go = true;
                break;
            case "ready":
                this.ready = true;
                break;
            default:
                break;
        }
        if (this && this.ready && this.go && this.srcInfo) {
            var speed = 1;
            if (this.speed > MAX_SPEED) {
                speed = this.speed / MAX_SPEED;
            } else if (this.speed > 0) {
                speed = MAX_SPEED / this.speed;
            } else {
                speed = MAX_SPEED / 2;
            }

            if (timer) {
                _timer = timer;
            } else if (_timer) {
                timer = _timer;
            }
            var self = this;
            if (this.loop && this.duration > 0) {
                this.animManager.play(canvas, this.srcInfo, speed, this.loop);
                var stopSecond = timer.second + this.duration;
                timer.loopEvent(self.name, stopSecond, function() {
                    self.animManager.stop();
                    (endCallback) && (endCallback.call(window));
                });
            } else {
                this.animManager.play(canvas, this.srcInfo, speed, this.loop, function() {
                    (endCallback) && (endCallback.call(window));
                });
            }
        }
    };

    /**
    * @description   resourceManager对象，用来加载资源，
        preLoad 方法，用来预加载图片资源
    * 加载完成会回调onLoadComplete方法
    * [调用示例]
    <pre>
    _animLoader.resourceManager.preLoad(imgSrc, function() {
        console.log("preload ready");
    });
    </pre>
    * @param {Object}   srcInfo  资源的相关信息，需要包含资源的通用名与资源列表
            形如：
            var srcInfo = {
                name: "src_name",
                list: [
                    "img/01.jpg",
                    "img/02.jpg"
                ]
            };
    * @param {Function} onLoadComplete  回调方法，资源加载完成时回调
    [源码]
    **/
    resourceManager.preLoad = function(srcInfo, onLoadComplete) {
        var loadedCount = 0,
            call_valied = (srcInfo.list && srcInfo.name);
        if (!call_valied) {
            return false;
        }
        srcInfo.status = "loading";
        if (srcInfo.list instanceof Array) {
            for (var src in srcInfo.list) {
                var image = new Image();
                image.src = srcInfo.list[src];
                onLoad(image);
            }
        }

        function onLoad(image) {
            var img = image;
            img.onload = function() {
                loadedCount++;
                if (loadedCount >= srcInfo.list.length) {
                    srcInfo.status = "ready";
                    onLoadComplete.call(this);
                }
            };
        }
    };

    /**
        内部方法
    * @description   内部渲染方法，请勿通过任何方式直接调用
    * @ignore
    [源码]
    * @ignore
    **/
    resourceManager.preLoadFolder = function(urlBase, fileType, length, onLoadComplete, soundUrl) {
        var loadedCount = 0,
            call_valied = (urlBase && (length > 0));
        if (!call_valied) {
            return false;
        }

        var srcInfo = {
            status: "loading",
            list: []
        };

        var completeFlag = {
            image_ok: false
        };

        if (soundUrl) {
            var sound = new Audio(soundUrl);
            srcInfo.sound = sound;
        } else {
            completeFlag.sound_ok = true;
        }

        function onLoad(image) {
            image.onload = function() {
                loadedCount++;
                if (loadedCount >= length) {
                    loadComplete("img");
                }
            };
        }
        for (var count = 1; count <= length; count++) {
            var srcUrl = urlBase + "_" + count + "." + fileType;
            srcInfo.list.push(srcUrl);
            var image_load = new Image();
            image_load.src = srcUrl;
            onLoad(image_load);
        }

        function loadComplete(srcType) {
            switch (srcType) {
                case "img":
                    completeFlag.image_ok = true;
                    break;
                case "sound":
                    completeFlag.sound_ok = true;
                    break;
                default:
                    break;
            }

            if (completeFlag.image_ok) {
                srcInfo.status = "ready";
                onLoadComplete.apply(this, [srcInfo]);
            }
        }
    };

    /**
    * @description   animManager对象，用来控制播放视频/动画，
        play 方法，用来播放视频／动画
    * [调用示例]
    <pre>
    var canvas = document.getElementById("canvas");
    _animLoader.animManager.play(canvas, imgSrc.list, 9, true, function() {
        alert("play end");
    });
    </pre>
    * @param {Context}  canvas      canvas的context
    * @param {Array}    srcList     资源文件src的列表
    * @param {Integer}  duration    视频／动画的播放时长
    * @param {boolean}  loop        是否循环播放
    * @param {Function} playEnd     播放完毕后的回调方法
    [源码]
    **/
    animManager.play = function(canvas, srcInfo, duration, loop, playEnd) {
        var images = [];
        status = "start";
        var imgArray = [];
        if (srcInfo instanceof Array) {
            imgArray = srcInfo;
        } else if (srcInfo && srcInfo.list && srcInfo.list instanceof Array) {
            imgArray = srcInfo.list;
            if (srcInfo.sound) {
                soundPool.push(srcInfo.sound);
            }
        } else {
            console.log("srcInfo Error");
            console.log(srcInfo);
            return;
        }

        for (var img_index in imgArray) {
            var image = new Image();
            image.src = imgArray[img_index];
            images.push(image);
        }

        if (images && images.length > 0) {
            ctx = canvas.getContext("2d");
            var size = {
                width: canvas.width,
                height: canvas.height
            };
            renderer = new Renderer(ctx, size, images, duration, loop, playEnd, _timer);
            renderer.init(function() {
                renderer.renderFrame();
            });
            if (soundPool.length > 2) {
                playSound(soundPool[-1], loop);
            } else if (soundPool.length > 0) {
                playSound(soundPool[0], loop);
            }
        }
    };

    /**
        内部方法
    * @description   内部渲染方法，请勿通过任何方式直接调用
    * @ignore
    [源码]
    * @ignore
    **/
    function playSound(sound, loop) {
        if (loop) {
            if (typeof sound.loop == "boolean") {
                sound.loop = true;
            } else {
                sound.addEventListener("ended", function() {
                    this.currentTime = 0;
                    this.play();
                }, false);
            }
        }
        sound.play();
    }

    /**
    * @description   animManager对象，用来控制播放视频/动画，
        stop 方法，用来停止视频／动画
    * 加载完成会回调onLoadComplete方法
    * [调用示例]
    <pre>
    _animLoader.animManager.stop();
    </pre>
    [源码]
    **/
    animManager.stop = function() {
        if (renderer && renderer.RAF && renderer.RAF.rendering &&
            renderer.status == renderer.STATUS.RENDERING) {
            cancelAnimationFrame(renderer.RAF.rendering);
            renderer.status = renderer.STATUS.END;
        }
        if (soundPool.length > 0) {
            soundPool.forEach(function(item, index, array) {
                item.pause();
            });
        }

    };

    return {
        animManager: animManager,
        resourceManager: resourceManager,
        tryPlayAnim: tryPlayAnim
    };

};

var define = window.define || {};
if (define && ((typeof define) == "function")) {
    define(function(require) {
        return {
            create: function() {
                return new AnimLoader();
            }
        };
    });
}

module.exports = AnimLoader;