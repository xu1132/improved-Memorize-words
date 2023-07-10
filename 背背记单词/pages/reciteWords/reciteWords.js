// pages/reciteWords/reciteWords.js
/*
  导入data中的词库列表，词库中列表的名字是大写的CET，
  导入后命名为小写的cet以作区分
*/
var cet3 = require("../../data/CET3.js");
var cet4 = require("../../data/CET4.js");
var cet6 = require("../../data/CET6.js");
var gz = require("../../data/gaozhi.js");
var sb = require("../../data/shengben.js");

// 导入发音接口即“InnerAudioContext”API
const innerAudioContext = wx.createInnerAudioContext();

Page({
  // 当前的数据名称及数据类型
  data: {
    // 发音，音频数据
    audiosrc: 'http://dict.youdao.com/dictvoice?type=1&audio=play',
    audioDuration: 0,

    /* 词汇内容 */
    content: " ", //单词的拼写
    pron: " ", //单词的音标
    definition: " ", //单词的释义
    show: false, //是否显示释义

    /* 页面完成情况判断 */
    isNull: true, //完成值，用来判断显示完成页面还是未完成页面
    isNullList: [true, true, true, true, true], //完成值列表，用来存放不同词库的完成值

    select: 0, //选择值，接收my.js通过缓存传过来的选择，用来切换词库

    /*上方部分 */
    title: "CET3词汇", //标题 如“CET3词汇”
    wordQuantity: 20, //“每日学习量”，通过绑定函数来传值

    nowGroup: [], //以当前wordQuantity来决定的数组，每wordQuantity个为一组作为nowGroup的一个元素
    nowWordList: [
      []
    ], //从nowGroup中获取其中一个元素即一组单词
    index: 0, //进度值，nowGroup的索引值，也称词汇库切片进度值
    indexList: [0, 0, 0, 0, 0], //进度值列表，用于存放各个词汇库切片进度值index的列表
    id: 0, //
  },
  /* 
  加载页面时执行的函数
  */
  onLoad: function () {
    console.log('onLoad开始')
    /* 
    接收select和title
    select、title是从my.js传过来的缓存数据
    */
    var select = wx.getStorageSync("select");
    var title = wx.getStorageSync('title');
    // 如果从缓存读取的选择值不为空，则把它存放到data中
    if (select !== "") {
      this.setData({
        select: select,
        title: title
      });
    }
    /*
    读档：
    接收进度值列表indexList，
    (关键)如果接收的数据不为空，则把indexList[this.data.select]赋值给this.data.index
    说明：wxwx.getStorageSync('key')如果索引不到数据则会返回一个空字符串""
    */
    if (wx.getStorageSync('indexList') != "") {
      this.setData({
        indexList: wx.getStorageSync('indexList')
      })
    }
    console.log("进度值列表：" + this.data.indexList);
    this.setData({
      index: this.data.indexList[this.data.select],
      isNull: this.data.isNullList[this.data.select]
    })
    // 读档，读取完成值，来决定是否显示“下一组”页面
    if (wx.getStorageSync('isNullList') !== "") {
      this.setData({
        isNullList: wx.getStorageSync('isNullList')
      })
      console.log(wx.getStorageSync('isNullList'))
    }

    /*调用cut函数切分词库 */
    this.cut();
    console.log("onLoad结束");
  },
  /* 
  刷新页面时执行的函数
  */
  onShow: function () {
    console.log('onshow开始')
    /* 
    接收select和title
    select、title是从my.js传过来的缓存数据
    */
    var select = wx.getStorageSync("select");
    var title = wx.getStorageSync('title');
    /*切换词库： 
    在赋值给data中的select之前，先做一个判断。
    如果是二者不同则为切换词库，则需要重新分切片即调用切片算法函数  
    */
    console.log("从缓存读取的select是否为空：")
    console.log(select == "");
    /* 判断缓存中的选择值是否与data中的一致，
    若不一致则更新data中的选择值，
    接着调用cut函数根据选择值重新切分新的词库 
    */
    if (this.data.select != select && select !== "") {
      /* 把缓存中的选择值select和标题值title存入data中 */
      if (select !== "") {
        this.setData({
          select: select,
          title: title
        });
      }
      // 接着调用cut函数
      this.cut();
    }

    /* 在onShow中给index赋值 */
    console.log("进度值列表：" + this.data.indexList);
    console.log("完成值：")
    console.log(this.data.isNull);
    this.setData({
      index: this.data.indexList[this.data.select],
      isNull: this.data.isNullList[this.data.select]
    })

    /* 
    注意这里会给nowWordList重新赋值，
    根据index来确定nowWordList
    */
    this.setData({
      nowWordList: this.data.nowGroup[this.data.index]
    })

    /* 
    判断是显示完成页面还是未完成页面 
    即判断nowWordList.length是否为0
    如果为0则显示完成页面
    (重点)因为前面已经给nowWordList重新赋值，所以在nowGroup被切完之前nowWordList的值不会为零
    */
    //  console.log(this.data.nowGroup[0]);
    if (this.data.nowWordList.length === 0 && this.data.nowGroup.length != 0) {
      var isNull = 'isNullList[' + this.data.select + ']'
      this.setData({
        [isNull]: false
      })
      // 把完成值列表放入缓存
      wx.setStorageSync('isNullList', this.data.isNullList);
      console.log(this.data.isNullList);
    } else {
      /* 
        词汇刷新
      */
      var id = Math.floor(Math.random() * this.data.nowWordList.length);
      var word = this.data.nowWordList[id];
      console.log("当前显示的单词：");
      console.log(word[0]);

      this.setData({
        content: word[0].content,
        definition: word[0].definition,
        pron: word[0].pron,
        show: false,
        id: id,
        audiosrc: 'http://dict.youdao.com/dictvoice?type=1&audio=' + word[0].content, // 更新音频src
      });
      // 发音API初始化
      this.Initialization();
      //清空word列表
      word = [];
    }
    console.log('onshow结束')
  },

  /* 
  切分某个词库的算法，把大词库切分成等量的切片
  */
  cut() {
    console.log("cut函数执行前词库切片量为" + this.data.nowGroup.length);
    console.log("cut函数开始");

    // 先把data中的nowGroup和nowWordList置空
    this.setData({
      nowGroup: [],
      nowWordList: []
    })
    /*接着再把当前词库切片：
    然后把切片放入this.data.nowGroup。 
    判断select：
    如果为0则是CET3词汇,
    如果为1则是CET4词汇,
    如果为2则是CET6词汇,
    如果为3则是专升本词汇。
    */

    if (this.data.select === 0) {
      /* 
        单词记忆算法1.0
        给CET3词汇按照“每日学习量”分组
      */
      var result2 = []; //新建一个二维数组
      var result3 = []; //新建一个三维数组
      var count = 1.0 * cet3.CET3.length / this.data.wordQuantity;
      //第一层循环对应三维数组
      for (var i = 0; i < count; i++) {
        //第二层循环对应二维数组
        for (var g = 0; g < this.data.wordQuantity; g++) {
          result2[g] = cet3.CET3.slice(i * this.data.wordQuantity + g, (i * this.data.wordQuantity + g) + 1);
          /* 
          result[i] = list.CET3.slice(i*this.data.wordQuantity+g, (i*this.data.wordQuantity+g)+1);
          list.CET3.slice(i*this.data.wordQuantity+g, (i*this.data.wordQuantity+g)+1)返回的是一个二维数组，这个二维数组是这样的[{xx,xx}]
          "i*this.wordQuantity"为某一组词汇的起点，
          “i*this.wordQuantity+g”是当前组中的位置，
          */
        }
        // 把包含20个单词的二维数组result2放入三维数组result3
        result3[i] = result2;
        // 把二维数组result2置空
        result2 = []
      }
      // 把三维数组赋值给data中的nowGroup，之后把三维数组result3置空
      this.setData({
        nowGroup: result3
      })
      result3 = []
    } else if (this.data.select === 1) {

      /* 
        给词汇按照“每日学习量”分组, “单词记忆1.0算法”
      */
      var result2 = []; //新建一个二维数组
      var result3 = []; //新建一个三维数组
      var count = 1.0 * cet4.CET4.length / this.data.wordQuantity;
      //第一层循环对应二维数组的第一层
      for (var i = 0; i < count; i++) {
        //第二层循环对应二维数组的第二层
        for (var g = 0; g < this.data.wordQuantity; g++) {
          result2[g] = cet4.CET4.slice(i * this.data.wordQuantity + g, (i * this.data.wordQuantity + g) + 1);
          /* 
          "i*this.wordQuantity"为某一组词汇的起点，
          “i*this.wordQuantity+g”是当前组中的位置，
          */
        }
        // 把包含20个单词的二维数组result2放入三维数组result3
        result3[i] = result2;
        // 把二维数组result2置空
        result2 = []
      }
      // 把三维数组赋值给data中的nowGroup，之后把三维数组result3置空
      this.setData({
        nowGroup: result3
      })
      result3 = []
    } else if (this.data.select === 2) {

      /* 
        给词汇按照“每日学习量”分组, “单词记忆1.0算法”
      */
      var result2 = []; //新建一个二维数组
      var result3 = []; //新建一个三维数组
      var count = 1.0 * cet6.CET6.length / this.data.wordQuantity;
      //第一层循环对应二维数组的第一层
      for (var i = 0; i < count; i++) {
        //第二层循环对应二维数组的第二层
        for (var g = 0; g < this.data.wordQuantity; g++) {
          result2[g] = cet6.CET6.slice(i * this.data.wordQuantity + g, (i * this.data.wordQuantity + g) + 1);
          /* 
          "i*this.wordQuantity"为某一组词汇的起点，
          “i*this.wordQuantity+g”是当前组中的位置，
          */
        }
        // 把包含20个单词的二维数组result2放入三维数组result3
        result3[i] = result2;
        // 把二维数组result2置空
        result2 = []
      }
      // 把三维数组赋值给data中的nowGroup，之后把三维数组result3置空
      this.setData({
        nowGroup: result3
      })
      result3 = []

    } else if (this.data.select === 3) {

      /* 
        给词汇按照“每日学习量”分组, “单词记忆1.0算法”
      */
      var result2 = []; //新建一个二维数组
      var result3 = []; //新建一个三维数组
      var count = 1.0 * sb.SB.length / this.data.wordQuantity;
      //第一层循环对应二维数组的第一层
      for (var i = 0; i < count; i++) {
        //第二层循环对应二维数组的第二层
        for (var g = 0; g < this.data.wordQuantity; g++) {
          result2[g] = sb.SB.slice(i * this.data.wordQuantity + g, (i * this.data.wordQuantity + g) + 1);
          /* 
          "i*this.wordQuantity"为某一组词汇的起点，
          “i*this.wordQuantity+g”是当前组中的位置，
          */
        }
        // 把包含20个单词的二维数组result2放入三维数组result3
        result3[i] = result2;
        // 把二维数组result2置空
        result2 = []
      }
      // 把三维数组赋值给data中的nowGroup，之后把三维数组result3置空
      this.setData({
        nowGroup: result3
      })
      result3 = []

    } else if (this.data.select === 4) {

      /* 
        给词汇按照“每日学习量”分组, “单词记忆1.0算法”
      */
      var result2 = []; //新建一个二维数组
      var result3 = []; //新建一个三维数组
      var count = 1.0 * gz.GZ.length / this.data.wordQuantity;
      //第一层循环对应二维数组的第一层
      for (var i = 0; i < count; i++) {
        //第二层循环对应二维数组的第二层
        for (var g = 0; g < this.data.wordQuantity; g++) {
          result2[g] = gz.GZ.slice(i * this.data.wordQuantity + g, (i * this.data.wordQuantity + g) + 1);
          /* 
          "i*this.wordQuantity"为某一组词汇的起点，
          “i*this.wordQuantity+g”是当前组中的位置，
          */
        }
        // 把包含20个单词的二维数组result2放入三维数组result3
        result3[i] = result2;
        // 把二维数组result2置空
        result2 = []
      }
      // 把三维数组赋值给data中的nowGroup，之后把三维数组result3置空
      this.setData({
        nowGroup: result3
      })
      result3 = []
    }
    console.log("cut函数结束");
    console.log("cut函数执行后词库切片量为" + this.data.nowGroup.length);
  },

  //初始化播放器，获取duration
  Initialization() {
    var t = this;
    //设置src
    innerAudioContext.src = this.data.audiosrc;
    //运行一次
    innerAudioContext.onCanplay(() => {
      //初始化duration
      innerAudioContext.duration
      setTimeout(function () {
        //延时获取音频真正的duration
        var duration = innerAudioContext.duration;
        var min = parseInt(duration / 60);
        var sec = parseInt(duration % 60);
        if (min.toString().length == 1) {
          min = `0${min}`;
        }
        if (sec.toString().length == 1) {
          sec = `0${sec}`;
        }
        t.setData({
          audioDuration: innerAudioContext.duration,
          showTime2: `${min}:${sec}`
        });
      }, 1000)
    })
  },
  //播放按钮
  playAudio() {
    innerAudioContext.play();
  },
  /* 下拉刷新时执行的函数 */
  onPullDownRefresh: function () {
    wx.reLaunch({
      url: 'reciteWords'
    })
    wx.stopPullDownRefresh()
  },
  /* 
  点击“点击此处显示答案”后执行的函数
  */
  show: function () {
    this.setData({
      show: true
    })
    innerAudioContext.play();
  },

  /* 
  点击模糊后执行的函数
  */
  next: function () {
    var data = {
      word: this.data.any
    }
    this.onShow(data); //
  },

  /* 
  点击认识后执行的函数
  */
  know: function (e) {
    /* 
      删除这里也要做限制，要根据“每日学习量”来删除其中的词汇
    */
    this.data.nowWordList.splice(this.data.id, 1)
    if (this.data.nowWordList.length === 0) {
      /* 改写完成值 */
      //把完成值放入完成值列表
      var isNull = 'isNullList[' + this.data.select + ']'
      this.setData({
        [isNull]: false
      })
      //把完成值列表中对应值赋给完成值
      this.setData({
        isNull: this.data.isNullList[this.data.select]
      })
      // 把完成值列表放入缓存
      wx.setStorageSync('isNullList', this.data.isNullList);
      console.log(this.data.isNullList);
    } else {
      this.onShow(); //
    }
  },

  // 点击下一组学习后执行的函数
  nextGroup: function () {
    var isNull = 'isNullList[' + this.data.select + ']'
    this.setData({
      [isNull]: true,
      index: this.data.index + 1 //点击“下一组学习”之后index加1，跳到下一组词汇
    })
    // 把完成值列表放入缓存
    wx.setStorageSync('isNullList', this.data.isNullList);
    console.log(this.data.isNullList);
    /* 
    存档，将索引值index和完成状态isNull存档,
    先将index存入indexList，再把进度值列表indexList存入缓存
    */
    // 将index存入indexList,以下4行方法取自网络
    var index = 'indexList[' + this.data.select + ']'
    this.setData({
      [index]: this.data.index
    })
    console.log(this.data.indexList);
    // 把进度值列表放入缓存
    wx.setStorageSync('indexList', this.data.indexList);
    // 把完成值列表放入缓存
    wx.setStorageSync('isNullList', this.data.isNullList);
    this.onShow()
  }
})