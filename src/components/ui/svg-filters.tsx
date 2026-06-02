import React from 'react'

export const SvgFilters = () => {
  return (
    <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
      <defs>
        <filter id="remove-white" colorInterpolationFilters="sRGB">
          {/* تحويل اللون الأبيض (أو القريب منه) إلى شفافية كاملة */}
          <feComponentTransfer>
            <feFuncR type="table" tableValues="1 0" />
            <feFuncG type="table" tableValues="1 0" />
            <feFuncB type="table" tableValues="1 0" />
          </feComponentTransfer>
          <feColorMatrix type="matrix" values="0 0 0 1 0  0 0 0 1 0  0 0 0 1 0  1 1 1 0 -2.5" />
          <feComposite operator="in" in="SourceGraphic" />
        </filter>
      </defs>
    </svg>
  )
}
