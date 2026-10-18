import { spawn } from 'child_process';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chromeProc = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9222',
  '--user-data-dir=C:\\Users\\super pc\\AppData\\Local\\Temp\\chrome-verify-profile',
  '--no-first-run',
  '--no-default-browser-check',
  'about:blank'
]);

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const routes = [
  '/',
  '/about',
  '/services',
  '/contact',
  '/blogs',
  '/privacy',
  '/terms',
  '/booking/manage',
  '/admin'
];

async function run() {
  await sleep(1500);

  try {
    const res = await fetch('http://127.0.0.1:9222/json/list');
    const tabs = await res.json();
    const target = tabs.find(t => t.type === 'page');
    if (!target) {
      console.error('No page target found');
      chromeProc.kill();
      process.exit(1);
    }

    const ws = new WebSocket(target.webSocketDebuggerUrl);
    let msgId = 1;

    function sendCommand(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        const handler = (event) => {
          const data = JSON.parse(event.data);
          if (data.id === id) {
            ws.removeEventListener('message', handler);
            resolve(data.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await new Promise((resolve) => {
      ws.onopen = resolve;
    });

    await sendCommand('Runtime.enable');
    await sendCommand('Console.enable');
    await sendCommand('Log.enable');
    await sendCommand('Network.enable');
    await sendCommand('Page.enable');

    const results = [];

    for (const route of routes) {
      const consoleErrors = [];
      const failedRequests = [];

      const listener = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.method === 'Runtime.exceptionThrown') {
          consoleErrors.push(`Exception: ${msg.params.exceptionDetails?.text || ''} ${msg.params.exceptionDetails?.exception?.description || ''}`);
        }
        if (msg.method === 'Console.messageAdded' && msg.params.message.level === 'error') {
          consoleErrors.push(`Console Error: ${msg.params.message.text}`);
        }
        if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
          consoleErrors.push(`Console.error: ${msg.params.args.map(a => a.value || a.description).join(' ')}`);
        }
        if (msg.method === 'Network.responseReceived') {
          const { response } = msg.params;
          if (response.status >= 400) {
            failedRequests.push(`${response.status} ${response.url}`);
          }
        }
      };

      ws.addEventListener('message', listener);

      const url = `http://127.0.0.1:4173${route}`;
      await sendCommand('Page.navigate', { url });
      await sleep(2500);

      // Evaluate root innerHTML and title
      const evalRes = await sendCommand('Runtime.evaluate', {
        expression: `({
          title: document.title,
          rootLength: document.getElementById('root')?.innerHTML?.length || 0,
          robotsMeta: document.querySelector('meta[name="robots"]')?.getAttribute('content') || 'none',
          bodyTextSnippet: document.body.innerText.slice(0, 100).replace(/\\s+/g, ' ')
        })`,
        returnByValue: true
      });

      ws.removeEventListener('message', listener);

      const details = evalRes?.result?.value || {};
      const passed = consoleErrors.length === 0 && failedRequests.length === 0 && details.rootLength > 100;

      results.push({
        route,
        passed,
        rootLength: details.rootLength,
        robotsMeta: details.robotsMeta,
        title: details.title,
        bodySnippet: details.bodyTextSnippet,
        consoleErrors,
        failedRequests
      });
    }

    console.log('\n================ ROUTE VERIFICATION REPORT ================');
    let allPassed = true;
    for (const r of results) {
      const statusIcon = r.passed ? '✓ PASS' : '✗ FAIL';
      console.log(`[${statusIcon}] Route: ${r.route}`);
      console.log(`   HTML Length: ${r.rootLength} chars | Robots: ${r.robotsMeta}`);
      console.log(`   Title: ${r.title}`);
      console.log(`   Body Snippet: ${r.bodySnippet}`);
      if (r.consoleErrors.length > 0) {
        console.log(`   Console Errors (${r.consoleErrors.length}):`, r.consoleErrors);
        allPassed = false;
      }
      if (r.failedRequests.length > 0) {
        console.log(`   Failed Requests (${r.failedRequests.length}):`, r.failedRequests);
        allPassed = false;
      }
      if (r.rootLength <= 100) {
        console.log(`   ERROR: Page content is too short or empty!`);
        allPassed = false;
      }
      console.log('------------------------------------------------------------');
    }

    console.log(`\nOVERALL VERIFICATION: ${allPassed ? 'ALL ROUTES PASSED (100% HEALTHY)' : 'SOME ROUTES FAILED'}`);
    ws.close();
    process.exit(allPassed ? 0 : 1);
  } catch (err) {
    console.error('Fatal error in route verification:', err);
    process.exit(1);
  } finally {
    chromeProc.kill();
  }
}

run();
