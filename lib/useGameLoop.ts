'use client';

import { useEffect, useRef } from 'react';

/** 한 프레임에 허용하는 최대 dt(초). */
const MAX_DELTA = 1 / 20;

/**
 * requestAnimationFrame 게임 루프.
 *
 * setInterval이 아니라 rAF를 쓰는 이유:
 * - 브라우저 렌더 주기와 동기화되어 프레임이 끊겨 보이지 않는다
 * - 백그라운드 탭에서 자동으로 멈춘다 (배터리)
 *
 * 콜백은 ref에 담아 최신 것을 부른다. 의존성 배열에 넣으면 콜백이 바뀔
 * 때마다 루프가 해제되고 다시 걸려 프레임이 튄다.
 *
 * @param callback 매 프레임 호출된다. dt는 초 단위.
 * @param running false면 루프를 돌리지 않는다.
 */
export function useGameLoop(callback: (dt: number) => void, running: boolean): void {
  const callbackRef = useRef(callback);

  // 렌더 중에 ref를 쓰면 안 된다 (React 순수성 규칙). 커밋 이후에 갱신한다.
  // 의존성 배열이 없으므로 매 렌더 뒤에 최신 콜백으로 맞춰진다.
  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    if (!running) return;

    let frameId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      /*
       * dt에 상한을 둔다.
       *
       * 탭을 전환했다 돌아오거나 브레이크포인트에 걸리면 dt가 수 초로
       * 튄다. 그대로 적분하면 줍스가 화면을 가로질러 순간이동하고,
       * 그 사이의 충돌 판정이 통째로 건너뛰어진다. 상한을 걸면 느려질
       * 뿐 상태가 깨지지는 않는다.
       */
      const dt = Math.min((now - lastTime) / 1000, MAX_DELTA);
      lastTime = now;

      callbackRef.current(dt);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [running]);
}
