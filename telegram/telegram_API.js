export async function getMe() {

    const answer = await this.send({
        url : `https://api.telegram.org/bot${this.apiKey}/getMe`,
        options : {
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json'
            }
        }
    })
    
    return answer

}


/**
 * Метод отправки сообщения
 * @param {Number || String} chat_id 
 * @param {String} text 
 * @param {Object} extra Может быть одним из следующих значений:
 * 
 * message_thread_id - Идентификатор топика, без него не отправить сообщение в супергруппу-форум
 * parse_mode - метод форматирования, @see https://core.telegram.org/bots/api#formatting-options
 * link_preview_options - опции формирования превью внешних ссылок @see https://core.telegram.org/bots/api#linkpreviewoptions
 * disable_notification - отключение уведомлений, Boolean
 * protect_content - защита контента, Boolean
 * reply_parameters - параметры для создания цитирования другого сообщения @see https://core.telegram.org/bots/api#replyparameters
 * reply_markup - Передача клавиатуры под сообщением:
 *   InlineKeyboardMarkup - @see https://core.telegram.org/bots/api#inlinekeyboardmarkup
 *   ReplyKeyboardMarkup - @see https://core.telegram.org/bots/api#replykeyboardmarkup
 *   ReplyKeyboardRemove - @see https://core.telegram.org/bots/api#replykeyboardremove
 *   ForceReply - @see https://core.telegram.org/bots/api#forcereply
 * 
 */
export async function sendMessage (chat_id, text, extra = {}) {

    const body = new FormData();

    body.append('chat_id', chat_id);
    body.append('text', text);
    Object.keys(extra).forEach(key => body.append(key, extra[key]));

    const options = {
        method : 'POST',
        body
    }

    const answer = await this.send({
        url: `https://api.telegram.org/bot${this.apiKey}/sendMessage`,
        options
    })

    return answer

}

export async function editMessageText (previousMessage, newText, extra = {}) {

    const body = new FormData();

    body.append('chat_id', previousMessage.result.chat.id);
    body.append('message_id', previousMessage.result.message_id);
    body.append('text', newText);
    Object.keys(extra).forEach(key => body.append(key, extra[key]));
    
    const options = {
        method : 'POST',
        body
    }

    const answer = await this.send({
        url: `https://api.telegram.org/bot${this.apiKey}/editMessageText`,
        options
    })
    
    return answer
    
}

export async function forwardMessage (chat_id, from_chat_id, message_id, extra = {}) {
    /**
     * chat_id - чат куда будет послано
     * from_chat_id - чат откуда будет переслано
     * message_id - номер сообщения пересылаемого
     * 
     * extra:
     * 
     * 
     */
    
    const body = new FormData();
    
    body.append('chat_id', chat_id);
    body.append('from_chat_id', from_chat_id);
    body.append('message_id', message_id);
    Object.keys(extra).forEach(key => body.append(key, extra[key]));

    const options = {

        method : 'POST',
        body

    }

    const answer = await this.send({
        url : `https://api.telegram.org/bot${this.apiKey}/forwardMessage`,
        options
    })

    return answer
    
}

/**
 * Отправляет фото, поддерживается буферизованный вид
 * @param {*} chat_id 
 * @param {*} photo 
 * @param {*} extra - Может быть одним из следующих типов:
 * 
 * message_thread_id - необходимо указывать если это супергруппа-форум
 * caption - text для фотографии
 * parse_mode - варианты отображения контента, @see https://core.telegram.org/bots/api#formatting-options
 * has_spoiler - Спрячет фотографию под спойлер, Boolean
 * disable_notification - Отключить оповещения, Boolean
 * protect_content - Отключает возможность копировать сообщение, Boolean
 * reply_parameters	- @see https://core.telegram.org/bots/api#replyparameters
 * reply_markup - Передача клавиатуры под сообщением:
 *   InlineKeyboardMarkup - @see https://core.telegram.org/bots/api#inlinekeyboardmarkup
 *   ReplyKeyboardMarkup - @see https://core.telegram.org/bots/api#replykeyboardmarkup
 *   ReplyKeyboardRemove - @see https://core.telegram.org/bots/api#replykeyboardremove
 *   ForceReply - @see https://core.telegram.org/bots/api#forcereply
 */
export async function sendPhoto(chat_id, photo, extra = {}) {

    const body = new FormData();
    
    body.append('chat_id', chat_id);
    body.append('photo', new Blob ([photo]), 'photo.png');
    Object.keys(extra).forEach(key => body.append(key, extra[key]));

    const options = {

        method : 'POST',
        body

    }

    const answer = await this.send({
        url : `https://api.telegram.org/bot${this.apiKey}/sendPhoto`,
        options
    })
    
    return answer

}


/**
 * Отправка несжатых документов, например hiRes фотографий, pdf, xml и т.д.
 * {Number or String} chat_id
 * {Buffer} document
 * {String} document_type - разрешение документа например '.jpg', '.png', '.pdf', '.doc', '.docx'
 * extra - может быть одним из следующих типов:
 *  thumbnail - файл для превью @see https://core.telegram.org/bots/api#sending-files
 *  disable_content_type_detection - Отключает проверку файла на серверсайде
 *  parse_mode - варианты отображения контента, @see https://core.telegram.org/bots/api#formatting-options
 *  has_spoiler - Спрячет фотографию под спойлер, Boolean
 *  disable_notification - Отключить оповещения, Boolean
 *  protect_content - Отключает возможность копировать сообщение, Boolean
 *  reply_parameters	- @see https://core.telegram.org/bots/api#replyparameters
 *  reply_markup - Передача клавиатуры под сообщением:
 *  InlineKeyboardMarkup - @see https://core.telegram.org/bots/api#inlinekeyboardmarkup
 *  ReplyKeyboardMarkup - @see https://core.telegram.org/bots/api#replykeyboardmarkup
 *  ReplyKeyboardRemove - @see https://core.telegram.org/bots/api#replykeyboardremove
 *  ForceReply - @see https://core.telegram.org/bots/api#forcereply
 *  
 */
export async function sendDocument(chat_id, document,document_type, extra = {}) {

    const body = new FormData();
    
    body.append('chat_id', chat_id);
    body.append('document', new Blob ([document]), `Document.${document_type}`);
    Object.keys(extra).forEach(key => body.append(key, extra[key]));

    const options = {

        method : 'POST',
        body

    }

    const answer = await this.send({
        url : `https://api.telegram.org/bot${this.apiKey}/sendDocument`,
        options
    })
    
    return answer

}


/**
 * 
 * @param {Number or String} chat_id 
 * @param {*} action - Один из приведённых внизу:
 * @param {Number} message_thread_id - Не обязателен, только для супергрупп-форумов
 * 
 * Действия: typing for text messages, upload_photo for photos, record_video or upload_video for videos, record_voice or upload_voice for voice notes, upload_document for general files, choose_sticker for stickers, find_location for location data, record_video_note or upload_video_note for video notes
 */
export async function sendChatAction(chat_id, action, message_thread_id){

    const body = new FormData();
    
    body.append('chat_id', chat_id);
    body.append('action', action);
    if (message_thread_id) {
        body.append('message_thread_id', message_thread_id);
    }

    const options = {

        method : 'POST',
        body

    }

    const answer = await this.send({
        url : `https://api.telegram.org/bot${this.apiKey}/sendChatAction`,
        options
    })
    
    return answer

}

//Позволяет покинуть группу если пользователь решил добавить моего бота в свою группу
export async function leaveChat (chat_id) {

    const body = new FormData();
    body.append('chat_id', chat_id);

    const answer = await this.send({
        url : `https://api.telegram.org/bot${this.apiKey}/leaveChat`,
        options : {
            method : 'POST',
            body
        }
    })
    
    return answer
}

/**
 * {number} chat_id
 * {number} user_id
 * {boolean} only_if_banned - will not affect if user is not banned when true, when false kick user
 */
export async function unbanChatMember(chat_id, user_id, only_if_banned) {

    const body = new FormData();
    body.append('chat_id', chat_id);
    body.append('user_id', user_id);
    if (only_if_banned) {
        body.append('only_if_banned', only_if_banned);
    }

    const answer = await this.send({
        url : `https://api.telegram.org/bot${this.apiKey}/unbanChatMember`,
        options : {
            method : 'POST',
            body
        }
    })
    
    return answer

}

export async function kickChatMember(chat_id, user_id) {

    const body = new FormData();
    body.append('chat_id', chat_id);
    body.append('user_id', user_id);
    body.append('only_if_banned', false);

    const answer = await this.send({
        url : `https://api.telegram.org/bot${this.apiKey}/unbanChatMember`,
        options : {
            method : 'POST',
            body
        }
    })
    
    return answer

}

export async function getFile(file_id) {

    const body = new FormData();
    body.append('file_id', file_id);

    const answer = await this.send({
        url : `https://api.telegram.org/bot${this.apiKey}/getFile`,
        options : {
            method : 'POST',
            body
        }
    })
    
    return answer

}

export async function downloadFile(file_id) {

    const file = await this.getFile(file_id);    
    const file_path = file.result.file_path;

    if (file.ok){

        const answer = await  fetch(`https://api.telegram.org/file/bot${this.apiKey}/${file_path}`).then((res) => res.json());

        return {
            ok : true,
            data : answer
        }

    }

    return {
        ok : false,
        error : file.data
    }

}






//====Сервисные функции==============================================================================================================================

function send( data ) {

    return this.queue.send( data )

}




//====Примеры синтаксиса==============================================================================================================================

//------Отправка фото------------------------------------------------------------------------------------------------------------------------------------------------------------

//this.sendPhoto(data.message.chat.id, await screenshot( fs.readFileSync('./test2.html', 'utf8') )  ) 
// Или
//this.sendPhoto(data.message.chat.id, await screenshot( <html></html> )  ) 


//----Отправка кнопки---------------------------------------------------------------------------------------------------------------------------------

// this.sendMessage(data.message.chat.id, 'Тестовое сообщение демонстрирующее поведение кнопок', 
    // {
    //     "reply_markup": JSON.stringify({
    //         "inline_keyboard": 
    //             [   
    //                 [
    //                     {
    //                         "text": "A",
    //                         "callback_data": "A1"            
    //                     }, 
    //                     {
    //                         "text": "B",
    //                         "callback_data": "C1"            
    //                     }
    //                 ],
    //                 [
    //                     {
    //                         "text": "C",
    //                         "callback_data": "C1"            
    //                     }, 
    //                     {
    //                         "text": "D",
    //                         "callback_data": "D1"            
    //                     }   
    //                 ]
    //             ]   
    //         }
    //     )
    // }
// )

