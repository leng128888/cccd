
/*

loon

海尔智家 

*/

var accessToken = $request.headers.accessToken
var clientId = $request.headers.clientId
req = accessToken + '#' + clientId
console.log("haierAccount:")
console.log(req)
$notification.post("海尔智家cookie✅", req, "")
$done({}) 