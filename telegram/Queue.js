import { debug } from '../libs/debug.js'
import { callTg } from '../telegram/callTg.js'

export class Queue {


    constructor (delay) {

        this.isBusy = false
        this.delay = delay

        this.timer = null

        this.queue = []

    }

    /*
    * Добавляет в массив очереди запрос обёрнутый в промис, который резолвится внутри handler
    * 
    */
    send (request) {
        
        return new Promise( (resolve) => {
            
            this.queue.push({resolve, request, timesCalled : 0})
            this.handler()

        })
    }

    handler () {
        
        if (this.isBusy) {return}
        this.isBusy = true

        const element = this.look()

        if (!element) {return this.isBusy = false}

        if (element.timesCalled > 3) {

            debug(`Queue: Превышено количество повторных попыток обращения к методу ${new URL(element.request.url).pathname.split('/').pop()}`)
            this.remove()
            element.resolve({ok: false, data : 'Превышено количество попыток обращения к методу'})
            this.isBusy = false

            return
        }

        const answer = callTg(element.request)

        answer.then( async (result) => {
           

            if (result.ok) {

                if (result.data.error_code === 429) {

                    debug('stop Spaming for ' + result.data.parameters.retry_after + ' seconds');

                    setTimeout(() => {
    
                        this.isBusy = false
                        this.handler()
            
                    }, result.data.parameters.retry_after * 1000)
    
                    return

                }

                element.resolve(result.data)
                this.remove()

                setTimeout(() => {

                    this.isBusy = false
                    this.handler()
        
                }, this.delay)

                return

            } else {

                this.queue[0].timesCalled += 1

                setTimeout(() => {

                    this.isBusy = false
                    this.handler()
        
                }, this.delay)

                return

            }

        })

    }

    look () {

        return this.queue[0]

    }

    remove () {

        return this.queue.shift()

    }

}