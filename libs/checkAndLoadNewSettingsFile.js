import { error } from 'console';
import fs from 'fs';

export function checkAndLoadNewSettingsFile(file, desirableName = null) {

    if (!file.ok) {
        return {ok:false, error : file.data}
    }

    console.log('FILE: ------------------');
    
    console.log(file);
    

    if (!checkJSON(file.data)) {
        return {ok:false, error : 'Ошибка при чтении JSON файла'}
    }

    let report = checkFullfillness(file.data)

    if (!report.ok) {
        return {ok:false, error : report.data}
    }

    fs.writeFileSync(`./${desirableName || 'settings.json'}`, JSON.stringify(file.data), 'utf8')

    return {ok:true}

}

function checkJSON(file) {

    try {
        JSON.stringify(file.data);
        return true
    } catch (e) {
        return false;
    }

}

//Проверяет, имеются ли все нужные поля
function checkFullfillness(file){

    let report = {ok : true, data : 'Отсутствуют обязательные поля в JSON-файле: '}
    
    let keysJsonHave = Object.keys(file)

    for (let key of keysFileMustContain) {

        if (!keysJsonHave.includes(key)) {

            report.ok = false

            report.data += `${key}, `

        }

    }

    return report

}

let keysFileMustContain = [
    'TOKEN',
    'BOT_NAME',
    'ADMINS',
    'HELP_MESSAGE',
    'LIST_OF_DEPARTMENTS',
    'EDITED'
]