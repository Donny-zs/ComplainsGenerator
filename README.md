edit settings as followed:

{

    "TOKEN" : telegram api bot token - string,
    "ADMINS" : [ array of string - telegramId of admins],

    "LIST_OF_DEPARTMENTS" : {

        "DEPARTMENT_1" : {

            "name" : string - name of department
            "email" : string - email of department for complaints
            "body" : {

                key : value

                messageID : message body with {n}, each {n} will be filled from "replacements".messageID.n by random element from array

                "var1" : "{1} по адресу Профсоюзная 123А с 1,2,3,4 и 123А к 25,26,27 происходит {2}, законная просьба предоставить документы привела к направлению в Управу района Ясенево, прошу предоставить документацию "

            },

            "replacements" : { - object with keys that must be same as body.messageID's, like "var1", if you create body.var2, then replacements.var2 must be as well

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
            
            "header" : string - will be add on top of a message
            "footer" : string - will be add on bottom of a message

        }
    },

    "EDITED" : заменить на true по окончанию редактирования
}