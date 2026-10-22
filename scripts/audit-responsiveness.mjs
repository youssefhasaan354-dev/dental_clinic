import { spawn } from 'child_process';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const viewports = [
  { name: '320x568 (Small Mobile)', width: 320, height: 568, mobile: true },
  { name: '360x800 (Standard Mobile)', width: 360, height: 800, mobile: true },
  { name: '390x844 (Modern Mobile)', width: 390, height: 844, mobile: true },
  { name: '430x932 (Large Mobile)', width: 430, height: 932, mobile: true },
  { name: '768x1024 (Tablet Portrait)', width: 768, height: 1024, mobile: true },
  { name: '1024x768 (Tablet Landscape / Laptop)', width: 1024, height: 768, mobile: false },
  { name: '1280x800 (Desktop)', width: 1280, height: 800, mobile: false },
  { name: '1440x900 (Large Desktop)', width: 1440, height: 900, mobile: false },
  { name: '1920x1080 (Wide Desktop)', width: 1920, height: 1080, mobile: false },
];

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

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('🚀 Spawning Vite preview server...');
  const previewProc = spawn('cmd.exe', ['/c', 'npx', 'vite', 'preview', '--port', '4173', '--host', '127.0.0.1'], {
    cwd: 'd:\\web\\Dentalist',
    stdio: 'ignore'
  });

  // Wait for server to be responsive
  let serverReady = false;
  for (let i = 0; i < 30; i++) {
    try {
      const ping = await fetch('http://127.0.0.1:4173/');
      if (ping.ok || ping.status === 200 || ping.status === 304) {
        serverReady = true;
        break;
      }
    } catch (e) {
      // wait
    }
    await sleep(500);
  }

  if (!serverReady) {
    console.error('Failed to start Vite preview server');
    previewProc.kill();
    process.exit(1);
  }
  console.log('✅ Vite preview server running on http://127.0.0.1:4173');

  console.log('🚀 Starting Chrome Headless...');
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--user-data-dir=C:\\Users\\super pc\\AppData\\Local\\Temp\\chrome-resp-profile',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank'
  ]);

  await sleep(1500);

  const cleanup = () => {
    try { chromeProc.kill(); } catch (e) {}
    try { previewProc.kill(); } catch (e) {}
  };

  process.on('SIGINT', cleanup);
  process.on('exit', cleanup);

  try {
    const res = await fetch('http://127.0.0.1:9223/json/list');
    const tabs = await res.json();
    const target = tabs.find(t => t.type === 'page');
    if (!target) {
      throw new Error('No Chrome target page found');
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
    await sendCommand('Page.enable');
    await sendCommand('Emulation.setFocusEmulationEnabled', { enabled: true });

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    const failures = [];

    console.log(`\n📋 Testing ${viewports.length} viewports across ${routes.length} routes (${viewports.length * routes.length} test configurations)...\n`);

    for (const vp of viewports) {
      console.log(`\n📱 Viewport: ${vp.name} (${vp.width}x${vp.height})`);

      await sendCommand('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.mobile,
      });

      for (const route of routes) {
        totalTests++;
        const url = `http://127.0.0.1:4173${route}`;
        await sendCommand('Page.navigate', { url });
        await sleep(1000);

        // Check horizontal overflow
        const overflowEval = await sendCommand('Runtime.evaluate', {
          expression: `(() => {
            const scrollWidth = document.documentElement.scrollWidth;
            const innerWidth = window.innerWidth;
            const bodyScrollWidth = document.body ? document.body.scrollWidth : 0;
            const hasOverflow = scrollWidth > innerWidth + 1 || bodyScrollWidth > innerWidth + 1;
            
            let overflowingElements = [];
            if (hasOverflow) {
              const allEls = document.querySelectorAll('*');
              for (const el of allEls) {
                const rect = el.getBoundingClientRect();
                if (rect.right > innerWidth + 2 && rect.width > 0) {
                  overflowingElements.push({
                    tag: el.tagName,
                    class: (el.className && typeof el.className === 'string') ? el.className.slice(0, 50) : '',
                    id: el.id || '',
                    right: Math.round(rect.right),
                    width: Math.round(rect.width)
                  });
                }
              }
            }

            return {
              hasOverflow,
              scrollWidth,
              innerWidth,
              bodyScrollWidth,
              overflowingCount: overflowingElements.length,
              sampleOverflow: overflowingElements.slice(0, 3)
            };
          })()`,
          returnByValue: true
        });

        const data = overflowEval.result?.value;

        if (data && !data.hasOverflow) {
          passedTests++;
          process.stdout.write(`  ✅ ${route.padEnd(20)} [Overflow: None (scrollWidth=${data.scrollWidth}px <= ${data.innerWidth}px)]\n`);
        } else {
          failedTests++;
          const reason = data
            ? `Overflow detected: scrollWidth=${data.scrollWidth}px vs windowWidth=${data.innerWidth}px (overflow elements: ${data.overflowingCount})`
            : 'Evaluation failed';
          failures.push({
            viewport: vp.name,
            route,
            reason,
            samples: data?.sampleOverflow
          });
          process.stdout.write(`  ❌ ${route.padEnd(20)} [${reason}]\n`);
        }
      }
    }

    console.log('\n========================================');
    console.log(`Audit Summary: ${passedTests}/${totalTests} Passed (${failedTests} Failed)`);
    console.log('========================================');

    if (failures.length > 0) {
      console.log('\nFailure Details:');
      console.log(JSON.stringify(failures, null, 2));
    }

    ws.close();
    cleanup();
    process.exit(failedTests > 0 ? 1 : 0);
  } catch (err) {
    console.error('Audit encountered an error:', err);
    cleanup();
    process.exit(1);
  }
}

run();
