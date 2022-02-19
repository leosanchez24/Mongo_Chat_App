
const mongo = require('mongodb').MongoClient;
const client = require('socket.io')(4000)

mongo.connect('mongodb+srv://dbUser:mongoPW@cluster0.q876g.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', function(err, db) {
  //const collection = client.db("test").collection("devices");
  if (err){
      throw err;
  }
  console.log('Connected to Mongo!');

  // Connect to socket.io
  client.on('connection', function(socket){
      let chat = db.collection('chats');

      // Create function to send status
      sendStatus = function(s){
          socket.emit('status', s);
      }

      // Get chats from mongo collection
      chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
          if (err){
              throw err;
          }

          // Emit the messages
          socket.emit('output', res);
      });

      // Handle input events
      socket.on('input', function(data){
          let name = data.name;
          let message = data.message;

          // Check for name and message
          if (name == '' || message == ''){
              // Send error status
              sendStatus('Please enter a name and message');
          } else {
              // Insert message into the database
              chat.insert({name: name, message: message}, function(){
                  client.emit('output', [data]);

                  // Send status object
                  sendStatus({
                      message: 'Message sent',
                      clear: true
                  });
              });
          }
      });

      // Handle clear
      socket.on('clear', function(data){
          // Remove all chats from collection
          chat.remove({}, function(){
              // Emit cleared
              socket.emit('cleared');
          })
      });
  });

  // perform actions on the collection object

});
