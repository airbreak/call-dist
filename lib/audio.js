/* jshint esversion: 6 */
/**
 * Created by 耸善 on 2016-X-X.
 * Last Modify by 耸善 on 2017-7-5.
 * version 0.1
<strong>
    audioManager
    用于管理audio对象，封装了一些最基本的audio操作(其实可以完全不用....)
 </strong>
 **/


var audio = {
    /**
     * @description 构建方法
     * @param {String} soundPath audio对象路径
     * @param {Boolean} loop 是否循环播放
     * @param {Element} container html元素，承载audio对象，因为客户端对于
     * 退出应用后声音仍在播放的bug的处理方式是遍历所有audio对象然后调用pause方法，
     * 所以audio必须承载在某个html元素中， 汗
     * @param {Function} loadFinish 加载完成后的回调方法
     * 
     */
    initSound: function(soundPath, loop, container, loadFinish) {
        this.sound = document.createElement("audio");
        this.sound.type = "audio";
        if (container) {
            container.appendChild(this.sound);
        }
        this.sound.src = soundPath;
        this.sound.loop = loop;
        this.sound.load();
        this.sound.addEventListener("canplaythrough", function() {
            if (loadFinish) {
                loadFinish();
            }
        });
    },
    /**
     * @description 播放声音
     * 
     */
    playSound: function() {
        if (!this.sound) {
            return;
        }
        this.sound.play();
    },
    /**
     * @description 停止播放声音
     * 
     */
    stopSound: function() {
        if (!this.sound) {
            return;
        }
        this.sound.currentTime = 0;
        this.sound.pause();
    }
};

module.exports = audio;