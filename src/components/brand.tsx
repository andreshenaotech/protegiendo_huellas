import Image from "next/image";
import Link from "next/link";

type BrandProps = {
  onClick?: () => void;
};

export function Brand({ onClick }: BrandProps) {
  return (
    <Link className="brand" href="/#inicio" aria-label="Fundación Protegiendo Huellas, ir al inicio" onClick={onClick}>
      <span className="brand-mark" aria-hidden="true">
        <Image className="brand-logo" src="/logo.png" alt="" width={2000} height={2000} sizes="50px" />
      </span>
      <span className="brand-text">
        <strong>Fundación Protegiendo Huellas</strong>
      </span>
    </Link>
  );
}
