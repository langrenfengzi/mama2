/*  dmzj
 *  @lang
 */
var canPlayM3U8 = require('./canPlayM3U8')
var ajax        = require('./ajax')
var log         = require('./log')
var youku       = require('./seeker_youku')

function setUserAgent(window, userAgent) {
    if (window.navigator.userAgent != userAgent) {
        var userAgentProp = { get: function () { return userAgent; } };
        try {
            Object.defineProperty(window.navigator, 'userAgent', userAgentProp);
        } catch (e) {
            window.navigator = Object.create(navigator, {
                userAgent: userAgentProp
            });
        }
    }
}
function setAppVersion(window, appVersion) {
    if (window.navigator.appVersion != appVersion) {
        var appVersionProp = { get: function () { return appVersion; } };
        try {
            Object.defineProperty(window.navigator, 'appVersion', appVersionProp);
        } catch (e) {
            window.navigator = Object.create(navigator, {
                appVersion: appVersionProp
            });
        }
    }
}
function setUserAgent2(window, userAgent, appVersion) {
    if (window.navigator.userAgent != userAgent) {
        var userAgentProp = { get: function () { return userAgent; } };
        var appVersionProp = { get: function () { return appVersion; } };
        try {
            Object.defineProperty(window.navigator, 'userAgent', userAgentProp);
            Object.defineProperty(window.navigator, 'appVersion', appVersionProp);
        } catch (e) {
            window.navigator = Object.create(navigator, {
                userAgent: userAgentProp,
                appVersion: appVersionProp
            });
        }
    }
}

exports.match = function (url) {
	var _id = window.iid || (window.pageConfig && window.pageConfig.iid) || (window.itemData && window.itemData.iid)
	var youkuCode = window.itemData && window.itemData.vcode
	return /dmzj\.com/.test(url.attr('host'))
}

exports.getVideos = function (url, callback) {	
	var y=$(".cite-youku");
	if(y.length){
	var youkuOnclick=$(".cite-youku")[0].getAttributeNode("onclick").nodeValue
	var youkuCode = youkuOnclick.match(/.*,'(.*==)'/)[1]

	console.info("youkuCode:"+youkuCode)
		if (youkuCode) {
			return youku.parseYoukuCode(youkuCode, callback)
		}
	}

	var tudou_url = $("embed")[0].src;
	var _id= tudou_url.match(/\d+/g)[0]
	log("url:"+tudou_url+"\nid="+_id, 2)
	console.info("url:"+tudou_url+"\nid="+_id)

	var m3u8 = function(callback){
		var urls = [
			['原画', 'http://vr.tudou.com/v2proxy/v2.m3u8?it=' + _id + '&st=5'],
			['超清', 'http://vr.tudou.com/v2proxy/v2.m3u8?it=' + _id + '&st=4'],
			['高清', 'http://vr.tudou.com/v2proxy/v2.m3u8?it=' + _id + '&st=3'],
			['标清', 'http://vr.tudou.com/v2proxy/v2.m3u8?it=' + _id + '&st=2']
		]
		
		if(window.itemData && window.itemData.segs){
			urls = []
			_s   = JSON.parse(window.itemData.segs)
			if(_s[5]) urls.push(['原画', 'http://vr.tudou.com/v2proxy/v2.m3u8?it=' + _id + '&st=5'])
			if(_s[4]) urls.push(['超清', 'http://vr.tudou.com/v2proxy/v2.m3u8?it=' + _id + '&st=4'])
			if(_s[3]) urls.push(['高清', 'http://vr.tudou.com/v2proxy/v2.m3u8?it=' + _id + '&st=3'])
			if(_s[2]) urls.push(['标清', 'http://vr.tudou.com/v2proxy/v2.m3u8?it=' + _id + '&st=2'])
		}
		console.info("appVersion:" + window.navigator.appVersion);
        console.info("UA:" + window.navigator.userAgent);
//		if(window.navigator.userAgent && (window.navigator.userAgent.indexOf("Macintosh") > 0)) {
//		    setUserAgent(window, window.navigator.userAgent.replace("Macintosh", "iPad"));
//		    setappVersion(window, window.navigator.appVersion.replace("Macintosh", "iPad"));
		    setUserAgent2(window, window.navigator.userAgent.replace("Macintosh", "iPad"), window.navigator.appVersion.replace("Macintosh", "iPad"));
		    console.info("appVersion:" + window.navigator.appVersion);
		    console.info("UA:" + window.navigator.userAgent);
		    //UA:Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/600.7.12 (KHTML, like Gecko) Version/8.0.7 Safari/600.7.12
		    //UA:Mozilla/5.0 (iPad; CPU OS 8_1 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/8.0 Mobile/12B410 Safari/600.1.4
//		}
		log('解析tudou视频地址成功 ' + urls.map(function (item) {return '<a href='+item[1]+'>'+item[0]+'</a>'}).join(' '), 2)
		callback(urls)
	};

	var mp4 = function(callback){
		ajax({
			url: 'http://vr.tudou.com/v2proxy/v2.js',
			param: {
				it: _id,
				st: '52%2C53%2C54'
			},
			jsonp: 'jsonp',
			callback: function(param){
				console.info("back.")
				log('Back', 2)
				if(param === -1 || param.code == -1) return log('解析tudou视频地址失败')
				for(var urls=[],i=0,len=param.urls.length; i<len; i++){ urls.push([i, param.urls[i]]); }
				log('解析tudou视频地址成功 ' + urls.map(function (item) {return '<a href='+item[1]+'>'+item[0]+'</a>'}).join(' '), 2)
				return callback(urls);
			}
		});
	};
	canPlayM3U8 ? m3u8(callback) : mp4(callback)
}