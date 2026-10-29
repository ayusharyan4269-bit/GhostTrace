import { describe, expect, it } from 'vitest';
import { redactSensitiveContent } from '../utils/secretRedaction';

describe('redactSensitiveContent', () => {
  it('redacts named secrets, bearer credentials, and common token formats', () => {
    const result = redactSensitiveContent('api_key=demo-secret-value\nAuthorization: Bearer abc123\nkey=sk-123456789012345678901234');
    expect(result.count).toBe(3);
    expect(result.text).not.toContain('demo-secret-value');
    expect(result.text).not.toContain('abc123');
    expect(result.text).not.toContain('sk-123456789012345678901234');
  });

  it('does not change ordinary logs or count already redacted values', () => {
    const clean = 'INFO server started successfully';
    expect(redactSensitiveContent(clean)).toEqual({ text: clean, count: 0 });
    expect(redactSensitiveContent('password=[REDACTED]')).toEqual({ text: 'password=[REDACTED]', count: 0 });
  });

  it('redacts environment variable credentials and database URL passwords', () => {
    const result = redactSensitiveContent('GITHUB_TOKEN=demo-token\nAWS_SECRET_ACCESS_KEY=demo-aws-secret\nDATABASE_URL=postgres://alice:demo-password@db.example/app');
    expect(result.count).toBe(3);
    expect(result.text).not.toContain('demo-token');
    expect(result.text).not.toContain('demo-aws-secret');
    expect(result.text).not.toContain('alice:demo-password');
  });
});
