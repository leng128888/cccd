/*

loon

北京现代
打开 我的-任务墙 获取cookie

*/

var req =$request.headers.token
console.log("Cookie:")
console.log(req)
$notification.post("北京现代Cookie✅",req, "")
$done({})