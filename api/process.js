const converters = {
  camel: (str) => str.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '').replace(/^(.)/, c => c.toLowerCase()),
  pascal: (str) => str.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '').replace(/^(.)/, c => c.toUpperCase()),
  snake: (str) => str.replace(/([A-Z])/g, '_$1').replace(/[-\s]+/g, '_').replace(/^_/, '').toLowerCase().replace(/_+/g, '_'),
  kebab: (str) => str.replace(/([A-Z])/g, '-$1').replace(/[_\s]+/g, '-').replace(/^-/, '').toLowerCase().replace(/-+/g, '-'),
  constant: (str) => str.replace(/([A-Z])/g, '_$1').replace(/[-\s]+/g, '_').replace(/^_/, '').toUpperCase().replace(/_+/g, '_'),
  dot: (str) => str.replace(/([A-Z])/g, '.$1').replace(/[-_\s]+/g, '.').replace(/^\./, '').toLowerCase().replace(/\.+/, '.'),
  path: (str) => str.replace(/([A-Z])/g, '/$1').replace(/[-_\s]+/g, '/').replace(/^\//, '').toLowerCase().replace(/\/+/g, '/'),
  lower: (str) => str.toLowerCase().replace(/[-_\s]+/g, ' '),
  upper: (str) => str.toUpperCase().replace(/[-_\s]+/g, ' '),
  title: (str) => str.toLowerCase().replace(/[-_\s]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
  sentence: (str) => str.toLowerCase().replace(/[-_\s]+/g, ' ').replace(/^\w/, c => c.toUpperCase())
};

function convertText(text, caseType) {
  const converter = converters[caseType];
  if (!converter) return text;

  const lines = text.split('\n');
  return lines.map(line => {
    if (!line.trim()) return line;
    const normalized = line.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
    return converter(normalized);
  }).join('\n');
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-License-Key');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { text, case: caseType = 'camel' } = req.body || {};

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!converters[caseType]) {
      return res.status(400).json({
        error: 'Invalid case type',
        validTypes: Object.keys(converters)
      });
    }

    const result = convertText(text, caseType);

    return res.status(200).json({
      success: true,
      original: text,
      result,
      case: caseType,
      stats: {
        chars: text.length,
        words: text.trim().split(/\s+/).filter(w => w).length,
        lines: text.split('\n').length
      }
    });
  } catch (error) {
    console.error('[ERROR] Process:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
