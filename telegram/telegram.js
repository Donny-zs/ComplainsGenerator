import {
    getMe,
    sendMessage,
    sendPhoto,
    sendChatAction,
    leaveChat,
    kickChatMember,
    sendDocument,
    editMessageText,
    forwardMessage,
    downloadFile,
    getFile

} from './telegram_API.js'

import { Queue } from '../telegram/Queue.js'

import {checkAndLoadNewSettingsFile} from '../libs/checkAndLoadNewSettingsFile.js'

export function tg (complainsGenerator, complainsSettings, messageHandler, token, botName, botHelpMessage, admins = [], report, banned = [], delayMsg, delayGnr) {

    return new TelegramBot(complainsGenerator, complainsSettings, messageHandler, token, botName, botHelpMessage, admins, report, banned, delayMsg, delayGnr)

}

class TelegramBot {
    static #instance = null

    constructor (complainsGenerator, complainsSettings, messageHandler, token, botName, botHelpMessage, admins, report, banned, delayMsg, delayGnr) {
        if(TelegramBot.#instance) {
            return TelegramBot.#instance;
        }
        TelegramBot.#instance = this

        this.complainsGenerator = complainsGenerator
        this.complainsSettings = complainsSettings

        this.apiKey = token
        this.botName = botName
        this.botHelpMessage = botHelpMessage //сообщение возникающее на команду /help в чате с ботом
        this.botReportWatchList = new Map() //коллекция chat_id которые нажали ввод ответа от департамента 
        this.botSettingsWatch = false //флаг ожидания документа "settings.json" от одного из админов
        this.waitBeforeCleanWatchList = 2.4e+6
        this.cleanWatchListTimer = null
        this.reportMinLength = 20
        this.delayBetweenMessages = delayMsg
        this.delayBetweenComplains = delayGnr

        this.owner = admins //пользователи которым доступны особые функции
        this.report = report //объект с указанием каналов и групп имеющих значение для бота
        this.banned = banned //список пользователей которые были заблокированы (в этой программе не используется)
        this.delayList = {} //объект содержащий ключ в виде user_id и полями где в тч указано время следующей генерации сообщения для пользователя
        this.queue = new Queue(this.delayBetweenMessages)

        this.isUpdating = false
        this.updData = null
        this.poolDelay = 50

        this.sendMessage = sendMessage
        this.sendPhoto = sendPhoto
        this.sendChatAction = sendChatAction
        this.leaveChat = leaveChat
        this.kickChatMember = kickChatMember
        this.sendDocument = sendDocument
        this.editMessageText = editMessageText
        this.getMe = getMe
        this.forwardMessage = forwardMessage
        this.downloadFile = downloadFile
        this.getFile = getFile

        this.messageHandler = messageHandler

        //Хранит чаты, следующим сообщением в которых ожидается ответ от департамента
        this.chatsAwaitForAnswers = {} 

        this.pool()

    }

    async pool(offset = 0,limit = 100,timeout = this.poolDelay) {

        const options = {
            method: "POST",
        }
    
        const body = new FormData();
        body.append("offset", offset);
        body.append("limit", limit);
        body.append("timeout", timeout);
    
        options.body = body
    
        fetch(`https://api.telegram.org/bot${this.apiKey}/getUpdates`, options)
    
        .then  (async response => {
    
            response = await response.json();
            
            this.updData = response.result;
    
            if (this.updData.length > 0) {
    
                this.updData.forEach(update => {
    
                    try {

                        this.handler(update);

                    } catch (error) {

                        console.log('\nПри обработке сообщения:\n')
                        console.log(update)
                        console.log('\nИз телеграма была перхвачена ошибка:\n')
                        console.log(error)

                    }

                });   
    
                this.pool(this.updData[this.updData.length - 1].update_id + 1, 100, this.poolDelay);
    
            } else {
    
                this.pool(0, 100, this.poolDelay);
                
            }
    
        })
        .catch(error => console.log(error))

    }

    async handler (data) {

        //логгирование полного события
        //console.dir(data, { depth: null });

        //Прямые сообщения к боту текстом
        if (data.message?.text) {

            //Сообщения из супергрупп
            if (data.message.chat.is_forum === true) { 

                data.message.reply_to_message.text = data.message.text

                data.message = data.message.reply_to_message

                if (this.checkUser(data.message.from.first_name, data.message.from.id, data.message.chat.id,data.message.message_thread_id)) {


                    this.commandHandler(data,'forum')
                    console.log('Сообщение из супергруппы-форума получено');
                    return

                }

                return
            }

            if (this.checkUser(data.message.from.first_name, data.message.from.id, data.message.chat.id)) {

                //Личные и в else групповые сообщения
                if (data.message.from.id === data.message.chat.id){

                    if (data.message.entities) {

                        console.log(`ЛС: получена команда ${data.message.text} от ${data.message.from.first_name} (${data.message.from.username}, ${data.message.from.id})`);
                        
                        this.commandHandler(data,'private')
                        return

                    }

                    if (this.botReportWatchList.has(`${data.message.chat.id}`)) {

                        if (data.message.text.length >= this.reportMinLength) {
                            
                            this.reportHandler(data.message.chat.id, data.message.message_id, data.message.chat.type)

                            this.sendMessage(data.message.chat.id, 'Данные успешно получены, спасибо!', {reply_parameters: JSON.stringify({message_id: data.message.message_id})})

                        } else {

                            this.sendMessage(data.message.chat.id, 'Ошибка во время NLP преобразования, попробуйте отправить скриншот', {reply_parameters: JSON.stringify({message_id: data.message.message_id})})

                        }
                        
                    }

                    

                    console.log(`ЛС: получено сообщение: "${data.message.text}" от ${data.message.from.first_name} (@${data.message.from.username}, ${data.message.from.id})`);
                    return

                } else {


                    this.commandHandler(data,'supergroup')
                    console.log('Сообщение из группы получено');
                    return

                }

            }

        }

        //Обработка нажатия на кнопку
        if (data.callback_query?.data) {

            //Супергруппы-топик
            if(data.callback_query.message.is_topic_message){

                if (this.checkUser(data.callback_query.from.first_name, data.callback_query.from.id, data.callback_query.message.chat.id, data.callback_query.message.message_thread_id)) {

                    console.log('Кнопку нажали в супергруппе-топике');
                    return

                }

                return

            } 
            //Группа
            else if (data.callback_query.message.chat.type === 'supergroup') {

                if (this.checkUser(data.callback_query.from.first_name, data.callback_query.from.id, data.callback_query.message.chat.id)) {

                    this.messageHandler(data.callback_query.data)

                    console.log(`${data.callback_query.from.first_name} нажал на кнопку ${data.callback_query.data} в группе: ${data.callback_query.message.chat.title}`);
                    return
                }

                return
            }
            //Личные сообщения
            else if (data.callback_query.from.id === data.callback_query.message.chat.id ){

                if (this.checkUser(data.callback_query.from.first_name, data.callback_query.from.id, data.callback_query.message.chat.id)) {

                    console.log(`ЛС: нажата кнопка: ${data.callback_query.data} пользователем ${data.callback_query.from.first_name} (${data.callback_query.from.username}, ${data.callback_query.from.id})`);

                    this.buttonHandler(data, 'private', data.callback_query.from)

                    return

                }
                
                return
            }





            return
        }

        //Не позволить заблокированным пользователям возвращаться
        // if (data.message?.new_chat_member && data.message.new_chat_participant) {

        //     if ( Object.values(this.banned).includes(user => user === data.message.new_chat_participant.id)) {

        //         this.kickChatMember(data.message.chat.id, data.message.new_chat_participant.id)
        //         console.log(`Пользователь ${data.message.new_chat_participant.first_name} кикнут из группы, поскольку находится в чёрном списке`);
        //         return
        //     }

        //     return
        // }

        //Не позволить добавлять в посторонние группы

        if (data.my_chat_member?.chat) {


            if ( !this.report === data.my_chat_member.chat.id) {

                if (data.my_chat_member.from.username === `${this.botName}`) { return }

                //автоудаление
                //this.leaveChat(data.my_chat_member.chat.id)


                return

            }

            //Приветствие при добавлении
            //this.sendMessage(data.my_chat_member.chat.id, 'Всем привет!')

            return
        }

        //Логгирование результатов вызова методов
        if (data.result?.text) {
            //console.log(data.result.text)
        }
        if(data.description) {
            //console.log(data.description)
        }

        if (data.message?.photo) {

            console.log(`ЛС: получена фотография от ${data.message.from.first_name} (@${data.message.from.username}, ${data.message.from.id})`);
            
            if (this.botReportWatchList.has(`${data.message.chat.id}`)) {
    
                this.reportHandler(data.message.chat.id, data.message.message_id, data.message.chat.type)

                this.sendMessage(data.message.chat.id, 'Данные успешно получены, спасибо!', {reply_parameters: JSON.stringify({message_id: data.message.message_id})})

            }

        }

        if (data.message?.document) {

            if (
                this.owner.includes(`${data.message.from.id}`) &&
                this.botSettingsWatch === true &&
                data.message.document.mime_type === 'application/json' &&
                data.message.document.file_name === 'settings.json'
            ) {

                //TODO Скачать файл - если он парсится и имеет все нужные флаги, тогда говорим спасибо, иначе сообщаем об ошибке

                let file = await this.downloadFile(data.message.document.file_id)

                const reportAboutRefreshSettings = checkAndLoadNewSettingsFile(file, 'settings.json')

                if (reportAboutRefreshSettings.ok) {

                    this.apiKey = file.data.TOKEN 
                    this.botName = file.data.BOT_NAME
                    this.owner = file.data.ADMINS
                    this.report = file.data.REPORT
                    this.banned = file.data.BANNED
                    this.delayList = {}
                    this.botHelpMessage = file.data.HELP_MESSAGE
                    this.complainsSettings = file.data

                    this.sendMessage(data.message.chat.id, 'Настройки обновлены успешно!')

                } else {

                    this.sendMessage(data.message.chat.id, `Ошибка во время обновления настроек: ${reportAboutRefreshSettings.error}.`)

                }

                this.botSettingsWatch = false
                
                return

            }


            console.log(`ЛС: получен документ от ${data.message.from.first_name} (@${data.message.from.username}, ${data.message.from.id})`);
            
            if (this.botReportWatchList.has(`${data.message.chat.id}`)) {
    
                this.reportHandler(data.message.chat.id, data.message.message_id, data.message.chat.type)
                
                this.sendMessage(data.message.chat.id, 'Данные успешно получены, спасибо!', {reply_parameters: JSON.stringify({message_id: data.message.message_id})})

                return

            }


        }

    }

    checkUser (first_name, user_id, chat_id, message_thread_id) {

        if (this.isBanned(user_id)) {

            return false

        }

        if ( !this.isOwner(user_id) ) {

            
            //this.sendMessage(chat_id, `Здравствуйте ${first_name ? first_name : ''}, к сожалению Вы не в круге лиц имеющих разрешение на работу с ботом. Приношу свои извинения.`,{message_thread_id})
            //this.banUser(first_name,user_id) //Не банить юзеров, пересылать их сообщение форвардом мне, и позволить с ними общаться с возможностью бана
            return true
            
        }

        return true

    }

    isBanned (user_id) {
        
        if (Object.values(this.banned).includes(user_id)) {

            return true

        } else {

            return false

        }

    }

    isOwner (user_id) {
        
        if (Object.values(this.owner).includes(user_id)) {

            return true

        } else {

            return false

        }
    }

    banUser (first_name,user_id) {

        console.log(`User ${first_name} banned`)
        this.banned[first_name] = user_id

    }

    commandHandler (data,chat_type) {
        
        switch (chat_type) {

            case 'private' : 
                this.privateHandler(data)
                break
            case 'supergroup' : 
                this.supergroupHandler(data)
                break
            case 'supergroup-forum' :
                this.forumHandler(data)
                break

        }

    }

    //Расшифровывает дату пришедшую с нажатия кнопки в чате, парся data.callback_query.data
    buttonHandler(data, chat_type, from){



        let splited = data.callback_query.data.split('@')
        let command = splited[0]
        let chat_id = splited[1]
        let message_thread_id = splited[2]

        



        switch (chat_type) {

            case 'private' : 
                this.privateButton(command, chat_id, from)
                break
            case 'supergroup' : 
                this.supergroupButton(command, chat_id, from)
                break
            case 'supergroup-forum' :
                this.forumButton(command, chat_id, from, message_thread_id)
                break

        }

    }

    privateHandler(data){
        
        switch (data.message.text) {

            case '/start':
                this.commandStart(data.message.chat.id,data.message.from.first_name)
                break;
            case '/help':
                this.commandHelp(data.message.chat.id,data.message.from.first_name)
                break;

        }
    }

    supergroupHandler(data){}

    forumHandler(data){}

    privateButton(command, chat_id, from){

        switch (command) {

            case 'getComplaints' : 

                //защита от множественного нажатия
                if (this.delayList[chat_id]){

                    if (Date.now() - this.delayList[chat_id].time > this.delayBetweenComplains) {

                        switch (chat_type) {

                            case 'private' : 
                                this.privateButton(command, chat_id)
                                break
                            case 'supergroup' : 
                                this.supergroupButton(command, chat_id)
                                break
                            case 'supergroup-forum' :
                                this.forumButton(command, chat_id, message_thread_id)
                                break
                
                        }

                        let date = new Date(Date.now() + this.delayBetweenComplains);

                        let options = {
                            year: '2-digit', // Год в формате '24'
                            month: '2-digit', // Месяц в формате '08'
                            day: '2-digit', // День в формате '20'
                            hour: '2-digit', // Час в формате '09'
                            minute: '2-digit', // Минуты в формате '27'
                            hour12: false, // Использовать формат 24 часа
                        };
            
                        let formattedDate = date.toLocaleString('ru-RU', options);
            
                        let nextTimeHumanReadible = formattedDate.replace(',', ' в')
            
                        this.delayList[chat_id] = {
            
                            time: Date.now(),
                            spamer:false,
                            lastTap:Date.now(),
                            totalTap:0,
                            totalMessages:0,
                            nextTime : Date.now() + this.delayBetweenComplains,
                            nextTimeHumanReadible
            
                        }

                        console.log('Пользователь есть в бд, времени прошло достаточно, генерируем текст, пользователь сброшен');
                        
                        

                        return
                    }

                    console.log(`Пользователь ${from.first_name} (@${from.username} ${from.id}) Повторно нажимает кнопку ${command}`);
                    
                    if (this.delayList[chat_id].spamer) {
                        console.log('Пользователь спамил и заигнорен');
                        
                        return
                    }

                    if (this.delayList[chat_id].totalTap >= 2) {
                        this.delayList[chat_id].spamer = true
                    }
                    

                    this.delayList[chat_id].totalTap++

                    console.log(this.delayList[chat_id].totalTap);
                    
                    console.log('Времени прошло недостаточно, пользователь проигорирован');

                    return

                } else {

                    console.log('новый пользователь добавлен в бд');

                    let date = new Date(Date.now() + this.delayBetweenComplains);

                    let options = {
                        year: '2-digit', // Год в формате '24'
                        month: '2-digit', // Месяц в формате '08'
                        day: '2-digit', // День в формате '20'
                        hour: '2-digit', // Час в формате '09'
                        minute: '2-digit', // Минуты в формате '27'
                        hour12: false, // Использовать формат 24 часа
                    };

                    let formattedDate = date.toLocaleString('ru-RU', options);

                    let nextTimeHumanReadible = formattedDate.replace(',', ' в')

                    this.delayList[chat_id] = {

                        time: Date.now(),
                        spamer:false,
                        lastTap:Date.now(),
                        totalTap:0,
                        totalMessages:0,
                        nextTime : Date.now() + this.delayBetweenComplains,
                        nextTimeHumanReadible

                    }

                }

                let messages = this.complainsGenerator(this.complainsSettings)

                //напоминание о легальности
                this.sendMessage(chat_id, `Благодарю за готовность помочь, количество департаментов к которым нужно обратиться на текущий момент: ${messages.length},\nсоставленный текст нужно будет прочесть, исправить окончания слов, добавить имя и отправить по указанным емейлам\nСледующая генерация будет доступна ${this.delayList[chat_id].nextTimeHumanReadible}`)

                this.messageGun(chat_id, messages)

                console.log('Пользователю сгенерирован текст');

                break

            case 'postComplaint' :

                this.botReportWatchList.set(chat_id, true)

                clearTimeout(this.cleanWatchListTimer)

                this.cleanWatchListTimer = setTimeout(() => {

                    this.botReportWatchList.clear()

                }, this.waitBeforeCleanWatchList)

                this.sendMessage(chat_id, `Пожалуйста пришлите пришедший ответ из департамента следующим сообщением в виде текста, файла или скриншота(убедитесь что всё видно)`)

                break

            case 'removeAdmin' :

                this.owner = this.owner.filter(item => item !== `${chat_id}`)

                this.sendMessage(chat_id, `В этой сессии Вы больше не считаетесь администратором`)

                break

            case 'refreshSettings' :

                this.botSettingsWatch = true

                this.sendMessage(chat_id, `Отправьте подготовленный файл с названием "settings.json"`)

                break

        }

    }

    supergroupButton(command, chat_id){}

    forumButton(command, chat_id, message_thread_id){}

    commandStart(chat_id,first_name,message_thread_id){

        /**
         * Админам выдаёт иную раскладку
         * В данной версии бот общается только в приватном чате,
         * будьте аккуратны с выводом админских команд в группах
         * Переносите проверку выше в распределение по типам чатов
         */

        if (this.owner.includes(`${chat_id}`)) {
            
            this.sendMessage(chat_id, `Здравствуйте ${first_name ? first_name : ''}, Вам доступны следующие функции:`,{message_thread_id,"reply_markup": JSON.stringify({
                "inline_keyboard": 
                    [   
                        [
                            {
                                "text": "Получить обращения в департаменты",
                                "callback_data": `getComplaints@${chat_id}@${message_thread_id}`            
                            }, 
                        ],
                        [
                            {
                                "text": "Сдать ответы на обращения",
                                "callback_data": `postComplaint@${chat_id}@${message_thread_id}`            
                            }  
                        ],
                        [
                            {
                                "text": "Удалить меня из администраторов",
                                "callback_data": `removeAdmin@${chat_id}@${message_thread_id}`            
                            }  
                        ],
                        [
                            {
                                "text": "Обновить конфигурацию",
                                "callback_data": `refreshSettings@${chat_id}@${message_thread_id}`            
                            }  
                        ],

                    ]   
                }
            )})

        } else {

            this.sendMessage(chat_id, `Здравствуйте ${first_name ? first_name : ''}, Вам доступны следующие функции:`,{message_thread_id,"reply_markup": JSON.stringify({
                "inline_keyboard": 
                    [   
                        [
                            {
                                "text": "Получить обращения в департаменты",
                                "callback_data": `getComplaints@${chat_id}@${message_thread_id}`            
                            }, 
                        ],
                        [
                            {
                                "text": "Сдать ответы на обращения",
                                "callback_data": `postComplaint@${chat_id}@${message_thread_id}`            
                            }  
                        ]
                    ]   
                }
            )})

        }



    }

    commandHelp(chat_id,first_name,message_thread_id){

        this.sendMessage(chat_id, `Здравствуйте${' ' + first_name ? first_name : ''}, ${this.botHelpMessage}`,{message_thread_id})

    }

    callback_queryHandler (data) {
        
    }

    reportHandler(chat_id, message_id, chat_type, message_thread_id) {
        
        switch (chat_type) {
            
            case 'private' : 
                this.reportPrivate(chat_id, message_id)
                break
            case 'supergroup' : 
                this.reportSupergroup(chat_id, message_id)
                break
            case 'supergroup-forum' :
                this.reportForum(chat_id, message_id, message_thread_id)
                break

        }

    }

    reportPrivate(chat_id, message_id) {

        this.forwardMessage(this.report, chat_id, message_id)

        this.botReportWatchList.delete(`${chat_id}`)

    }

    reportSupergroup(){

    }

    reportForum(){

    }

    removeAdminPrivate() {}

    removeAdminSupergroup() {}

    removeAdminForum() {}


    //====Сервисные функции==============================================================================================================================

    send( data ) {

        return this.queue.send( data )

    }

    //Разедляет массив на отдельные сообщения и запихивает их в очередь
    messageGun(chat_id, messageArray, message_thread_id = null) {

        for (let i = 0; i < messageArray.length; i++) {

            this.sendMessage(

                chat_id,
                //Напоминание о легальности и данные
                `Обращение к департаменту "${messageArray[i].name}"\nЭлектронная почта:\n${messageArray[i].email}\n\n💥Внимательно прочтите, замените окончания в тексте, поставьте своё имя, помните, это лишь образец💥\n\n${messageArray[i].message}`,
                {message_thread_id}
            
            ) 

        }

    }


}