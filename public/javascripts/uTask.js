(function() {
  var uTask;

  uTask = (function() {

    function uTask() {
      var pathFragments, taskID;
      pathFragments = location.pathname.split('/');
      taskID = pathFragments[2];
      this.task = parseInt(taskID);
      this.url = '/task/' + taskID;
      this.codeUrl = this.url + '/code';
      this.inputUrl = this.url + '/input';
      this.configUrl = this.url + '/configuration';
      this.resultUrl = this.url + '/result';
      this.outputData = {};
      this.init();
    }

    uTask.prototype.getConfiguration = function(name, callback) {
      if (!callback) {
        callback = name;
        name = '*';
      }
      $.ajax({
        url: "" + this.configUrl + "/" + name,
        dataType: 'json',
        error: function(xhr, status, response) {
          return callback(response, {});
        },
        success: function(json) {
          return callback(null, json);
        }
      });
    };

    uTask.prototype.getData = function(config, callback) {
      var id, name;
      var _this = this;
      if (config == null) config = {};
      if (!callback) {
        callback = config;
        config = {};
      }
      if (typeof config === 'string') {
        config = {
          name: config
        };
      }
      name = config.name || '*';
      id = config.id;
      $.ajax({
        url: "" + this.inputUrl + "/" + name,
        dataType: 'json',
        beforeSend: function(xhr) {
          xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        },
        error: function(xhr, status, response) {
          return callback(response, {});
        },
        success: function(json) {
          return callback(null, json);
        }
      });
    };

    uTask.prototype.toggleData = function(name) {
      if (this.outputData[name]) {
        this.removeData(name);
        return false;
      } else {
        this.storeData(name, true);
        return true;
      }
    };

    uTask.prototype.removeData = function(name) {
      delete this.outputData[name];
    };

    uTask.prototype.storeData = function(name, data) {
      this.outputData[name] = data;
    };

    uTask.prototype.postData = function(formData, callback) {
      var _this = this;
      if (!callback) {
        callback = formData;
        formData = void 0;
      }
      $.ajax({
        url: this.resultUrl,
        data: formData || JSON.stringify(this.outputData),
        processData: formData ? false : true,
        contentType: formData ? false : 'application/json; charset=UTF-8',
        dataType: formData ? void 0 : 'json',
        cache: false,
        type: 'POST',
        beforeSend: function(xhr) {
          xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        },
        error: function(jXHR, status, error) {
          callback(error, {});
        },
        success: function(data, status, jXHR) {
          callback(null, data);
        }
      });
    };

    uTask.prototype.sendStatus = function(status) {
      console.log("Sending status: " + status);
    };

    uTask.prototype.init = function() {
      throw new Error("Not implemented");
    };

    uTask.prototype.run = function() {
      throw new Error("Not implemented");
    };

    return uTask;

  })();

  window.uTask = uTask;

}).call(this);
