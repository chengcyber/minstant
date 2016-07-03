Meteor.methods({
  // save message to db
  saveMsg: function(chatId,content) {
    var curUserId = this.userId;
    var authorName = Meteor.user().profile.username;
    var authorAva = Meteor.user().profile.avatar;
    var chat = Chats.findOne({_id:chatId});
    if (chat){// ok - we have a chat to use
      var msgs = chat.messages; // pull the messages property
      if (!msgs){// no messages yet, create a new array
        msgs = [];
      }
      // is a good idea to insert data straight from the form
      // (i.e. the user) into the database?? certainly not. 
      // push adds the message to the end of the array
      msgs.push({
        text: content,
        authorName: authorName,
        authorAva: authorAva,
        createOn: new Date()
      });
      // put the messages array onto the chat object
      chat.messages = msgs;
      // update the chat object in the database.
      Chats.update(chat._id, chat);
    }
  },
  getChatId: function(otherUserId) {
    // find a chat that has two users that match current user id
    // and the requested user id
    if (!otherUserId) return;
    // console.log(otherUserId);
    var filter = {$or:[
                {user1Id:this.userId, user2Id:otherUserId}, 
                {user2Id:this.userId, user1Id:otherUserId}
                ]};
    var chat = Chats.findOne(filter);
    if (!chat){// no chat matching the filter - need to insert a new one
      chatId = Chats.insert({user1Id:this.userId, user2Id:otherUserId});
    }
    else {// there is a chat going already - use that. 
      chatId = chat._id;
    }
    return chatId;
  }
})
