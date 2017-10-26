/* jshint esversion: 6 */
/**
 * Created by 耸善 on 2017-8-8.
 * Last Modify by 耸善 on 2017-8-8.
 * version 0.1
<strong>
    chart
    简单的柱状图绘制工具，通过指定参数绘制柱状图
 </strong>
 **/


/**
 * @description 构建方法
 * 
 * [调用示例]:
    <pre>
    conf_sample:  {
        // background: img,
        canvas: document.querySelect(".canvas"),
        orientation: "horizontal", // horizontal,vertical
        width: 300,
        height: 200,
        unit: "次",
        list: [{
                name: "1.丰田",
                color: "rgba(238, 96, 81, 1)",
                amount: 21100
            },
            {
                name: "2.大众",
                color: "rgba(254, 204, 42, 1)",
                amount: 20700
            },
            {
                name: "3.本田",
                color: "rgba(254, 204, 42, 1)",
                amount: 15300
            },
            {
                name: "4.吉利",
                color: "rgba(254, 204, 42, 1)",
                amount: 15100
            },
            {
                name: "5.现代",
                color: "rgba(254, 204, 42, 1)",
                amount: 13500
            },
        ]
    }
    var chart = new Chart(conf_sample);
    chart.draw();
    </pre>
 * @param {Object} conf configure对象，详见conf_sample
 * @return {Boolean} 构建结果，若失败则返回false
 */
function Chart(conf) {

}

/**
 * @description 获取设备pixelRatio
 * @ignore
 */
var getPixelRatio = function(context) {
    var backingStore = context.backingStorePixelRatio ||
        context.webkitBackingStorePixelRatio ||
        context.mozBackingStorePixelRatio ||
        context.msBackingStorePixelRatio ||
        context.oBackingStorePixelRatio ||
        context.backingStorePixelRatio || 1;

    return (window.devicePixelRatio || 1) / backingStore;
};

/**
 * @description 构建方法
 * @ignore
 */
var Chart = function(conf) {
    var _self = this;
    if (conf && conf.canvas) {
        _self.canvas = conf.canvas;
    } else {
        console.warn("[dialer-chart] container missing!!");
        return false;
    }

    if (conf && conf.list && conf.list instanceof Array) {
        _self.list = conf.list;
    } else {
        console.warn("[dialer-chart] data list missing!!");
        return false;
    }

    var canvas = _self.canvas;
    ctx = canvas.getContext("2d");
    _self.ctx = ctx;
    var pixelRatio = getPixelRatio(ctx);

    canvas.style.height = (parseInt(conf["height"]) || 300) + "px";
    canvas.style.width = (parseInt(conf["width"]) || 200) + "px";
    canvas.width *= pixelRatio;
    canvas.height *= pixelRatio;
    _self.drawArray = [];
    _self.drawed = false;

    var orien = conf["orientation"] || "vertical",
        itemHeight = 0,
        itemWidth = 0,
        vertical = false,
        unit = conf["unit"] || "";
    if (orien === "vertical") {
        vertical = true;
        itemHeight = canvas.height;
        itemWidth = canvas.width / (_self.list.length + 1);
    } else {
        vertical = false;
        itemHeight = canvas.height / (_self.list.length + 1);
        itemWidth = canvas.width;
    }

    var defaultFontSize = 14,
        maxItem = {},
        tempAmount = 0;
    _self.list.forEach(function(item) {
        if (item.amount > tempAmount) {
            tempAmount = item.amount;
            maxItem = Object.assign(item);
        }
    });

    var max = maxItem.amount;
    _self.list.forEach(function(item, index) {
        var fontSize = (parseInt(item["font"]) || defaultFontSize) * pixelRatio;
        var prefixWidth = (item.name && item.name.length > 0) ? item.name.length * fontSize : 0,
            endWidth = (item.amount && ("" + item.amount).length > 0) ? ("" + item.amount).length * (fontSize * 1.2) : 0,
            prefixHeight = fontSize,
            endHeight = fontSize << 1;

        var startX = 0,
            startY = 0,
            chartStartX = 0,
            chartStartY = 0,
            endX = 0,
            endY = 0,
            fontStartX = 0,
            fontStartY = 0,
            diffX = 0,
            diffY = 0;

        if (vertical) {
            startX = itemWidth * index + (itemWidth / 1.5);
            startY = itemHeight - fontSize * 2;
            chartStartX = startX;
            chartStartY = startY - fontSize;
            endX = chartStartX;
            endY = startY - ((item.amount) / max * (startY - endHeight));
            fontStartX = item.name.length === 1 ? startX + (fontSize >> 1) : startX - (fontSize >> 1) * item.name.length + (fontSize >> 1);
            fontStartY = startY;
        } else {
            startX = prefixWidth >> 2;
            startY = itemHeight * index + (itemHeight / 2);
            chartStartX = prefixWidth;
            chartStartY = startY;
            endX = startX + ((item.amount) / max * (canvas.width - endWidth));
            endY = startY;
            fontStartX = startX;
            fontStartY = startY;
        }
        diffX = Math.ceil(Math.abs(endX - chartStartX) / 60);
        diffY = Math.ceil(Math.abs(chartStartY - endY) / 60);

        endY = endY >= chartStartY ? chartStartY - diffY : endY;
        var posInfo = {
            fontSize: fontSize,
            startX: startX,
            endX: endX,
            startY: startY,
            endY: endY,
            chartStartX: chartStartX,
            chartStartY: chartStartY,
            fontStartX: fontStartX,
            fontStartY: fontStartY,
            drawWidth: vertical ? (itemWidth >> 1) : (diffX << 1),
            drawHeight: vertical ? (diffY << 1) : (itemHeight / 1.5),
            diffX: diffX,
            diffY: diffY
        };

        var drawItem = {
            amount: item.amount,
            font: posInfo.fontSize + "px serif",
            textStyle: item["colorText"] || "rgba(43, 79, 88)",
            fillStyle: item["color"] || "rgba(43, 79, 88)",
            index: index,
            name: item.name,
            startPos: [posInfo.startX, posInfo.startY],
            endPos: [posInfo.endX, posInfo.endY],
            curPos: [posInfo.chartStartX, posInfo.chartStartY],
            fontPos: [posInfo.fontStartX, posInfo.fontStartY],
            drawWidth: posInfo.drawWidth,
            drawHeight: posInfo.drawHeight,
            diffX: posInfo.diffX,
            diffY: posInfo.diffY,
            unit: unit
        };
        _self.drawArray.push(drawItem);
    });

};

Chart.prototype.draw = function() {
    if (!this.drawed) {
        draw.call(this, this.ctx, this.drawArray);
        this.drawed = true;
    }
};

function draw(ctx, drawArray) {
    var curDrawObj = ctx.curDrawObj;
    if (curDrawObj) {
        if (!curDrawObj.textDrawed) {
            ctx.restore();
            ctx.font = curDrawObj.font;
            ctx.fillStyle = curDrawObj.textStyle;
            ctx.textBaseline = "top";
            ctx.fillText(curDrawObj.name,
                curDrawObj.fontPos[0],
                curDrawObj.fontPos[1]);
            curDrawObj.textDrawed = true;
            ctx.save();
        }

        if (curDrawObj.curPos[0] < curDrawObj.endPos[0] ||
            curDrawObj.curPos[1] > curDrawObj.endPos[1]) {
            curDrawObj.curPos[0] += curDrawObj.diffX;
            curDrawObj.curPos[1] -= curDrawObj.diffY;
            ctx.fillStyle = curDrawObj.fillStyle;
            ctx.fillRect(curDrawObj.curPos[0], curDrawObj.curPos[1],
                curDrawObj.drawWidth, curDrawObj.drawHeight);
        } else {
            ctx.restore();
            ctx.font = curDrawObj.font;
            ctx.fillStyle = curDrawObj.textStyle;
            ctx.textBaseline = "top";
            ctx.fillText(curDrawObj.amount + curDrawObj.unit,
                curDrawObj.curPos[0] + (curDrawObj.diffX > 0 ? parseInt(curDrawObj.font) : -(parseInt(curDrawObj.font) / 2)),
                curDrawObj.curPos[1] - (curDrawObj.diffY > 0 ? parseInt(curDrawObj.font) * 2 : 0)
            );
            ctx.curDrawObj = null;
            ctx.save();
        }
    } else {
        ctx.curDrawObj = drawArray.shift();
        if (!ctx.curDrawObj) {
            return;
        }
    }
    window.requestAnimationFrame(function() {
        draw(ctx, drawArray);
    });
}

module.exports = Chart;