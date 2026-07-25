'use client';

import { useCallback, useRef, useState } from 'react';
import styles from './Joystick.module.css';
import type { Vec } from '@/lib/game/types';

interface JoystickProps {
  /**
   * 방향과 세기를 알린다. 길이 0~1의 벡터.
   *
   * 게임 루프가 매 프레임 읽어야 하는 고빈도 값이라 콜백으로 넘긴다.
   * 부모가 이걸 state에 담으면 손가락을 움직일 때마다 리렌더가 나므로
   * ref에 담아야 한다 (ADR-004).
   */
  onChange: (input: Vec) => void;
}

/**
 * 가상 조이스틱.
 *
 * 포인터 이벤트로 터치와 마우스를 한 코드로 처리한다. touch/mouse 계열을
 * 따로 다루면 이벤트 두 벌에 상태 동기화 문제까지 생긴다.
 *
 * 손잡이 위치는 state가 아니라 DOM을 직접 만져 갱신한다. 손가락을 움직이는
 * 동안 초당 수십 번 리렌더가 나는 것을 피하기 위함이다. 대신 "잡았는지"
 * 여부만 state로 둔다 — 프레임당이 아니라 조작당 한 번 바뀌는 저빈도 값이다.
 */
export function Joystick({ onChange }: JoystickProps) {
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const activePointerId = useRef<number | null>(null);
  const [active, setActive] = useState(false);

  const updateFromEvent = useCallback(
    (clientX: number, clientY: number) => {
      const base = baseRef.current;
      const knob = knobRef.current;
      if (!base || !knob) return;

      const rect = base.getBoundingClientRect();
      const maxRadius = rect.width / 2;
      const dx = clientX - (rect.left + maxRadius);
      const dy = clientY - (rect.top + maxRadius);

      const distance = Math.hypot(dx, dy);
      // 스틱 범위를 벗어나도 최대 세기로 고정한다. 손가락이 멀어졌다고
      // 입력이 끊기면 조작 중 자꾸 놓치게 된다.
      const clamped = Math.min(distance, maxRadius);
      const ratio = distance === 0 ? 0 : clamped / distance;

      const offsetX = dx * ratio;
      const offsetY = dy * ratio;

      // transform만 건드려 레이아웃·페인트를 건너뛰고 컴포지팅만 발생시킨다.
      knob.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;

      onChange({ x: offsetX / maxRadius, y: offsetY / maxRadius });
    },
    [onChange],
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (activePointerId.current !== null) return;
      activePointerId.current = event.pointerId;
      // 손가락이 조이스틱 밖으로 나가도 계속 추적한다.
      event.currentTarget.setPointerCapture(event.pointerId);
      setActive(true);
      updateFromEvent(event.clientX, event.clientY);
    },
    [updateFromEvent],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (activePointerId.current !== event.pointerId) return;
      updateFromEvent(event.clientX, event.clientY);
    },
    [updateFromEvent],
  );

  const handlePointerEnd = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (activePointerId.current !== event.pointerId) return;
      activePointerId.current = null;
      setActive(false);

      const knob = knobRef.current;
      if (knob) knob.style.transform = 'translate3d(0, 0, 0)';
      onChange({ x: 0, y: 0 });
    },
    [onChange],
  );

  return (
    <div
      ref={baseRef}
      className={`${styles.base} ${active ? styles.active : ''}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      role="application"
      aria-label="줍스 이동 조이스틱"
    >
      <div ref={knobRef} className={styles.knob} />
    </div>
  );
}
