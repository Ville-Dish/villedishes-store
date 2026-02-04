import { memo, useMemo } from "react";

const gcd = (a: number, b: number): number => {
  return b === 0 ? a : gcd(b, a % b);
};

const toFraction = (decimal: number, maxDenominator = 8) => {
  let best = { n: 0, d: 1, error: Infinity };

  for (let d = 1; d <= maxDenominator; d++) {
    const n = Math.round(decimal * d);
    const error = Math.abs(decimal - n / d);

    if (error < best.error) {
      best = { n, d, error };
    }
  }

  const divisor = gcd(best.n, best.d);
  return {
    n: best.n / divisor,
    d: best.d / divisor,
  };
};

const Fraction = ({ n, d }: { n: number; d: number }) => {
  return (
    <span className="inline-flex items-center text-[0.85em]">
      <sup className="text-[0.7em] leading-none">{n}</sup>
      <span className="mx-[1px]">/</span>
      <sub className="text-[0.7em] leading-none">{d}</sub>
    </span>
  );
};

export const MixedFraction = memo(function MixedFraction({
  value,
}: {
  value: number;
}) {
  const { whole, fraction } = useMemo(() => {
    const whole = Math.floor(value);
    const decimal = value - whole;

    if (decimal === 0) {
      return { whole, fraction: null };
    }

    const frac = toFraction(decimal);
    return { whole, fraction: frac };
  }, [value]);

  if (!fraction) {
    return <span>{whole}</span>;
  }

  if (whole === 0) {
    return <Fraction n={fraction.n} d={fraction.d} />;
  }

  return (
    <span className="inline-flex items-center gap-[0.05em]">
      <span>{whole}</span>
      <Fraction n={fraction.n} d={fraction.d} />
    </span>
  );
});
