/*

loon

相宜本草  微信小程序
抓cookie中的ut

*/

var req = $request.headers.Cookie.slice(3)
console.log("ut:")
console.log(req)
$notification.post("相宜本草cookie✅", req, "")
$done({}) 