const childProcess = require('node:child_process');
const { EventEmitter } = require('node:events');

const originalExec = childProcess.exec;

function createNoopChildProcess() {
  const child = new EventEmitter();
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();
  child.stdin = null;
  child.killed = false;
  child.pid = 0;
  child.kill = () => true;

  process.nextTick(() => {
    child.emit('exit', 0, null);
    child.emit('close', 0, null);
  });

  return child;
}

childProcess.exec = function patchedExec(command, options, callback) {
  const commandText = String(command).trim().toLowerCase();

  if (process.platform === 'win32' && commandText === 'net use') {
    const done = typeof options === 'function' ? options : callback;
    const child = createNoopChildProcess();

    if (typeof done === 'function') {
      process.nextTick(() => done(null, '', ''));
    }

    return child;
  }

  return originalExec.apply(this, arguments);
};

// Vite 8 imports exec as a named ESM binding; keep it aligned with the preload patch.
require('node:module').syncBuiltinESMExports();
