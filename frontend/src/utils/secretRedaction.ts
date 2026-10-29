export interface RedactionResult {
  text: string;
  count: number;
}

const patterns: Array<[RegExp, string]> = [
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/gi, '[REDACTED PRIVATE KEY]'],
  [/\b(authorization\s*:\s*)(?:bearer|basic)\s+[^\s,;]+/gi, '$1[REDACTED]'],
  [/\b(((?:[A-Za-z0-9]+[_-])*)(?:api[_-]?key|access[_-]?key|client[_-]?secret|secret|password|passwd|token)\s*[=:]\s*)(?!\[REDACTED\])(?:"[^"]*"|'[^']*'|[^\s,;"']+)/gi, '$1[REDACTED]'],
  [/\b(?:sk-ant-[A-Za-z0-9_-]{12,}|sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16})\b/g, '[REDACTED CREDENTIAL]'],
  [/\beyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, '[REDACTED JWT]'],
  [/([A-Za-z][A-Za-z0-9+.-]*:\/\/)[^\s/:@]+:[^\s/@]+@/gi, '$1[REDACTED]@'],
];

export function redactSensitiveContent(input: string): RedactionResult {
  let text = input;
  let count = 0;
  for (const [pattern, replacement] of patterns) {
    text = text.replace(pattern, (...args: string[]) => {
      count += 1;
      return replacement.replace('$1', args[1] ?? '');
    });
  }
  return { text, count };
}
