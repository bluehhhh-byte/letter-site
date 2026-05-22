import { execSync } from 'node:child_process';

const VPN_CLI = 'C:\\Program Files\\Windscribe\\windscribe-cli.exe';
const INSTALLER_URL = 'https://github.com/Windscribe/Desktop-App/releases/download/v2.22.9/Windscribe_2.22.9_amd64.exe';

let connectedByPlugin = false;

function isInstalled() {
  try {
    execSync(`& "${VPN_CLI}" status 2>&1`, { shell: 'powershell', stdio: 'pipe', windowsHide: true, timeout: 15000 });
    return true;
  } catch { return false; }
}

function isVpnConnected() {
  try {
    const out = execSync(`& "${VPN_CLI}" status 2>&1`, { shell: 'powershell', stdio: 'pipe', windowsHide: true, encoding: 'utf8', timeout: 10000 });
    return out.includes('Connect state: Connected');
  } catch { return false; }
}

function isReachable(url) {
  try {
    const code = execSync(
      `curl.exe -s -o NUL -w "%{http_code}" "${url}" --connect-timeout 5 --max-time 10`,
      { shell: 'powershell', stdio: 'pipe', timeout: 15000 }
    ).toString().trim();
    return code === '200';
  } catch { return false; }
}

function connectVpn() {
  execSync(`& "${VPN_CLI}" connect best 2>&1`, { shell: 'powershell', stdio: 'pipe', windowsHide: true, timeout: 60000 });
}

function disconnectVpn() {
  execSync(`& "${VPN_CLI}" disconnect 2>&1`, { shell: 'powershell', stdio: 'pipe', windowsHide: true, timeout: 30000 });
}

function installAndConnect() {
  const tmp = `${process.env.TEMP}\\Windscribe_2.22.9_amd64.exe`;
  execSync(`curl.exe -L -o "${tmp}" "${INSTALLER_URL}" --connect-timeout 10 --max-time 180`, { shell: 'powershell', stdio: 'pipe', timeout: 200000 });
  execSync(`Start-Process -FilePath "${tmp}" -ArgumentList "-silent" -Wait`, { shell: 'powershell', stdio: 'pipe', timeout: 120000 });
}

function ensureVpn() {
  if (!isInstalled()) { installAndConnect(); return; }
  if (!isVpnConnected()) { connectVpn(); }
}

function needsNetwork(cmd) {
  return ['git push', 'git fetch', 'git pull', 'git clone', 'vercel'].some(p => cmd.includes(p));
}

const NETWORK_URLS = ['https://github.com', 'https://vercel.com', 'https://google.com'];

export default async () => {
  let wasAlreadyConnected = false;

  return {
    'tool.execute.before': async (input) => {
      if (input?.tool_name !== 'bash') return;
      const cmd = (input?.args?.command || '').toLowerCase();
      if (!needsNetwork(cmd)) return;

      wasAlreadyConnected = isVpnConnected();

      // Connect if any of the target sites are unreachable
      const needsVpn = NETWORK_URLS.some(url => !isReachable(url));
      if (needsVpn && !wasAlreadyConnected) {
        try {
          ensureVpn();
          connectedByPlugin = true;
        } catch {}
      }
    },
    'tool.execute.after': async (input, output) => {
      if (input?.tool_name !== 'bash') return;
      const cmd = (input?.args?.command || '').toLowerCase();
      if (!needsNetwork(cmd)) return;

      // Only disconnect if we connected it, and command succeeded
      if (connectedByPlugin) {
        try {
          const hadError = output?.isError || output?.result?.exitCode !== 0;
          if (!hadError) {
            disconnectVpn();
            connectedByPlugin = false;
          }
        } catch {}
      }
    }
  };
};
