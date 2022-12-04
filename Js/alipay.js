/*

loon

支付宝蚂蚁森林收能量

*/

var title = "支付宝收能量🌲🌲🌲";
var scheme = 'alipay://platformapi/startapp?appId=60000002';

var url = "https://dict.youdao.com/infoline/style/cardList?mode=publish&client=mobile&style=daily&size=2"
$httpClient.get(url, function (error, response, data) {
    //console.log(response);
    //console.log(data);
    var obj = JSON.parse(data);
    //console.log(obj[0].summary);
    var subtitle = obj[0].title;
    var message = obj[0].summary;
    var imageUrl = obj[1].image[0];
    console.log(imageUrl);
    $notification.post(title,
        subtitle,
        message,
        {
            'openUrl': scheme,
            'mediaUrl': imageUrl
        })
    $done({})
});