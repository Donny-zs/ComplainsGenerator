import fs from 'fs';


export function checkSettings() {

    let settings = null

    try{

        settings = fs.readFileSync('./settings.json', 'utf8')

    }catch(err){
        
        console.error('Settings not found');
        console.log('Creating new settings...');
        fs.writeFileSync('./settings.json', JSON.stringify(JSON.parse(fs.readFileSync('./libs/template.json', 'utf8')), null, 4), 'utf8');
        console.log('Settings successfully created');
        console.log('Please, edit settings.json and restart the program');
        console.log('read REAMDME.md for more info');
        
        process.exit(1); 

    }

    settings = JSON.parse(settings)

    if (!settings.EDITED) {

        console.error('Settings not edited et, or flag EDITED is forgoten to set to true');
        console.log('Please, edit settings.json and restart the program');
        console.warn('read REAMDME.md for more info');
        
        process.exit(1);

    }

    return settings

}

















export function checkSettings1() {

    let settings = null

    fs.stat('./settings.json', (err, stat) => {
        if (err == null) {
    
            console.log('Settings successfully loaded');
            settings = fs.readFileSync('./settings.json', 'utf8');

        } else if (err.code === 'ENOENT') {
            
            console.log('Settings not found');
            console.log('Creating new settings...');
    
            fs.writeFileSync('./settings.json', JSON.stringify(JSON.parse(fs.readFileSync('./libs/template.json', 'utf8')), null, 4), 'utf8');
            
            console.log('Settings successfully created');
            console.log('Please, edit settings.json and restart the program');
            console.warn('read REAMDME.md for more info');
            
            process.exit(1);
            
        } else {
            console.log('Some other error: ', err.code);

            process.exit(1);
        }
    });

    return settings

}