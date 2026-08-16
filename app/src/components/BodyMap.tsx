import type { MuscleKey } from '../lib/muscles';
import { LEVEL_COLORS, type BodyMapProps } from '../lib/bodyMapTypes';

/**
 * Muscle regions as SVG paths on a 220x470 canvas. Left/right pairs are drawn
 * as one path each so a whole muscle group lights up together.
 */
const FRONT: Partial<Record<MuscleKey, string>> = {
  traps:
    'M97,66 Q80,72 62,92 Q72,100 82,96 Q90,82 100,78 Z M123,66 Q140,72 158,92 Q148,100 138,96 Q130,82 120,78 Z',
  shoulders:
    'M62,92 Q46,100 44,124 Q45,143 55,151 Q69,142 74,119 Q72,101 62,92 Z M158,92 Q174,100 176,124 Q175,143 165,151 Q151,142 146,119 Q148,101 158,92 Z',
  chest:
    'M78,98 Q97,93 108,99 L108,152 Q88,159 78,145 Q71,121 78,98 Z M142,98 Q123,93 112,99 L112,152 Q132,159 142,145 Q149,121 142,98 Z',
  biceps:
    'M52,152 Q43,166 43,190 Q45,206 55,210 Q64,201 65,178 Q63,159 57,152 Z M168,152 Q177,166 177,190 Q175,206 165,210 Q156,201 155,178 Q157,159 163,152 Z',
  forearms:
    'M46,212 Q39,230 37,256 Q39,270 48,272 Q57,256 59,229 Q58,215 54,211 Z M174,212 Q181,230 183,256 Q181,270 172,272 Q163,256 161,229 Q162,215 166,211 Z',
  abs: 'M90,150 L130,150 L130,244 Q110,258 90,244 Z M84,152 Q77,182 83,222 Q86,238 90,244 L90,150 Z M136,152 Q143,182 137,222 Q134,238 130,244 L130,150 Z',
  quads:
    'M84,262 Q73,292 73,332 Q75,364 84,374 Q101,369 105,336 Q107,296 104,266 Q94,257 84,262 Z M136,262 Q147,292 147,332 Q145,364 136,374 Q119,369 115,336 Q113,296 116,266 Q126,257 136,262 Z',
  calves:
    'M84,390 Q77,410 79,434 Q83,448 91,447 Q97,431 97,406 Q95,392 91,389 Z M136,390 Q143,410 141,434 Q137,448 129,447 Q123,431 123,406 Q125,392 129,389 Z',
};

const BACK: Partial<Record<MuscleKey, string>> = {
  traps:
    'M110,70 Q86,74 64,94 Q76,104 90,100 L110,150 L130,100 Q144,104 156,94 Q134,74 110,70 Z',
  shoulders:
    'M62,94 Q46,102 44,126 Q45,145 55,153 Q69,144 74,121 Q72,103 62,94 Z M158,94 Q174,102 176,126 Q175,145 165,153 Q151,144 146,121 Q148,103 158,94 Z',
  back: 'M80,110 Q70,140 76,180 Q82,214 96,240 L110,246 L124,240 Q138,214 144,180 Q150,140 140,110 Q126,150 110,152 Q94,150 80,110 Z',
  triceps:
    'M52,152 Q43,166 43,190 Q45,206 55,210 Q64,201 65,178 Q63,159 57,152 Z M168,152 Q177,166 177,190 Q175,206 165,210 Q156,201 155,178 Q157,159 163,152 Z',
  forearms:
    'M46,212 Q39,230 37,256 Q39,270 48,272 Q57,256 59,229 Q58,215 54,211 Z M174,212 Q181,230 183,256 Q181,270 172,272 Q163,256 161,229 Q162,215 166,211 Z',
  glutes:
    'M110,250 Q88,248 80,262 Q76,282 86,296 Q100,304 110,300 Z M110,250 Q132,248 140,262 Q144,282 134,296 Q120,304 110,300 Z',
  hamstrings:
    'M85,302 Q75,330 76,362 Q79,378 87,382 Q101,374 104,342 Q106,318 103,304 Q94,298 85,302 Z M135,302 Q145,330 144,362 Q141,378 133,382 Q119,374 116,342 Q114,318 117,304 Q126,298 135,302 Z',
  calves:
    'M84,390 Q75,412 78,436 Q83,450 92,448 Q99,430 98,404 Q96,391 91,389 Z M136,390 Q145,412 142,436 Q137,450 128,448 Q121,430 122,404 Q124,391 129,389 Z',
};

/** Silhouette drawn under the muscle layer so the figure reads as a body. */
const SILHOUETTE =
  'M110,8 C124,8 135,20 135,37 C135,50 130,60 123,65 ' +
  'Q150,72 166,94 Q182,110 184,140 Q186,180 180,215 Q176,250 170,272 ' +
  'L156,272 Q150,240 146,215 Q148,250 146,282 Q144,320 145,352 ' +
  'Q146,392 143,424 Q141,450 138,462 L120,462 Q118,430 117,400 ' +
  'Q116,360 113,330 L110,318 L107,330 Q104,360 103,400 Q102,430 100,462 ' +
  'L82,462 Q79,450 77,424 Q74,392 75,352 Q76,320 74,282 Q72,250 74,215 ' +
  'Q70,240 64,272 L50,272 Q44,250 40,215 Q34,180 36,140 Q38,110 54,94 ' +
  'Q70,72 97,65 C90,60 85,50 85,37 C85,20 96,8 110,8 Z';

export default function BodyMap({
  view,
  levels = {},
  highlight = [],
  highlightSecondary = [],
  selected,
  onSelect,
  className = '',
}: BodyMapProps) {
  const regions = view === 'front' ? FRONT : BACK;

  return (
    <svg
      viewBox="0 0 220 470"
      className={className}
      role="img"
      aria-label={view === 'front' ? 'Front view muscle map' : 'Back view muscle map'}
    >
      <defs>
        <linearGradient id="bm-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a2230" />
          <stop offset="100%" stopColor="#141a24" />
        </linearGradient>
      </defs>

      <path d={SILHOUETTE} fill="url(#bm-skin)" stroke="#2b3648" strokeWidth={1.5} />

      {(Object.keys(regions) as MuscleKey[]).map((key) => {
        const d = regions[key];
        if (!d) return null;

        const level = Math.max(0, Math.min(5, Math.round(levels[key] ?? 0)));
        const isPrimary = highlight.includes(key);
        const isSecondary = highlightSecondary.includes(key);
        const isSelected = selected === key;
        // Muscles visibly thicken as they get stronger.
        const scale = 1 + level * 0.018;

        let stroke = '#0b0f14';
        let strokeWidth = 1;
        if (isSelected) {
          stroke = '#ffffff';
          strokeWidth = 2.2;
        } else if (isPrimary) {
          stroke = '#34d399';
          strokeWidth = 2.2;
        } else if (isSecondary) {
          stroke = '#fbbf24';
          strokeWidth = 1.6;
        }

        return (
          <g
            key={key}
            onClick={onSelect ? () => onSelect(key) : undefined}
            style={{
              transformBox: 'fill-box',
              transformOrigin: 'center',
              transform: `scale(${scale})`,
              transition: 'transform 400ms ease, fill 400ms ease',
              cursor: onSelect ? 'pointer' : 'default',
            }}
          >
            <path
              d={d}
              fill={LEVEL_COLORS[level]}
              fillOpacity={isPrimary || isSecondary || isSelected ? 1 : 0.92}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
          </g>
        );
      })}

      {/* Ab segment lines, drawn on top so the six-pack reads on the front view. */}
      {view === 'front' && (
        <g stroke="#0b0f14" strokeWidth={1.2} opacity={0.5}>
          <line x1="110" y1="152" x2="110" y2="244" />
          <line x1="92" y1="178" x2="128" y2="178" />
          <line x1="92" y1="204" x2="128" y2="204" />
          <line x1="94" y1="228" x2="126" y2="228" />
        </g>
      )}
    </svg>
  );
}
