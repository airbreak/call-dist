/* jshint browser: true */

// 当前链接，通常默认分享链接即为当前链接
var curUrl = encodeURIComponent(window.location.href.split("#")[0]);
var currentUrl = window.location.href.split("#")[0];
var curPath = window.location.href.substr(0, [window.location.href.lastIndexOf("/")]);
// shareManager 主体对象
var shareManager = {};

var DIALOG_TYPE = {
    INAPP: 1,
    WECHAT: 2
};

var IMG_WECHAT = "data:image/png;base64,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";
var IMG_TIMELINE = "data:image/png;base64,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";
var IMG_QZONE = "data:image/png;base64,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"
var IMG_QQ = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABO1BMVEUAAABmmcxto91spt5tp95up99spt9tp91kpNFspt1sp95spt5spt1upt9gn89tp91tqN9po9ttp99rpt1sqN9gn79sp91tp91spt5spd1ootxnpNtbpMhsqN5hntNtqN5tpdxsqN9po91rpd5tp94AAABqpNtup95upt9rp95rpN1moNNdorlrp99spd1sp9xlodcAAABmn9ljpdZtp91rpt1sp99tp99pptxsp95spt1spN1tp99jnMZpo9lsp91mo9Zsp99on9dppdxspd4AVVVuqN9spt5JkrZtpt5qpt5ppNxipdptpdxsp95sp91oodBtqN5sqN5tpt1rpt5spNxrotpspd9loNVspt1spd9km9NAgIBrodttptxmmZlpottsp95spt5spt5tpt5sp99upt5uqN////980JbHAAAAZ3RSTlMAD1mSud3s+Rxquvqe/RCI9k7tef4IpcX3rVgqDqod+178S3rHAUbTh2tDIwufb5MmAigf86TktlDJtVrcEj3iGdQgM2MDp6AH73NJImDCxBvq8OtkOzeXK5WOFwQ5mwU/28bL6b/YaIh6lwAAAAFiS0dEaMts9CIAAAAHdElNRQfeBRANKxFoAUHYAAACL0lEQVRIx52WZ1vbMBSFb5xF7AyySCBASMpoCGBGCx10QMsoG8oqZZS21P//HzR2EunIvnYecr9Juq9lSUfnisgTIS0cicbi8Vg0EtZC1DMGErphQRh6YiAYSKYsT6SS/lA6M2ixMZhJ80Q2Z/lGLssR+YIVEIW8BygOWT1iqOgiSjhaHh6pjI5WRobL2FtSGWWOsfFu9/iYMo+yDhioTuDIRBWGYD1ZWHmtrv5yvQZ7IPYtneO/1I4XuNfd88lA5+SUG5mahOFMRyV45tPeA5tGHbS1k4SuGe6QZyAh6UyCSnzJIfjjKXuaBm79LIfMYkai1aFjR5NDmpiht+6gcqPmOGQOM4wQadieJzYWMEcjE5uLPLKEqjHVpSzzCKGidYoisuKDvIKcKMWg9dqHUBYTo7hsrPqb1prMiiPyxpegZg0Q+WNvKSDewY/J5b8PQqSs1uUmpz4EIR8FEpFH+SmIoM8CCUvBbBBtfuHzv27RCghGyLJcpO0dltj9tkf7IEu5mJ28ZRywk1jG4RGInxKomOMtL3Fyihn2FVMu8lnFi9TPIMG5yGgX31kpLwPj2AWa0jm/Y9L9OqYEDnLBI5cioWN9YLBXIuv6x82iaOx1x4XBgo3f/LTbt3dmS+DV+wvbbR9+iZpbgPIni0Xh8fefR2E6f4+e/sG9Vyy+Z9mzQylJrsLHR8ldLJ9dXqmPIk79PBX6eZBQH88eB2q4H1eNYMCJkGbq7SecbnJPuP8mMM3e11fF+gAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxNi0wOS0xN1QxNToyMDo1MCswODowMPmMZosAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTQtMDUtMTZUMTM6NDM6MTcrMDg6MDAKqgioAAAATXRFWHRzb2Z0d2FyZQBJbWFnZU1hZ2ljayA3LjAuMS02IFExNiB4ODZfNjQgMjAxNi0wOS0xNyBodHRwOi8vd3d3LmltYWdlbWFnaWNrLm9yZ93ZpU4AAAAYdEVYdFRodW1iOjpEb2N1bWVudDo6UGFnZXMAMaf/uy8AAAAXdEVYdFRodW1iOjpJbWFnZTo6SGVpZ2h0ADUwkKA+XgAAABZ0RVh0VGh1bWI6OkltYWdlOjpXaWR0aAA1MGgP/tMAAAAZdEVYdFRodW1iOjpNaW1ldHlwZQBpbWFnZS9wbmc/slZOAAAAF3RFWHRUaHVtYjo6TVRpbWUAMTQwMDIxODk5N9mS4tQAAAASdEVYdFRodW1iOjpTaXplADEuODZLQh4BD7oAAABfdEVYdFRodW1iOjpVUkkAZmlsZTovLy9ob21lL3d3d3Jvb3Qvc2l0ZS93d3cuZWFzeWljb24ubmV0L2Nkbi1pbWcuZWFzeWljb24uY24vc3JjLzExNjQ0LzExNjQ0MzAucG5ntIwjkwAAAABJRU5ErkJggg=="
var IMG_WEIBO = "data:image/png;base64,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"
var IMG_SMS = "data:image/png;base64,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"

shareManager.DIALOG_TYPE = DIALOG_TYPE;

/**
 * @description 分享参数模板<br/>
 * @param {Object} param 分享参数，具体参见分享参数模板
 */
/**
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
*/

var sharePopUp = {};
/**
 * @description 构造方法<br/>
 * @param {Object} param 分享参数，具体参见分享参数模板
 */
shareManager.init = function(dialog_type, param, shareFunc, wechatCB) {
    initShareParam(param);
    // shareManager.initWechatShare();
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
        width: "91%",
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
                case "qq":
                    icon_img = new Image();
                    icon_img.src = IMG_QQ;
                    fillStyle(icon_img, icon_img_style);
                    icon_text = document.createElement("div");
                    fillStyle(icon_text, icon_text_style);
                    icon_text.innerHTML = "QQ好友";
                    shareItem.appendChild(icon_img);
                    shareItem.appendChild(icon_text);
                    shareItem.className = "share-icon";
                    shareItem.id = "qq";
                    break;
                case "qzone":
                    icon_img = new Image();
                    icon_img.src = IMG_QZONE;
                    fillStyle(icon_img, icon_img_style);
                    icon_text = document.createElement("div");
                    fillStyle(icon_text, icon_text_style);
                    icon_text.innerHTML = "QQ空间";
                    shareItem.appendChild(icon_img);
                    shareItem.appendChild(icon_text);
                    shareItem.className = "share-icon";
                    shareItem.id = "qzone";
                    break;
                case "weibo":
                    icon_img = new Image();
                    icon_img.src = IMG_WEIBO;
                    fillStyle(icon_img, icon_img_style);
                    icon_text = document.createElement("div");
                    fillStyle(icon_text, icon_text_style);
                    icon_text.innerHTML = "微博";
                    shareItem.appendChild(icon_img);
                    shareItem.appendChild(icon_text);
                    shareItem.className = "share-icon";
                    shareItem.id = "weibo";
                    break;
                case "sms":
                    icon_img = new Image();
                    icon_img.src = IMG_SMS;
                    fillStyle(icon_img, icon_img_style);
                    icon_text = document.createElement("div");
                    fillStyle(icon_text, icon_text_style);
                    icon_text.innerHTML = "短信";
                    shareItem.appendChild(icon_img);
                    shareItem.appendChild(icon_text);
                    shareItem.className = "share-icon";
                    shareItem.id = "sms";
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

// /**
//  * @description 构造分享弹框的UI [内部方法]<br/>
//  * @ignore
//  */
// shareManager.initWechatShare = function(WECHAT_TYPE) {
//     var reqUrl = "//mkt.chule.cc/market/wechat-sign?url=" + curUrl;
//     var req = new XMLHttpRequest();
//     req.responseType = "json";
//     req.open("GET", reqUrl, true);
//     req.timeout = 5000;
//     req.send();
//     req.onload = function() {
//         if (req.status != 200) {
//             console.warn("[initWechatShare] failed:" + req.status);
//             return;
//         }
//         var remoteData = req.response;
//         console.log(JSON.stringify(remoteData));
//         // $.getJSON("//mkt.chule.cc/market/wechat-sign?url=" + curUrl, function(remoteData) {
//         var shareParams = shareManager.shareParams;
//         //向服务器发送请求，获得signature
//         wx.config({
//             debug: false, // 开启或关闭调试模式,调用的所有api的返回值会在客户端alert出来
//             appId: remoteData.appId, // 必填，公众号的唯一标识
//             timestamp: remoteData.timestamp, // 必填，生成签名的时间戳
//             nonceStr: remoteData.nonceStr, // 必填，生成签名的随机串
//             signature: remoteData.signature, // 必填，签名，见附录1
//             jsApiList: ["onMenuShareTimeline", "onMenuShareAppMessage", "onMenuShareQQ"] // 必填，需要使用的JS接口列表
//         });

//         wx.ready(function() {
//             console.log("wx share info:" + JSON.stringify(shareParams));
//             wx.onMenuShareTimeline({
//                 title: shareParams.title,
//                 link: shareParams.wechat_share_url, // 分享链接，必填
//                 imgUrl: shareParams.image_url, // 分享图标，需替换为图片地址
//                 success: function() {
//                     shareManager.wechatCB("success");
//                     // record("wechat_share_timeline");
//                 },
//                 cancel: function() {
//                     // 用户取消分享后执行的回调函数，需要时选填
//                 }
//             });
//             wx.onMenuShareAppMessage({
//                 title: shareParams.title,
//                 desc: shareParams.content, // 分享描述
//                 link: shareParams.wechat_share_url,
//                 imgUrl: shareParams.image_url, // 分享图标，需替换为图片地址
//                 type: "", // 分享类型,music、video或link，不填默认为link
//                 dataUrl: "", // 如果type是music或video，则要提供数据链接，默认为空
//                 success: function() {
//                     shareManager.wechatCB("success");
//                     // record("wechat_share_app");
//                 },
//                 cancel: function() {}
//             });
//             wx.onMenuShareQQ({
//                 title: shareParams.title,
//                 desc: shareParams.content, // 分享描述
//                 link: shareParams.wechat_share_url,
//                 imgUrl: shareParams.image_url, // 分享图标，需替换为图片地址
//                 type: "", // 分享类型,music、video或link，不填默认为link
//                 dataUrl: "", // 如果type是music或video，则要提供数据链接，默认为空
//                 success: function() {
//                     shareManager.wechatCB("success");
//                     // record("wechat_share_qq");
//                 },
//                 cancel: function() {}
//             });
//         });
//         wx.error(function(res) {});
//     };
// };

window.shareManager = shareManager || {};
// module.exports = shareManager;
