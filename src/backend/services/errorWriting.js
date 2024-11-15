const fs = require('fs');
const path = require('path');

function writeError(nameOfFile, extraElement, errorMessage) {
    

    try {
        const logDir = path.join(__dirname,'..', '..', '..', 'errors');
        const logFilePath = path.join(logDir, `${nameOfFile}.log`);

        fs.mkdirSync(logDir, { recursive: true });

        const content = `Error processing ${extraElement}:\n${errorMessage}\n`;

        fs.writeFileSync(logFilePath, content, { flag: 'a' });

    } catch (err) {
        const fallbackLog = path.join(__dirname, 'errors', 'scraperErrors.log');
        const fallbackContent = `Failed to log error for ${nameOfFile}: ${err.message}\n`;
        fs.appendFileSync(fallbackLog, fallbackContent, 'utf8');
    }
}

module.exports = { writeError };