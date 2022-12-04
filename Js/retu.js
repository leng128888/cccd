/*

loon

api.lolicon.app

*/

var r18 = 1;//18禁为1 非为0 2是混合
var retuUrl = "https://api.lolicon.app/setu/v2?r18=" + r18;
$httpClient.get(retuUrl, function (error, response, data) {
  var datas = JSON.parse(data);
  //console.log(datas.data[0]);
  //console.log(datas);
  if (datas) {
    var msg = datas.data[0];
    var title = msg.title;
    var tags = msg.tags;
    //console.log(tags);
    var url = msg.urls.original;
    //console.log(url);
    $notification.post("每日热图🔥", title, tags, { 'openUrl': url, 'mediaUrl': url })
  }
  else {
    $notification.post("获取图片失败", "", "")
  }
  $done({});
});
