import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { extname, join, parse } from 'node:path';
import { spawnSync } from 'node:child_process';

const [, , inputDir, outputDir = inputDir] = process.argv;

if (!inputDir) {
  console.error('Usage: npm run images:prepare -- <input-folder> [output-folder]');
  process.exit(1);
}

if (!existsSync(inputDir)) {
  console.error(`Input folder not found: ${inputDir}`);
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });

const sizes = [
  { suffix: 'hero', edge: 2800, quality: 82 },
  { suffix: 'rail', edge: 2000, quality: 80 },
  { suffix: 'thumb', edge: 1000, quality: 75 },
];

const files = readdirSync(inputDir).filter((file) => /\.(jpe?g|png|tiff?|webp)$/i.test(file));

files.forEach((file) => {
  const source = join(inputDir, file);
  const name = parse(file).name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  sizes.forEach((size) => {
    const output = join(outputDir, `${name}-${size.suffix}.webp`);
    const result = spawnSync('sips', [
      '-s', 'format', 'webp',
      '-s', 'formatOptions', String(size.quality),
      '-Z', String(size.edge),
      source,
      '--out',
      output,
    ], { stdio: 'inherit' });

    if (result.status !== 0) {
      console.error(`Failed to prepare ${file}${extname(file)} as ${size.suffix}.`);
      process.exit(result.status || 1);
    }
  });
});

console.log(`Prepared ${files.length} image(s) into ${outputDir}`);
