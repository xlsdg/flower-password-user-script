// ==UserScript==
// @name         Flower Password
// @namespace    https://greasyfork.org/en/scripts/23026-flower-password
// @version      0.4.4
// @description  花密 Flower Password --- 可记忆的密码管理方案
// @author       徐小花, Johnny Jian, xLsDg
// @include      http://*/*
// @include      https://*/*
// @match        http://*/*
// @match        https://*/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/1.12.4/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/blueimp-md5/2.3.1/js/md5.min.js
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_setClipboard
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_registerMenuCommand
// @run-at       document-end
// @license      MIT License
// @encoding     utf-8
// @homepageURL  https://github.com/xlsdg/flower-password-user-script
// @supportURL   https://github.com/xlsdg/flower-password-user-script/issues
// @icon         https://raw.githubusercontent.com/xlsdg/flower-password-user-script/master/icon.png
// @resource     fpStyle https://raw.githubusercontent.com/xlsdg/flower-password-user-script/master/fp.min.css
// ==/UserScript==

(function() {
    'use strict';

    function fpCode(password, key, length) {
        var hmd5, rule, source, str, code32, code01, i;
        length = length || 16;
        if (password && key && (1 < length) && (length < 33)) {
            hmd5 = md5(password, key);
            rule = md5(hmd5, 'kise').split('');
            source = md5(hmd5, 'snow').split('');
            str = 'sunlovesnow1990090127xykab';
            for (i = 0; i < 32; i++) {
                if (isNaN(source[i])) {
                    if (str.search(rule[i]) > -1) {
                        source[i] = source[i].toUpperCase();
                    }
                }
            }
            code32 = source.join('');
            code01 = code32.slice(0, 1);
            code32 = (isNaN(code01) ? code01 : 'K') + code32.slice(1, length);
            return code32;
        } else {
            return '';
        }
    }

    var currentField = null;

    function setupInputListeners() {
        function insideBox(e) {
            return e.parents('#flower-password-input').size() > 0;
        }

        $(document).on('focus', 'input:password', function() {
            if (insideBox($(this))) {
                return;
            }

            lazyInject();

            if (currentField && currentField.get(0) != this) {
                $('#flower-password-password, #flower-password-key').val('');
            }

            currentField = $(this);

            var offset = currentField.offset();
            var height = currentField.outerHeight();
            $('#flower-password-input').css({
                left: offset.left + 'px',
                top: offset.top + height + 'px'
            }).show();
        });

        $(document).on('focus', 'input:not(:password)', function() {
            if (insideBox($(this))) {
                return;
            }
            $('#flower-password-input').hide();
        });
    }

    function isInjected() {
        return $('#flower-password-input').size() > 0;
    }

    function lazyInject() {
        if (isInjected()) {
            return;
        }

        var style = GM_getResourceText('fpStyle');
        // var style = '#flower-password-input,#flower-password-input span,#flower-password-input h1,#flower-password-input label,#flower-password-input input,#flower-password-input p,#flower-password-input a{border:0;font:inherit;font-size:100%;color:#000;background:#FFF;text-align:left;vertical-align:baseline;line-height:1;box-sizing:content-box!important;margin:0;padding:0;}#flower-password-input{border:2px solid #168BC3!important;font:normal 14px/1.5 Tahoma, Helvetica, Arial, \\5b8b\\4f53!important;width:250px;z-index:999999;position:absolute;padding:10px!important;}#flower-password-input h1{font-size:21px!important;font-weight:700!important;color:#168BC3!important;margin:0 0 5px!important;}#flower-password-input input[type=text],#flower-password-input input[type=password]{border:1px solid #999!important;border-radius:3px;font-size:14px!important;display:inline;height:18px;width:160px;margin:5px 10px!important;padding:5px!important;}#flower-password-input input[type=checkbox]{border:1px solid #999!important;border-radius:3px;vertical-align:middle!important;display:inline-block;width:13px;height:13px;cursor:pointer;-webkit-appearance:none;margin:10px!important;}#flower-password-input input[type=checkbox]:checked::after{display:block;position:relative;top:-3px;left:-5px;}#flower-password-input label{vertical-align:middle!important;display:inline;float:none;}#flower-password-input p{font-size:12px!important;color:#999!important;line-height:1.5!important;}#flower-password-close{border:2px solid #168BC3!important;font-weight:700!important;color:#FFF!important;background:#168BC3!important;display:block;width:16px;height:16px;overflow:hidden;position:absolute;top:-2px;right:-2px;cursor:pointer;}#flower-password-close::before{text-align:center!important;line-height:16px!important;content:"\\D7";display:block;width:16px;height:16px;position:relative;top:-1px;}#flower-password-input a{color:#168BC3!important;text-decoration:none;cursor:pointer;}#flower-password-input a:hover{color:#FF881C!important;text-decoration:none;cursor:pointer;}#flower-password-toolbar{display:block;text-align:right!important;}#flower-password-toolbar a{font-size:12px!important;margin-left:10px!important;display:inline;}#flower-password-input a img{vertical-align:middle!important;}#flower-password-hint{margin-top:10px!important;}';
        GM_addStyle(style);

        $('body').append(
            '<div id="flower-password-input" style="display: none;">' +
            '<span id="flower-password-close" title="关闭">关闭</span>' +
            '<h1>花密 Flower Password</h1>' +
            '<label for="flower-password-password">记忆密码</label><input id="flower-password-password" name="flower-password-password" type="password" value=""/>' +
            '<br>' +
            '<label for="flower-password-key">区分代号</label><input id="flower-password-key" name="flower-password-key" type="text" value=""/>' +
            '<p id="flower-password-hint">· 记忆密码：可选择一个简单易记的密码，用于生成其他高强度密码。<br>· 区分代号：用于区别不同用途密码的简短代号，如淘宝账号可用“taobao”或“tb”等。<br>· 按Enter键或Esc键关闭本窗口。<br>· 花密官网地址：<a href="http://flowerpassword.com/" target="_blank">http://flowerpassword.com/</a></p>' +
            '</div>'
        );

        var onChange = function() {
            var password = $('#flower-password-password').val();
            var key = $('#flower-password-key').val();
            var result = fpCode(password, key);
            if (result) {
                currentField.val(result);
            }
        };

        $('#flower-password-password, #flower-password-key').change(onChange).keyup(onChange).keyup(function(e) {
            if (e.which === 13 || e.which === 27) {
                currentField.focus();
                $('#flower-password-input').hide();
            }
        });

        $('#flower-password-close').click(function() {
            $('#flower-password-input').hide();
        });
    }

    setupInputListeners();
})();
