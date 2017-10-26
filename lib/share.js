/* jshint browser: true */
/* jshint esversion: 6 */
/**
 * Created by 耸善 on 2016-X-X.
 * Last Modify by 耸善 on 2017-7-5.
 * version 0.1
<strong>
    shareManager
    分享功能相关
 </strong>
 **/


// 当前链接，通常默认分享链接即为当前链接
var curUrl = encodeURIComponent(window.location.href.split("#")[0]);
var currentUrl = window.location.href.split("#")[0];
var curPath = window.location.href.substr(0, [window.location.href.lastIndexOf("/")]);
/**
 * @description shareManager 主体对象
 */
var shareManager = {};

var DIALOG_TYPE = {
    INAPP: 1,
    WECHAT: 2
};

var IMG_WECHAT = "data:image/png;base64,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";
var IMG_TIMELINE = "data:image/png;base64,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";

shareManager.DIALOG_TYPE = DIALOG_TYPE;

/**
 * @description 分享参数模板<br/>
 * @param {Object} param 分享参数，具体参见分享参数模板
 */
/**
<pre>
 * demo
{
    approaches: ["wechat", "timeline"], //要分享途径，{wechat: "微信好友", timeline: "微信朋友圈"...}
    dlg_title: "分享到",
    title: "title", //分享标题
    content: "content", //分享描述
    from: "web_call", //分享的tag，用于统计分享次数，默认为web_call,通常情况下不需要修改
    url: currentUrl, //分享的链接
    wechat_share_url: currentUrl, //用于微信二次分享的链接
    keep_org_url: true, //分享链接是否需要转换为短链接，true表示不需要保持原有链接，不需要转换
    image_url: "http://dialer.cdn.cootekservice.com/icon/icon.jpg", //分享的小图标
    img_url: "http://dialer.cdn.cootekservice.com/icon/icon.jpg" //分享的小图标
};
</pre>
*/

var sharePopUp = {};
/**
 * @description 构造方法<br/>
 * @param {Object} param 分享参数，具体参见分享参数模板
 */
shareManager.init = function(dialog_type, param, shareFunc, wechatCB) {
    initShareParam(param);
    shareManager.initWechatShare();
    sharePopUp = initShareUI(dialog_type);
    shareManager.shareFunc = shareFunc;
    shareManager.wechatCB = wechatCB;
};

/**
 * @description 填充分享参数 [内部方法]<br/>
 * @param {Object} param 分享参数，具体参见分享参数模板
 * @ignore
 */
function initShareParam(param) {
    shareManager.shareParams = (param) && (param instanceof Object) ? param : shareParams;
    console.log(JSON.stringify(shareManager.shareParams));
}

/**
 * @description 设定组件style [内部方法]<br/>
 * @param {Object} el html element
 * @param {Object} style 类style对象
 * @ignore
 */
function fillStyle(el, style) {
    for (var key in style) {
        el.style[key] = style[key];
    }
}

/**
 * @description 构造分享弹框的UI [内部方法]<br/>
 * @ignore
 */
function initShareUI(dialog_type) {
    var approaches = shareManager.approaches;
    var sharePopUp = {};
    sharePopUp.el = document.createElement("div");
    var popup_style = {
        display: "block",
        height: "100%",
        left: 0,
        position: "absolute",
        top: 0,
        width: "100%",
        "z-index": 999
    };
    fillStyle(sharePopUp.el, popup_style);
    sharePopUp.el.className = "share-dialog";
    var mask = document.createElement("div");
    var mask_style = {
        background: "black",
        height: "100%",
        left: 0,
        opacity: 0.8,
        position: "absolute",
        top: 0,
        width: "100%",
        "z-index": 1
    };
    fillStyle(mask, mask_style);
    mask.className = "mask";
    var content = document.createElement("div");
    var content_style = {
        height: "100%",
        left: 0,
        position: "absolute",
        top: 0,
        width: "100%",
        "text-align": "center",
        "z-index": 2
    };
    fillStyle(content, content_style);
    content.className = "content";

    var pop_container = document.createElement("div");
    var pop_container_style = {
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        "z-index": 10,
        width: "100%",
    };
    fillStyle(pop_container, pop_container_style);
    pop_container.className = "pop-container";
    var pop_content = {};
    if (dialog_type) {
        switch (dialog_type) {
            case DIALOG_TYPE.INAPP:
                pop_content = initInAppShareUI();
                break;
            case DIALOG_TYPE.WECHAT:
                pop_content = initWeChatShareUI();
                break;
            default:
                pop_content = initWeChatShareUI();
                break;
        }
    } else {
        pop_content = initWeChatShareUI();
    }
    pop_container.appendChild(pop_content);
    content.appendChild(pop_container);

    sharePopUp.el.appendChild(mask);
    sharePopUp.el.appendChild(content);

    sharePopUp.show = function(container) {
        if (container && container instanceof Element) {
            container.appendChild(sharePopUp.el);
        } else {
            document.body.appendChild(sharePopUp.el);
        }
        sharePopUp.el.style.display = "block";
        sharePopUp.el.style.top = document.body.scrollTop + "px";
        lockScroll();
        setTimeout(function() {
            pop_content.style["-webkit-transform"] = "translateY(0)";
        }, 200);
    };
    sharePopUp.dismiss = function(fouce) {
        pop_content.style["-webkit-transform"] = "translateY(100%)";
        setTimeout(function() {
            if (fouce) {
                sharePopUp.el.parentNode.removeChild(sharePopUp.el);
            } else {
                sharePopUp.el.style.display = "none";
            }
            unlockScroll();
        }, 500);
    };
    return sharePopUp;
}

function lockScroll() {
    window.ontouchmove = function(e) {
        if (e.preventDefault) { e.preventDefault(); }
        e.returnValue = true;
        if (e.stopPropagation) { e.stopPropagation(); }
        return false;
    };
}

function unlockScroll() {
    window.ontouchmove = function(e) {
        if (e.preventDefault) { e.preventDefault(); }
        e.returnValue = true;
        if (e.stopPropagation) { e.stopPropagation(); }
        return true;
    };
}

/**
 * @description 构造分享弹框的UI(应用内) [内部方法]<br/>
 * @ignore
 */
function initInAppShareUI() {
    var pop_content = document.createElement("div");
    var pop_content_style = {
        background: "#ffffff",
        bottom: "0",
        "max-height": "234px",
        "min-height": "44px",
        "padding-top": "20px",
        "padding-bottom": "44px",
        position: "absolute",
        width: "100%",
        "text-align": "center",
        "-webkit-transition": "-webkit-transform 0.5s linear",
        "-webkit-transform": "translateY(100%)",
        "z-index": 3
    };
    fillStyle(pop_content, pop_content_style);
    pop_content.className = "pop-content";
    var icon_group = document.createElement("ul");
    var icon_group_style = {
        float: "left",
        "margin-bottom": "12px",
        "list-style-type": "none",
        "white-space": "nowrap",
        width: "100%"
    };
    fillStyle(icon_group, icon_group_style);
    icon_group.className = "icon-group";
    var icon_style = {
        display: "inline-block",
        width: "64px",
        height: "64px",
        "font-size": "13px",
        margin: 0,
        padding: 0,
        "margin-left": "16px",
        "margin-right": "16px"
    };
    var icon_img_style = {
        width: "40px"
    };
    var icon_text_style = {
        color: "#868484",
        "margin-top": "10px"
    };
    if (shareManager.shareParams.approaches) {
        Array.prototype.forEach.call(shareManager.shareParams.approaches, function(item, index) {
            var shareItem = document.createElement("li");
            fillStyle(shareItem, icon_style);
            var icon_img = {},
                icon_text = {};
            switch (item) {
                case "wechat":
                    icon_img = new Image();
                    icon_img.src = IMG_WECHAT;
                    fillStyle(icon_img, icon_img_style);
                    icon_text = document.createElement("div");
                    fillStyle(icon_text, icon_text_style);
                    icon_text.innerHTML = "微信好友";
                    shareItem.appendChild(icon_img);
                    shareItem.appendChild(icon_text);
                    shareItem.className = "share-icon";
                    shareItem.id = "wechat";
                    break;
                case "timeline":
                    icon_img = new Image();
                    icon_img.src = IMG_TIMELINE;
                    fillStyle(icon_img, icon_img_style);
                    icon_text = document.createElement("div");
                    fillStyle(icon_text, icon_text_style);
                    icon_text.innerHTML = "朋友圈";
                    shareItem.appendChild(icon_img);
                    shareItem.appendChild(icon_text);
                    shareItem.className = "share-icon";
                    shareItem.id = "timeline";
                    break;
                default:
                    break;
            }
            shareItem.addEventListener("click", function(el) {
                var id = "";
                if (el.currentTarget) {
                    id = el.currentTarget.id;
                } else if (el.id) {
                    id = el.id;
                }
                if (shareManager.shareFunc && shareManager.shareFunc instanceof Function) {
                    shareManager.shareFunc.call(window, id, shareManager.shareParams);
                }
            });

            var cancel = document.createElement("div");
            var cancel_style = {
                background: "#f1f1f1",
                bottom: 0,
                color: "#878585",
                display: "inline-block",
                "font-size": "16px",
                height: "44px",
                left: 0,
                "line-height": "44px",
                position: "absolute",
                "text-align": "center",
                width: "100%"
            };
            fillStyle(cancel, cancel_style);
            cancel.innerHTML = "取消";
            cancel.className = "share-cancel";
            cancel.addEventListener("click", function() {
                sharePopUp.dismiss();
            });
            icon_group.appendChild(shareItem);
            icon_group.appendChild(cancel);
        });
    }
    pop_content.appendChild(icon_group);
    return pop_content;
}

/**
 * @description 构造分享弹框的UI(微信内) [内部方法]<br/>
 * @ignore
 */
function initWeChatShareUI() {
    var pop_content = document.createElement("div");
    var pop_content_style = {
        height: "100%",
        position: "absolute",
        width: "100%",
        "text-align": "center",
        "z-index": 3
    };
    fillStyle(pop_content, pop_content_style);
    var tips = new Image();
    tips.src = shareManager.shareParams.wechat_pic || "./img/tips-wechat.gif";
    var tips_classname = shareManager.shareParams.wechat_pic_cls || "";
    if (tips_classname) {
        tips.className = tips_classname;
    } else {
        var tips_style = {
            position: "absolute",
            right: 0,
            top: 0,
            width: "140px",
            "z-index": 3
        };
        fillStyle(tips, tips_style);
    }
    pop_content.className = "pop-content";
    pop_content.appendChild(tips);
    pop_content.addEventListener("click", function() {
        sharePopUp.dismiss();
    });
    return pop_content;
}

/**
 * @description 展示分享弹框<br/>
 * 
 */
shareManager.showShare = function(container) {
    if (sharePopUp && sharePopUp.show) {
        sharePopUp.show(container);
    }
};

/**
 * @description 关闭分享弹框<br/>
 * 
 */
shareManager.dismiss = function(fouce) {
    if (sharePopUp && sharePopUp.dismiss) {
        sharePopUp.dismiss(fouce);
    }
};

/**
 * @description 构造分享弹框的UI [内部方法]<br/>
 * @ignore
 */
shareManager.initWechatShare = function(WECHAT_TYPE) {
    var reqUrl = "//mkt.chule.cc/market/wechat-sign?url=" + curUrl;
    var req = new XMLHttpRequest();
    req.responseType = "json";
    req.open("GET", reqUrl, true);
    req.timeout = 5000;
    req.send();
    req.onload = function() {
        if (req.status != 200) {
            console.warn("[initWechatShare] failed:" + req.status);
            return;
        }
        var remoteData = req.response;
        console.log(JSON.stringify(remoteData));
        // $.getJSON("//mkt.chule.cc/market/wechat-sign?url=" + curUrl, function(remoteData) {
        var shareParams = shareManager.shareParams;
        //向服务器发送请求，获得signature
        wx.config({
            debug: false, // 开启或关闭调试模式,调用的所有api的返回值会在客户端alert出来
            appId: remoteData.appId, // 必填，公众号的唯一标识
            timestamp: remoteData.timestamp, // 必填，生成签名的时间戳
            nonceStr: remoteData.nonceStr, // 必填，生成签名的随机串
            signature: remoteData.signature, // 必填，签名，见附录1
            jsApiList: ["onMenuShareTimeline", "onMenuShareAppMessage", "onMenuShareQQ"] // 必填，需要使用的JS接口列表
        });

        wx.ready(function() {
            console.log("wx share info:" + JSON.stringify(shareParams));
            wx.onMenuShareTimeline({
                title: shareParams.title,
                link: shareParams.wechat_share_url, // 分享链接，必填
                imgUrl: shareParams.image_url, // 分享图标，需替换为图片地址
                success: function() {
                    shareManager.wechatCB("success");
                    // record("wechat_share_timeline");
                },
                cancel: function() {
                    // 用户取消分享后执行的回调函数，需要时选填
                }
            });
            wx.onMenuShareAppMessage({
                title: shareParams.title,
                desc: shareParams.content, // 分享描述
                link: shareParams.wechat_share_url,
                imgUrl: shareParams.image_url, // 分享图标，需替换为图片地址
                type: "", // 分享类型,music、video或link，不填默认为link
                dataUrl: "", // 如果type是music或video，则要提供数据链接，默认为空
                success: function() {
                    shareManager.wechatCB("success");
                    // record("wechat_share_app");
                },
                cancel: function() {}
            });
            wx.onMenuShareQQ({
                title: shareParams.title,
                desc: shareParams.content, // 分享描述
                link: shareParams.wechat_share_url,
                imgUrl: shareParams.image_url, // 分享图标，需替换为图片地址
                type: "", // 分享类型,music、video或link，不填默认为link
                dataUrl: "", // 如果type是music或video，则要提供数据链接，默认为空
                success: function() {
                    shareManager.wechatCB("success");
                    // record("wechat_share_qq");
                },
                cancel: function() {}
            });
        });
        wx.error(function(res) {});
    };
};

window.shareManager = shareManager || {};
// module.exports = shareManager;