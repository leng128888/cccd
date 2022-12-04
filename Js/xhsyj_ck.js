
/*

loon

欣和食与家 微信小程序

*/
var req = $request;
var userid = req.url.split("=")[1]
var xtoken = req.headers
console.log("xinhe_data :")
//console.log(userid)
//console.log(xtoken)

for (var key in xtoken) {

  if (key == "X-Amz-Security-Token") {
    var token = xtoken[key]
    //console.log(key)
    //console.log(token)
    var msg = userid + '&' + token
    console.log(msg)
  }
}
$notification.post("欣和食与家cookie✅", msg, "")
$done({}) 
