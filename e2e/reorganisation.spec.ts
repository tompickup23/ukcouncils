import {test,expect} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {councilPages} from '../src/lib/paths';
import {reorganisationFor, reorganisationData} from '../src/lib/reorganisation';
const pages=councilPages().filter(({council})=>reorganisationFor(council.gss));
const folder='output/playwright/b4';
test.beforeEach(async ({page})=>{
  await page.route('https://static.cloudflareinsights.com/**',route=>route.abort());
  await page.route('https://cloudflareinsights.com/**',route=>route.abort());
});
for(const theme of ['light','dark'] as const) {
  if(theme === 'light') for(let offset=0;offset<pages.length;offset+=16) {
    test(`all panel layouts in ${theme}, group ${offset/16+1}`,async({page})=>{
      await page.emulateMedia({colorScheme:theme});
      for(const {council} of pages.slice(offset,offset+16)) {
        await page.goto(`/councils/${council.slug}/`);
        const panel=page.locator('#reorganisation');
        await expect(panel).toHaveCount(1);
        await expect(panel.locator('[data-step]')).toHaveCount(5);
        expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth),council.slug).toBeLessThanOrEqual(2);
        expect(await panel.locator('.reorg-rail').evaluate(el=>el.scrollWidth-el.clientWidth),council.slug).toBeLessThanOrEqual(2);
        expect(await panel.locator('svg').getAttribute('aria-label')).toContain(reorganisationFor(council.gss)!.area.name);
      }
    });
  }
  for(const slug of ['elmbridge','cheltenham','west-berkshire','lewes','burnley','isle-of-wight','norwich','adur','birmingham']) {
    test(`${slug} reorganisation captures in ${theme}`,async({page},testInfo)=>{
      await page.emulateMedia({colorScheme:theme});
      await page.goto(`/councils/${slug}/`);
      await page.evaluate(theme=>{localStorage.setItem('ukcouncils-theme',theme);document.documentElement.dataset.theme=theme;},theme);
      await page.evaluate(()=>document.fonts.ready);
      mkdirSync(folder,{recursive:true});
      const prefix=`${folder}/${slug}-${testInfo.project.name}-${theme}`;
      await page.screenshot({path:`${prefix}-first-screen.png`});
      if(slug==='birmingham')await expect(page.locator('#reorganisation')).toHaveCount(0);
      else {
        const panel=page.locator('#reorganisation');
        await panel.screenshot({path:`${prefix}-panel.png`,style:'.site-header-bar { visibility: hidden; }'});
        await panel.locator('.reorg-rail').screenshot({path:`${prefix}-rail.png`,style:'.site-header-bar { visibility: hidden; }'});
      }
      if(slug==='burnley' && testInfo.project.name==='mobile') {
        await page.evaluate(()=>window.scrollTo(0,0));
        const amount=page.locator('#council-tax [data-band-panel="D"] [data-figure]').first();
        const box=await amount.boundingBox();
        expect(box).toBeTruthy();
        expect(box!.y+box!.height).toBeLessThanOrEqual(812);
        expect(box!.x+box!.width).toBeLessThanOrEqual(375);
      }
    });
  }
}
test('save one rendered panel per area for source review',async({page},testInfo)=>{
  if(testInfo.project.name!=='desktop')return;
  const review=[];
  for(const area of reorganisationData.areas) {
    const council=pages.find(p=>area.councils.some(c=>c.gss===p.council.gss))!.council;
    await page.goto(`/councils/${council.slug}/`);
    review.push({area:area.id,council:council.slug,text:await page.locator('#reorganisation').innerText()});
  }
  mkdirSync(folder,{recursive:true});
  writeFileSync(`${folder}/rendered-area-review.json`,JSON.stringify(review,null,2)+'\n');
});
