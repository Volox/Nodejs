
  $(function() {
    var $tags, $timestamps, $video;
    $video = $('#video');
    $timestamps = $('#timestamps');
    $tags = $('#tags li');
    $tags.click(function() {
      var $li, $tag, id, percTime, tag, tagId, time;
      tag = $(this).text();
      time = $video[0].currentTime;
      percTime = parseInt(time / $video[0].duration * 100);
      id = "time_" + percTime;
      $li = $("#" + id);
      if ($li.length === 0) {
        $li = $('<li>', {
          id: "time_" + percTime
        });
        $li.css('left', "" + percTime + "%");
        $li.append('<div></div>');
        $timestamps.append($li);
      }
      tagId = "" + id + "_tag_" + tag;
      $tag = $("#" + tagId, $li);
      if ($tag.length === 0) {
        $tag = $('<span>', {
          text: "" + tag,
          id: tagId
        });
        $('div', $li).append($tag);
      }
    });
    $video.mouseenter(function() {
      this.play();
    });
    return $video.mouseleave(function() {
      this.pause();
    });
  });
