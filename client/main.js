
Meteor.subscribe("chats");
Meteor.subscribe("users");
Meteor.subscribe("emojis");

// set up the main template the the router will use to build pages
Router.configure({
layoutTemplate: 'ApplicationLayout'
});
// specify the top level route, the page users see when they arrive at the site
Router.route('/', function () {
  console.log("rendering root /");
  this.render("navbar", {to:"header"});
  this.render("lobby_page", {to:"main"});  
});

// specify a route that allows the current user to chat to another users
Router.route('/chat/:_id', function () {
  // the user they want to chat to has id equal to 
  // the id sent in after /chat/... 
  var otherUserId = this.params._id;
  // Session.set("otherUserId", this.params._id);
  // and the requested user id
  // console.log(otherUserId);

  // var filter = {$or:[
  //   {user1Id:otherUserId},
  //   {user2Id:otherUserId}
  // ]}
  // var chat = Chats.findOne(filter);
  // console.log("chat");
  // console.log(chat);

  // if (!chat){// no chat matching the filter - need to insert a new one
  //   chatId = Chats.insert({user1Id:Meteor.userId(), user2Id:otherUserId});
  // }
  // else {// there is a chat going already - use that.
  //   chatId = chat._id;
  // }
  Meteor.call("getChatId", otherUserId, function(err, res) {
    if (err) {
      console.log(err);
    } else {
      chatId = res;
      // console.log("chatId:");
      // console.log(chatId);
      if (chatId){// looking good, save the id to the session
        Session.set("chatId",chatId);
      }
    }
  });

  this.render("navbar", {to:"header"});
  this.render("chat_page", {
    to:"main"
  });
});


///
// helper functions 
/// 
Template.available_user_list.helpers({
users:function(){
  var curUserId = Meteor.userId();
  if (curUserId) {
    return Meteor.users.find({_id:{$ne : curUserId}}, {sort: {profile : 1}});
  } else {
    return Meteor.users.find({},{sort: {profile: 1}}); 
  }
}
})
Template.available_user.helpers({
getUsername:function(userId){
  user = Meteor.users.findOne({_id:userId});
  return user.profile.username;
}, 
isMyUser:function(userId){
  if (userId == Meteor.userId()){
    return true;
  }
  else {
    return false;
  }
}
})

Template.navbar.helpers({
  isLogin: function() {
    return !!Meteor.user();
  },
  curUserAva: function(){
    return Meteor.users.findOne({_id:Meteor.userId()}).profile.avatar;
  }
})

Template.chat_page.helpers({
messages:function(){
  var chat = Chats.findOne({_id:Session.get("chatId")});
  return chat?chat.messages:[];
}
})

Template.chat_message.helpers({
  getUserAvaById: function(UID) {
    return Meteor.users.findOne({_id: UID}).profile.avatar;
  },
  getUserName: function(UID) {
    return Meteor.users.findOne({_id: UID}).profile.username;
  }
})

/////
// Events
/////

Template.chat_page.events({
  // this event fires when the user sends a message on the chat page
  'submit .js-send-chat':function(event){
    // stop the form from triggering a page reload
    event.preventDefault();
    // see if we can find a chat object in the database
    // to which we'll add the message
    var content = event.target.chat.value;
    Meteor.call("saveMsg",Session.get("chatId"),content,function(err,res){
      if(!err) {
        // reset the form
        event.target.chat.value = "";
        console.log("saveMsg return:"+chatId);
      }
    });
  }
})

// Template.available_user.events({
//   "click .js-set-otheruser" : function(event) {
//     // event.preventDefault();
//     console.log(this._id);
//     Session.set("otheruser", this._id);
//   }
// })