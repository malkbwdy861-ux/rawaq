const targets = await fetch("http://localhost:9223/json/list").then((response) => response.json());
const target = targets.find((item) => item.type === "page");
if (!target) throw new Error("No browser page target found.");

const socket = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
let requestId = 0;

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  const resolve = pending.get(message.id);
  if (resolve) {
    pending.delete(message.id);
    resolve(message.result);
  }
});

await new Promise((resolve) => socket.addEventListener("open", resolve, { once: true }));

function call(method, params = {}) {
  const id = ++requestId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve) => pending.set(id, resolve));
}

for (const width of [1440, 1024, 390, 375]) {
  await call("Emulation.setDeviceMetricsOverride", { width, height: 1000, deviceScaleFactor: 1, mobile: width < 600 });
  for (const path of ["projects", "services", "solutions"]) {
    await call("Page.navigate", { url: `http://localhost:3000/${path}` });
    await new Promise((resolve) => setTimeout(resolve, 700));
    const result = await call("Runtime.evaluate", {
      expression: `(() => {
        const hero = document.querySelector('[aria-labelledby="archive-hero-title"]');
        const title = document.getElementById('archive-hero-title');
        const filters = document.querySelector('[aria-label="تصنيفات المشاريع"]');
        return {
          path: location.pathname,
          width: innerWidth,
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
          heroHeight: Math.round(hero.getBoundingClientRect().height),
          heroLeft: Math.round(hero.getBoundingClientRect().left),
          heroRight: Math.round(hero.getBoundingClientRect().right),
          titleFont: getComputedStyle(title).fontSize,
          titleLeft: Math.round(title.getBoundingClientRect().left),
          titleRight: Math.round(title.getBoundingClientRect().right),
          filtersLeft: filters ? Math.round(filters.getBoundingClientRect().left) : null,
          filtersRight: filters ? Math.round(filters.getBoundingClientRect().right) : null,
          offenders: [...document.querySelectorAll('body *')].map((element) => ({
            tag: element.tagName,
            className: typeof element.className === 'string' ? element.className.slice(0, 90) : '',
            left: Math.round(element.getBoundingClientRect().left),
            right: Math.round(element.getBoundingClientRect().right),
          })).filter((item) => item.left < -1 || item.right > document.documentElement.clientWidth + 1).slice(0, 6),
        };
      })()`,
      returnByValue: true,
    });
    console.log(JSON.stringify(result.result.value));
  }
}

socket.close();
