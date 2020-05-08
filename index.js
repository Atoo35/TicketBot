const Discord = require('discord.js')
const client = new Discord.Client();
const config = require('./config.json');
const BOATS = require("boats.js")
const Boats = new BOATS("rh7vtY9gvIGJi1OzrHBVorF2gTDVt99c7S76zm0T9DMMmB6Z9KhPFPAGsjY1Hw6bqvnCAagL14XVJ0vgKz8tz2UPsG7NPQvMI0pUSipAjeUR45D5L5Jiuj4gFoJZ5c53LB3zIAzfzB9pIKFVU9Rt1KSKIsE")


var fs = require('fs');



client.on("guildCreate", async (guild) => {
  // This event triggers when the bot joins a guild.
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  var msg=`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!\n Server Count: ${client.guilds.size}`

  const exampleEmbed =new Discord.RichEmbed()
  .setColor('36393E')
  .setAuthor('Ticket Bot',client.user.displayAvatarURL)
  .setDescription(msg)
  client.guilds.get('651670086310035457').channels.get('708245760738721822').send({embed:exampleEmbed})

  Boats.postStats(client.guilds.size, '707141747846676572').then(() => {
      console.log('Successfully updated server count.')
  }).catch((err) => {
      console.error(err)
  })
  client.user.setPresence({ game: { name: `issues in ${client.guilds.size} servers.`,type:"Listening" }, status: 'online' })

});

client.on("guildDelete", async(guild) => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);

  var msg=`I have been removed from: ${guild.name} (id: ${guild.id})!\n Server Count: ${client.guilds.size}`
  const exampleEmbed =new Discord.RichEmbed()
  .setColor('36393E')
  .setAuthor('Ticket Bot',client.user.displayAvatarURL)
  .setDescription(msg)
  client.guilds.get('651670086310035457').channels.get('708245760738721822').send({embed:exampleEmbed})

  Boats.postStats(client.guilds.size, '707141747846676572').then(() => {
      console.log('Successfully updated server count.')
  }).catch((err) => {
      console.error(err)
  })
  client.user.setPresence({ game: { name: `issues in ${client.guilds.size} servers.`,type:"Listening" }, status: 'online' })


});




client.on("ready", () => {

  // This event will run if the bot starts, and logs in, successfully.
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
  Boats.postStats(client.guilds.size, '707141747846676572').then(() => {
      console.log('Successfully updated server count.')
  }).catch((err) => {
      console.error(err)
  })
client.user.setPresence({ game: { name: `issues in ${client.guilds.size} servers.`,type:"Listening" }, status: 'online' })

});

client.on('raw', packet => {
  // We don't want this to run on unrelated packets
  if (!['MESSAGE_REACTION_ADD'].includes(packet.t)) return;
  // Grab the channel to check the message from
  const channel = client.channels.get(packet.d.channel_id);
  // There's no need to emit if the message is cached, because the event will fire anyway for that
  if (channel.messages.has(packet.d.message_id)) return;
  // Since we have confirmed the message is not cached, let's fetch it
  channel.fetchMessage(packet.d.message_id).then(message => {
      // Emojis can have identifiers of name:id format, so we have to account for that case as well
      const emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
      // This gives us the reaction we need to emit the event properly, in top of the message object
      const reaction = message.reactions.get(emoji);
      // Adds the currently reacting user to the reaction's users collection.
      if (reaction) reaction.users.set(packet.d.user_id, client.users.get(packet.d.user_id));
      // Check which type of event it is before emitting
      if (packet.t === 'MESSAGE_REACTION_ADD') {
          client.emit('messageReactionAdd', reaction, client.users.get(packet.d.user_id));
      }
      if (packet.t === 'MESSAGE_REACTION_REMOVE') {
          client.emit('messageReactionRemove', reaction, client.users.get(packet.d.user_id));
      }
  });
});


client.on('messageReactionAdd',async(messageReaction,user)=>{

  if(messageReaction.message.channel.name==='ticket-bot'){
    if(user.bot)
    return
      console.log(messageReaction.emoji.name)
      var server = messageReaction.message.guild;
      var name = user.username;
      if(!messageReaction.message.guild.channels.find(r=>r.name === name.toLowerCase())){
        var channel = await server.createChannel(name,{
              type:'text',
              permissionOverwrites:[
                  {
                      id:messageReaction.message.guild.id,
                      deny:['READ_MESSAGES']
                  },
                  {
                      id:user.id,
                      allow:['READ_MESSAGES','SEND_MESSAGES']
                  },

              ]
          });
          var parent = messageReaction.message.guild.channels.find(r=>r.name === 'Tickets' && r.type==='category')
        channel.setParent(parent.id)
          // var staff=messageReaction.message.guild.roles.find(r=>r.name==="Staff")
          // var admin=messageReaction.message.guild.roles.find(r=>r.name==="Admin")
          messageReaction.message.guild.channels.get(channel.id).send("A Moderator will be here soon to talk to you about the issue you are facing. :D")
      }
  }
  else{
    console.log('not here')
  }
})

client.on('message',async(message)=>{
  if(message.author.bot)return;

  if(message.content==='_close'){

    var parent = await message.guild.channels.find(r=>r.name === 'Tickets' && r.type==='category')
    if(message.channel.parentID != parent.id)
    return;
    if(client.channels.find(c=>c.name==='transcripts')){
    var allMessages=[];
    message.channel.fetchMessages().then((messages)=>{

  messages.forEach((message) => {
        var line=message.author.username+": "+message.content
        allMessages.push(line)

      });

    }).then(()=>{
      message.channel.delete()

    var writeStream = fs.createWriteStream("transcript.txt");
    var i;
    for(i=allMessages.length-1;i>=0;i--){
      writeStream.write(allMessages[i]+"\n")
    }
    var transcriptChannel = message.guild.channels.find(c=>c.name==='transcripts')
    transcriptChannel.send("Transcript for "+message.channel.name,{file:'transcript.txt'})
  })
}
else{
  message.channel.send('The channel `transcripts` doesn\'t exist')
}
  }
  else if(message.content==='_setup'){


          if(!message.guild.channels.find(c=>c.name==='ticket-bot')){
            console.log('here')
            var channel =  await message.guild.createChannel('ticket-bot',{
              type:'text'
            })
            var transcriptChannel =  await message.guild.createChannel('transcripts',{
              type:'text'
            })
            var channelCategory = await message.guild.createChannel('Tickets',{
               type:'category',
             })
            console.log("channel created"+channel.name)
            let ticketEmbed = new Discord.RichEmbed()
          .setTitle(config.title)
          .setDescription(`To create a ticket react with :tickets:`)
          .setColor(config.embedColor)
          .setTimestamp()
          .setFooter(config.footer);
          transcriptChannel.setParent(channelCategory.id)
    client.channels.get(channel.id).send({embed:ticketEmbed}).then((message)=>{message.react('🎟️')});
    message.channel.send('Setup Completed successfully!')
          }
  }
})

client.login(process.env.BOT_TOKEN)
