/* ============================================
   Brutalist homepage: kinetic type, terminal, scroll scenes
   No 3D, no external dependencies
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  if (!body.classList.contains('brutal-home')) return;

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktopScene = window.matchMedia('(min-width: 961px)');
  const clamp = value => Math.min(Math.max(value, 0), 1);

  // --- Kinetic word masks, with accessible original labels ---
  document.querySelectorAll('.hero-title-line').forEach((line, lineIndex) => {
    const original = line.textContent.trim();
    line.setAttribute('aria-label', original);
    line.innerHTML = original.split(/\s+/).map((word, wordIndex) =>
      `<span class="word-mask" aria-hidden="true"><span class="word-inner" style="--word-delay:${120 + lineIndex * 130 + wordIndex * 75}ms">${word}</span></span>`
    ).join(' ');
  });

  // --- Continuous terminal stream; static content remains without JS/reduced motion ---
  const terminal = document.getElementById('securityTerminal');
  if (terminal && !motionQuery.matches) {
    const source = terminal.textContent.trimEnd();
    const initialLines = source.split('\n');
    const extraLines = String.raw`filip@kecman:~$ grep -RniE "update_option|register_setting" PayPlug/
PayPlug/admin/settings.php:84: update_option('payplug_settings', $_POST['settings'])
filip@kecman:~$ grep -RniE "current_user_can|check_admin_referer" PayPlug/
// No capability or nonce check in the vulnerable path
filip@kecman:~$ grep -RniE "wc_get_order|get_order_key" PayPlug/
PayPlug/includes/PayPlugIntent.php:41: $order = wc_get_order($_POST['order_id'])
PayPlug/includes/PayPlugIntent.php:44: return $order->get_order_key()
filip@kecman:~$ grep -RniE "wp_ajax_nopriv|register_rest_route|permission_callback" PayPlug/
PayPlug/includes/api.php:17: add_action('wp_ajax_nopriv_payplug_create_intent', 'payplug_create_intent')
[+] Unauthenticated reachability confirmed for audit scope
filip@kecman:~$ git diff 3.1.0..3.1.1 -- PayPlugIntent.php
// Illustrative patch review, not vendor source
+ if (!current_user_can('manage_woocommerce')) return;
+ if (get_current_user_id() !== $order->get_user_id()) return;
[+] Patch pattern: authorization + ownership validation
filip@kecman:~$ php -l PayPlugIntent.php
No syntax errors detected in PayPlugIntent.php
filip@kecman:~$ semgrep --config=auto PayPlug/
Scanning PHP files for authorization and data exposure patterns
[+] CWE-862 and CWE-200 evidence attached to report

filip@kecman:~$ apktool d target.apk
I: Decoding AndroidManifest.xml with resource values
filip@kecman:~$ jadx -d target.apk
DeepLinkActivity exported=true
WebView loadUrl detected in intent handler
filip@kecman:~$ adb shell pm list packages | grep target
package:com.target.app
filip@kecman:~$ adb shell dumpsys package com.target.app | grep exported
DeepLinkActivity exported=true
filip@kecman:~$ adb logcat | grep -i deeplink
VIEW act=android.intent.action.VIEW dat=myapp://open
filip@kecman:~$ objection -g com.target.app explore
android hooking watch activity DeepLinkActivity
[+] Runtime instrumentation ready

filip@kecman:~$ httpx -u https://target -tech-detect
https://target [nginx] [PHP] [WooCommerce]
filip@kecman:~$ whatweb https://target
nginx, PHP, WordPress, WooCommerce
filip@kecman:~$ katana -u https://target -jc
/admin
/api/v1/status
/wp-json/wp/v2/users
filip@kecman:~$ gobuster dir -u https://target -w dirs.txt
/login (Status: 302)
/admin (Status: 200)
/uploads (Status: 301)
filip@kecman:~$ nuclei -u https://target -t cves/
[info] CVE templates loaded for technology-specific review
filip@kecman:~$ sqlmap -r login.request --batch
[info] testing connection to the target URL
[info] checking parameter ordering and error behavior

filip@kecman:~$ rustscan -a 10.10.10.15 --ulimit 5000
22/tcp open
443/tcp open
filip@kecman:~$ dig +short target.com
203.0.113.15
filip@kecman:~$ whois target.com
Registrar data collected for scope verification
filip@kecman:~$ testssl.sh target.com
TLS 1.3 offered
Certificate chain verified
filip@kecman:~$ nikto -h https://target
+ Target IP: 203.0.113.15
+ Server: nginx
filip@kecman:~$ tcpdump -i eth0 port 443 -c 3
3 packets captured

filip@kecman:~$ subfinder -d target.com -silent
api.target.com
staging.target.com
filip@kecman:~$ waybackurls target.com | grep -E "api|admin|config"
https://target/api/v1/status
https://target/admin/login
https://target/config.old
filip@kecman:~$ curl -s https://target/robots.txt
User-agent: *
Disallow: /admin/
Disallow: /staging/
filip@kecman:~$ curl -sI https://target | grep -iE "server|x-powered-by|location"
Server: nginx
X-Powered-By: PHP
filip@kecman:~$ git log --oneline -- PayPlugIntent.php
a11c0de Fix order ownership validation
b42f19a Add intent cancellation handler
filip@kecman:~$ grep -RniE "get_post_meta|update_post_meta" PayPlug/
PayPlug/includes/settings.php:92: update_post_meta($post_id, 'payplug_config', $value)
[+] Settings and order data flows mapped for review
filip@kecman:~$ ./verify-fix.sh --case CVE-2026-42637,CVE-2026-110292
[+] Unauthorized request rejected
[+] Cross-account order access rejected
[+] Owner request accepted
[+] Retest passed and evidence archived
filip@kecman:~$ `.split('\n');
    const stream = [...initialLines, ...extraLines];
    terminal.textContent = '';
    terminal.title = 'Hover to pause the live terminal';
    let lineIndex = 0;
    let paused = false;
    terminal.addEventListener('pointerenter', () => { paused = true; });
    terminal.addEventListener('pointerleave', () => { paused = false; });

    const typeLine = () => {
      if (motionQuery.matches) {
        terminal.textContent = source;
        return;
      }
      if (paused || document.hidden) {
        window.setTimeout(typeLine, 300);
        return;
      }
      const text = stream[lineIndex];
      const line = document.createElement('span');
      const kind = text.startsWith('filip@kecman') ? 'command'
        : text.startsWith('[+]') ? 'success'
        : text.trimStart().startsWith('//') ? 'comment'
        : /^(function|\$|return|}|\+)/.test(text.trimStart()) ? 'code'
        : 'output';
      line.className = `terminal-line ${kind}`;
      terminal.append(line);
      while (terminal.children.length > 42) terminal.firstElementChild.remove();
      terminal.scrollTop = terminal.scrollHeight;

      const nextLine = () => {
        lineIndex = (lineIndex + 1) % stream.length;
        window.setTimeout(typeLine, 75);
      };

      if (text.startsWith('filip@kecman')) {
        let character = 0;
        line.classList.add('cursor');
        const typeCharacter = () => {
          if (motionQuery.matches) {
            terminal.textContent = source;
            return;
          }
          if (paused || document.hidden) {
            window.setTimeout(typeCharacter, 300);
            return;
          }
          line.textContent = text.slice(0, character);
          terminal.scrollTop = terminal.scrollHeight;
          character += 1;
          if (character <= text.length) window.setTimeout(typeCharacter, 8);
          else {
            line.classList.remove('cursor');
            nextLine();
          }
        };
        typeCharacter();
      } else {
        line.textContent = text || ' ';
        window.setTimeout(nextLine, text ? 55 : 105);
      }
    };
    typeLine();
  }

  // --- Horizontal Approach chapters ---
  const hero = document.querySelector('.hero');
  const scene = document.querySelector('.approach-scene');
  const stickyScene = document.querySelector('.approach-sticky');
  const approachCards = document.querySelector('.approach-cards');
  let sceneCount;
  if (scene && stickyScene && approachCards) {
    const hud = document.createElement('div');
    hud.className = 'scene-hud';
    hud.setAttribute('aria-hidden', 'true');
    hud.innerHTML = '<span>Scroll the operation</span><div class="scene-hud-line"><span></span></div><span class="scene-count">01 / 03</span>';
    stickyScene.append(hud);
    sceneCount = hud.querySelector('.scene-count');
  }

  let ticking = false;
  const updateScenes = () => {
    const scrollY = window.scrollY;
    if (hero) hero.style.setProperty('--hero-progress', String(clamp(scrollY / Math.max(hero.offsetHeight * .85, 1))));

    if (scene && approachCards && desktopScene.matches && !motionQuery.matches) {
      const rect = scene.getBoundingClientRect();
      const distance = Math.max(scene.offsetHeight - window.innerHeight, 1);
      const progress = clamp(-rect.top / distance);
      const available = Math.max(approachCards.scrollWidth - approachCards.parentElement.clientWidth + 32, 0);
      approachCards.style.transform = `translate3d(${-available * progress}px, 0, 0)`;
      scene.style.setProperty('--scene-progress', String(progress));
      if (sceneCount) sceneCount.textContent = `${String(Math.round(progress * 2) + 1).padStart(2, '0')} / 03`;
    } else if (approachCards) {
      approachCards.style.transform = '';
      if (scene) scene.style.setProperty('--scene-progress', '0');
    }
    ticking = false;
  };

  const requestUpdate = () => {
    if (!ticking) {
      requestAnimationFrame(updateScenes);
      ticking = true;
    }
  };
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  updateScenes();
});
