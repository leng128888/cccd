/*

loon

http://ovooa.com/API/wyrp/api.php

*/


var title = "网抑云时间🎧🎧🎧";
var url = "http://ovooa.com/API/wyrp/api.php";
$httpClient.get(url, function (error, response, data) {
  var datas = JSON.parse(data);
  //console.log(data);
  var msg = datas.data;
  console.log(msg);
  var subTitle = msg.name + msg.Music + msg.Nick;
  var content = msg.Content;
  var pic = msg.Picture;
  var media = msg.Url;
  console.log(subTitle);
  console.log(pic);
  $notification.post(title, subTitle, content, { 'openUrl': media, 'mediaUrl': pic })
  $done({})
});



















