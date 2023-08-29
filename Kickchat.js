var chat_users=[];
var chatdata=[];
var chat_commands=[
    {"name":"toto", "description":"debug command","command":"!toto","args":[ {"name":"arg1","default":0,"min":0,"max":100}, {"name":"arg1","default":"vide"}],"triggers":[] },
    {"name":"banzai", "description":"banzai command","command":"!BANZAI","args":[ ],"triggers":[["banzai"]] },
];
keywords=[
    {'keyword':'dark','color':  0xFF000000,'moods':['dark','hard'],"triggers":[]},
    {'keyword':'black','color': 0xFF000000,'moods':['dark','hard'],"triggers":[]},
    {'keyword':'white','color': 0xFFFFFFFF,'moods':['anger','hard'],"triggers":[]},
    {'keyword':'red','color':   0xFFFF0000,'moods':['anger','hard'],"triggers":[]},
    {'keyword':'green','color': 0xFF00FF00,'moods':['calm','hot'],"triggers":[]},
    {'keyword':'blue','color':  0xFF0000FF,'moods':['calm','cold'],"triggers":[]},
    {'keyword':'yellow','color':0xFFFFFF00,'moods':['calm','cold'],"triggers":[]},
    {'keyword':'orange','color':0xFFFF7F00,'moods':['calm','cold'],"triggers":[]},

    {'keyword':'sombre','color':  0xFF000000,'moods':['dark','hard'],"triggers":[]},
    {'keyword':'noir','color': 0xFF000000,'moods':['dark','hard'],"triggers":[]},
    {'keyword':'blanc','color': 0xFFFFFFFF,'moods':['anger','hard'],"triggers":[]},
    {'keyword':'rouge','color':   0xFFFF0000,'moods':['anger','hard'],"triggers":[]},
    {'keyword':'vert','color': 0xFF00FF00,'moods':['calm','hot'],"triggers":[]},
    {'keyword':'bleu','color':  0xFF0000FF,'moods':['calm','cold'],"triggers":[]},
    {'keyword':'jaune','color':0xFFFFFF00,'moods':['calm','cold'],"triggers":[]},
    {'keyword':'orange','color':0xFFFF7F00,'moods':['calm','cold'],"triggers":[]},
];
/* 	--------------------------------------------------------------------------------------------------------------
										MODULE RELATED FUNCTIONS
	--------------------------------------------------------------------------------------------------------------*/
function init()
{
    script.log("INIT Kick chat module");    
	local.values.lastPseudoMessage.set("");
	local.values.lastMessage.set("");
    root.modules.kickChat.scripts.kickchat.updateRate.set(1);
    root.modules.kickChat.parameters.debugUsername.set("debug");
    root.modules.kickChat.parameters.debugMessage.set("test ");
}

function GET_request(type)
{
    channel_id=root.modules.kickChat.parameters.channelID.get();
    channel_name=root.modules.kickChat.parameters.channelName.get();

    if (type == 'INFO' && channel_name != "")
    {
        local.sendGET(root.modules.kickChat.parameters.baseAddress.get()+root.modules.kickChat.parameters.channelName.get());
    }
    if (type == 'CHAT' && channel_id != "" && channel_id != undefined)
    {
        local.sendGET(root.modules.kickChat.parameters.baseAddress.get()+root.modules.kickChat.parameters.channelID.get() + "/messages");
    }
}

function update()
{
    GET_request('INFO');
    GET_request('CHAT');    
}

function moduleParameterChanged(param)
{
	if(param.name == "baseAddress") {
		
	}
    if(param.name == "channelName") {
        script.log(param.name+ ' has changed');
        GET_request('INFO');
        
    }
    if(param.name == "triggerDebug") {
        chat_debug_payload=root.modules.kickChat.parameters.debugMessage.get();
        chat_debug_user=root.modules.kickChat.parameters.debugUsername.get();
        message={"id":"1691230968018087","chat_id":912446,"user_id":3189709,
                 "content":chat_debug_payload,"type":"message","metadata":null,"created_at":"2023-08-05T10:22:48Z",
                 "sender":{"id":3189709,"slug":chat_debug_user,"username":chat_debug_user,"identity":{"color":"#B9D6F6","badges":[{"type":"subscriber","text":"Subscriber","count":2,"active":true}]}}};
        script.log(message.created_at + "  ||  " + message.sender.username +"  ||  " +message.content);                    
        local.values.lastPseudoMessage.set(message.sender.username);
        local.values.lastMessage.set(message.content);
        local.values.newMessage.trigger();
        analyze_chat_message(message);
        get_chat_command(message.sender.username,message.content);
    }
	
}

function dataEvent(data, requestURL)
{
	//script.log("Data received, request URL :"+requestURL+"\nContent :\n" +data);
    if (requestURL.indexOf("/messages") >=0 )
    {   update_chat_messages(JSON.parse(data));}
    else 
    {   update_channel_info(JSON.parse(data));}
}

/* 	--------------------------------------------------------------------------------------------------------------
										KICK CHAT
	--------------------------------------------------------------------------------------------------------------*/
function update_channel_info(json)
{
    root.modules.kickChat.parameters.channelID.set(''+json.id);
    local.values.streamName.set(json.user.username);
    local.values.viewers.set(parseInt(json.livestream.viewer_count));
    if (local.values.followers.get()<parseInt(json.followers_count)){local.values.newFollower.trigger();}
    local.values.followers.set(parseInt(json.followers_count));
    local.values.streamTitle.set(json.livestream.session_title);
    if (json.livestream.is_live==1) {local.values.streamLive.set(true);}
    else {local.values.streamLive.set(false);}

}

function get_chat_messages(json)
{  
    messages=json.data.messages;   
    if (messages != undefined) 
        {
            //script.log("Number of chat messages : " + messages.length);
            out_messages=[];
            for(var i = 0; i < messages.length; i++)
                {
                    out_messages.push(messages[messages.length-1-i]);
                }
        } 
    else {
        script.log("Error : property data.messages of input JSON data not defined");
    }
    return out_messages;    
}

function update_chat_messages(json)
{
        result=get_chat_messages(json);       
        if (result != undefined) 
        {
            var lastIndex=0;
            if (chatdata.length == 0)
            {     chatdata=result;}
            else if (result[result.length-1].created_at!=chatdata[chatdata.length-1].created_at)
            {
                for(var i = 0; i < result.length; i++)
                {
                    if (result[i].created_at==chatdata[chatdata.length-1].created_at)
                    {
                        lastIndex=i;
                        break;
                    }
                }
                chatdata=result;
            } 
            else 
            {
                lastIndex=chatdata.length-1;
            }
            for(var i = lastIndex+1; i < chatdata.length; i++)
                {                           
                    message=chatdata[i];
                    script.log(message.created_at + "  ||  " + message.sender.username +"  ||  " +message.content);                    
                    local.values.lastPseudoMessage.set(message.sender.username);
                    local.values.lastMessage.set(message.content);
                    local.values.newMessage.trigger();
                    analyze_chat_message(message);
                    get_chat_command(message.sender.username,message.content);
                }   
        }
}

function get_events(trigger,user,chat_message)
{
    local.values.eventName.set(trigger[0]);
    local.values.eventTrigger.trigger();
    script.log("Event " + trigger[0] + " triggered");    
}

function get_chat_command(user,chat_message)
{
    if (chat_message.indexOf("!") >= 0)
        {
            command=chat_message.substring(chat_message.indexOf("!"),chat_message.length).trim();
            command_array=command.split(" ");
            if (command_array.length>0)
                {
                    var args=[];
                    var command=command_array[0];
                    for(var i = 1; i < command_array.length; i++) {args.push(command_array[i]);}
                    for(var i = 0; i < chat_commands.length; i++) {
                        if (chat_commands[i].command == command && args.length == chat_commands[i].args.length)
                            {
                                script.log("user : "+ user + ", command : " + command + ", args : " + args.join(", ")); 
                                for(var j = 0; j < chat_commands[i].triggers.length; j++)
                                {
                                    get_events(chat_commands[i].triggers[j],user,chat_message);
                                }
                            }
                    }                   
                }        
        }
}


function count_string(text,string)
{
    count=0;
    while(text.indexOf(string)>=0)
    {
      count++;
      text=text.substring(text.indexOf(string)+string.length,text.length);
    }
    return count;
}

function detect_emotes(text)
{
    var emotes=[];
    while(text.indexOf("[emote:")>=0)
    {
        if (text.indexOf("[emote:")>=0 && text.indexOf("]")>text.indexOf("[emote:") )
        {
            
            if (count_string(text.substring(text.indexOf("[emote"),text.indexOf("]")),":") == 2 )
            {   //[emote:39274:NotLikEDuc]
                emote_string=text.substring( text.indexOf("[emote"),text.indexOf("]")+1) ;              
                var sub1=emote_string.substring(emote_string.indexOf(":")+1,emote_string.length-1);
                emote_id=sub1.substring(1,sub1.indexOf(":"));                    
                emote_name=emote_string.substring(emote_string.indexOf(emote_id)+emote_id.length+1,emote_string.indexOf("]")-1);
                emote_url="https://files.kick.com/emotes/"+emote_id+"/fullsize";
                emotes.push({'name':emote_name,"id":emote_id,"raw":emote_string,"url":emote_url});
            }
        }
        text=text.substring(text.indexOf("[emote:")+1,text.length-1);
    }
    return emotes;   
}

function remove_emotes(text,emotes)
{
    for(var i = 0; i < emotes.length; i++)
    {
        text=text.replace(emotes[i].raw,'');
    }
    return text;
}

function detect_keywords(text)
{
    detected_keywords=[];
    for(var i = 0; i < keywords.length; i++)
    {
       if (text.indexOf(keywords[i].keyword)>=0)
       {          
            detected_keywords.push(keywords[i]);
        } 
    }
    return detected_keywords;
}

function text_to_color(text)
{
    kw=detect_keywords(text);
    
    if (kw != [])
    {
       return keywords_to_color(kw); 
    }
    else 
    {
        return 0xFFD399FF;
    }
}

function keywords_to_color(keywords)
{
    return keywords[0].color;
}

function emotes_to_color(emotes)
{
    return 0xFFD399FF;
}

function moods_to_color(moods)
{   
    return [0xFF0000FF,0xFFFF0000,0xFF00FF00];
}

function chat_count_users(sender)
{
    user_found=false;
    for(var i = 0; i < chat_users.length; i++)
    {
        if (chat_users[i].username == sender.username)
        {
            user_found=true;
            break;
        }
    }
    if (user_found == false)
    {
        chat_users.push(sender);
        userlist="";
        for(var i = 0; i < chat_users.length; i++)
        {
            userlist+=chat_users[i].username+" ";
        }
        local.values.chatUsers.set(userlist);
        script.log("Chat users : " + chat_users.length);
    }
}

function analyze_chat_message(message)
{

    chat_count_users(message.sender);

    user_color='0x'+message.sender.identity.color.substring(1,message.sender.identity.color.length);
    color=parseInt(user_color)+parseInt("0xff000000");
    user_badges=message.sender.identity.badges;
    user_name=message.sender.username;
    user_text=message.content;
    emotes=detect_emotes(user_text);
    user_text=remove_emotes(user_text,emotes);
    detected_keywords=detect_keywords(user_text);
    moods=[];
    var moodcolors=moods_to_color(moods);

    if (emotes.length>0)
    {   
        
        for(var i = 0; i < emotes.length; i++) 
        {
            local.values.lastEmote.set(emotes[i].url);
            //local.values.emoteColor.set(emotes_to_color(emotes[i]));
            local.values.emoteTrigger.trigger();
        }
        local.values.lastPseudoEmote.set(user_name);
         
    }
    local.values.userColor.set(color);
    local.values.textColor.set(text_to_color(user_text));
    mood_colors=moods_to_color(moods);
    local.values.moodColor1.set(mood_colors[0]);
    local.values.moodColor2.set(mood_colors[1]);
    local.values.moodColor3.set(mood_colors[2]);         
}

function RemoveValues() {
	local.values.lastMessage.set("");
	local.values.lastPseudoMessage.set("");
}

function Commande(data) {
    script.log(data);
	//local.send(data);
}

