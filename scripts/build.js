#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple minification functions
function minifyCSS(css) {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/;\s*}/g, '}') // Remove semicolon before closing brace
        .replace(/\s*{\s*/g, '{') // Remove spaces around opening brace
        .replace(/\s*}\s*/g, '}') // Remove spaces around closing brace
        .replace(/\s*;\s*/g, ';') // Remove spaces around semicolons
        .replace(/\s*,\s*/g, ',') // Remove spaces around commas
        .replace(/\s*:\s*/g, ':') // Remove spaces around colons
        .replace(/\s*>\s*/g, '>') // Remove spaces around >
        .replace(/\s*\+\s*/g, '+') // Remove spaces around +
        .replace(/\s*~\s*/g, '~') // Remove spaces around ~
        .replace(/\s*\[\s*/g, '[') // Remove spaces around [
        .replace(/\s*\]\s*/g, ']') // Remove spaces around ]
        .replace(/\s*\(\s*/g, '(') // Remove spaces around (
        .replace(/\s*\)\s*/g, ')') // Remove spaces around )
        .trim();
}

function minifyJS(js) {
    return js
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
        .replace(/\/\/.*$/gm, '') // Remove line comments
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\s*{\s*/g, '{') // Remove spaces around opening brace
        .replace(/\s*}\s*/g, '}') // Remove spaces around closing brace
        .replace(/\s*;\s*/g, ';') // Remove spaces around semicolons
        .replace(/\s*,\s*/g, ',') // Remove spaces around commas
        .replace(/\s*:\s*/g, ':') // Remove spaces around colons
        .replace(/\s*\(\s*/g, '(') // Remove spaces around (
        .replace(/\s*\)\s*/g, ')') // Remove spaces around )
        .replace(/\s*\[\s*/g, '[') // Remove spaces around [
        .replace(/\s*\]\s*/g, ']') // Remove spaces around ]
        .replace(/\s*=\s*/g, '=') // Remove spaces around =
        .replace(/\s*\+\s*/g, '+') // Remove spaces around +
        .replace(/\s*-\s*/g, '-') // Remove spaces around -
        .replace(/\s*\*\s*/g, '*') // Remove spaces around *
        .replace(/\s*\/\s*/g, '/') // Remove spaces around /
        .replace(/\s*%\s*/g, '%') // Remove spaces around %
        .replace(/\s*&&\s*/g, '&&') // Remove spaces around &&
        .replace(/\s*\|\|\s*/g, '||') // Remove spaces around ||
        .replace(/\s*==\s*/g, '==') // Remove spaces around ==
        .replace(/\s*!=\s*/g, '!=') // Remove spaces around !=
        .replace(/\s*===\s*/g, '===') // Remove spaces around ===
        .replace(/\s*!==\s*/g, '!==') // Remove spaces around !==
        .replace(/\s*<\s*/g, '<') // Remove spaces around <
        .replace(/\s*>\s*/g, '>') // Remove spaces around >
        .replace(/\s*<=\s*/g, '<=') // Remove spaces around <=
        .replace(/\s*>=\s*/g, '>=') // Remove spaces around >=
        .trim();
}

// Read source files
const scriptPath = path.join(__dirname, '..', 'frontend', 'script.js');
const stylePath = path.join(__dirname, '..', 'frontend', 'style.css');
const indexPath = path.join(__dirname, '..', 'frontend', 'index.html');

// Read files
const scriptContent = fs.readFileSync(scriptPath, 'utf8');
const styleContent = fs.readFileSync(stylePath, 'utf8');
const indexContent = fs.readFileSync(indexPath, 'utf8');

// Minify files
const minifiedScript = minifyJS(scriptContent);
const minifiedStyle = minifyCSS(styleContent);

// Extract critical CSS (above-the-fold styles)
const criticalCSS = `
body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f0f0f0; }
.container { max-width: 800px; margin: 0 auto; padding: 20px; }
h1 { text-align: center; color: #333; margin-bottom: 20px; }
.difficulty-controls { margin-bottom: 20px; text-align: center; }
.sudoku-container { display: flex; justify-content: center; margin: 20px 0; }
.sudoku-grid { display: grid; grid-template-columns: repeat(9, 45px); grid-template-rows: repeat(9, 45px); gap: 2px; background: #333; padding: 8px; border-radius: 10px; }
.cell { background: white; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; cursor: pointer; }
.cell:nth-child(3n):not(:nth-child(9n)) { border-right: 3px solid #333; }
.cell:nth-child(n+19):nth-child(-n+27), .cell:nth-child(n+46):nth-child(-n+54) { border-bottom: 3px solid #333; }
[role="rowgroup"] .cell:nth-child(3n):not(:nth-child(9n)) { border-right: 3px solid #333; }
[role="rowgroup"] [role="row"]:nth-child(3n) .cell, [role="rowgroup"] [role="row"]:nth-child(6n) .cell { border-bottom: 3px solid #333; }
.cell:hover { background: #f0f8ff; }
.cell.selected { background: #e3f2fd; border: 2px solid #2196F3; }
.cell.prefilled { background: #f5f5f5; color: #333; }
.cell.error { background: #ffebee; color: #d32f2f; }
.cell.success { background: #e8f5e8; color: #2e7d32; }
.game-controls { text-align: center; margin-bottom: 20px; }
.btn { padding: 10px 20px; margin: 0 5px; border: none; border-radius: 4px; background-color: #007bff; color: white; cursor: pointer; font-size: 16px; }
.btn:hover { background-color: #0056b3; }
.feedback { text-align: center; margin: 20px 0; padding: 10px; border-radius: 4px; font-weight: bold; }
.feedback.success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
.feedback.error { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
.feedback.info { background-color: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
.feedback.solved { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
`;

const minifiedCritical = minifyCSS(criticalCSS);

// Create optimized HTML with inlined critical CSS
const optimizedHTML = indexContent
    .replace(/<link rel="stylesheet" href="style\.css">/g, '')
    .replace(/<script src="script\.js" defer><\/script>/g, '<script src="script.js" defer></script>')
    .replace(/<script src="script\.js"><\/script>/g, '<script src="script.js" defer></script>')
    .replace(/<link rel="preload" href="style\.css" as="style" onload="this\.onload=null;this\.rel='stylesheet'">/g, '')
    .replace(/<noscript><link rel="stylesheet" href="style.css"><\/noscript>/g, '')
    .replace(/<title>Sudoku Game<\/title>/, `<title>Sudoku Game</title>
    <style>${minifiedCritical}</style>`);

// Write minified files
fs.writeFileSync(path.join(__dirname, '..', 'frontend', 'script.min.js'), minifiedScript);
fs.writeFileSync(path.join(__dirname, '..', 'frontend', 'style.min.css'), minifiedStyle);
fs.writeFileSync(path.join(__dirname, '..', 'frontend', 'index.optimized.html'), optimizedHTML);

// Add non-blocking CSS loading
const finalHTML = optimizedHTML.replace(
    '</head>',
    `<link rel="preload" href="style.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="style.css"></noscript>
</head>`
);

fs.writeFileSync(path.join(__dirname, '..', 'frontend', 'index.optimized.html'), finalHTML);

console.log('Build completed!');
console.log('Generated files:');
console.log('- script.min.js (minified JavaScript)');
console.log('- style.min.css (minified CSS)');
console.log('- index.optimized.html (optimized HTML with inlined critical CSS)');
console.log('');
console.log('File sizes:');
console.log(`- script.min.js: ${Math.round(minifiedScript.length / 1024 * 100) / 100} KB`);
console.log(`- style.min.css: ${Math.round(minifiedStyle.length / 1024 * 100) / 100} KB`);
console.log(`- index.optimized.html: ${Math.round(finalHTML.length / 1024 * 100) / 100} KB`);
