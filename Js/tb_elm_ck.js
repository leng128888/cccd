/*

loon

淘宝   抓网页cookie
饿了么 抓网页cookie

*/



var elmUrl = 'https://h5.ele.me/minisite/pages/my/index'
var tbUrl = 'https://h5api.m.taobao.com/h5/mtop.order.taobao.countv2/1.0/'
var url = $request.url.split('?')[0]
//console.log(url)

var req = $request.headers.Cookie
console.log("Cookie:")
console.log(req)
if (url == elmUrl) {
  $notification.post("饿了吗Cookie✅", req, "")
} else if (url == tbUrl) {
  $notification.post("淘宝Cookie✅", req, "")
}
$done({})
