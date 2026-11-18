'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { useRef, useState, useEffect } from 'react';
import {
  useGetWebPushKeyQuery,
  useDisableWebPushMutation,
  useRegisterWebPushMutation,
} from 'src/redux/communication/notification/web-push-api';

import { enableWebPush, decodeVapidKey } from './web-push-client';
import {
  webPushOwner,
  readPushDevice,
  removePushDevice,
  preparePushWorker,
  isCurrentPushOwner,
  isWebPushSupported,
} from './web-push-device';

type DeviceState = 'loading' | 'unsupported' | 'unconfigured' | 'blocked' | 'ready' | 'enabled' | 'error';

type PreparedDevice = {
  owner: string;
  worker: ServiceWorkerRegistration;
  key: Uint8Array;
  version: string;
};

export function useWebPush() {
  const { data, status } = useSession();
  const profile = (data as { profile?: { sub?: string; tenantid?: string } } | null)?.profile;
  const scope = useSelector((state: RootState) => state.auth.sessionContext);
  const owner = status === 'authenticated' && scope?.tenantId === profile?.tenantid
    ? webPushOwner(profile?.tenantid, profile?.sub) : null;
  const supported = isWebPushSupported();
  const { currentData, isError, refetch } = useGetWebPushKeyQuery(owner ?? '', { skip: !owner || !supported });
  const [register] = useRegisterWebPushMutation();
  const [disable] = useDisableWebPushMutation();
  const prepared = useRef<PreparedDevice | null>(null);
  const [state, setState] = useState<DeviceState>('loading');
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    prepared.current = null;
    async function prepare() {
      if (!supported) { setState('unsupported'); return; }
      if (!owner) { setState('unconfigured'); return; }
      if (Notification.permission === 'denied') { setState('blocked'); return; }
      if (isError) { setState('error'); return; }
      if (!currentData) { setState('loading'); return; }
      if (!currentData.isConfigured || !currentData.publicKey || !currentData.vapidKeyVersion) {
        setState('unconfigured'); return;
      }
      const version = currentData.vapidKeyVersion;
      const worker = await preparePushWorker();
      const device = readPushDevice();
      if (!active || !isCurrentPushOwner(owner)) return;
      if (device && device.owner !== owner) await removePushDevice(device.owner);
      if (device?.owner === owner && device.version !== version)
        await removePushDevice(owner, (link) => disable({ owner, id: link.id! }).unwrap());
      const subscription = await worker.pushManager.getSubscription();
      if (!active || !isCurrentPushOwner(owner)) return;
      prepared.current = { owner, worker, key: decodeVapidKey(currentData.publicKey), version };
      const enabled = Boolean(subscription && device?.id && device.owner === owner && device.version === version);
      setState(enabled ? 'enabled' : 'ready');
    }
    prepare().catch(() => { if (active) setState('error'); });
    return () => { active = false; prepared.current = null; };
  }, [attempt, currentData, disable, isError, owner, supported]);

  async function toggle() {
    const { current } = prepared;
    if (!current || current.owner !== owner || busy) return;
    setBusy(true);
    setFailed(false);
    try {
      if (state === 'enabled') {
        await removePushDevice(current.owner, (link) => disable({ owner: current.owner, id: link.id! }).unwrap());
        setState('ready');
      } else {
        await enableWebPush(current.worker, current.key, current.owner, current.version,
          (registration) => register({ owner: current.owner, registration }).unwrap());
        setState('enabled');
      }
    } catch {
      if (Notification.permission === 'denied') setState('blocked');
      else setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  const retry = () => { if (isError) refetch(); else setAttempt((previous) => previous + 1); };
  return { visible: Boolean(owner), state, busy, failed, toggle, retry };
}
