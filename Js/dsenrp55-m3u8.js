/*

loon

dsenrp55学习网站

*/

var m3u8 = $request.url;
console.log(m3u8);
var sch = $persistentStore.read('Scheme')
console.log(sch);
if (sch == null) {
    var oU = m3u8;
} else {
    var oU = sch + m3u8;
}
console.log(oU);
$notification.post("", "", "打开链接", { 'openUrl': oU })
$done({})











