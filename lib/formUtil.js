/**
 * Created by 耸善 on 2017-9-6.
 * Last Modify by 耸善 on 2017-9-6.
 * version 0.1
<strong>
    formUtil
    定义了表单处理的一些方法
 </strong>
 *  @deprecated 
 **/


/**
 * @description 预处理省市店信息，对原始省市店进行去重
 * @param {Array} arr 省市数据的数组数据，
 * * [data demo]
 * Array:
 * <pre>
 * var data = [
        ["新疆维吾尔自治区","阿克苏地区"],
        ["新疆维吾尔自治区","阿克苏地区"],
        ["内蒙古自治区","阿拉善盟"],
        ["新疆维吾尔自治区","阿勒泰地区"],
        ["安徽省","安庆市"],
        ["安徽省","安庆市"],
        ["安徽省","安庆市"],
        ["贵州省","安顺市"],
        ["河南省","安阳市"],
        ["河南省","安阳市"],
        ["辽宁省","鞍山市"],
        ["辽宁省","鞍山市"],
        ["内蒙古自治区","巴彦淖尔市"],
        ["内蒙古自治区","巴彦淖尔市"]
    ];
    var neoData = deDuplication(data, 1);
 * </pre>
 * 
 * Object Array:
 * <pre>
 * var data = [
        { province:"新疆维吾尔自治区", city:"阿克苏地区"},
        { province:"新疆维吾尔自治区", city:"阿克苏地区"},
        { province:"内蒙古自治区", city:"阿拉善盟"},
        { province:"新疆维吾尔自治区", city:"阿勒泰地区"},
        { province:"安徽省", city:"安庆市"},
        { province:"安徽省", city:"安庆市"},
        { province:"贵州省", city:"安顺市"},
        { province:"河南省", city:"安阳市"},
        { province:"河南省", city:"安阳市"},
        { province:"辽宁省", city:"鞍山市"},
        { province:"辽宁省", city:"鞍山市"},
        { province:"辽宁省", city:"鞍山市"},
        { province:"内蒙古自治区", city:"巴彦淖尔市"},
        { province:"内蒙古自治区", city:"巴彦淖尔市"}
    ];
    var neoData = deDuplication(data, "city");
 * </pre>
 * @param {Object} key 主要数据，以此数据为准进行去重
 * @return {Array} 去重后的数据
 * @ignore
 */
function deDuplication(arr, key) {
    if (Array.isArray(arr)) {
        var neoData = {};
        arr.forEach(function(item, index) {
            if (Array.isArray(item) && typeof key === "number") {
                neoData[item[key]] = item;
            } else if (typeof item === "object" && typeof key === "string") {
                neoData[item[key]] = item;
            } else {
                neoData[index] = item;
            }
        });
        return neoData;
    }
}

/**
 * @description 填充表单
 * @param {Element} el_form 表单元素
 * @param {Object} data 数据,可以是数组或者对象
 * 数组的第0位为province, 第一位为city
 * 对象必须包含属性province, city
 * @ignore
 */
function fillIn(el_form, data, default_prov, default_city) {
    var provinces = {};
    if (Array.isArray(data)) {
        data.forEach(function(item) {
            if (Array.isArray(item)) {
                provinces[item[0]] = 1;
            } else {
                provinces[item.province] = 1;
            }
        });
    }

    var el_prov = el_form.querySelector("select[name='province']");
    var el_city = el_form.querySelector("select[name='city']");

    Object.keys(provinces).forEach(function(province) {
        var option_pr = new Option(province, province, 0);
        if (province.indexOf(default_prov) > -1) {
            option_pr.selected = true;
            addCity(province);
        }
        el_prov.appendChild(option_pr);
    });
    el_prov.addEventListener("change", function(e) {
        var province = e.target.selectedOptions[0].text;
        addCity(province);
    });

    function addCity(province) {
        el_city.options.length = 0;
        Array.prototype.forEach.call(data, function(item) {
            var citys = [];
            if (Array.isArray(item)) {
                if (item[0] === province) {
                    citys.push(item[1]);
                }
            } else {
                if (item.province === province) {
                    citys.push(item.city);
                }
            }
            citys.forEach(function(city) {
                var option_city = new Option(city, city, 0);
                el_city.appendChild(option_city);
                if (city.indexOf(default_city) > -1 || default_city.indexOf(city) > -1) {
                    option_city.selected = true;
                }
            })
        });
    }
}

var formUtil = {
    /**
     * @description 预处理省市店信息，对原始省市店进行去重
     * @param {Array} arr 省市数据的数组数据，
     * @param {Object} key 主要数据，以此数据为准进行去重
     * @return {Array} 去重后的数据
     * [data demo]
     * Array:
     * <pre>
     * var data = [
            ["新疆维吾尔自治区","阿克苏地区"],
            ["新疆维吾尔自治区","阿克苏地区"],
            ["内蒙古自治区","阿拉善盟"],
            ["新疆维吾尔自治区","阿勒泰地区"],
            ["安徽省","安庆市"],
            ["安徽省","安庆市"],
            ["安徽省","安庆市"],
            ["贵州省","安顺市"],
            ["河南省","安阳市"],
            ["河南省","安阳市"],
            ["辽宁省","鞍山市"],
            ["辽宁省","鞍山市"],
            ["内蒙古自治区","巴彦淖尔市"],
            ["内蒙古自治区","巴彦淖尔市"]
        ];
        var neoData = deDuplication(data, 1);
     * </pre>
     * 
     * Object Array:
     * <pre>
     * var data = [
            { province:"新疆维吾尔自治区", city:"阿克苏地区"},
            { province:"新疆维吾尔自治区", city:"阿克苏地区"},
            { province:"内蒙古自治区", city:"阿拉善盟"},
            { province:"新疆维吾尔自治区", city:"阿勒泰地区"},
            { province:"安徽省", city:"安庆市"},
            { province:"安徽省", city:"安庆市"},
            { province:"贵州省", city:"安顺市"},
            { province:"河南省", city:"安阳市"},
            { province:"河南省", city:"安阳市"},
            { province:"辽宁省", city:"鞍山市"},
            { province:"辽宁省", city:"鞍山市"},
            { province:"辽宁省", city:"鞍山市"},
            { province:"内蒙古自治区", city:"巴彦淖尔市"},
            { province:"内蒙古自治区", city:"巴彦淖尔市"}
        ];
        var neoData = deDuplication(data, "city");
     * </pre>
     * 
    */
    deDuplication: deDuplication,
    /**
     * @description 填充表单
     * @param {Element} el_form 表单元素
     * @param {Object} data 数据,可以是数组或者对象
     * 数组的第0位为province, 第一位为city
     * 对象必须包含属性province, city
     */
    fillIn: fillIn
}

module.exports = formUtil;