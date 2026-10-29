/* The app moved to a new address. This service worker replaces the old one on phones that
 * had the app installed: it deletes the old offline copy, unregisters itself and reloads,
 * so the next load follows the redirect to the new address. */
self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",e=>e.waitUntil((async()=>{
  const k=await caches.keys();await Promise.all(k.map(x=>caches.delete(x)));
  await self.registration.unregister();
  const cs=await self.clients.matchAll({type:"window"});cs.forEach(c=>{try{c.navigate(c.url)}catch(x){}});
})()));
