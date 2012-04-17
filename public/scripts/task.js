(function() {
  var Task;

  Task = (function() {

    function Task(id) {
      this.id = id;
      this.url = "/tasks/" + this.id;
      this.codeUrl = this.url + '/code';
      this.resourcesUrl = this.url + '/resources';
      this.detailsUrl = this.url + '/details/json';
      this.resultUrl = this.url + '/result';
      this.result = null;
      this.init();
    }

    Task.prototype.init = function() {
      var _this = this;
      $.ajax({
        url: this.detailsUrl,
        type: 'get',
        dataType: 'json',
        success: function() {
          console.log('success', arguments);
        },
        error: function() {
          console.log('error', arguments);
        }
      });
    };

    Task.prototype.getCode = function() {
      var _this = this;
      $.ajax({
        url: this.codeUrl,
        type: 'get',
        dataType: 'script',
        success: function() {
          console.log('code success', arguments);
        },
        error: function() {
          console.log('code error', arguments);
        }
      });
    };

    Task.prototype.addScript = function() {};

    Task.prototype.sendResult = function() {
      var method, url;
      url = this.resultUrl;
      method = 'put';
      console.log("sending PUT " + url);
    };

    return Task;

  })();

  window.Task = Task;

}).call(this);
