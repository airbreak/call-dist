
var tel = null,
code=null;

$(function(){




	getEnvData();
	var url=window.location.href;
	// alert(url)
	var id=url.replace(/.*\?id=/g,'').replace(/&.*/g,'');

	if(id=='two'){
		$.ajax({
			url:'http://114.55.61.44:8087/card/distribute',
			type:'POST',
			dataType:"json",
			data:{"account_name":"tel",
			"ext_info": 'minutes-5-reward'},
			success: function(data){
				console.log(data)
				// data.data.result_code=2000
				if(data.data.result_code==2000){
                    if(window.localStorage.getItem("awardStatus")=='true'){
                        $('#right').html('您已领取过')
                        $('#tip').html('快去围观刘惜君为触宝打call吧')
                    }else{
                         $('#right').html('猜对啦！送您5分钟通话时长')
                        $('#tip').html('快去围观刘惜君为触宝打call吧')
                        window.localStorage.setItem('awardStatus',true)
                    }

                }else{
                     $('#right').html('领取失败')
                      $('#tip').html('快去围观刘惜君为触宝打call吧')
                }

            }

        })

	}else if(id=='zero'){
        $('#right').html('持续关注触宝电话')
        $('#tip').html('您喜欢的明星很可能出现在下一期哦')
    }else{
        $('#right').html('您选择的明星很可能出现在下一期哦')
        $('#tip').html('快去围观刘惜君为触宝打call吧')
    }

    


    $('input').click(function(){
       _hmt.push(['_trackEvent', "call", "callClickShare"]);
      var share_params = {
         approaches: ["wechat", "timeline"],
         dlg_title:"分享至",
         title:"明星为触宝打call啦",
         content:"快来围观吧",
         from: "web_call",
         url: "http://mkt.nuobeiya.cc/test/call-dist/right.html?id=zero",
         keep_org_url: false,
         img_url:"http://mkt.nuobeiya.cc/test/nationday-dist/imgs/midShareIcon.jpg"
     }
     if ( _dialerEnv.jsHandler ||_dialerEnv.iosBridge) {
      shareManager.init(shareManager.DIALOG_TYPE.INAPP, share_params, function(approach) {
                        // _hmt.push(['_trackEvent', _path, "分享" + approach]);
                        if (approach == 'timeline') {
                        	share_params.title = "明星为触宝打call啦!"
                        }
                        var approach = "wechat";
                        _dialerEnv.doShare(approach, share_params, true,
                        	function(share_from, approach, status) {
                        		switch (status) {
                        			case "shareCanceled":
                        			break;
                        			case "shareSucceed":
                        			break;
                        			case "shareFailed":
                        			break;
                        			default:
                        			break;
                        		}
                        	});
                    })
      shareManager.showShare();

  } else{
	    	$('.mask').show()
	    	$('.arrow').show()
           wxshare()
       }

   })


ctrlWidth();
function ctrlWidth() {
  var width=$('.main-wrap').width()+'px',
      height=$('.main-wrap').height()-30+'px';
  
    $('#ideo1').attr({'width':width,'height':height});
  }

});

$('.mask').click(function(){
	$('.mask').hide()
	$('.arrow').hide()
})
function wxshare() {
     var myUrl = encodeURIComponent(location.href.split('#')[0]); //自动获得本网页的url
     $.getJSON('//mkt.cootekinfo.top/market/wechat-sign?url=' + myUrl, function(remoteData) {
       wx.config({
             debug: false, // 开启或关闭调试模式,调用的所有api的返回值会在客户端alert出来
             appId: remoteData.appId, // 必填，公众号的唯一标识
             timestamp: remoteData.timestamp, // 必填，生成签名的时间戳
             nonceStr: remoteData.nonceStr, // 必填，生成签名的随机串
             signature: remoteData.signature, // 必填，签名，见附录1
             jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage'] // 必填，需要使用的JS接口列表
         });
       wx.ready(function(){      
           var wx_share_title = "明星为触宝打call啦";
           var wx_share_desc = "你也一起来吧！";
           var wx_share_link = "http://mkt.nuobeiya.cc/test/call-dist/right.html?id=zero";
           var wx_share_img = "http://mkt.nuobeiya.cc/test/nationday-dist/imgs/midShareIcon.jpg";
           var wx_timeline_title = wx_share_title;
           var wx_timeline_link  = wx_share_link;
           var wx_timeline_img   =wx_share_img ;
           wx.onMenuShareAppMessage({
               title  : wx_share_title,
               desc   : wx_share_desc,
               link   : wx_share_link,
               imgUrl : wx_share_img,
              
              success: function(res){
                      
              },
              cancel: function(res){
                 
              }
          });
           wx.onMenuShareTimeline({
               title   : wx_timeline_title,
               link    : wx_timeline_link,
               imgUrl  : wx_timeline_img,
               success : function(){
                
                },
                cancel: function() {
                   
                } 
            });
       });
        
     });
 }
 
 function getEnvData() {
   _dialerEnv.init(function(params) {
      switch (params["status"]) {
         case _dialerEnv.STATUS.SUCCEED:
				// alet(1)
				break;
				case _dialerEnv.STATUS.LOGGED:
				tel = params.phone.slice(-11);
				// alert(tel)
				break;
				case _dialerEnv.STATUS.FAILED:
				// alert('3')
				break;
				default:
				break;
			}
			/*vueInit();*/
		});
}

