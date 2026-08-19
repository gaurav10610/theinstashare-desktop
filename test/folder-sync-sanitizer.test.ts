import { describe, it, expect } from 'vitest';

describe('Live Folder Sync & Security Sanitizer Exhaustive Suite', () => {
  const SENSITIVE_PATTERNS = [
    /^\.env(\..+)?$/i,
    /\.pem$/i,
    /\.key$/i,
    /id_rsa/i,
    /id_ed25519/i,
    /credentials\.json/i
  ];

  const SECRET_REGEX = [
    /AKIA[0-9A-Z]{16}/, // AWS Access Key
    /ghp_[a-zA-Z0-9]{36}/, // GitHub Personal Access Token
    /sk-[a-zA-Z0-9_-]{20,}/ // OpenAI / Generic API Key
  ];

  const IGNORED_DIRS = ['node_modules', '.git', '.DS_Store', 'dist', 'out', 'tmp'];

  it('should detect sensitive secret file names during pre-flight check', () => {
    const isSensitiveFile = (filename: string) =>
      SENSITIVE_PATTERNS.some((pattern) => pattern.test(filename));

    expect(isSensitiveFile('.env')).toBe(true);
    expect(isSensitiveFile('.env.production')).toBe(true);
    expect(isSensitiveFile('server.key')).toBe(true);
    expect(isSensitiveFile('id_rsa')).toBe(true);
    expect(isSensitiveFile('id_ed25519')).toBe(true);
    expect(isSensitiveFile('credentials.json')).toBe(true);

    expect(isSensitiveFile('index.ts')).toBe(false);
    expect(isSensitiveFile('presentation.pdf')).toBe(false);
    expect(isSensitiveFile('image.png')).toBe(false);
  });

  it('should detect leaked API keys and tokens in file contents', () => {
    const hasSecretContent = (content: string) =>
      SECRET_REGEX.some((regex) => regex.test(content));

    expect(hasSecretContent('const key = "AKIAIOSFODNN7EXAMPLE";')).toBe(true);
    expect(hasSecretContent('export GITHUB_TOKEN="ghp_1234567890abcdefghijklmnopqrstuvwxyz"')).toBe(true);
    expect(hasSecretContent('export OPENAI_API_KEY="sk-proj-abc12345678901234567890"')).toBe(true);

    expect(hasSecretContent('console.log("Hello World");')).toBe(false);
  });

  it('should filter out build artifacts and OS junk directories during live sync', () => {
    const shouldIgnore = (relPath: string) => {
      const parts = relPath.split('/');
      return parts.some((p) => IGNORED_DIRS.includes(p));
    };

    expect(shouldIgnore('node_modules/react/index.js')).toBe(true);
    expect(shouldIgnore('.git/config')).toBe(true);
    expect(shouldIgnore('subfolder/.DS_Store')).toBe(true);
    expect(shouldIgnore('dist/bundle.js')).toBe(true);
    expect(shouldIgnore('out/main/index.js')).toBe(true);

    expect(shouldIgnore('src/components/Header.tsx')).toBe(false);
    expect(shouldIgnore('assets/logo.png')).toBe(false);
  });
});
