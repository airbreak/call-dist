$(function(){
	$('.commen').click(function(){
		_hmt.push(['_trackEvent', "call", "callClick"]);
		var id=$(this).attr('id')
		console.log(id)
		$(location).attr('href', 'right.html?id='+id);
		
		
	})

})