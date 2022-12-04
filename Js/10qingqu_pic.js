/*

loon

看图片只启动 pic
看视频只启动 video*2

http-response http:\/\/www\.10qingqu.com\/api_beta1_2\/api.php script-path=https://raw.githubusercontent.com/fishdown/Ggsddu/master/Js/10qingqu_pic.js, requires-body=true, timeout=10, tag=10情趣-pic
http-response http:\/\/www\.10qingqu.com\/api_beta1_2\/api.php script-path=https://raw.githubusercontent.com/fishdown/Ggsddu/master/Js/10qingqu_res_video.js, requires-body=true, timeout=10,tag=10情趣-video-res
http-request http:\/\/www\.10qingqu.com\/api_beta1_2\/api.php script-path=https://raw.githubusercontent.com/fishdown/Ggsddu/master/Js/10qingqu_req_video.js, requires-body=true, timeout=10,tag=10情趣-video-req

hostname = www.10qingqu.com

*/

var body = $response.body.replace(/"money":"\d+"/, '"money":"0"')
$done({ body });
