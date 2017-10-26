/* jshint esversion: 6 */
/**
 * Created by 耸善 on 2016-X-X.
 * Last Modify by 耸善 on 2017-7-5.
 * version 0.1
<strong>
    encodeIt
    加／解密字符串，算法及其简单，爱用用
    已整合进util.js,该处保留仅为兼容旧版本
 </strong>
 *  @deprecated 
 **/



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

var encodeIt = {};
/**
 * @description 加密
 * @param {String} str 欲加密的字符串
 * @return {String} 加密后的字符串
 * 
 */
encodeIt.e = encodeStr;
/**
 * @description 解密
 * @param {String} str 欲解密的字符串
 * @return {String} 解密后的字符串
 * 
 */
encodeIt.d = decodeStr;

module.exports = encodeIt;