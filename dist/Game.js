'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Created by LzxHahaha on 2016/10/6.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var STATUS = {
  STOP: 'STOP',
  START: 'START',
  PAUSE: 'PAUSE',
  OVER: 'OVER'
};

var JUMP_DELTA = 5;
var JUMP_MAX_HEIGHT = 53;

var Game = function (_React$Component) {
  _inherits(Game, _React$Component);

  function Game(props) {
    _classCallCheck(this, Game);

    var _this = _possibleConstructorReturn(this, (Game.__proto__ || Object.getPrototypeOf(Game)).call(this, props));

    _this.start = function () {
      if (_this.status === STATUS.START) {
        return;
      }

      _this.status = STATUS.START;
      _this.__setTimer();
      _this.jump();
    };

    _this.pause = function () {
      if (_this.status === STATUS.START) {
        _this.status = STATUS.PAUSE;
        _this.__clearTimer();
      }
    };

    _this.goOn = function () {
      if (_this.status === STATUS.PAUSE) {
        _this.status = STATUS.START;
        _this.__setTimer();
      }
    };

    _this.stop = function () {
      if (_this.status === STATUS.OVER) {
        return;
      }
      _this.status = STATUS.OVER;
      _this.playerStatus = 3;
      _this.__clearTimer();
      _this.__draw();
      _this.__clear();
    };

    _this.restart = function () {
      _this.obstacles = _this.__obstaclesGenerate();
      _this.start();
    };

    _this.jump = function () {
      if (_this.jumpHeight > 2) {
        return;
      }
      _this.jumpDelta = JUMP_DELTA;
      _this.jumpHeight = JUMP_DELTA;
    };

    var imageLoadCount = 0;
    var onImageLoaded = function onImageLoaded() {
      ++imageLoadCount;
      if (imageLoadCount === 3) {
        _this.__draw();
      }
    };

    // 资源文件
    var skyImage = new Image();
    var groundImage = new Image();
    var playerImage = new Image();
    var playerLeftImage = new Image();
    var playerRightImage = new Image();
    var playerDieImage = new Image();
    var obstacleImage = new Image();

    skyImage.onload = onImageLoaded;
    groundImage.onload = onImageLoaded;
    playerImage.onload = onImageLoaded;

    skyImage.src = require('url-loader!./img/cloud.png');
    groundImage.src = require('url-loader!./img/ground.png');
    playerImage.src = require('url-loader!./img/dinosaur.png');
    playerLeftImage.src = require('url-loader!./img/dinosaur_left.png');
    playerRightImage.src = require('url-loader!./img/dinosaur_right.png');
    playerDieImage.src = require('url-loader!./img/dinosaur_die.png');
    obstacleImage.src = require('url-loader!./img/obstacle.png');

    _this.options = _extends({
      fps: 60,
      skySpeed: 40,
      groundSpeed: 100,
      skyImage: skyImage,
      groundImage: groundImage,
      playerImage: [playerImage, playerLeftImage, playerRightImage, playerDieImage],
      obstacleImage: obstacleImage,
      skyOffset: 0,
      groundOffset: 0
    }, _this.props.options);

    _this.status = STATUS.STOP;
    _this.timer = null;
    _this.score = 0;
    _this.highScore = window.localStorage ? window.localStorage['highScore'] || 0 : 0;
    _this.jumpHeight = 0;
    _this.jumpDelta = 0;
    _this.obstaclesBase = 1;
    _this.obstacles = _this.__obstaclesGenerate();
    _this.currentDistance = 0;
    _this.playerStatus = 0;
    return _this;
  }

  _createClass(Game, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      if (window.innerWidth >= 680) {
        this.canvas.width = 680;
      }

      var onSpacePress = function onSpacePress() {
        switch (_this2.status) {
          case STATUS.STOP:
            _this2.start();
            break;
          case STATUS.START:
            _this2.jump();
            break;
          case STATUS.OVER:
            _this2.restart();
            break;
        }
      };

      window.onkeypress = function (e) {
        if (e.key === ' ') {
          onSpacePress();
        }
      };
      this.canvas.parentNode.onclick = onSpacePress;

      window.onblur = this.pause;
      window.onfocus = this.goOn;
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      window.onblur = null;
      window.onfocus = null;
    }
  }, {
    key: '__draw',
    value: function __draw() {
      if (!this.canvas) {
        return;
      }

      var options = this.options;


      var level = Math.min(200, Math.floor(this.score / 100));
      var groundSpeed = (options.groundSpeed + level) / options.fps;
      var skySpeed = options.skySpeed / options.fps;
      var obstacleWidth = options.obstacleImage.width;
      var playerWidth = options.playerImage[0].width;
      var playerHeight = options.playerImage[0].height;

      var ctx = this.canvas.getContext('2d');
      var _canvas = this.canvas;
      var width = _canvas.width;
      var height = _canvas.height;


      ctx.clearRect(0, 0, width, height);
      ctx.save();

      // 云
      this.options.skyOffset = this.options.skyOffset < width ? this.options.skyOffset + skySpeed : this.options.skyOffset - width;
      ctx.translate(-this.options.skyOffset, 0);
      ctx.drawImage(this.options.skyImage, 0, 0);
      ctx.drawImage(this.options.skyImage, this.options.skyImage.width, 0);

      // 地面
      this.options.groundOffset = this.options.groundOffset < width ? this.options.groundOffset + groundSpeed : this.options.groundOffset - width;
      ctx.translate(this.options.skyOffset - this.options.groundOffset, 0);
      ctx.drawImage(this.options.groundImage, 0, 76);
      ctx.drawImage(this.options.groundImage, this.options.groundImage.width, 76);

      // 恐龙
      // 这里已经将坐标还原回左上角
      ctx.translate(this.options.groundOffset, 0);
      ctx.drawImage(this.options.playerImage[this.playerStatus], 80, 64 - this.jumpHeight);
      // 更新跳跃高度/速度
      this.jumpHeight = this.jumpHeight + this.jumpDelta;
      if (this.jumpHeight <= 1) {
        this.jumpHeight = 0;
        this.jumpDelta = 0;
      } else if (this.jumpHeight < JUMP_MAX_HEIGHT && this.jumpDelta > 0) {
        this.jumpDelta = this.jumpHeight * this.jumpHeight * 0.001033 - this.jumpHeight * 0.137 + 5;
      } else if (this.jumpHeight < JUMP_MAX_HEIGHT && this.jumpDelta < 0) {
        // jumpDelta = (jumpHeight * jumpHeight) * 0.00023 - jumpHeight * 0.03 - 4;
      } else if (this.jumpHeight >= JUMP_MAX_HEIGHT) {
        this.jumpDelta = -JUMP_DELTA / 2.7;
      }

      // 分数
      var scoreText = (this.status === STATUS.OVER ? 'GAME OVER  ' : '') + Math.floor(this.score);
      ctx.font = "Bold 18px Arial";
      ctx.textAlign = "right";
      ctx.fillStyle = "#595959";
      ctx.fillText(scoreText, width - 30, 23);
      if (this.status === STATUS.START) {
        this.score += 0.5;
        if (this.score > this.highScore) {
          this.highScore = this.score;
          window.localStorage['highScore'] = this.score;
        }
        this.currentDistance += groundSpeed;
        if (this.score % 4 === 0) {
          this.playerStatus = (this.playerStatus + 1) % 3;
        }
      }
      if (this.highScore) {
        ctx.textAlign = "left";
        ctx.fillText('HIGH  ' + Math.floor(this.highScore), 30, 23);
      }

      // 障碍
      var pop = 0;
      for (var i = 0; i < this.obstacles.length; ++i) {
        if (this.currentDistance >= this.obstacles[i].distance) {
          var offset = width - (this.currentDistance - this.obstacles[i].distance + groundSpeed);
          if (offset > 0) {
            ctx.drawImage(options.obstacleImage, offset, 84);
          } else {
            ++pop;
          }
        } else {
          break;
        }
      }
      for (var _i = 0; _i < pop; ++_i) {
        this.obstacles.shift();
      }
      if (this.obstacles.length < 5) {
        this.obstacles = this.obstacles.concat(this.__obstaclesGenerate());
      }

      // 碰撞检测
      var firstOffset = width - (this.currentDistance - this.obstacles[0].distance + groundSpeed);
      if (90 - obstacleWidth < firstOffset && firstOffset < 60 + playerWidth && 64 - this.jumpHeight + playerHeight > 84) {
        this.stop();
      }

      ctx.restore();
    }
  }, {
    key: '__obstaclesGenerate',
    value: function __obstaclesGenerate() {
      var res = [];
      for (var i = 0; i < 10; ++i) {
        var random = Math.floor(Math.random() * 100) % 60;
        random = (Math.random() * 10 % 2 === 0 ? 1 : -1) * random;
        res.push({
          distance: random + this.obstaclesBase * 200
        });
        ++this.obstaclesBase;
      }
      return res;
    }
  }, {
    key: '__setTimer',
    value: function __setTimer() {
      var _this3 = this;

      this.timer = setInterval(function () {
        return _this3.__draw();
      }, 1000 / this.options.fps);
    }
  }, {
    key: '__clearTimer',
    value: function __clearTimer() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    }
  }, {
    key: '__clear',
    value: function __clear() {
      this.score = 0;
      this.jumpHeight = 0;
      this.currentDistance = 0;
      this.obstacles = [];
      this.obstaclesBase = 1;
      this.playerStatus = 0;
    }
  }, {
    key: 'render',
    value: function render() {
      var _this4 = this;

      return _react2.default.createElement('canvas', { id: 'canvas', ref: function ref(_ref) {
          return _this4.canvas = _ref;
        }, height: 160, width: 340 });
    }
  }]);

  return Game;
}(_react2.default.Component);

exports.default = Game;
;