/*

loon

乐事心动社会员专区  微信小程序

*/
var req = $request
var memberId = req.url.split('=')[1]
var Authorization = req.headers.Authorization
var msg = Authorization + '&' + memberId
$.setdata(msg,
    'tls_data');
console.log("tls_data:")
console.log(msg)
$notification.post("乐事心动社会员专区cookie✅", msg, "")
$done({})

