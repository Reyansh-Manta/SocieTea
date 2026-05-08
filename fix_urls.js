const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    content = content.replace(/"http:\/\/localhost:9000([^"]*)"/g, (match, p1) => {
        changed = true;
        return `\`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}${p1}\``;
    });

    content = content.replace(/`http:\/\/localhost:9000([^`]*)`/g, (match, p1) => {
        changed = true;
        return `\`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}${p1}\``;
    });

    if (changed) {
        fs.writeFileSync(filePath, content);
        console.log('Updated', filePath);
    }
}

function walkDir(dir) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (fs.statSync(dirPath).isDirectory()) {
            walkDir(dirPath);
        } else if (dirPath.endsWith('.tsx') || dirPath.endsWith('.ts')) {
            processFile(dirPath);
        }
    });
}

walkDir('/home/reyansh-manta/socieTea/SocieTea/frontend/my-app/app');
