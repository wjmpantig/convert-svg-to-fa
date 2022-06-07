const { parse } = require('svg-parser');
const fs = require('fs');
const path = require('path');
const args = process.argv.slice(2);
const SVGPathCommander = require('svg-path-commander')
const [input] = args;

const file = fs.readFileSync(path.resolve(input), { encoding: 'utf-8'});
const svg = parse(file);


const [root] = svg.children;
const {properties, tagName, children} = root;
if (tagName !== 'svg') {
  console.error('invalid file');
  return;
}
const { width, height } = properties;

const reducer = (arr, item) => {
  const { children, properties, tagName } = item;
  // console.log({ item })
  if (tagName === 'g') {
    return children.reduce(reducer, arr);
  }
  if (tagName === 'path') {
    if (properties.d.includes('\r')){
      return arr.concat(properties.d.replace(/\s/g, '').replace('  ',' '))      
    }
    arr.push(properties.d)
    return arr;
  }
  if (tagName === 'circle') {
    const { cx, cy, r } = properties;
    const d = `M ${cx} ${cy} m -${r}, 0 a ${r}, ${r} 0 1,0 ${r*2}, 0 a ${r}, ${r} 0 1,0 -${r*2}, 0`;
    arr.push(d);
    return arr;
  }
  return arr;
}
const pathArr = children.reduce(reducer, []).map(pathStr => {
  const path = new SVGPathCommander(pathStr, { round: 'auto'}).transform({
    origin: [0,0,0],
    translate: [0, 0, 0]
  })
  .toAbsolute()
  
  .optimize()
  const out = path.toString()
  console.log({path: pathStr, out})
  return out;
});
console.log({ width, height, pathArr })
const output = pathArr.join(' ')

console.log({ output })