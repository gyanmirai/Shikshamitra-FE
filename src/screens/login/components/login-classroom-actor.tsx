import { classroomSprite } from './login-classroom-actors';
import { LoginClassroomDetails } from './login-classroom-details';

import type { ClassroomActor } from './login-classroom-actors';

export function LoginClassroomActor({
  actor,
  sceneId,
}: {
  actor: ClassroomActor;
  sceneId: string;
}) {
  const id = `${sceneId}-${actor.name}`;
  return (
    <g transform={`translate(${actor.x} 32) scale(0.5)`} data-classroom-actor={actor.name}>
      <defs>
        <image
          id={`${id}-art`}
          href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${classroomSprite.path}`}
          x={-actor.frame * classroomSprite.frameWidth}
          width={classroomSprite.width}
          height={classroomSprite.height}
        />
        <mask id={`${id}-body`} maskUnits="userSpaceOnUse" x="0" y="0" width="444" height="887">
          <rect width="444" height="887" fill="white" />
          <rect width="444" height={actor.head - 10} fill="black" />
          <path d={actor.hand} fill="black" />
        </mask>
        <mask
          id={`${id}-head`}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="444"
          height={actor.head}
        >
          <rect width="444" height={actor.head} fill="white" />
          <path d={actor.hand} fill="black" />
        </mask>
        <clipPath id={`${id}-hand`}>
          <path d={actor.hand} />
        </clipPath>
      </defs>
      <g className={`classroom-${actor.name}`}>
        <g className="actor-breath">
          <g mask={`url(#${id}-body)`}>
            <use href={`#${id}-art`} />
          </g>
          <g className="actor-head" style={{ transformOrigin: actor.pivot }}>
            <g mask={`url(#${id}-head)`}>
              <use href={`#${id}-art`} />
              <g className="actor-eyelids">
                {actor.eyes.map(([x, y]) => (
                  <g key={x}>
                    <ellipse cx={x} cy={y} rx="13" ry="18" fill="white" />
                    <path
                      d={`M${x - 11} ${y}q11 7 22 0`}
                      fill="none"
                      stroke="black"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </g>
                ))}
              </g>
            </g>
          </g>
          <g className="actor-hand" style={{ transformOrigin: actor.handPivot }}>
            <g clipPath={`url(#${id}-hand)`}>
              <use href={`#${id}-art`} />
            </g>
          </g>
          <LoginClassroomDetails role={actor.name} />
        </g>
      </g>
    </g>
  );
}
