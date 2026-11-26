/* Счётчик посещений Cloudflare Web Analytics.
   Токен выдан в панели Cloudflare для сайта alex1ua.netlify.app.
   Если понадобится отключить счётчик — впишите пустой токен: var token = ''; */
(function () {
  var token = 'bf62233926a543dca4df091cf2220d90';
  if (!token) return;
  if (location.protocol === 'file:') return;
  if (navigator.doNotTrack === '1') return;
  var s = document.createElement('script');
  s.type = 'module';
  s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  s.setAttribute('data-cf-beacon', JSON.stringify({ token: token }));
  document.head.appendChild(s);
})();
