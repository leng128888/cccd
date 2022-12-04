/*

loon

广汽传祺 微信小程序
打开小程序直接获取

*/

var token = $request.headers.token
console.log("gqcqWxCookie:")
console.log(token)
$notification.post("广汽传祺微信小程序cookie✅", token, "")
$done({}) 