"use strict";

const Slimbot = require('slimbot');
const token = '771213330:AAFRE4O6sD_mjD1j6YR2lm2qZEtrzMGXixs';
const path  =  require("path");
const env  =  require("dotenv").config();
const git = require('simple-git/promise');
const command  =  require("./command.json");
const { exec , spawn }   = require('child_process');
const adminId =  process.env.ADMIN_ID;
const bot = new Slimbot(process.env.TOKEN);

try {
	bot.on('message', (msg) => {
	  const chatId = msg.chat.id;
	  ///  run 
	  if (msg.text.substring(0,3).toLowerCase() == "run") {
			let tmp =  msg.text.split("@");
			let dir  =  tmp[1].split(" ").join("")
			let cwd  =  tmp[2];
			for (var i = 0; i < command[0]["list"].length; i++) {
				if (dir == command[0]["list"][i].name) {
					dir  =  path.join(__dirname,command[0]["list"][i]["path"]);
					let main  = exec(`cd  ${dir}  &&  ${cwd}`); 
						main.stdout.on('data', (data) => {
						  bot.sendMessage(adminId,"Response : \n"+ data);
						  if (chatId != adminId) {
						  	bot.sendMessage(chatId,"Response : \n"+ data);
						  }
						});
						main.stderr.on('data', (data) => {
						  bot.sendMessage(adminId, "Error : \n" +data);
						  if (chatId != adminId) {
						  	bot.sendMessage(chatId,"Error : \n"+ data);
						  }
						});
						main.on('close', (code) => {
						  bot.sendMessage(adminId, `Closed ${code}`);
						  if (chatId != adminId) {
						  	bot.sendMessage(chatId,`Closed ${code}`);
						  }
						});
						//main.kill('SIGHUP');
				}
			}
		}

		// git
		else if (msg.text.substring(0,3).toLowerCase() == "git") { 
			let tmp =  msg.text.split("@");
			let dir  =  tmp[1].split(" ").join("")
			let cwd  =  tmp[2].split(" ").join("");
			let args  =  tmp[3] ? tmp[3] : " ";
			let remote;
			for (var i = 0; i < command[1]["list"].length; i++) {
				let config  = command[1]["list"][i];
				if (config["name"] == dir) {
					dir  =  path.join(__dirname,config["path"]);
					remote  =  `https://${process.env.GIT_USER}:${process.env.GIT_PASS}@${config.repo}`;
					if (cwd == "pull") {
						git(dir).pull(remote, "master", args ).then((stat)=> {
							let push  = `         Files : ${JSON.stringify(stat.files)}
										 Insertions : ${JSON.stringify(stat.insertions)}
										 Deletions : ${JSON.stringify(stat.deletions)}
										 Summary : ${JSON.stringify(stat.summary)}  
										 Created : ${JSON.stringify(stat.created)}  
										 Deleted : ${JSON.stringify(stat.deleted)}  
										`;
							 bot.sendMessage(adminId, `Response :\n ${push}`);
							  if (chatId != adminId) {
							  	bot.sendMessage(chatId,`Response :\n ${push}`);
							  }
						}).catch((e)=>{
							 bot.sendMessage(adminId, `Error : \n${e}`);
							  if (chatId != adminId) {
							  	bot.sendMessage(chatId,`Error : \n${e}`);
							  }
						})
					}
				}
			}
		}

		else {
			bot.sendMessage(chatId,`Opps Command notfound`);
		}


	});
} catch(e) {
	bot.sendMessage(chatId,JSON.parse(JSON.stringify(e)));
}

bot.startPolling();