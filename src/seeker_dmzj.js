/*  dmzj
 *  @lang
 */
var canPlayM3U8 = require('./canPlayM3U8')
var ajax        = require('./ajax')
var log         = require('./log')
var youku       = require('./seeker_youku')

exports.match = function (url) {
	var _id = window.iid || (window.pageConfig && window.pageConfig.iid) || (window.itemData && window.itemData.iid)
	var youkuCode = window.itemData && window.itemData.vcode
	log("haah", 2)
	//return /dmzj\.com/.test(url.attr('host')) && (youkuCode || _id)
	return /dmzj\.com/.test(url.attr('host'))
}

exports.getVideos = function (url, callback) {	
	//var youkuCode = window.itemData && window.itemData.vcode
	//if（ $(".cite-youku").length > 0){
		var y=$(".cite-youku");
		if(y.length){
		var youkuOnclick=$(".cite-youku")[0].getAttributeNode("onclick").nodeValue
		var youkuCode = youkuOnclick.match(/.*,'(.*==)'/)[1]
		
		console.info("youkuCode:"+youkuCode)
		if (youkuCode) {
			return youku.parseYoukuCode(youkuCode, callback)
		}
	}

	//var _id = window.iid || (window.pageConfig && window.pageConfig.iid) || (window.itemData && window.itemData.iid);
	var tudou_url = $("embed")[0].src;
	//var _id = tudou_url.match(/.*tudou\.com\/v\/([1-9]+)/)[1]
	var _id= tudou_url.match(/\d+/g)[0]
	log("url:"+tudou_url+"\nid="+_id, 2)
	console.info("id="+_id)
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
	//canPlayM3U8 ? m3u8(callback) : mp4(callback)
	mp4(callback)
}