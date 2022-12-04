/*

loon

新天威旅游  微信小程序
首页中部签到获取cookie

*/

var req = $request.headers;
console.log("xtwly_data :")
for (var key in req) {
  if (key == "user-login-token") {
    var msg = req[key]
    console.log(msg)
  }
}
$notification.post("新天威旅游cookie✅", msg, "")
$done({})
















