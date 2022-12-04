/*

loon

美团外卖

*/
var req = $request.headers.Cookie.split(';')
console.log("meituanCookie:")
console.log(req)
$notification.post("美团外卖cookie✅", req, "")
$done({})