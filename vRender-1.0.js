(function (e) {
    e.$ || (e.$ = {});

    function _createpType(value, dataType, msg) {

        dataType && (dataType = dataType[0])
        if (dataType == "(time)") {
            if(_num.test(value)){
                value=value*1;
            }
            var _tm = new Date(value);
            if (_tm != "Invalid Date") {
                value = _tm.getFullYear() + "/" + (_tm.getMonth() + 1) + "/" + _tm.getDate() + " " + _tm.getHours() + ":" + _tm.getMinutes() + ":" + _tm.getSeconds()
            }
        } else if (dataType == "(shortTime)") {
            if(_num.test(value)){
                value=value*1;
            }
            var _tm2 = new Date(value);
            if (_tm2 != "Invalid Date") {
                value = _tm2.getFullYear() + "/" + (_tm2.getMonth() + 1) + "/" + _tm2.getDate();
            }
        } else if (dataType == "(image)") {
            value = toImgUrl(value);
        }
        else if (dataType == "(litImage)") {
            value = toImgUrl(value, 1);
        }
        else {
            if (dataType) {

                dataType = dataType.replace(_rdkh, "");

                if (_num.test(dataType) === true) {
                    if (1 * dataType > 0) {
                        value = value.substring(0, 1 * dataType) + "...";
                    }
                    else {
                        value = "*" + value.substring(-1 * dataType, value.length);
                    }
                } else {

                    if (typeof (window[dataType]) == "function") {

                        return window[dataType](value);
                    }
                    else if (typeof (window[dataType.replace("obj_", "")]) == "function") {

                        return window[dataType.replace("obj_", "")](msg);
                    }
                    if (/(y+)/.test(dataType)){
                        value = format(dataType, value);
                    }
                    else {
                        return window[dataType];
                    }
                }
            }
        }
        return value;
    }
    var _rdkh = new RegExp("^[{(]|[)}]$", "g");
    function format(fmt,value){
        if(_num.test(value)){
            value=value*1;
        }
        var time = new Date(value);

        if (time != "Invalid Date") {
            var o = {
                "M+": time.getMonth() + 1,
                "d+": time.getDate(),
                "h+": time.getHours(),
                "m+": time.getMinutes(),
                "s+": time.getSeconds(),
                "q+": Math.floor((time.getMonth() + 3) / 3),
                "S": time.getMilliseconds()
            };
            if (/(y+)/.test(fmt))
                fmt = fmt.replace(RegExp.$1, (time.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt))
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;

        }else{
            return time+"";
        }
    }
    function _createValue(columnValue, data, status) {
        var nodata = "";
        var value = data[columnValue]|| (typeof(data[columnValue])=="number"?data[columnValue]:"");

        if (columnValue.indexOf("||") > -1) {
            nodata = columnValue.split("||")[1];
            value = data[columnValue.split("||")[0]]
        }

        if (columnValue.indexOf(".") > -1) {
            var columnAr = columnValue.split('.');
            var l=columnAr.length;
            if (data[columnAr[0]] && data[columnAr[0]][columnAr[1]]) {
                value = data[columnAr[0]][columnAr[1]];
            } else {
                value = nodata;
            }
            for(var i=2;i<=l;i++){
                value[columnAr[i]]&&(value=value[columnAr[i]]);
            }
        }

        if (status) {
            status = status[0];
            var p = status.replace(_rdkh, "").split(",");
            var l = p.length;
            for (var i = 0; i < l; i++) {
                var _pNm = p[i].split(":");
                if (_pNm[0] == value) {
                    value = _pNm[1];
                }
            }
        }

        return value||nodata;
    }
    var _getText = "[^\\n(}})({{)]+";
    var _getChild = "\\[child[0-9]{0,1}\\]";
    var _getList = "\\[list[0-9]{0,1}\\]";
    var _getType = "\(\\([^\\n(}})({{)]+\\)\){0,1}";
    var _getTypeV = "\(\\([^\\n(}})({{)]+\\)\)";

    var _getStatus = "\({[^\\n]+}\){0,1}";
    var _getStatusV = "\({[^\\n{}]+[:,]+[^\\n{}]+}\){1}";


    var _reText = new RegExp(_getStatusV + "|\([{]{2}|[}]{2}\)|" + _getChild + "|" + _getList + "|" + _getType, "g");
    var _canRe = new RegExp("[{]{2}|[}]{2}|" + _getChild + "|\\([^\\n]+\\)}}", "g");
    var _getAllChild = new RegExp("{{" + _getText + _getChild + _getType + _getStatus + "}}", "g");
    var _getAllList = new RegExp("{{" + _getText + _getList + _getType + _getStatus + "}}", "g");
    var _getAll = new RegExp("{{" + _getText + _getType + _getStatus + "}}", "g");
    var _anNum2 = new RegExp("[^\\(\\)]+"), _num = new RegExp("^-{0,1}[0-9]+$");

    function vCreateChild(data,_attr,str,level){

        var msg=data[_attr]||[];
        if (_attr.indexOf(".") > -1) {
            var columnAr = _attr.split('.');
            var l=columnAr.length;
            if (data[columnAr[0]] && data[columnAr[0]][columnAr[1]]) {
                msg = data[columnAr[0]][columnAr[1]];
            }
            for(var i=2;i<=l;i++){
                msg[columnAr[i]]&&(msg=msg[columnAr[i]]);
            }
        }

        var childName = "{{" + _attr + "[list" + level + "]}}", childEnd = "{{" + _attr + "[end" + level + "]}}";
        var childStart = str.indexOf(childName);
        var childend = str.indexOf(childEnd);

        while (childStart > -1) {
            var regstr = str.substring(childStart + childName.length, str.indexOf(childEnd));
            var l = msg.length;
            var restultStr = "";
            var _getNowChild = new RegExp("{{" + _getText + "\\[child" + level + "\\]" + _getType + _getStatus + "}}", "g");

            for (var i = 0; i < l; i++) {
                var tmp = regstr;

                while (tmp.match(_getNowChild)) {
                    var pstr = tmp.match(_getNowChild);
                    var text = pstr[0].replace(_reText, "");
                    var pType = pstr[0].match(_getTypeV);
                    var status = pstr[0].match(_getStatusV);

                    if (msg[i].constructor !=Object){
                        tmp = tmp.replace(pstr[0],msg[i], pType, msg[i])
                    }
                    else{
                        tmp = tmp.replace(pstr[0], _createpType(_createValue(text, msg[i], status), pType, msg[i]))
                    }
                }
                tmp=createByLevel(msg[i],tmp,level?level*1+1:level+2);
                restultStr += tmp;
            }

            str=str.substring(0, childStart) + restultStr + str.substring(childend + childEnd.length, str.length - 1);
            childStart = str.indexOf(childName);
            childend = str.indexOf(childEnd);
        }
        return str;
    }

    function createByLevel(data,tempStr,level){
        var _getNowList = new RegExp("{{" + _getText + "\\[list" + level + "\\]" + _getType + _getStatus + "}}", "g");

        var lkey = tempStr.match(_getNowList);

        if (lkey) {
            var _attr = lkey[0].replace(_reText, "");
            return vCreateChild(data,_attr,tempStr,level);
        }else{
            return tempStr;
        }
    }
    function _BaseRanderAppend(data, _tempStr,dl) {
        dl =dl?dl:data.length;
        var str = "";
        for (var j = 0; j < dl; j++) {

            var tempStr = _tempStr;
            tempStr=createByLevel(data[j],tempStr,"");

            str +=_angular(tempStr, data[j]);
        }
        return str;
    }

    function _angular(str, msg) {
        while (str.match(_getAll)) {
            var pstr = str.match(_getAll);
            var text = pstr[0].replace(_reText, "");
            var status = pstr[0].match(_getStatusV);
            var pType = pstr[0].match(_getTypeV);
            str = str.replace(pstr[0], _createpType(_createValue(text, msg, status), pType, msg));
        }
        return str;
    }

    function _createThisEle(element) {
        if (!window["v" + element]) {
            window["v" + element] = document.getElementById("vDis"+element)?document.getElementById("vDis"+element).innerHTML:document.getElementById(element).innerHTML;
        }
        return window["v" + element];
    }
    e.$.vRender=function(element,date,config){
        if(date.constructor!=Array){date=[date]}
        config||(config={});
        var strt=_createThisEle(element);
        if(config["append"]){
            document.getElementById(element).innerHTML+=_BaseRanderAppend(date,strt);
        }else{
            document.getElementById(element).innerHTML=_BaseRanderAppend(date,strt)
        }
    }
})(window)
