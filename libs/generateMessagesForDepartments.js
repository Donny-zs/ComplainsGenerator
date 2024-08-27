/**
 * Generates a message for a given department by replacing placeholders in the message body with random values from the replacements.
 * @param {Object} department - The department object containing the message body, replacements, header, footer, and name.
 */
function generateMessage(department) {

    const { body, replacements, header, footer, name, email } = department;

    const randomIndex = Math.floor(Math.random() * Object.keys(body).length)

    const randomMessage = Object.keys(body)[randomIndex]

    let message = body[randomMessage];

    for (const replacementKey in replacements[randomMessage]) {

        const replacementValues = replacements[randomMessage][replacementKey];
        const regex = new RegExp(`\\{${replacementKey}\\}`, 'g');
        message = message.replace(regex, () => replacementValues[Math.floor(Math.random() * replacementValues.length)]);

    }

    message = `${header}\n\n${message}\n${footer}`

    return {

        message,
        name,
        email,

    }

    
    
}

/**
 * Iterates through the list of departments and generates messages for each one.
 * @param {Object} data - The data object containing the LIST_OF_DEPARTMENTS.
 */
export function generateMessagesForDepartments(data) {

    let answerArray = [];

    for (const departmentKey in data.LIST_OF_DEPARTMENTS) {
        answerArray.push(generateMessage(data.LIST_OF_DEPARTMENTS[departmentKey]))
    }

    return answerArray

}