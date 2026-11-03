import type { ClassroomActor } from './login-classroom-actors';

export function LoginClassroomDetails({ role }: { role: ClassroomActor['name'] }) {
  if (role === 'finance') {
    return (
      <g fill="none" stroke="#235d43" strokeWidth="3" strokeLinecap="round">
        <path d="M278 448h37M274 460h37M270 472h29" />
        <path className="finance-receipt" d="M271 490h21m-16-7v14m10-14v14" />
      </g>
    );
  }
  if (role === 'hr') {
    return (
      <g transform="rotate(7 290 395)" fill="none" stroke="#235d43" strokeWidth="3">
        <path d="M262 353h60M255 371h77M252 401h13v13h-13ZM248 433h13v13h-13ZM244 465h13v13h-13Z" />
        <path d="M279 408h48M275 440h48M271 472h48" />
        <path className="attendance-check" d="m253 404 5 5 12-15" strokeWidth="4" />
      </g>
    );
  }
  if (role === 'academics') {
    return (
      <path
        className="academic-page"
        d="M218 402q29-18 66-23l-3 7q-33 4-63 16Z"
        fill="white"
        stroke="#23382d"
        strokeWidth="2"
      />
    );
  }
  return (
    <g transform="rotate(10 225 495)" stroke="#235d43" strokeWidth="3" fill="none">
      <circle cx="223" cy="487" r="13" fill="#d8eee1" />
      <path d="M202 520q0-21 21-21t21 21ZM197 537h47M197 548h34" />
    </g>
  );
}
