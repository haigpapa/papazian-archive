const fs = require('fs');
const data = require('./src/data/nodes.json');
const expanded = [];
for (let i = 0; i < 99; i++) {
  const template = data[i % data.length];
  expanded.push({
    ...template,
    id: i + 1,
    title: template.title + (i >= data.length ? ' \u2014 ' + Math.floor(i / data.length + 1) : '')
  });
}
fs.writeFileSync('./src/data/nodes.json', JSON.stringify(expanded, null, 2));
console.log('Expanded to ' + expanded.length + ' nodes');
