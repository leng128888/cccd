/*

loon

https://api.nasa.gov/planetary/apod?api_key=
api
hOG6kKaBhfOdtCH5VbELvuoRrJMCmleiMk9NCLVv

*/
var title = 'NASA每日一图'
var api = 'hOG6kKaBhfOdtCH5VbELvuoRrJMCmleiMk9NCLVv'
var nasaurl = 'https://api.nasa.gov/planetary/apod?api_key=' + api
var trans = 'http://translate.google.cn/translate_a/single?client=gtx&dt=t&dj=1&ie=UTF-8&sl=auto&tl=zh_cn&q='



$httpClient.get(nasaurl, function (error, response, data) {
    var obj = JSON.parse(data);
    console.log(obj);
    var picurl = obj.url
    var pichdurl = obj.hdurl
    var subt = obj.title
    var msg = obj.explanation
    console.log(picurl);
    $notification.post(title,
        subt,
        msg,
        {
            'openUrl': pichdurl,
            'mediaUrl': picurl
        })
    //$done({})
});




















