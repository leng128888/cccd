/*

loon

北京汽车
打开app直接获取

*/

var req = $request.headers.Authorization
console.log("Cookie:")
console.log(req)

$notification.post("北京汽车Cookie✅", req, "")
$done({})