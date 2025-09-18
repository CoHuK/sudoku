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
const scriptPath = path.join(__dirname, 'frontend', 'script.js');
const stylePath = path.join(__dirname, 'frontend', 'style.css');
const criticalPath = path.join(__dirname, 'frontend', 'critical.css');
const indexPath = path.join(__dirname, 'frontend', 'index.html');

// Read files
const scriptContent = fs.readFileSync(scriptPath, 'utf8');
const styleContent = fs.readFileSync(stylePath, 'utf8');
const criticalContent = fs.readFileSync(criticalPath, 'utf8');
const indexContent = fs.readFileSync(indexPath, 'utf8');

// Minify files
const minifiedScript = minifyJS(scriptContent);
const minifiedStyle = minifyCSS(styleContent);
const minifiedCritical = minifyCSS(criticalContent);

// Create optimized HTML with inlined critical CSS
const optimizedHTML = indexContent
    .replace(/<link rel="stylesheet" href="style\.css">/g, '')
    .replace(/<style>[\s\S]*?<\/style>/g, `<style>${minifiedCritical}</style>`)
    .replace(/<script src="script\.js"><\/script>/g, '<script src="script.min.js" defer></script>')
    .replace(/<link rel="preload" href="style\.css" as="style" onload="this\.onload=null;this\.rel='stylesheet'">/g, '')
    .replace(/<noscript><link rel="stylesheet" href="style\.css"><\/noscript>/g, '');

// Write minified files
fs.writeFileSync(path.join(__dirname, 'frontend', 'script.min.js'), minifiedScript);
fs.writeFileSync(path.join(__dirname, 'frontend', 'style.min.css'), minifiedStyle);
fs.writeFileSync(path.join(__dirname, 'frontend', 'index.optimized.html'), optimizedHTML);

// Add non-blocking CSS loading
const finalHTML = optimizedHTML.replace(
    '</head>',
    `<link rel="preload" href="style.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="style.min.css"></noscript>
</head>`
);

fs.writeFileSync(path.join(__dirname, 'frontend', 'index.optimized.html'), finalHTML);

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
