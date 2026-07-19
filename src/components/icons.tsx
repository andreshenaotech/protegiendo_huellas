import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const iconProps = {
  className: "icon",
  viewBox: "0 0 24 24",
  "aria-hidden": true,
} as const;

export function PawIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M12 13.2c-3.4 0-6.5 2.6-6.5 5.1 0 2 1.8 3.2 3.8 2.5 1.8-.6 3.6-.6 5.4 0 2 .7 3.8-.5 3.8-2.5 0-2.5-3.1-5.1-6.5-5.1ZM5.4 12.9c1.5-.4 2.2-2.2 1.7-4s-2.1-3-3.5-2.6-2.2 2.2-1.7 4 2.1 3 3.5 2.6Zm5.1-2.4c1.6-.2 2.7-2 2.4-4s-1.8-3.4-3.4-3.2-2.7 2-2.4 4 1.8 3.4 3.4 3.2Zm8.1-4.2c-1.5-.4-3 .8-3.5 2.6s.2 3.6 1.7 4 3-.8 3.5-2.6-.2-3.6-1.7-4Zm-4.1 4.2c1.6.2 3.1-1.2 3.4-3.2s-.8-3.8-2.4-4-3.1 1.2-3.4 3.2.8 3.8 2.4 4Z" />
    </svg>
  );
}

export function ArrowIcon() {
  return <svg {...iconProps}><path d="m5 12 14 0m-6-6 6 6-6 6" /></svg>;
}

export function HeartIcon() {
  return <svg {...iconProps}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></svg>;
}

export function SearchIcon() {
  return <svg {...iconProps}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>;
}

export function MenuIcon() {
  return <svg {...iconProps}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
}

export function CloseIcon() {
  return <svg {...iconProps}><path d="m6 6 12 12M18 6 6 18" /></svg>;
}

export function ChatIcon() {
  return <svg {...iconProps}><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" /><path d="M8 9h8M8 13h5" /></svg>;
}

export function PhoneIcon() {
  return <svg {...iconProps}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2.1Z" /></svg>;
}

export function EmailIcon() {
  return <svg {...iconProps}><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" /><path d="m22 6-10 7L2 6" /></svg>;
}

export function PinIcon() {
  return <svg {...iconProps}><path d="M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 1 1 18 0Z" /><circle cx="12" cy="10" r="3" /></svg>;
}
