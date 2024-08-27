//Импорт генераторов текста
import {checkSettings} from './libs/checkSettings.js';
import {generateMessagesForDepartments} from './libs/generateMessagesForDepartments.js';

//Импорт телеграм бота
import { tg } from './telegram/telegram.js'

//TODO горячая подгрузка конфигов
const settings = checkSettings();

let bot = tg(generateMessagesForDepartments, settings, handler, settings.TOKEN, settings.BOT_NAME, settings.HELP_MESSAGE, settings.ADMINS, settings.REPORT, settings.BANNED, settings.DELAY_BETWEEN_MESSAGES, settings.DELAY_BETWEEN_GENERATIONS,);

function handler(){

    //Нужен для наружней обработки запросов, в этой версии не задействован

}

//console.log(await bot.getFile('BQACAgIAAxkBAAIBQGbNdEMbflJ5D9p7BtsVSdAwGebHAAKVXAACgt9oSs7INSoE72nWNQQ'))
//file_path: 'documents/file_0.json'


// console.log('Пример генерации текста:');
// console.log(generateMessagesForDepartments(settings))