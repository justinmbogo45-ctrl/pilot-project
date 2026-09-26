import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PropFirmMapClient, numeric, validateFirm } from '../backend/propfirmmap';
import { mapCatalogFirm, planPrice, safeUrl } from '../src/lib/catalog';
import { fixtureFirm } from './fixtures';

test('unknown source values stay unknown and ambiguous numerics are not guessed',()=>{
  for(const value of [null,undefined,'','3% or 5%','60-100%','weekly'])assert.equal(numeric(value),null);
  assert.equal(numeric(0),0);assert.equal(numeric('89.50'),89.5);
  const firm=mapCatalogFirm(fixtureFirm());
  assert.equal(firm.plans[0].discountedPrice,null);
  assert.equal(firm.rules.newsTrading,null);
  assert.equal(firm.trustpilotScore,null);
  assert.equal(planPrice(firm.plans[0]),'Price not provided');
  assert.equal(safeUrl('javascript:alert(1)'),undefined);
});
test('firm validation rejects incomplete and duplicate challenge payloads',()=>{
  assert.throws(()=>validateFirm({...fixtureFirm(),challenges:null}));
  const f=fixtureFirm();f.challenges.push(f.challenges[0]);assert.throws(()=>validateFirm(f));
});
test('all pagination pages are collected and totals checked',async()=>{
  const paths:string[]=[];
  const fetcher:typeof fetch=async input=>{
    const url=new URL(String(input));paths.push(url.search);
    const page=Number(url.searchParams.get('page'));
    return Response.json({data:[{id:page}],meta:{current_page:page,last_page:2,total:2}});
  };
  const client=new PropFirmMapClient(fetcher,0,async()=>{});
  assert.deepEqual(await client.pages('/firms',50),[{id:1},{id:2}]);
  assert.equal(paths.length,2);assert.match(paths[1],/page=2/);
  const incomplete=new PropFirmMapClient(async()=>Response.json({data:[],meta:{current_page:1,last_page:1,total:4}}),0,async()=>{});
  await assert.rejects(()=>incomplete.pages('/firms',50),/Incomplete/);
});
test('429 responses respect retry windows and retry count is bounded',async()=>{
  let attempts=0;const delays:number[]=[];
  const client=new PropFirmMapClient(async()=>++attempts===1?new Response('',{status:429,headers:{'Retry-After':'90'}}):Response.json({data:[]}),0,async ms=>{delays.push(ms);});
  await client.get('/firms');assert.equal(attempts,2);assert.ok(delays.includes(90000));
  attempts=0;
  const failing=new PropFirmMapClient(async()=>{attempts++;return new Response('',{status:503});},0,async()=>{});
  await assert.rejects(()=>failing.get('/firms'),/503/);assert.equal(attempts,4);
});
