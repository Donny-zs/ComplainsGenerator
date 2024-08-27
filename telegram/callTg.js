/**
 * Получает метод и данные на входе
 * 
 * выполняет вызов API
 * 
 * возвращает данные
 */

export async function callTg(message) {

    try {

        return { ok : true, data : await fetch(message.url, message.options) .then(answer => answer.json()) }

    } catch (err) {

        return { ok : false, data : err}

    }

}