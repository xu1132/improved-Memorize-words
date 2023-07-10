var me; // 相当于onLoad 里的this
var todo;
var currentO = {}; // 记录当前操作对象的信息，格式{}
var inputText; // 记录输入内容

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'), // 如需尝试获取用户信息可改为false
    actionSheetHidden: true,
    actionSheetItems: ['CET3词汇', 'CET4词汇', 'CET6词汇', '专升本词汇','高职词汇'],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    me = this
  },
 
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户名与头像', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    console.log(e)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  /* 
  点击“选择词库”后执行的函数，
  主要是控制选项的“显示”与“隐藏”
  */
  clickThesaurus: function (e) {
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },
  actionSheetChange: function (e) {
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },
  bindItemTap: function (e) {
    /* 
    此处用来写选择词库的逻辑,
    选了哪个就把哪个词库的id（序号）传给select,
    把词库名传给title
    */
    console.log("选择的词汇库序号："+e.currentTarget.id)
    
    var select = parseInt(e.currentTarget.id);
    wx.setStorageSync('select', select);
    var title = this.data.actionSheetItems[select]
    wx.setStorageSync('title', title)
    console.log(title)
    
    //点击后隐藏菜单
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },
  // 跳转到“关于我们”页面
  goWe:function(){
    wx.navigateTo({
      url: '../../pages/we/we',
   })
  }
})