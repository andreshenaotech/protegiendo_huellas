import { PawIcon } from "@/components/icons";

type BrandProps = {
  onClick?: () => void;
};

export function Brand({ onClick }: BrandProps) {
  return (
    <a className="brand" href="#inicio" aria-label="Fundación Protegiendo Huellas, ir al inicio" onClick={onClick}>
      <span className="brand-mark" aria-hidden="true"><PawIcon /></span>
      <span className="brand-text">
        <strong>Protegiendo Huellas</strong>
        <span>Fundación animal</span>
      </span>
    </a>
  );
}
