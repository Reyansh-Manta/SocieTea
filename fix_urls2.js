const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    const target = "${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'}";
    const replacement = "${process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `http://${window.location.hostname}:9000` : 'http://localhost:9000')}";

    if (content.includes(target)) {
        content = content.split(target).join(replacement);
        changed = true;
    }

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
