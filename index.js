//Bot designed by Alexis

const fetch = require("node-fetch");
var ical2json = require("ical2json");
const fs = require ('fs')


const Discord = require ('discord.js')
const  bot = new Discord.Client()
const Canvas = require('canvas');

let lastUpdate = '01'



bot.on('ready', function(){
    //bot.user.setAvatar('./gif-anime.gif').catch(console.error)
    bot.user.setActivity(".next pour avoir le lien du prochain cours" , 'WATCHING').catch(console.error)
    console.log("Le bot est en ligne")
})

bot.on('message', function(message){
      
       
    


    if(message.content=== '.next'){


        edtFile = require ('./files/edt.json') 

        let _event =""
        let _start =""
        let _end =""
        let start =""
        let end =""
        var hourstart = 0
        var hourend = 0
        let lien = ""

        var j = -1
        var year = 0
        var month = 0
        var day = 0
        var datehour = 0
        var datemin = 0

        var length= edtFile.VCALENDAR[0].VEVENT.length

        var events = []
        events.length=0 


        //---------- GET ACTUAL DATE ------------
        var today = new Date();
        var datetime =calculateDateTime(today.getFullYear(),today.getMonth()+1,today.getDate(),today.getHours(),10*Math.floor((today.getMinutes())/10));

        //var datetime = '20201114T080000Z'
         
        console.log(datetime)

        year =  parseInt(datetime.slice(0, 4));
        month = parseInt(datetime.slice(4, 6));
        day = parseInt(datetime.slice(6, 8));
        datehour = parseInt(datetime.slice(9, 11)); 
        datemin = parseInt(datetime.slice(11, 13));

        //enlever 1h30 pour pouvoir trouver le cours même 30 min après qu'il ait commencé
        // -1h30min
        if(datehour<2 && datemin<30 || datehour<1){
            if(datehour<2 && datemin<30){
                datehour=datehour+22;
                datemin=datemin+30;
			}else{
                datehour=datehour+23;
                datemin=60-datemin;
			}
            if(day>1){
                day=day-1;
			}else{
                if(month<2){
                    year=year-1;
                    month=12;
                    day=31;

				}else{
                   month=month-1;
                   day=31;
				}
			}

            console.log(datehour+'h'+datemin)

		}else{

            if(datemin>=30){
                  datehour=datehour-1;
                  datemin = datemin -30;
		    }else{
                  datehour=datehour-2;
                  datemin=datemin+30;
		    }
        }

        datetime =calculateDateTime(year,month,day,datehour,datemin);
        console.log(datetime)        

        //message.channel.send(datetime)    
        
        //éviter boucle infini
        var saveYear = parseInt(datetime.slice(0, 4)) +2;

        do{
               
               for (var i=0; i<length; i++){
                   _start = edtFile.VCALENDAR[0].VEVENT[i].DTSTART
                       if(_start === datetime){
                            var newLength = events.push(i);
 
                            console.log('Find : '+ _start + '  ' + datetime)
			           }
               }

                             
                
               year =  parseInt(datetime.slice(0, 4));
               month = parseInt(datetime.slice(4, 6));
               day = parseInt(datetime.slice(6, 8));
               datehour = parseInt(datetime.slice(9, 11));
               datemin = parseInt(datetime.slice(11, 13));

               if(datehour==23 && datemin+5 >59){
                   
                   datemin = 00;
                   datehour = 00;
                   if(day>30){

                       if(month>11){
                           year=year+1;
                           month=1;
                           day=1;
				       }else{
                           month=month+1;
                           day=1;
				       }
                    
				   }else{
                   day=day+1;
                   }

               }else if(datemin+5 >59 && datehour < 23){
                       datehour=datehour+1; 
                       datemin=00;
               }else{

                datemin=datemin+5;
			   }

               datetime =calculateDateTime(year,month,day,datehour,datemin);
               //console.log(datetime)

        }while(events.length<1 && year<saveYear)


        console.log(events) 
        if(events.length>0){
        
            events.forEach(function(item, index, array) {

                _event = edtFile.VCALENDAR[0].VEVENT[item].SUMMARY
                _start = edtFile.VCALENDAR[0].VEVENT[item].DTSTART
                _end = edtFile.VCALENDAR[0].VEVENT[item].DTEND

                _event = _event.replace(/&apos\\;/g, "'")
                _event = _event.replace(/\\,/g, ',');


                hourstart = parseInt(_start.slice(9, 11))+1;
                let minstart = _start.slice(11, 13)
                hourend = parseInt(_end.slice(9, 11))+1;
                let minend =_end.slice(11, 13)

                let daystart = _start.slice(6, 8)
                let monthstart = _start.slice(4, 6)
                let yearstart = _start.slice(0 , 4)
                
                start = daystart +"/"+ monthstart +"/"+ _start.slice(0, 4) +' à ' + hourstart +"h"+ minstart;
                end = _end.slice(6, 8)+ "/" + _end.slice(4, 6) +"/"+ _end.slice(0, 4) +' à ' + hourend +"h"+ minend;
                
        
                //message.channel.send(_event /*+ " :\n Début : " + start + "\n Fin : " + end + "\n Accès : Teams"+lien*/)     
                bot.emit('ShowEDT', message, _event,hourstart,hourend,minstart,minend,daystart,monthstart,yearstart)


            });

   



        }else{
             console.log(events)
             message.channel.send(":no_entry: Erreur - Aucun évènement à venir...") 
		}

        message.delete();


	}

    if(message.content === '.now'){
      
        //---------- GET ACTUAL DATE ------------
        var today = new Date();
        var datetime =calculateDateTime(today.getFullYear(),today.getMonth()+1,today.getDate(),today.getHours(),10*Math.floor((today.getMinutes())/10));

        message.channel.send(datetime);

	}

    if(message.content === '.help'){

        const helpEmbed = new Discord.MessageEmbed()
	    .setColor('#ff564d') //#ff564d
        .setTitle("Informatins PolyCalendar - Bot")
        .setDescription("\n**Commandes :**")
        .setThumbnail('https://www.vinsguru.com/wp-content/uploads/2018/12/execute-around-header.gif')
        .addFields(
		        { name: '**.next**', value: 'donne le prochain cours', inline: false },
                { name: '**.update**', value: "met à jour l'emploi du temps du bot", inline: false },
                { name: '**.add Matière_TDouCM_TeamsouDiscord_Lien**', value: "ajoute ou modifie les informations d'un cours", inline: false },
		        { name: '**.now**', value: "affiche la date actuelle", inline: false },
                { name: '**.help**', value: "affiche les infos du bot", inline: false },
	    )
	    .setFooter('© 2020 Alexis - Tous droits réservés ', 'https://files.u-angers.fr/data/f-e452e5bcad91f088.jpg');

        message.channel.send(helpEmbed);

	}

    if(message.content.startsWith('.add')){

        lessonFile = require ('./files/lessons.json')
        let msgText = message.content;
        msgText = msgText.replace('.add ', '');

        if(msgText.includes("_")){
           
            const infos = msgText.split('_');
            
            if(infos.length == 4 && infos[0] != "" && infos[1] != "" && infos[2] != "" && infos[3] != ""){


                var infoExist = LessonsExist(msgText);
            
                var alreadyExist = infoExist.exist,
                    index = infoExist.index;


                switch (alreadyExist) {
                    case 0:

                        //Ajout d'un nouveau cours qui existe sur l'edt

                        //demandé pour vérifier s'il veut valider ou non			

                        var nextlesson =  lessonFile.LESSONS.length;

                        const AddEmbed = new Discord.MessageEmbed()
	                    .setColor('#ffff89') //#ff564d
	                    //.setAuthor(message.author.username, message.author.avatarURL())
                        .setTitle("Ajouter les informations d'un cours ?")
                        .setDescription("Ce cours n'a jamais été enregistré. Veuillez vérifier les informations avant d'enregistrer les informations.")
                        .setThumbnail('https://www.vinsguru.com/wp-content/uploads/2018/12/execute-around-header.gif')
                        .addFields(
		                        { name: '**__Matière__**', value: "```fix\n"+infos[0]+"```", inline: false },
                                { name: '**__Type (TD, CM, TP)__**', value: "```fix\n"+infos[1]+"```", inline: false },
                                { name: '**__Emplacement (Discord, Teams, ...)__**', value: "```fix\n"+infos[2]+"```", inline: false },
		                        { name: '**__Lien__**', value: "```fix\n"+infos[3]+"```", inline: false },
	                    )
	                    .setFooter('© 2020 Alexis - Tous droits réservés ', 'https://files.u-angers.fr/data/f-e452e5bcad91f088.jpg');

                        message.channel.send(AddEmbed).then((msg) => {
                          msg.react('✅');
                          msg.react('❌');

                  

                            const filter = (reaction, user) => {
                                return ['✅', '❌'].includes(reaction.emoji.name) && user.id != msg.author.id;
                            };

                
                            msg.awaitReactions(filter, { max: 1, time: 15000, errors: ['time'] })
                            .then(collected => {
                                const reaction = collected.first();

                                if (reaction.emoji.name === '✅') {
                                   AddLesson(msgText, nextlesson);
                                   message.channel.send("✅ Informations du cours de "+ infos +" ajoutées.");
                                   msg.delete();
                                   message.delete();
                                }
                                else {
                                   message.channel.send("❌ Vous avez annulé!")
                                   msg.delete();
                                   message.delete();

                                }
                            })
                            .catch(collected => {
                                console.log(`After 15s, only ${collected.size} out of 1 reacted.`);
                                msg.channel.send("❌ Action annulée car personne n'a réagit.");
                                msg.delete();
                                message.delete();

                            });

                        });


                        break;
                    case 1: 
                      
                         // need index to modify the informations (revoir function LessonsExist)

                         // get the infos already saved

                         let info = lessonFile.LESSONS[index].INFO;
                         let lien = lessonFile.LESSONS[index].LINK;

                         const ModifyEmbed = new Discord.MessageEmbed()
	                    .setColor('#faa61a') //#ff564d
                        .setTitle("Modifier les informations d'un cours ?")
                        .setDescription("Ce cours a déjà été enregistré. Veuillez vérifier les informations avant d'effectuer la modification")
                        .setThumbnail('https://www.vinsguru.com/wp-content/uploads/2018/12/execute-around-header.gif')
                        .addFields(
		                        { name: '**__Matière__**', value: "```css\n"+infos[0]+"```" , inline: true },
                                { name: '**__Type (TD, CM, TP)__**', value: "```css\n"+infos[1]+"```", inline: true }
                        )
                        .addFields(
                                { name: '\u200b', value: '**__Emplacement (Discord, Teams, ...)__**', inline: false },
                                { name: '*__Old__*', value: "```"+info+"```", inline: true },
                                { name: '*__New__*', value: "```fix\n"+infos[2]+"```", inline: true }
                        )
                        .addFields(
                                { name: '\u200b', value: '**__Lien__**', inline: false },
		                        { name: '*__Old__*', value: "```"+lien+"```", inline: true },
		                        { name: '*__New__*', value: "```fix\n"+infos[3]+"```", inline: true }

	                    )
	                    .setFooter('© 2020 Alexis - Tous droits réservés ', 'https://files.u-angers.fr/data/f-e452e5bcad91f088.jpg');

                        message.channel.send(ModifyEmbed).then((msg) => {
                          msg.react('✅');
                          msg.react('❌');

                  

                            const filter = (reaction, user) => {
                                return ['✅', '❌'].includes(reaction.emoji.name) && user.id != msg.author.id;
                            };

                
                            msg.awaitReactions(filter, { max: 1, time: 25000, errors: ['time'] })
                            .then(collected => {
                                const reaction = collected.first();

                                if (reaction.emoji.name === '✅') {
                                   AddLesson(msgText, index);
                                   message.channel.send("✅ Modifications appliquées pour le cours de " + infos[0]);
                                   msg.delete();
                                   message.delete();
                                }
                                else {
                                   message.channel.send("❌ Vous avez annulé les modifications!")
                                   msg.delete();
                                   message.delete();

                                }
                            })
                            .catch(collected => {
                                console.log(`After 15s, only ${collected.size} out of 1 reacted.`);
                                msg.channel.send("❌ Modifications annulées car personne n'a réagit.");
                                msg.delete();
                                message.delete();

                            });

                        });


                         break;

                    case 2: 
                        message.channel.send("❌ Les informations données ne correspondent à aucun cours");
                        message.delete();
                        break; 

                    default:
                        console.log('Error');
                        message.channel.send("❌ Error");
                        message.delete();
                }

            }else{
                message.channel.send("❌ Mise en forme non correcte (.help)")
                message.delete();  
			}

		}else{
            message.channel.send("❌ Mise en forme non correcte (.help)")
            message.delete();  
		}

       
	}

    



    if(message.content === '.update'){
        
        var today = new Date();
        var datetime =calculateDateTime(today.getFullYear(),today.getMonth()+1,today.getDate(),today.getHours(),10*Math.floor((today.getMinutes())/10));

        if(datetime.slice(6, 8) != lastUpdate){
            message.channel.send(':arrows_counterclockwise: Téléchargement de la màj en cours... :black_square_button::black_square_button::black_square_button::black_square_button: 0%')
                    .then((msg)=> {
                    setTimeout(function(){
                        msg.edit(':arrows_counterclockwise: Lecture du fichier .ics en cours... :green_square::black_square_button::black_square_button::black_square_button: 25%');
                    }, 1125)
                    setTimeout(function(){
                        msg.edit(':arrows_counterclockwise: Conversion du fichier en cours... :green_square::green_square::black_square_button::black_square_button: 50%');
                    }, 2250)
                    setTimeout(function(){
                        msg.edit(':arrows_counterclockwise: Ecriture du fichier .json en cours... :green_square::green_square::green_square::black_square_button: 75%');
                    }, 3375)
                    setTimeout(function(){
                        msg.edit('✅ Mise à jour terminée :green_square::green_square::green_square::green_square: 100%');
                    }, 4500)
                    })
                    
                download("https://edt.univ-angers.fr/edt/ics?id=gA44753094100BE6CE0530100007F1296", './files/edt.ics')
                
                lastUpdate = datetime.slice(6, 8)

        }else{
             message.channel.send(':arrows_counterclockwise: Téléchargement du .ics en cours... :black_square_button::black_square_button::black_square_button::black_square_button: 0%')
                    .then((msg)=> {
                    setTimeout(function(){
                        msg.edit(":no_entry: Erreur - Calendrier déjà mis à jour :red_square::red_square::red_square::red_square: 8%");
                    }, 950)
                    })
		}

        message.delete();

	}
    
})



const convert = async (fileLocation) => {

    try {  
        var icsData = fs.readFileSync(fileLocation, 'utf8');
        //console.log(icsData.toString());    
    } catch(e) {
        console.log('Error:', e.stack);
    }

    // Convert
    var output = ical2json.convert(icsData);
    
    let data = JSON.stringify(output, null, 2);
    fs.writeFileSync('./files/edt.json', data);
    
    console.log("Converted in JSON file")

}

function AddLesson (msg, index) {

           const infos = msg.split('_');


           lessonFile.LESSONS[index] = {
              "NAME" : infos[0], 
              "TYPE" : infos[1],
              "INFO" : infos[2],
              "LINK" : infos[3]
			}
            let data =JSON.stringify(lessonFile,null, 4);
            fs.writeFileSync('./files/lessons.json' , data, err => {
                if (err) throw err;

            });

            console.log('Data written to lessons.json');

}

function LessonsExist (msg) {



        lessonFile = require ('./files/lessons.json') 
        edtFile = require ('./files/edt.json') 
        
        const infos = msg.split('_');

        var j=-1;
        var i=0;
        do{    
            
            let name = lessonFile.LESSONS[i].NAME;
            let type = lessonFile.LESSONS[i].TYPE;

            if(msg.includes(name) && (msg.includes(type)) ){
                j=i
			}

            i++;
        }while(j<0 && i<lessonFile.LESSONS.length);
        
        i=0;
        var k =-1;
        do{    
            
            let name = edtFile.VCALENDAR[0].VEVENT[i].SUMMARY

            if(name.includes(infos[0]) && name.includes(infos[1])){
                k=i
			}

            i++;
        }while(k<0 && i<edtFile.VCALENDAR[0].VEVENT.length);

        var exist = -10;
        var index = -10;

        if(j<0 && k>-1){
            //new cours 
            exist = 0;
            index = -1;

        }else if (j>-1 && k>-1){
             //modifiier un cour + index cours à modifier
            exist = 1;
            index = j;

		}else {
            //autre le cours n'existe pas
           exist = 2;
           index = -1;
		}

        return {exist,index}; 


}


var download = function(url, dest, cb) {
           
            
          var https = require('https');
          var fs = require('fs');

          var file = fs.createWriteStream(dest);
          var request = https.get(url, function(response) {
            response.pipe(file);
            file.on('finish', function() {
              console.log("ICS file downloaded")
              
              //convert into json file
              var fileLocation = './files/edt.ics';
              convert(fileLocation);

              file.close(cb);  // close() is async, call cb after close completes.
            });
          }).on('error', function(err) { // Handle errors
            fs.unlink(dest); // Delete the file async. (But we don't check the result)
            if (cb) cb(err.message);
          });
};


function calculateDateTime(year,month,day,datehour,datemin) {
  datetime = year.toString();

        if(month<10){
                datetime = datetime + '0'+month  
		}else{
                datetime = datetime + month
		}

        if(day<10){
                datetime = datetime+'0'+day+'T'     
		}else{
                datetime = datetime+day+'T'
		}

        if(datehour<10){
                datetime = datetime + '0'+datehour
		}else{
                datetime = datetime +datehour               
		}

         if(datemin<10){ 
                datetime = datetime +'0'+ datemin+'00Z'
		}else{
                datetime = datetime + datemin+'00Z'               
		}

  return datetime;
}


bot.on('ShowEDT', async (message, _event, hourstart,hourend,minstart,minend,daystart,monthstart,yearstart) => {
        
        //canvas
	    const canvas = Canvas.createCanvas(500, 650);
	    const ctx = canvas.getContext('2d');

        //background
	    const background = await Canvas.loadImage('./images/back.png').catch(console.error);
	    ctx.drawImage(background, 0, 0, canvas.width, canvas.height)
	    /*ctx.strokeStyle = '#000000';
	    ctx.strokeRect(0, 0, canvas.width, canvas.height);*/
        

        const words = _event.split(' - ');


        let cours = ""
        if(_event.includes("TD")){
            cours = "TD"
        }else if(_event.includes("CM")){
            cours = "CM"
        }else if(_event.includes("Contrôle continu")){
            cours = "CC"
        }else{
            if(words[0]!=null){
                cours = words[0]
			}else{
                cours = "?"     
			}
		}


        //TD or CM
        var varSize  = -10 * cours.length + 110;
        let font = varSize +'px Calibri';
        ctx.font = font;
        ctx.fillStyle = '#ff564d';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(cours, 247.5, 115); //245, 145
        
        var max = 24;
        var lines = (words[2].length/max)+1;
                        
        let summary = splitString(words[2], max);

        ctx.textBaseline = "alphabetic";


        //Matière Texte
        if(lines >3.05){
           const summarywords = summary.split('\n');
           ctx.font = '42px Calibri';
           ctx.fillStyle = '#ffffff';
           ctx.textAlign = "center";   
           for(i = 0; i<2;i++){            
                ctx.fillText(summarywords[i], 250, 320+i*45);
           }                
           ctx.fillText("...", 250, 390);
           
        }else if (2.05<lines && lines <= 3.05){
           const summarywords = summary.split('\n');
           summarywords.forEach(function(item, index, array) {
                ctx.font = '42px Calibri';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = "center";
                ctx.fillText(item, 250, 325+index*45);
           });
        }else{
            var varSize2 = -1.1466 * summary.length + 68.102;
            ctx.font = varSize2 +'px Calibri';
            ctx.fillStyle = '#ffffff';
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            ctx.fillText(summary, 250, 335);
        }


        ctx.font = '58px Calibri';
        ctx.fillStyle = '#ffffff';
        ctx.textBaseline = "alphabetic";
        ctx.textAlign = "center";

        //Hour Start Texte
        ctx.fillText(hourstart+'h'+minstart, 125, 475);

        //Hour End Texte
        ctx.fillText(hourend+'h'+minend, 375, 475);

        //Date Texte
        ctx.font = 'bold 45px Calibri';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = "center";
        ctx.fillText(daystart+'/'+monthstart+'/'+yearstart, 250, 535);

        
        let info =""
        let link =""
        
        var imagesInfo = []
        imagesInfo.length=0;

        if(_event.includes("distance")){
            
            let infos = GetLessonInfo(_event);
            info = infos.info,
            link = infos.link;

            imagesInfo[0]= "laptop"
      
        }else{

            if(words[1]!=""){
                //const salle =  words[1].split(',');
                if(words[1].length<9){
                    info = words[1];

			    }else{
                  info = words[1].slice(0,8) + '...';
			    }

            }else{
                info = "School"
			}
            link=""
            
            imagesInfo[0]= "school"

		}
        
        if (_event.includes("annulé") || _event.includes("Annulé")){
            imagesInfo[1]= "cancel"
        }else{
            imagesInfo[1]= "check"              
		}


        const image1 = await Canvas.loadImage('./images/'+ imagesInfo[0]+'.png').catch(console.error);
        ctx.drawImage(image1, 43, 150, 50, 50)

        const image2 = await Canvas.loadImage('./images/'+ imagesInfo[1]+'.png').catch(console.error);
        ctx.drawImage(image2, 407, 150, 50, 50)

        //images

        //Info Texte
        ctx.font = 'bold 50px Calibri';
        ctx.fillStyle = '#ff564d';
        ctx.textAlign = "center";
        ctx.fillText(info, 250, 635);

        let groupe = ""
        if(words[words.length-1].length>35){
            groupe = words[words.length-1].slice(0, 32) + '...';
		}else{
            groupe =   words[words.length-1];
		}

        //Groupe Texte
        ctx.font = 'italic 25px Calibri';
        ctx.fillStyle = '#696969';
        ctx.textAlign = "center";
        ctx.fillText(groupe, 250, 580);


        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'edt.png');


        const embed = new Discord.MessageEmbed()
	    .setColor('#ff564d') //#ff564d
	    //.setAuthor(message.author.username, message.author.avatarURL())
	    .attachFiles(attachment)
        .setImage('attachment://edt.png')
	    .setTimestamp()
	    .setFooter('© 2020 Alexis', 'https://files.u-angers.fr/data/f-e452e5bcad91f088.jpg');

        if(link.startsWith("https")){
        	embed.setTitle('Lien du cours')
                 .setURL(link)
		}else{
            embed.setTitle(link)
                 .setURL("")
		}
        
        message.channel.send(embed);
        let status ="";

        //update Status bot
        if (_event.includes("annulé") || _event.includes("Annulé")){
             status ='Annulé - '+ hourstart+"h"+minstart +" - " + cours +" - " +  words[2];

        }else{
            status = hourstart+"h"+minstart +" - " + cours +" - " + words[2];
		}
        bot.user.setActivity(status , 'WATCHING').catch(console.error);

        
})

function splitString(_event, max){
    var length =0
    let string =""
    
    if(_event.length>max){

        const words = _event.split(" ");

        for(var k = 0; k<words.length; k++){

            length = length + words[k].length

            if(length>max){
                string = string +'\n'+ words[k] +' '
                length = words[k].length +1;

		    }else{
                if(k<words.length-1){
                    string = string + words[k] +' '
                    length = length + 1;
                
				}else{
                    string = string + words[k]
				}
               

		        }
	    }

    }else{
        string = _event;
	}
            
    
    return string;

}


function GetLessonInfo(event) {

        let link = ""
        let info = ""

        lessonFile = require ('./files/lessons.json') 
        
        const words = event.split(' - ');

        var j=-1;
        var i=0;
        do{    
            
            let name = lessonFile.LESSONS[i].NAME;
            let type = lessonFile.LESSONS[i].TYPE;

            if(event.includes(name) && (words[0].includes(type)) ){
                j=i
                console.log( name + ' / ' + type)
			}

            i++;
        }while(j<0 && i<lessonFile.LESSONS.length);

        if(j>-1){
            info = lessonFile.LESSONS[j].INFO
            link = lessonFile.LESSONS[j].LINK
        }else{
            info = "Error"
            link = "Not found"
		}

        return {
            info,
            link
        };
}


bot.login(process.env.TOKEN);
