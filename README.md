Этот бот сгенерирует текст подставления в предложения случайный элемент из заданного набора, Пример:

предложение №1 - "{1} мыла раму"
набор для предложения №1 для {1} - [ "Саша", "Маша" ]
Результат: с 50% вероятностью - "Саша мыла раму"
либо "Маща мыла раму"

Бот отсылает сообщения по запросу, но не чаще чем раз в 23 часа, Принимает обращения после нажатия соответствующей клавиши, и пересылает в указанный чат (поле "REPORT")

после первого запуска создаст файл settings.json
его нужно отредактировать как указано:

{

    "TOKEN" : Строка, получить можно в @BotFather || telegram api bot token - string,
    "ADMINS" : Массив с id пользователей-админов, они получают дополнительные опции || [ array of string - telegramId of admins],
    "REPORT" : Строка, id канала или группы куда бот будет пересылать ответы из департаментов,
    "BANNED" : В настоящий момент не используется,
    "DELAY_BETWEEN_GENERATIONS" : значение в милисекундах, стоит 23 часа, отвечает за задержку между генерациями,
    "DELAY_BETWEEN_MESSAGES" : задержка между сообщениями в милисекундах, стоит 3 секунды,

    "LIST_OF_DEPARTMENTS" : {


        "DEPARTMENT_1" : { Имя департамента, каким его увидит программа, важно только что бы они не повторялись, а вы не путались

            "name" : Строка, имя которое увидит пользователь || string - name of department
            "email" : Строка, емейл департамента, если отправка сложнее, тут можно описать просто строкой как отправлять || string - email of department for complaints
            "body" : {


                "var1" : "{1} по адресу Профсоюзная 123А с 1,2,3,4 и 123А к 25,26,27 происходит {2}, законная просьба предоставить документы привела к направлению в Управу района Ясенево, прошу предоставить документацию ",

                "var2" : второе сообщение, оно имеет равные шансы быть отосланным пользователю как и "var1", использует свои реплейсменты, и таких сообщений может быть сколько нужно

            },

            "replacements" : { - отсюда "var1" и "var2" будут получать замены в фигурные скобки по номерам, каждый из своего "var", например тут описано только для "var1"

                "var1" : { 

                    "1" : [ 

                    "Уведомляю, что",
                    "Довожу до сведения",
                    "Узнал что",
                    "Увидел, что",
                    "Выяснил, что",
                    "Обеспокоен тем, что"

                    ],

                    "2" : [

                        "снос домов",
                        "демонтаж зданий",
                        "какие-то работы",
                        "подозрительные работы"

                    ]

                }

            },
            
            "header" : Строка, добавляется на верх сообщения, это шапка письма || string - will be add on top of a message
            "footer" : Тоже самое, но внизу письма || string - will be add on bottom of a message

        }
    },

    "EDITED" : заменить на true по окончанию редактирования
}

--------------------------------------------------------

Для использования бота следует ввести команду /start, и затем нажать одну из соответствующих кнопок

Для обычного пользователя доступны кнопки:
"Получить обращения в департаменты"
"Сдать ответы на обращения"

Для администратора также доступны кнопки:
"Удалить меня из администраторов" - нужна для тестовых целей, человек вернётся назад в администраторы после перезапуска бота
"Обновить конфигурацию" - Нужна для дистанционной замены файла конфигурации, без доступа к компьютеру где он находится

--------------------------------------------------------

для запуска экземпляра, скачайте себе на компьютер репозиторий нажав на зелёную кнопку code<> и выбрав в самом низу download zip
Установите nodejs https://nodejs.org/en/download/package-manager (это долго)
откройте консаль (Win + R) затем cmd + Enter, в консоль введите "node -v" и если консоль напишет версию установленной ноды - 

Вписываем путь до папки: 
    - пишем cd, не нажимая энтер перетаскиваем index.js в консоль, страем в конце получившейся строки "index.js", жмём Enter
    - пишем node, не нажимая энтер перетаскиваем index.js в консоль, после того как перетащили - жмём энтер, бот запущен 
