var App = function() {
	this.baseUri = "http://api.juketz.com/index.php/";
	this.commodUri = "http://www.juketz.com/";

	plus.screen.lockOrientation("portrait-primary");

	var base = this;
	pushinfo = plus.push.getClientInfo();
	base.osname = plus.os.name;
	base.osvison = plus.os.version;
	base.appverid = plus.runtime.version;
	base.did = plus.device.uuid; //ios无imsi 
	base.cid = pushinfo.clientid;
	/**
	 * @description 监测网络状态 
	 */
	this.CheckNetWork = function() {
		return plus.networkinfo.getCurrentType() > 1 ? true : false;
	}
	this.createMsgLog = function(msgtitle, msgdesc, msgtag, msgcontent, msgtime) {
		var sql = "insert into msylog(title,desc,tag,content,systime) values('" + msgtitle + "','" + msgdesc + "','" + msgtag + "','" + msgcontent + "','" + msgtime + "')";
		base.DBDML(sql, function() {
		}, function(error) {
			console.log(error.message);
		});
	}
	/**
	 * @description 封装axaj请求 
	 */
	this.AppHttpService = function(webservice, SuccessCallBack, ErrorCallBack) {
		var myDate = new Date();
		console.log(myDate.getFullYear() + "年" + myDate.getMinutes() + "分" + myDate.getSeconds() + "秒:" + "请求地址:" + (webservice.commond ? (base.commodUri + webservice.commond) : (base.baseUri + webservice.action)));
		console.log(myDate.getFullYear() + "年" + myDate.getMinutes() + "分" + myDate.getSeconds() + "秒:" + "请求的数据:" + JSON.stringify(webservice.data));
		mui.ajax(webservice.commond ? (this.commodUri + webservice.commond) : (this.baseUri + webservice.action), {
			type: "post",
			data: webservice.data,
			timeout: 30000,
			async: true,
			dataType: 'json', //服务器返回json格式数据 
			beforeSend: function() {
				plus.nativeUI.showWaiting();
			},
			success: function(response) {
				console.log(myDate.getFullYear() + "年" + myDate.getMinutes() + "分" + myDate.getSeconds() + "秒:返回参数:" + JSON.stringify(response));
				console.log("返回的代码：" + response['code']);
				if(response.code == "1002") {
					plus.nativeUI.toast("用户名或密码错误");
				} else if(response.code == "1001") {
					plus.nativeUI.toast("登录已经过期，请重新登录");
					base.AppCreateWindow('../login.html');
				} else if(response.code == "1000") {
					base.AppCreateWindow('../login.html');
				} else {
					SuccessCallBack(webservice.test || (typeof response == "object" ? response : JSON.parse(response)));
				}
			},
			complete: function() {
				plus.nativeUI.closeWaiting();
			},
			error: ErrorCallBack || ErrorDefaultEvent
		})
	}

	var ErrorDefaultEvent = function(xhr, type, errorThrown) {
		if(!base.CheckNetWork()) {
			plus.nativeUI.toast("请检查网络连接状态后重试");
		} else {
			mui.toast("oops,提交失败" + type);
			console.log(xhr);
			console.log(type);
			console.log(errorThrown);
		}
	}

	/**
	 * @description OpenNewWindow
	 * @param {URIString} url
	 */

	this.AppCloseWindow = function(id_wvobj, aniClose, duration, extras) {
		plus.webview.close(id_wvobj, "pop-out", 300, extras);
	}

	this.AppCreateWindow = function(url, anishow, styles, extras, id, _bool) {

		var myDate = new Date();
		console.log(myDate.getFullYear() + "年" + myDate.getMinutes() + "分" + myDate.getSeconds() + "秒: 打开页面" + url + "随带的参数：" + JSON.stringify(extras));
		mui.openWindow({
			url: url,
			id: id || url,
			styles: styles || {
				top: "0px",
				bottom: "0px"
			},
			createNew: _bool || false,
			waiting: {
				autoShow: true
			},
			show: {
				autoShow: true,
				aniShow: anishow || "pop-in",
				duration: 300
			},
			extras: extras
		})
	}

	/**
	 * @description UserLogin
	 */
	this.UserLogin = function(_username, _password) {
		var username = _username || document.getElementById("username").value;
		var password = _password || document.getElementById("password").value;
		var ostype = null;
		if(base.osname == 'iOS') {
			ostype = '2';
		} else if(base.osname == 'Android') {
			ostype = '1';
		} else {
			ostype = '3';
		}
		base.AppHttpService({
			action: 'auth/login',
			data: {
				mobile: username,
				password: password,
				did: base.did,
				cid: base.cid,
				app_version_id: base.appverid,
				client_type: ostype
			},
			type: 'post'
		}, function(response) {
			if(response.code == '200') {
				plus.storage.setItem("uinfo", JSON.stringify(response.data));
				base.initDevice();
				base.AppCreateWindow("index.html");
			} else {
				mui.toast(response.message);
			}
		});
	}

	var GetScene = function(wifibox, executeFunction) {
		base.AppHttpService({
			action: "getscenelist&wifiBoxAddress=" + wifibox
		}, function(response) {
			if(response.state == 1) {
				for(var item in response.data) {
					base.sqlite("insert into scene values(?,?,?)", [
						response.data[item].id,
						response.data[item].name,
						response.data[item].memo
					]);
				}

				HotTimelist(wifibox, executeFunction);
			}
		})
	}

	/**
	 * @description GetSmsCode
	 */
	this.GetSmsCode = function(n) {
		var tel = document.getElementById("tel").value;
		var btn = document.getElementById("smscodeButton");
		var i = 60;

		if(tel != "") {
			base.AppHttpService({
				action: "sendsms&tel=" + tel + "&type=" + n + "&r=0.590901952254546"
			}, function(response) {

				if(response.state == 1) {
					btn.disabled = true;
					var temp = btn.innerText;
					btn.innerText = "已发送验证码(60)";
					var timer = setInterval(function() {
						if(i-- <= 0) {
							btn.innerText = temp;
							btn.disabled = false;
							clearInterval(timer);
						} else {
							btn.innerText = "已发送验证码(" + i + ")";
						}
					}, 1E3);
				}
				plus.nativeUI.toast(response.msg);
			})
		} else {
			mui.toast("Please Input Tel Number");
		}
	}
	/**
	 * @author leeyoung
	 * @abstract app版本检查
	 */
	this.CheckVersion = function() {
		console.log("当前版本号：" + base.osname);
		var dtype = null;
		if(base.osname == 'Android') {
			dtype = '1';
		} else if(base.osname == 'IOS') {
			dtype = '3';
		}
		if(base.osname == '')
			plus.runtime.getProperty(plus.runtime.appid, function(inf) {
				console.log("当前应用版本：" + inf.version);
				if(dtype != null) {
					base.AppHttpService({
						action: 'App/app_version',
						data: {
							"app_version_id": inf.version, //版本ID编号
							"client_type": "2" //客户端设备id 1安卓pad 2安卓手机 3ios手机 4iospad 5winphone
						},
						type: 'post'
					}, function(response) {
						if(response.code == '555') {
							plus.storage.clear();
							mui.alert('系统错误，即将退出!');
							plus.runtime.quit();
						} else if(response.code == '200') {
							mui.toast("系统开始升级！");
							if(dtype == 1) {
								var dtask = plus.downloader.createDownload(response.data.apk_url, {}, function(d, status) {
									if(status == 200) {
										plus.nativeUI.toast("正在准备环境，请稍后！");
										sleep(1000);
										var path = d.filename; //下载apk
										plus.runtime.install(path); // 自动安装apk文件
									} else {
										mui.alert('版本更新失败:' + status);
									}
								});
								dtask.start();
							} else if(dtype == 3) {
								plus.runtime.openURL(response.data.apk_url);
							}
						} else if(response.code == '201') {
							var btnArray = ['否', '是'];
							mui.confirm('有新版本，确认更新？', '', btnArray, function(e) {
								if(e.index == 1) {
									if(dtype == 1) {
										var dtask = plus.downloader.createDownload(response.data.apk_url, {}, function(d, status) {
											if(status == 200) {
												plus.nativeUI.toast("正在准备环境，请稍后！");
												sleep(1000);
												var path = d.filename; //下载apk
												plus.runtime.install(path); // 自动安装apk文件
											} else {
												mui.alert('版本更新失败:' + status);
											}
										});
										dtask.start();
									} else if(dtype == 3) {
										plus.runtime.openURL(response.data.apk_url);
									}
								}
							})
						}
					});
				}
			});
	}
	/**
	 * @description OpenNewWindow
	 * @param {URIString} url
	 */

	this.getDatabase = function() {
		return openDatabase("Pdapp", "1.0", "pondering", 10000);
	}
	/**
	 * @description LoginOut
	 */
	this.LoginOut = function() {
		var dataBase = base.getDatabase()
		dataBase.transaction(function(tx) {
			tx.executeSql("drop table stockAmount;", [],
				function(tx, result) {
					console.log("删除STOCKSAmount表成功");
				},
				function(tx, error) {
					console.log(error.message);
				});
			tx.executeSql('drop table shopCart;', [],
				function(tx, result) {
					console.log("删除购物车表成功");
				},
				function(tx, error) {
					console.log(error.message);
				});
			tx.executeSql('drop table stockInventory;', [],
				function(tx, result) {
					console.log("删除分区盘点表成功");
				},
				function(tx, error) {
					console.log(error.message);
				});
			tx.executeSql('drop table msylog;', [],
				function(tx, result) {
					console.log("删除分区盘点表成功");
				},
				function(tx, error) {
					console.log(error.message);
				});
		   tx.executeSql('drop table stockAmountInput;', [],
				function(tx, result) {
					console.log("删除输入入库表成功");
				},
				function(tx, error) {
					console.log(error.message);
				});
		});
	}

	this.initDevice = function() {
		console.log("初始化设备创建相关数据缓存表");
		dataBase = base.getDatabase();
		dataBase.transaction(function(tx) {
			tx.executeSql("CREATE TABLE  if not exists  shopCart(scid integer primary key autoincrement,goods_a_id INTEGER,goodsId INTEGER,goods_ea_id INTEGER, stocksSku  varchar(20),goodName  varchar(50),goodsNum INTEGER,goodsImage varchar(50),goodsSpec varchar(50),goodsColor  varchar(50),barCode  varchar(50),goodPrice varchar(5))", [],
				function(tx, result) {
					console.log("初始化购物车表成功");
				},
				function(tx, error) {
					console.log(error.message);
				});
			tx.executeSql("CREATE TABLE  if not exists  stockAmount(said integer primary key autoincrement,goods_id varchar(10),goods_ea_id varchar(10),stocksSku  varchar(20),goodsNum INTEGER,goodsSpec varchar(50),goodsColor  varchar(50),barCode  varchar(50),uptime  varchar(15))", [],
				function(tx, result) {
					console.log("初始化货品入库表成功");
				},
				function(tx, error) {
					console.log(error.message);
				});
				tx.executeSql("CREATE TABLE  if not exists  stockAmountInput(said integer primary key autoincrement,goods_ea_id varchar(10),stocksSku  varchar(20),goodsNum INTEGER,goodsSpec varchar(50),goodsColor  varchar(50),uptime  varchar(15))", [],
				function(tx, result) {
					console.log("初始化录入货品入库表成功");
				},
				function(tx, error) {
					console.log(error.message);
				});
			tx.executeSql("CREATE TABLE  if not exists  stockInventory(said integer primary key autoincrement,goods_id varchar(10),goods_ea_id varchar(10),stockSku  varchar(20),num INTEGER,size varchar(50),goodsColor  varchar(50),barCode  varchar(50),areaId  varchar(15),areaName  varchar(15))", [],
				function(tx, result) {
					console.log("初始化分区盘点表成功");
				},
				function(tx, error) {
					console.log(error.message);
				});
			tx.executeSql("CREATE TABLE  if not exists  msylog(said integer primary key autoincrement,title  varchar(20),desc  varchar(100),tag  varchar(20),content varchar(255),systime  varchar(15))", [],
				function(tx, result) {
					console.log("初始化消息表成功");
				},
				function(tx, error) {
					console.log(error.message);
				});
		});
	}
	/**
	 * @description 数据的insert,del,update
	 * @author leeyoung
	 * @return 
	 */
	this.DBDML = function(sql, successCallback, errorCallback) {
		console.log("执行的SQL：" + sql);
		//mui.alert("执行的SQL：" + sql);
		dataBase = base.getDatabase();
		dataBase.transaction(function(tx) {
			tx.executeSql(
				sql, [],
				function(tx) {
					successCallback(true);
				},
				function(tx, error) {
					mui.alert("执行的SQL：" + JSON.stringify(error));
					errorCallback(error);
				});
		});
	}
	/**
	 * @description 查询数据
	 * @author leeyoung
	 * @return 
	 */
	this.DBquery = function(sql, successCallback, errorCallback) {
		console.log("查询SQL：" + sql);
		dataBase = base.getDatabase();
		dataBase.transaction(function(tx) {
			tx.executeSql(
				sql, [],
				function(tx, results) { //执行成功的回调函数
					//在这里对result 赋值数组...........
					var dataList = new Array();
					var len = results.rows.length;
					console.log("数据长度:" + len);
					for(i = 0; i < len; i++) {
						dataList[i] = results.rows.item(i);
					}
					successCallback(len, dataList);
				},
				function(tx, error) {
					errorCallback(error)
				});
		});
	}

}