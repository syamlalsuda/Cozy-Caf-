import {cp, mkdir, readFile, writeFile, readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'build');
// Reject incomplete artwork before publishing it.
for (const name of await readdir(path.join(root,'dist/assets'))) {
 if (!name.endsWith('.webp')) continue;
 const bytes=await readFile(path.join(root,'dist/assets',name));
 if(bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP'||bytes.readUInt32LE(4)+8!==bytes.length)throw new Error('Invalid or truncated image: '+name);
}
await mkdir(out,{recursive:true});
await cp(path.join(root,'dist'),out,{recursive:true});
let code=await readFile(path.join(out,'game.js'),'utf8');
code=code.replace(/<button class="review-launch" data-action="levels">.*?<\/button>/g,'');
code=code.replace(/<button data-action="levels">.*?<\/button>/g,'');
code=code.replace("if(modal==='levels')body=levelReviewPanel();",'');
code=code.replace(/^function levelReviewPanel\(\).*\n/gm,'').replace(/^function startReview\(.*\n/gm,'');
const start=code.indexOf("if(a==='review-level')");
const end=code.indexOf("if(a==='music-toggle')",start);
if(start<0||end<0)throw new Error('Review handler layout changed; inspect production stripping.');
code=code.slice(0,start)+code.slice(end);
code=code.replace("'exterior','reset','levels'","'exterior','reset'");
if(/data-action="levels"|startReview|levelReviewPanel|review-level|review-order|leave-review|Levels · temporary|Level selection/.test(code))throw new Error('Development level controls remain in production.');
await writeFile(path.join(out,'game.js'),code);
console.log('Production build ready: cash-gated progression with three customer characters per level, no temporary level selector.');
