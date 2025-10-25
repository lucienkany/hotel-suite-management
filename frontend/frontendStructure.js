import fs from 'fs';
import path from 'path';

function getStructure(dir, prefix = '') {
  const items = fs.readdirSync(dir);
  let structure = '';

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const isDir = fs.statSync(fullPath).isDirectory();
    structure += `${prefix}├── ${item}\n`;
    if (isDir) {
      structure += getStructure(fullPath, prefix + '│   ');
    }
  }

  return structure;
}

const folder = './app'; // 👈 change to the folder you want
const output = getStructure(folder);
fs.writeFileSync('folder_structure.txt', output);
console.log('✅ Folder structure saved to folder_structure.txt');
