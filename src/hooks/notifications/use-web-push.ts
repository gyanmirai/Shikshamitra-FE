'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { useRef, useState, useEffect } from 'react';
import {
  useGetWebPushKeyQuery,
  useDisableWebPushMutation,
  useRegisterWebPushMutation,
  useLazyGetWebPushSubscriptionStatusQuery,
} from 'src/redux/communication/notification/web-push-api';

import { enableWebPush, decodeVapidKey, WebPushEnrollmentTimeoutError } from './web-push-client';
import {
  webPushOwner,
  readPushDevice,
  withPushDevice,
  removePushDevice,
  preparePushWorker,
  isCurrentPushOwner,
  isWebPushSupported,
  disableWebPushDevice,
  needsPushHomeScreenInstallation,
} from './web-push-device';

type DeviceState =
  'loading' | 'unsupported' | 'needs-installation' | 'unconfigured' | 'blocked' | 'ready' | 'enabled' | 'expired' | 'error';

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
  const [checkStatus] = useLazyGetWebPushSubscriptionStatusQuery();
  const prepared = useRef<PreparedDevice | null>(null);
  const [state, setState] = useState<DeviceState>('loading');
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    prepared.current = null;
    async function prepare() {
      if (!supported) {
        setState(needsPushHomeScreenInstallation() ? 'needs-installation' : 'unsupported');
        return;
      }
      if (!owner) { setState('unconfigured'); return; }
      if (Notification.permission === 'denied') { setState('blocked'); return; }
      if (isError) { setState('error'); return; }
      if (!currentData) { setState('loading'); return; }
      if (!currentData.isConfigured || !currentData.publicKey || !currentData.vapidKeyVersion) {
        setState('unconfigured'); return;
      }
      setState('loading');
      const version = currentData.vapidKeyVersion;
      const worker = await preparePushWorker();
      const device = readPushDevice();
      if (!active || !isCurrentPushOwner(owner)) return;
      if (device && device.owner !== owner) await removePushDevice(device.owner);
      if (device?.owner === owner && device.version !== version)
        await removePushDevice(owner, (link) => disable({ owner, id: link.id! }).unwrap());
      if (!active || !isCurrentPushOwner(owner)) return;
      const linked = readPushDevice();
      let nextState: DeviceState = 'ready';
      if (linked?.id && linked.owner === owner && linked.version === version) {
        const subscription = await worker.pushManager.getSubscription();
        if (!active || !isCurrentPushOwner(owner)) return;
        // Authentication recovery can revoke the device, so fetch status before taking its lock.
        const registrationStatus = subscription
          ? await checkStatus({ owner, id: linked.id }).unwrap().catch((error: unknown) => {
              if (typeof error === 'object' && error && 'status' in error && error.status === 404)
                return { isEnabled: false };
              throw error;
            })
          : { isEnabled: false };
        if (!active || !isCurrentPushOwner(owner)) return;
        nextState = registrationStatus.isEnabled ? 'enabled' : 'expired';
        if (!registrationStatus.isEnabled && subscription) {
          const released = await withPushDevice(async () => {
            const current = readPushDevice();
            if (!active || !isCurrentPushOwner(owner) || current?.owner !== owner ||
                current.id !== linked.id || current.revision !== linked.revision) return false;
            const liveSubscription = await worker.pushManager.getSubscription();
            if (!active || !isCurrentPushOwner(owner)) return false;
            if (!liveSubscription) return true;
            if (liveSubscription.endpoint !== subscription.endpoint) return false;
            if (!(await liveSubscription.unsubscribe()) && await worker.pushManager.getSubscription())
              throw new Error('The old browser subscription could not be removed.');
            return true;
          });
          if (!active || !isCurrentPushOwner(owner)) return;
          if (!released) {
            setAttempt((previous) => previous + 1);
            return;
          }
        }
      }
      prepared.current = { owner, worker, key: decodeVapidKey(currentData.publicKey), version };
      setState(nextState);
    }
    prepare().catch(() => { if (active) setState('error'); });
    return () => { active = false; prepared.current = null; };
  }, [attempt, checkStatus, currentData, disable, isError, owner, supported]);

  async function toggle() {
    const { current } = prepared;
    if (!current || current.owner !== owner || busy) return;
    setBusy(true);
    setFailure(null);
    try {
      if (state === 'enabled') {
        await disableWebPushDevice(current.owner, (id) => disable({ owner: current.owner, id }).unwrap());
        if (isCurrentPushOwner(current.owner)) setAttempt((previous) => previous + 1);
      } else {
        await enableWebPush(current.worker, current.key, current.owner, current.version,
          (registration) => register({ owner: current.owner, registration }).unwrap());
        if (isCurrentPushOwner(current.owner)) setState('enabled');
      }
    } catch (error) {
      if (!isCurrentPushOwner(current.owner)) return;
      if (Notification.permission === 'denied') setState('blocked');
      else if (error instanceof WebPushEnrollmentTimeoutError) setFailure(error.message);
      else setFailure(state === 'enabled'
        ? 'Turning off browser notifications could not be confirmed. Try again.'
        : 'The setting could not be saved. Try again.');
    } finally {
      setBusy(false);
    }
  }

  const retry = () => { if (isError) refetch(); else setAttempt((previous) => previous + 1); };
  return { visible: Boolean(owner), state, busy, failure, toggle, retry };
}
