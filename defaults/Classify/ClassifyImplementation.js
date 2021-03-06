// Generated by CoffeeScript 1.3.3
(function() {
  var Classify,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Classify = (function(_super) {

    __extends(Classify, _super);

    function Classify() {
      this.run = __bind(this.run, this);

      this.createOuput = __bind(this.createOuput, this);

      this.getCategories = __bind(this.getCategories, this);

      this.getTweets = __bind(this.getTweets, this);

      this.createCategories = __bind(this.createCategories, this);

      this.init = __bind(this.init, this);
      return Classify.__super__.constructor.apply(this, arguments);
    }

    Classify.prototype.init = function() {
      var _this = this;
      this.categories = [];
      this.maxNum = 1;
      $('body').append($('<form>', {
        id: 'myForm'
      }));
      this.getConfiguration('maxNum', function(error, data) {
        if (!error) {
          _this.maxNum = parseInt(data[0]);
          return _this.getConfiguration('category', _this.getCategories);
        } else {
          return alert("Unable to get the configuration!\n" + error);
        }
      });
    };

    Classify.prototype.createCategories = function() {
      var $element, $option, category, _i, _len, _ref;
      $element = $('<select>', {
        name: 'categories',
        size: this.maxNum === 1 ? 1 : 3,
        multiple: this.maxNum !== 1 ? true : false
      });
      _ref = this.categories;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        category = _ref[_i];
        $option = $('<option>', {
          text: category,
          value: category
        });
        $element.append($option);
      }
      return $element;
    };

    Classify.prototype.getTweets = function(error, json) {
      var $li, $ul, data, index, tweet, _i, _len;
      if (!error) {
        data = json.field['text'];
        $('body').append($('<ul>', {
          id: 'tweetList'
        }));
        $ul = $('#tweetList');
        for (index = _i = 0, _len = data.length; _i < _len; index = ++_i) {
          tweet = data[index];
          $li = $('<li>');
          $li.attr('data-object-id', json.id[index]);
          $li.append(this.createCategories());
          $li.append($('<span>', {
            text: tweet
          }));
          $ul.append($li);
        }
      } else {
        alert('No data retrieved!');
      }
      this.$runBtn = $('<button>', {
        text: 'Send results',
        click: this.run
      });
      $('body').append(this.$runBtn);
    };

    Classify.prototype.getCategories = function(error, json) {
      if (!error) {
        this.categories = json;
        this.getData('text', this.getTweets);
      } else {
        alert('No categories specified');
      }
    };

    Classify.prototype.createOuput = function() {
      var $ul, answers;
      this.storeData('id', parseInt(this.task));
      this.storeData('token', '');
      this.storeData('userId', '');
      answers = [];
      $ul = $('#tweetList');
      $('li', $ul).each(function() {
        var $li, answerObj, categories;
        $li = $(this);
        answerObj = {};
        answerObj['objectId'] = parseInt($li.data('objectId'));
        categories = [];
        $('select option:selected', $li).each(function() {
          return categories.push($(this).val());
        });
        answerObj['categories'] = categories;
        answers.push(answerObj);
      });
      this.storeData('answers', answers);
    };

    Classify.prototype.run = function() {
      var _this = this;
      console.log('Run!');
      this.createOuput();
      this.postData(function(error, data) {
        if (!error) {
          _this.$runBtn.prop('disabled', true);
          return alert('Data sent successfully');
        } else {
          return alert("Unable to post results\n" + error);
        }
      });
    };

    return Classify;

  })(uTask);

  $(function() {
    var CI;
    return CI = new Classify;
  });

}).call(this);
