// Build first, then run: node scripts/capture.mjs
// The capture server owns a temporary account store and never touches user workspaces.
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { mkdir, access } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { randomUUID } from 'node:crypto';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(path.join(root,'frontend/package.json'));
const {chromium}=require('@playwright/test');
await access(path.join(root,'frontend/dist/index.html'));
await mkdir(path.join(root,'.impeccable/review'),{recursive:true});
const port=await new Promise((resolve,reject)=>{const server=createServer();server.once('error',reject);server.listen(0,'127.0.0.1',()=>{const selected=server.address().port;server.close(()=>resolve(selected));});});
const api=spawn(path.join(root,'.venv/bin/python'),['-m','backend.e2e_server'],{cwd:root,env:{...process.env,PORT:String(port)},stdio:['ignore','ignore','pipe']});
let apiErrors='';api.stderr.on('data',data=>{apiErrors+=data.toString()});
const origin=`http://127.0.0.1:${port}`;
let browser;
const errors=[];
let captures=0;
try{
 let ready=false;
 for(let attempt=0;attempt<80;attempt++){
  if(api.exitCode!==null)throw new Error(`Capture API exited: ${apiErrors.slice(-500)}`);
  try{ready=(await fetch(`${origin}/api/health`)).ok}catch{}
  if(ready)break;
  await new Promise(resolve=>setTimeout(resolve,100));
 }
 if(!ready)throw new Error('Capture API did not start.');
 browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||undefined,args:['--disable-gpu']});
 const anonymous=await browser.newContext();
 const authenticated=await browser.newContext();
 const registered=await authenticated.request.post(`${origin}/api/auth/register`,{data:{name:'Alex Morgan',email:'alex@schoolhouse.example',password:`Preview-only-${randomUUID()}`,sample_data:true}});
 if(registered.status()!==201)throw new Error('Could not create the isolated capture account.');
 async function capture(name,route,width,height,action,context=authenticated){
  const page=await context.newPage();await page.setViewportSize({width,height});
  page.on('pageerror',error=>errors.push(error.message));
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(origin+route);
  const authScreen=name.startsWith('auth-')||name.startsWith('register-');
  await page.getByRole('heading',{name:authScreen?'Welcome back.':route.includes('students')?'All students':'School overview',exact:true}).waitFor();
  await page.evaluate(()=>document.fonts.ready);
  if(action)await action(page);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw new Error(`${name}: document overflow`);
  await page.screenshot({path:path.join(root,`.impeccable/review/${name}.png`),fullPage:!['form-mobile','navigation-mobile'].includes(name)});
  captures++;await page.close();
 }
 const signup=page=>page.getByRole('group',{name:'Account access'}).getByRole('button',{name:'Create account',exact:true}).click();
 await capture('auth-desktop','/',1440,1000,null,anonymous);
 await capture('auth-mobile','/',390,844,null,anonymous);
 await capture('register-desktop','/',1440,1000,signup,anonymous);
 await capture('register-mobile','/',390,844,signup,anonymous);
 await capture('auth-error-mobile','/',390,844,async page=>{
  await page.getByLabel('Email address',{exact:true}).fill('example@example.test');
  await page.getByLabel('Password',{exact:true}).fill('Incorrect-passphrase');
  await page.getByRole('button',{name:'Sign in',exact:true}).last().click();
  await page.getByRole('alert').waitFor();
 },anonymous);
 await capture('desktop','/#overview',1440,1000);
 await capture('students-desktop','/#students',1440,1000);
 await capture('mobile','/#overview',390,844);
 await capture('form-mobile','/#students',390,844,page=>page.getByRole('button',{name:'Add student',exact:true}).click());
 await capture('students-mobile','/#students',390,844);
 await capture('user-1200','/#overview',1200,900);
 await capture('navigation-mobile','/#overview',390,844,page=>page.getByRole('button',{name:'Open navigation',exact:true}).click());
 console.log(JSON.stringify({captures,browserErrors:errors,storage:'temporary isolated account database'}));
}finally{
 if(browser)await browser.close();
 api.kill('SIGTERM');
}
