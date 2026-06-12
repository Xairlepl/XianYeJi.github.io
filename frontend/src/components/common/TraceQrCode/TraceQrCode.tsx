import { useMemo } from 'react';
import { createQrMatrix } from '@/utils/qrCode';

interface TraceQrCodeProps {
  value: string;
  title?: string;
  size?: number;
}

const QUIET_ZONE = 4;

const TraceQrCode = ({ value, title = '产地溯源二维码', size = 128 }: TraceQrCodeProps) => {
  const matrix = useMemo(() => createQrMatrix(value), [value]);
  const moduleCount = matrix.length + QUIET_ZONE * 2;

  return (
    <svg
      className="trace-qr-svg"
      width={size}
      height={size}
      viewBox={`0 0 ${moduleCount} ${moduleCount}`}
      role="img"
      aria-label={title}
      shapeRendering="crispEdges"
    >
      <title>{title}</title>
      <rect width={moduleCount} height={moduleCount} fill="#fff" />
      {matrix.map((row, y) =>
        row.map((dark, x) =>
          dark ? (
            <rect
              key={`${x}-${y}`}
              x={x + QUIET_ZONE}
              y={y + QUIET_ZONE}
              width="1"
              height="1"
              fill="currentColor"
            />
          ) : null
        )
      )}
    </svg>
  );
};

export default TraceQrCode;
