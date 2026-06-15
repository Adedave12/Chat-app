const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.jsx') || file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('c:/Users/adele/Projects/Chat-app/client/src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('react-hot-toast')) {
    content = content.replace(/import toast from ["']react-hot-toast["'];?/g, 'import { toast } from "sonner";');
    content = content.replace(/import \{ Toaster \} from ["']react-hot-toast["'];?/g, 'import { Toaster } from "sonner";');
    content = content.replace(/import toast, \{ Toaster \} from ["']react-hot-toast["'];?/g, 'import { toast, Toaster } from "sonner";');
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
  }
});
