//上传单张图片
function galleryImg(obj) {
	//每次拍摄或选择图片前清空数组对象
	// 从相册中选择图片
	plus.nativeUI.toast("从相册中选择一张图片");
	plus.gallery.pick(function(path) {
		obj.src=path;
	}, function(e) {
		plus.nativeUI.toast("取消选择图片");
	}, {
		filter: "image",
		multiple: false
	});
}
// 拍照添加文件
function cameraimages(obj) {
	//每次拍摄或选择图片前清空数组对象
	var cmr = plus.camera.getCamera();
	cmr.captureImage(function(p) {
		plus.io.resolveLocalFileSystemURL(p, function(entry) {
			var localurl = entry.toLocalURL(); //把拍照的目录路径，变成本地url路径，例如file:///........之类的。
			obj.src=localurl;
		});
	}, function(e) {
		plus.nativeUI.toast("很抱歉，获取失败 ");
	});
}

function appendFile(path, obj) {
	var img = new Image();
	img.src = path; // 传过来的图片路径在这里用。
	//document.getElementById("head-img").src = path;
	img.onload = function() {
		var that = this;
		//生成比例 
		var w = that.width,
			h = that.height,
			scale = w / h;
		w = 480 || w; //480  你想压缩到多大，改这里
		h = w / scale;
		//生成canvas
		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext('2d');
		$(canvas).attr({
			width: w,
			height: h
		});
		ctx.drawImage(that, 0, 0, w, h);
		var base64 = canvas.toDataURL('image/jpeg', 1 || 0.8); //1最清晰，越低越模糊。有一点不清楚这里明明设置的是jpeg。弹出 base64 开头的一段 data：image/png;却是png。哎开心就好，开心就好
		//              alert(base64);      
		//file = base64; // 把base64数据丢过去，上传要用。
		obj.src = base64; //这里丢到img 的 src 里面就能看到效果了
	}
}

//分享函数
function shareMessage(share, surl, stitle, scontent, sthumbs, ex) {
	var msg = {
		href: surl,
		title: stitle,
		content: scontent,
		thumbs: sthumbs,
		extra: {
			scene: ex
		}
	};
	console.log("分享地址：" + msg.href + "分享类型：" + msg.extra.scene);
	share.send(msg, function(e) {
		console.log("分享到\"" + share.description + "\"成功！ " + e.code + " - " + e.message);
	}, function(e) {
		console.log("分享到\"" + share.description + "\"失败: " + e.code + " - " + e.message + JSON.stringify(e));
	});
}
//数据去重 
Array.prototype.unique = function() {
	var res = [];
	var json = {};
	for(var i = 0; i < this.length; i++) {
		if(!json[this[i]]) {
			res.push(this[i]);
			json[this[i]] = 1;
		}
	}
	return res;
}

//获取当前时间
function getNowFormatDate() {
	var date = new Date();
	var seperator1 = "-";
	var seperator2 = ":";
	var month = date.getMonth() + 1;
	var strDate = date.getDate();
	if(month >= 1 && month <= 9) {
		month = "0" + month;
	}
	if(strDate >= 0 && strDate <= 9) {
		strDate = "0" + strDate;
	}
	var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate +
		" " + date.getHours() + seperator2 + date.getMinutes() +
		seperator2 + date.getSeconds();
	return currentdate;
}
//时间格式化函数var d =new Date().format('yyyy-MM-dd');
Date.prototype.format = function(format) {
	var o = {
		"M+": this.getMonth() + 1, //month
		"d+": this.getDate(), //day
		"h+": this.getHours(), //hour
		"m+": this.getMinutes(), //minute
		"s+": this.getSeconds(), //second
		"q+": Math.floor((this.getMonth() + 3) / 3), //quarter
		"S": this.getMilliseconds() //millisecond
	}
	if(/(y+)/.test(format)) format = format.replace(RegExp.$1,
		(this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for(var k in o)
		if(new RegExp("(" + k + ")").test(format))
			format = format.replace(RegExp.$1,
				RegExp.$1.length == 1 ? o[k] :
				("00" + o[k]).substr(("" + o[k]).length));
	return format;
}

//时间格式化函数new Date().DateAdd('d', -7);
Date.prototype.DateAdd = function(strInterval, Number) {  
    var dtTmp = this; 
    switch (strInterval) {  
        case 's' :return new Date(Date.parse(dtTmp) + (1000 * Number)); 
        case 'n' :return new Date(Date.parse(dtTmp) + (60000 * Number)); 
        case 'h' :return new Date(Date.parse(dtTmp) + (3600000 * Number)); 
        case 'd' :return new Date(Date.parse(dtTmp) + (86400000 * Number)); 
        case 'w' :return new Date(Date.parse(dtTmp) + ((86400000 * 7) * Number)); 
        case 'q' :return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + Number*3, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds()); 
        case 'm' :return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + Number, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds()); 
        case 'y' :return new Date((dtTmp.getFullYear() + Number), dtTmp.getMonth(), dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds()); 
    } 
} 

function isRadioClicked(obj)  
{  
    //获得 单选选按钮name集合  
    var radios = document.getElementsByName("radio_tj");  
                                  
    //根据 name集合长度 遍历name集合  
    for(var i=0;i<radios.length;i++)  
    {   
        //判断那个单选按钮为选中状态  
        if(radios[i].checked)  
        {  
            //弹出选中单选按钮的值  
            alert(radios[i].value);  
        }   
    }   
  
}  